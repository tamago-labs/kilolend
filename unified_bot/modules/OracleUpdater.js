const { ethers } = require('ethers');
const axios = require('axios');
const BaseModule = require('./BaseModule');
const { getChainContracts } = require('../config/chains');

// KiloPriceOracle ABI
const KILO_PRICE_ORACLE_ABI = [
  "function setDirectPrice(address asset, uint256 price) external",
  "function getUnderlyingPrice(address cToken) external view returns (uint256)",
  "function whitelist(address) external view returns (bool)",
  "function addToWhitelist(address user) external",
  "function removeFromWhitelist(address user) external",
  "function owner() external view returns (address)"
];

/**
 * OracleUpdater - Updates oracle prices for all supported chains
 * 
 * Responsibilities:
 * - Fetch prices from API
 * - Update oracle contracts on all chains
 * - Handle chain-specific whitelisting
 * - Gas optimization for updates
 */
class OracleUpdater extends BaseModule {
  constructor(chainManager, options = {}) {
    super('OracleUpdater', chainManager, options);
    
    // Configuration
    this.priceApiUrl = process.env.PRICE_API_URL;
    this.updateInterval = (parseInt(process.env.UPDATE_INTERVAL_MINUTES) || 120) * 60 * 1000;
    this.maxGasPrice = ethers.parseUnits((process.env.MAX_GAS_PRICE_GWEI || 50).toString(), 'gwei');
    
    // Excluded tokens - per-chain exclusions
    // Format: KAIA_USDT,KUB_KUSDT,ETHERLINK_USDT
    this.excludedTokens = this.parseExcludedTokens();
    
    // Per-chain configuration
    this.chainId = options.chainId;
    this.tokenAddresses = this.buildTokenAddresses();
    
    // Tracking state
    this.oracleContracts = {};
    this.updateCount = 0;
    this.lastUpdateTime = null;
  }

  /**
   * Parse excluded tokens from environment variable
   * Format: CHAIN_TOKEN,CHAIN_TOKEN (e.g., KAIA_USDT,KUB_KUSDT)
   */
  parseExcludedTokens() {
    const excluded = process.env.EXCLUDED_TOKENS || '';
    if (!excluded) return { kaia: [], kub: [], etherlink: [] };
    
    const result = { kaia: [], kub: [], etherlink: [] };
    const tokens = excluded.split(',').map(t => t.trim().toUpperCase());
    
    for (const token of tokens) {
      const parts = token.split('_');
      if (parts.length === 2) {
        const [chain, symbol] = parts;
        // Convert chain to lowercase to match result keys
        const chainLower = chain.toLowerCase();
        if (result[chainLower]) {
          result[chainLower].push(symbol);
        }
      }
    }
    
    return result;
  }

  /**
   * Build token address mapping for this chain
   */
  buildTokenAddresses() {
    if (!this.chainId) return {};
    
    const chainContracts = getChainContracts(this.chainId);
    const tokenAddresses = {};
    const excludedForChain = this.excludedTokens[this.chainId] || [];
    
    console.log(`[${this.chainId}] Excluded tokens: ${JSON.stringify(excludedForChain)}`);
    console.log(`[${this.chainId}] Available contracts: ${Object.keys(chainContracts).join(', ')}`);
    
    // Map tokens to their addresses (excluding cTokens and special addresses)
    for (const [key, address] of Object.entries(chainContracts)) {
      // Skip cTokens, Comptroller, Oracle, and rate models
      if (!key.startsWith('c') && 
          key !== 'Comptroller' && 
          key !== 'KiloOracle' &&
          !key.includes('RateModel') &&
          !key.startsWith('Stablecoin') &&
          !key.startsWith('Volatile') &&
          address !== ethers.ZeroAddress) {
        
        const symbol = key.toLowerCase();
        const symbolUpper = symbol.toUpperCase();
        const isExcluded = excludedForChain.includes(symbolUpper);
        
        console.log(`[${this.chainId}] Checking token: ${key} → ${symbol} (excluded: ${isExcluded})`);
        
        // Skip if token is in exclusion list for this chain
        if (isExcluded) {
          console.log(`[${this.chainId}] ⏭️  Skipping ${symbolUpper} (excluded from oracle updates)`);
          continue;
        }
        
        tokenAddresses[symbol] = address;
        console.log(`[${this.chainId}] ✅ Added token: ${symbol} → ${address}`);
      }
    }
    
    console.log(`[${this.chainId}] Final token addresses: ${Object.keys(tokenAddresses).join(', ')}`);
    return tokenAddresses;
  }

  async initialize() {
    // Initialize oracle contract for this chain
    const provider = this.chainManager.getProvider(this.chainId);
    const chainContracts = getChainContracts(this.chainId);
    
    this.oracleContracts[this.chainId] = new ethers.Contract(
      chainContracts.KiloOracle,
      KILO_PRICE_ORACLE_ABI,
      this.chainManager.getWallet(this.chainId)
    );
    
    // Check whitelist status
    await this.checkWhitelistStatus();
    
    this.log(`Tracking ${Object.keys(this.tokenAddresses).length} tokens`, 'info');
    this.log(`Update interval: ${this.updateInterval / 1000 / 60} minutes`, 'info');
  }

  async checkWhitelistStatus() {
    try {
      const wallet = this.chainManager.getWallet(this.chainId);
      const oracle = this.oracleContracts[this.chainId];
      
      const isWhitelisted = await oracle.whitelist(wallet.address);
      
      if (isWhitelisted) {
        this.log(`Wallet ${wallet.address.slice(0, 8)}... is whitelisted ✅`, 'success');
      } else {
        this.log(`Wallet ${wallet.address.slice(0, 8)}... is NOT whitelisted ❌`, 'warn');
        this.log('Price updates will fail. Contact oracle owner to whitelist.', 'warn');
        
        try {
          const owner = await oracle.owner();
          this.log(`Oracle owner: ${owner}`, 'info');
        } catch (error) {
          // Owner function might not be available
        }
      }
      
    } catch (error) {
      this.handleError(error, 'checkWhitelistStatus');
    }
  }

  async run() {
    this.log('Starting oracle updater...', 'info');
    
    // Run immediately on start
    await this.runUpdate();
    
    // Then run on interval
    this.updateLoop = setInterval(() => {
      this.runUpdate();
    }, this.updateInterval);
    
    this.log(`Update loop scheduled every ${this.updateInterval / 1000 / 60} minutes`, 'info');
  }

  async runUpdate() {
    try {
      this.log('Starting price update cycle...', 'info');
      this.log(`⏰ ${new Date().toISOString()}`, 'info');
      
      // Fetch latest prices from API
      const priceData = await this.fetchPrices();
      
      // Update oracle for this chain
      await this.updatePrices(priceData);
      
      this.lastUpdateTime = new Date().toISOString();
      this.updateCount++;
      this.recordSuccess();
      
      this.log('Update cycle completed successfully', 'success');
      
    } catch (error) {
      this.handleError(error, 'runUpdate');
    }
  }

  async fetchPrices() {
    try {
      this.log('Fetching prices from API...', 'info');
      
      const response = await axios.get(this.priceApiUrl, {
        timeout: 10000
      });
      
      if (!response.data || !response.data.success) {
        throw new Error('API response indicates failure');
      }
      
      const prices = {};
      const priceData = response.data.data;
      
      // Process each price from API
      for (const item of priceData) {
        const symbol = item.symbol;
        
        // Map API symbols to our token addresses
        // API returns: MARBLEX → mapped to mbx
        // API returns: STAKED_KAIA → mapped to stkaia
        let addressKey = symbol.toLowerCase();
        
        // Apply symbol mappings (also lowercase)
        if (symbol === 'MARBLEX') {
          addressKey = 'mbx';
        } else if (symbol === 'STAKED_KAIA') {
          addressKey = 'stkaia';
        }
        
        // Check if token exists in our address mapping
        if (this.tokenAddresses[addressKey]) {
          const tokenAddress = this.tokenAddresses[addressKey];
          
          // Convert price to 18-decimal format (e18 based)
          const priceInWei = ethers.parseEther(item.price.toString());
          
          prices[symbol] = {
            address: tokenAddress,
            price: priceInWei,
            rawPrice: item.price,
            mappedSymbol: addressKey // Track the actual symbol used
          };
          
          this.log(`💰 ${symbol} → ${addressKey}: $${item.price}`, 'info');
        }
      }
      
      this.log(`Fetched ${Object.keys(prices).length} prices`, 'success');
      return prices;
      
    } catch (error) {
      this.handleError(error, 'fetchPrices');
      throw error;
    }
  }

  async updatePrices(priceData) {
    try {
      this.log('Updating oracle prices...', 'info');
      
      if (Object.keys(priceData).length === 0) {
        this.log('No prices to update', 'warn');
        return;
      }
      
      // Check current gas price
      const provider = this.chainManager.getProvider(this.chainId);
      const feeData = await provider.getFeeData();
      const gasPriceGwei = parseFloat(ethers.formatUnits(feeData.gasPrice || 0, 'gwei'));
      
      this.log(`Gas price: ${gasPriceGwei.toFixed(2)} gwei`, 'info');
      
      // Check if gas price is too high
      if (feeData.gasPrice && feeData.gasPrice > this.maxGasPrice) {
        this.log(`Gas price too high (${gasPriceGwei.toFixed(2)} gwei > ${parseInt(ethers.formatUnits(this.maxGasPrice, 'gwei'))} gwei), skipping update`, 'warn');
        return;
      }
      
      const oracle = this.oracleContracts[this.chainId];
      
      // Update each price individually using setDirectPrice
      let successCount = 0;
      let failCount = 0;
      
      for (const [symbol, data] of Object.entries(priceData)) {
        try {
          this.log(`Updating ${symbol} price: $${data.rawPrice}`, 'info');
          console.log(`[${this.chainId}] Calling setDirectPrice(${data.address}, ${data.price})`);

          const tx = await oracle.setDirectPrice(data.address, data.price, {
            gasLimit: 200000,
          });
          
          this.log(`Transaction sent: ${tx.hash}`, 'info');
          
          const receipt = await tx.wait();
          
          if (receipt.status === 1) {
            this.log(`${symbol} price update successful ✅`, 'success');
            this.log(`Block: ${receipt.blockNumber}, Gas: ${receipt.gasUsed.toString()}`, 'info');
            successCount++;
          } else {
            this.log(`${symbol} transaction failed ❌`, 'error');
            failCount++;
          }
          
          // Wait a bit between transactions to avoid nonce issues
          await this.sleep(2000);
          
        } catch (error) {
          this.handleError(error, `update ${symbol}`);
          failCount++;
          
          // Check specific error types
          if (error.message.includes('Not whitelisted') || error.message.includes('whitelist')) {
            this.log('Wallet is not whitelisted for price updates. Stopping.', 'warn');
            break;
          }
          
          if (error.message.includes('insufficient funds')) {
            this.log('Insufficient funds for gas. Stopping.', 'warn');
            break;
          }
        }
      }
      
      this.log(`Update Summary: ${successCount} successful, ${failCount} failed`, 'info');
      
    } catch (error) {
      this.handleError(error, 'updatePrices');
      throw error;
    }
  }

  async cleanup() {
    if (this.updateLoop) {
      clearInterval(this.updateLoop);
    }
    this.log('OracleUpdater cleanup complete', 'success');
  }

  getHealthStatus() {
    const baseStatus = super.getHealthStatus();
    return {
      ...baseStatus,
      chainsUpdated: 1,
      tokensTracked: Object.keys(this.tokenAddresses).length,
      updateCount: this.updateCount,
      lastUpdateTime: this.lastUpdateTime,
      priceApiUrl: this.priceApiUrl
    };
  }
}

module.exports = OracleUpdater;
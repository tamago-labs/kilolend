const { ethers } = require('ethers');
const axios = require('axios');
const BaseModule = require('./BaseModule');
const { getChainContracts, getChainMarkets } = require('../config/chains');

// Comptroller ABI
const COMPTROLLER_ABI = [
  "function getAccountLiquidity(address account) external view returns (uint256, uint256, uint256)",
  "function liquidateBorrowAllowed(address cTokenBorrowed, address cTokenCollateral, address liquidator, address borrower, uint256 repayAmount) external returns (uint256)",
  "function markets(address) external view returns (bool isListed, uint256 collateralFactorMantissa)",
  "function closeFactorMantissa() external view returns (uint256)",
  "function liquidationIncentiveMantissa() external view returns (uint256)"
];

// CToken ABI
const CTOKEN_ABI = [
  "function borrowBalanceStored(address account) external view returns (uint256)",
  "function balanceOfUnderlying(address owner) external returns (uint256)",
  "function exchangeRateStored() external view returns (uint256)",
  "function liquidateBorrow(address borrower, uint256 repayAmount, address cTokenCollateral) external returns (uint256)",
  "function underlying() external view returns (address)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function balanceOf(address owner) external view returns (uint256)"
];

// ERC20 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

// Oracle ABI
const ORACLE_ABI = [
  "function getPrice(address token) external view returns (uint256)",
  "function getUnderlyingPrice(address cToken) external view returns (uint256)"
];

/**
 * Liquidator - Monitors and executes liquidations across all chains
 * 
 * Responsibilities:
 * - Monitor underwater positions
 * - Calculate liquidation profitability
 * - Execute liquidations with profit checks
 * - Chain-specific gas and profit thresholds
 */
class Liquidator extends BaseModule {
  constructor(chainManager, options = {}) {
    super('Liquidator', chainManager, options);
    
    // Configuration
    this.apiBaseUrl = process.env.API_BASE_URL;
    this.checkInterval = (parseInt(process.env.CHECK_INTERVAL_SECONDS) || 60) * 1000;
    this.minProfitUSD = parseFloat(process.env.MIN_PROFIT_USD || 10);
    this.maxGasPrice = ethers.parseUnits((process.env.MAX_GAS_PRICE_GWEI || 50).toString(), 'gwei');
    this.maxLiquidationUSD = parseFloat(process.env.MAX_LIQUIDATION_USD || 5000);
    this.minCollateralUSD = parseFloat(process.env.MIN_COLLATERAL_USD || 100);
    
    // Per-chain configuration
    this.chainId = options.chainId;
    this.markets = this.buildMarketsConfig();
    
    // Tracking state
    this.borrowers = new Set();
    this.liquidationHistory = [];
    this.comptrollerContracts = {};
    this.oracleContracts = {};
  }

  /**
   * Build markets configuration for this chain
   */
  buildMarketsConfig() {
    if (!this.chainId) return {};
    
    const chainContracts = getChainContracts(this.chainId);
    const chainMarkets = getChainMarkets(this.chainId);
    const markets = {};
    
    // Map cTokens to their underlying tokens
    for (const [key, contractAddress] of Object.entries(chainContracts)) {
      if (key.startsWith('c')) { // cTokens only
        const symbol = key.substring(1); // Remove 'c' prefix
        const marketInfo = Object.values(chainMarkets).find(m => m.symbol === symbol);
        
        if (marketInfo) {
          const underlyingKey = symbol.toUpperCase();
          const underlyingAddress = chainContracts[underlyingKey] || ethers.ZeroAddress;
          
          markets[contractAddress] = {
            symbol: key,
            underlying: underlyingAddress,
            underlyingSymbol: marketInfo.symbol,
            decimals: marketInfo.decimals
          };
        }
      }
    }
    
    return markets;
  }

  async initialize() {
    // Initialize contracts
    const provider = this.chainManager.getProvider(this.chainId);
    const chainContracts = getChainContracts(this.chainId);
    
    this.comptrollerContracts[this.chainId] = new ethers.Contract(
      chainContracts.Comptroller,
      COMPTROLLER_ABI,
      provider
    );
    
    this.oracleContracts[this.chainId] = new ethers.Contract(
      chainContracts.KiloOracle,
      ORACLE_ABI,
      provider
    );
    
    // Check wallet balance
    await this.checkWalletBalance();
    
    // Test API connection
    await this.testAPIConnection();
    
    this.log(`Tracking ${Object.keys(this.markets).length} markets`, 'info');
    this.log(`Min profit: $${this.minProfitUSD}, Max gas: ${parseInt(ethers.formatUnits(this.maxGasPrice, 'gwei'))} gwei`, 'info');
  }

  async checkWalletBalance() {
    try {
      const provider = this.chainManager.getProvider(this.chainId);
      const wallet = this.chainManager.getWallet(this.chainId);
      const balance = await provider.getBalance(wallet.address);
      const balanceEth = parseFloat(this.formatTokenAmount(balance, 18));
      
      this.log(`Wallet balance: ${balanceEth.toFixed(4)} native tokens`, 'info');
      
      if (balanceEth < 0.1) {
        this.log('WARNING: Low wallet balance. May not be able to execute liquidations.', 'warn');
      }
      
    } catch (error) {
      this.handleError(error, 'checkWalletBalance');
    }
  }

  async testAPIConnection() {
    if (!this.apiBaseUrl) {
      this.log('API not configured (API_BASE_URL missing)', 'warn');
      return false;
    }
    
    try {
      this.log('Testing API connection...', 'info');
      
      const response = await axios.get(`${this.apiBaseUrl}/all`, { timeout: 5000 });
      
      if (response.data && response.data.success) {
        const userCount = response.data.data ? response.data.data.length : 0;
        this.log(`API connection successful. Found ${userCount} users`, 'success');
        return true;
      }
      
      return false;
      
    } catch (error) {
      this.log(`API connection test failed: ${error.message}`, 'warn');
      return false;
    }
  }

  async run() {
    this.log('Starting liquidation monitoring...', 'info');
    
    // Start monitoring immediately
    await this.monitorMarkets();
    
    // Then check on interval
    this.monitoringInterval = setInterval(() => {
      this.monitorMarkets();
    }, this.checkInterval);
    
    this.log(`Monitoring every ${this.checkInterval / 1000}s`, 'info');
  }

  async monitorMarkets() {
    try {
      this.log(`Checking for liquidation opportunities...`, 'info');
      
      const opportunities = await this.scanForBorrowers();
      
      if (opportunities.length === 0) {
        this.log('No liquidation opportunities found', 'info');
        return;
      }
      
      this.log(`Found ${opportunities.length} liquidation opportunities`, 'info');
      
      // Sort by potential profit (highest first)
      opportunities.sort((a, b) => b.potentialProfit - a.potentialProfit);
      
      // Execute liquidations
      for (const opportunity of opportunities) {
        const success = await this.executeLiquidation(opportunity);
        if (success) {
          await this.sleep(5000); // Wait between liquidations
        }
      }
      
    } catch (error) {
      this.handleError(error, 'monitorMarkets');
    }
  }

  async scanForBorrowers() {
    try {
      const liquidationOpportunities = [];
      
      // Fetch users from API
      const apiUsers = await this.getAllUsers();
      
      if (apiUsers.length > 0) {
        this.log(`Scanning ${apiUsers.length} users from API...`, 'info');
        apiUsers.forEach(user => this.addBorrower(user));
      } else {
        this.log('No users from API, using fallback addresses...', 'warn');
        // Fallback addresses for testing
        this.addBorrower('0x1ecFDe4511a27f23B8cAE67354D41a487BAfA725');
      }
      
      this.log(`Monitoring ${this.borrowers.size} addresses`, 'info');
      
      for (const borrower of this.borrowers) {
        const opportunity = await this.findLiquidationOpportunity(borrower);
        if (opportunity) {
          liquidationOpportunities.push(opportunity);
        }
      }
      
      return liquidationOpportunities;
      
    } catch (error) {
      this.handleError(error, 'scanForBorrowers');
      return [];
    }
  }

  async getAllUsers() {
    try {
      if (!this.apiBaseUrl) {
        return [];
      }
      
      const response = await axios.get(`${this.apiBaseUrl}/all`, { timeout: 10000 });
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.map(user => user.userAddress);
      }
      
      return [];
      
    } catch (error) {
      this.handleError(error, 'getAllUsers');
      return [];
    }
  }

  async findLiquidationOpportunity(borrower) {
    try {
      const comptroller = this.comptrollerContracts[this.chainId];
      
      // Get account liquidity
      const [error, liquidity, shortfall] = await comptroller.getAccountLiquidity(borrower);
      
      if (error !== 0n) {
        return null;
      }
      
      const liquidityUSD = parseFloat(this.formatTokenAmount(liquidity, 18));
      const shortfallUSD = parseFloat(this.formatTokenAmount(shortfall, 18));
      
      if (shortfallUSD <= 0) {
        return null; // Account is healthy
      }
      
      this.log(`Found underwater account: ${borrower.slice(0, 8)}... Shortfall: $${shortfallUSD.toFixed(2)}`, 'info');
      
      // Get borrow and collateral positions
      const borrowPositions = await this.getBorrowPositions(borrower);
      const collateralPositions = await this.getCollateralPositions(borrower);
      
      if (borrowPositions.length === 0 || collateralPositions.length === 0) {
        return null;
      }
      
      // Find largest positions
      const largestBorrow = borrowPositions.reduce((max, pos) => 
        pos.borrowBalanceUSD > max.borrowBalanceUSD ? pos : max
      );
      
      const largestCollateral = collateralPositions.reduce((max, pos) => 
        pos.collateralUSD > max.collateralUSD ? pos : max
      );
      
      // Calculate maximum liquidation (close factor)
      const maxLiquidationUSD = largestBorrow.borrowBalanceUSD * 0.5;
      const liquidationUSD = Math.min(maxLiquidationUSD, this.maxLiquidationUSD);
      
      // Check collateral value
      if (largestCollateral.collateralUSD < this.minCollateralUSD) {
        return null;
      }
      
      // Calculate profit (liquidation incentive ~8%)
      const potentialProfit = liquidationUSD * 0.08;
      
      if (potentialProfit < this.minProfitUSD) {
        return null;
      }
      
      return {
        borrower,
        borrowPosition: largestBorrow,
        collateralPosition: largestCollateral,
        liquidationUSD,
        potentialProfit,
        shortfall: shortfallUSD
      };
      
    } catch (error) {
      this.handleError(error, 'findLiquidationOpportunity');
      return null;
    }
  }

  async getBorrowPositions(account) {
    try {
      const provider = this.chainManager.getProvider(this.chainId);
      const positions = [];
      
      for (const [cTokenAddress, market] of Object.entries(this.markets)) {
        const cToken = new ethers.Contract(cTokenAddress, CTOKEN_ABI, provider);
        const borrowBalance = await cToken.borrowBalanceStored(account);
        
        if (borrowBalance > 0n) {
          const priceData = await this.getTokenPrice(market.underlying);
          const borrowBalanceUSD = parseFloat(this.formatTokenAmount(borrowBalance, market.decimals)) * priceData.tokenPrice;
          
          positions.push({
            cTokenAddress,
            market,
            borrowBalance,
            borrowBalanceUSD
          });
        }
      }
      
      return positions;
      
    } catch (error) {
      this.handleError(error, 'getBorrowPositions');
      return [];
    }
  }

  async getCollateralPositions(account) {
    try {
      const provider = this.chainManager.getProvider(this.chainId);
      const positions = [];
      
      for (const [cTokenAddress, market] of Object.entries(this.markets)) {
        const cToken = new ethers.Contract(cTokenAddress, CTOKEN_ABI, provider);
        const cTokenBalance = await cToken.balanceOf(account);
        
        if (cTokenBalance > 0n) {
          const exchangeRate = await cToken.exchangeRateStored();
          const underlyingBalance = (cTokenBalance * exchangeRate) / ethers.parseEther('1');
          const priceData = await this.getTokenPrice(market.underlying);
          const collateralUSD = parseFloat(this.formatTokenAmount(underlyingBalance, market.decimals)) * priceData.tokenPrice;
          
          positions.push({
            cTokenAddress,
            market,
            cTokenBalance,
            underlyingBalance,
            collateralUSD
          });
        }
      }
      
      return positions;
      
    } catch (error) {
      this.handleError(error, 'getCollateralPositions');
      return [];
    }
  }

  async getTokenPrice(tokenAddress) {
    try {
      const oracle = this.oracleContracts[this.chainId];
      const price = await oracle.getUnderlyingPrice(tokenAddress);
      return {
        tokenPrice: parseFloat(this.formatTokenAmount(price, 18))
      };
    } catch (error) {
      return { tokenPrice: 0 };
    }
  }

  async executeLiquidation(opportunity) {
    try {
      this.log('Executing liquidation...', 'info');
      this.log(`Borrower: ${opportunity.borrower.slice(0, 8)}... Value: $${opportunity.liquidationUSD.toFixed(2)} Profit: $${opportunity.potentialProfit.toFixed(2)}`, 'info');
      
      const { borrowPosition, collateralPosition } = opportunity;
      
      // Calculate repay amount
      const repayAmountUSD = opportunity.liquidationUSD;
      const repayAmountWei = ethers.parseUnits(
        (repayAmountUSD / borrowPosition.borrowBalanceUSD * parseFloat(this.formatTokenAmount(borrowPosition.borrowBalance, borrowPosition.market.decimals))).toString(),
        borrowPosition.market.decimals
      );
      
      this.log(`Repaying ${this.formatTokenAmount(repayAmountWei, borrowPosition.market.decimals)} ${borrowPosition.market.underlyingSymbol}`, 'info');
      
      // Check gas price
      const provider = this.chainManager.getProvider(this.chainId);
      const feeData = await provider.getFeeData();
      const gasPriceGwei = parseFloat(ethers.formatUnits(feeData.gasPrice || 0, 'gwei'));
      
      if (feeData.gasPrice && feeData.gasPrice > this.maxGasPrice) {
        this.log(`Gas price too high (${gasPriceGwei.toFixed(2)} gwei), skipping`, 'warn');
        return false;
      }
      
      // Check and approve tokens if needed
      await this.ensureTokenApproval(borrowPosition, repayAmountWei);
      
      // Execute liquidation
      const wallet = this.chainManager.getWallet(this.chainId);
      const cTokenBorrow = new ethers.Contract(borrowPosition.cTokenAddress, CTOKEN_ABI, wallet);
      
      const tx = await cTokenBorrow.liquidateBorrow(
        opportunity.borrower,
        repayAmountWei,
        collateralPosition.cTokenAddress,
        {
          gasLimit: 800000,
          value: borrowPosition.market.underlying === ethers.ZeroAddress ? repayAmountWei : 0
        }
      );
      
      this.log(`Transaction sent: ${tx.hash}`, 'info');
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        this.log('Liquidation successful!', 'success');
        this.log(`Block: ${receipt.blockNumber}, Gas: ${receipt.gasUsed.toString()}`, 'info');
        
        // Record liquidation
        this.liquidationHistory.push({
          timestamp: new Date().toISOString(),
          borrower: opportunity.borrower,
          repayAmount: this.formatTokenAmount(repayAmountWei, borrowPosition.market.decimals),
          repayToken: borrowPosition.market.underlyingSymbol,
          collateralToken: collateralPosition.market.underlyingSymbol,
          liquidationUSD: opportunity.liquidationUSD,
          profit: opportunity.potentialProfit,
          txHash: tx.hash,
          gasUsed: receipt.gasUsed.toString()
        });
        
        this.recordSuccess();
        return true;
      }
      
      return false;
      
    } catch (error) {
      this.handleError(error, 'executeLiquidation');
      return false;
    }
  }

  async ensureTokenApproval(borrowPosition, amount) {
    if (borrowPosition.market.underlying === ethers.ZeroAddress) {
      return; // Native token doesn't need approval
    }
    
    const provider = this.chainManager.getProvider(this.chainId);
    const wallet = this.chainManager.getWallet(this.chainId);
    
    const token = new ethers.Contract(borrowPosition.market.underlying, ERC20_ABI, provider);
    const allowance = await token.allowance(wallet.address, borrowPosition.cTokenAddress);
    
    if (allowance < amount) {
      this.log('Approving token spending...', 'info');
      const tokenWithSigner = token.connect(wallet);
      const approveTx = await tokenWithSigner.approve(borrowPosition.cTokenAddress, ethers.MaxUint256);
      await approveTx.wait();
      this.log('Token approved', 'success');
    }
  }

  addBorrower(address) {
    const normalizedAddress = address.toLowerCase();
    if (!this.borrowers.has(normalizedAddress)) {
      this.borrowers.add(normalizedAddress);
    }
  }

  removeBorrower(address) {
    this.borrowers.delete(address.toLowerCase());
  }

  async cleanup() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.log('Liquidator cleanup complete', 'success');
  }

  getHealthStatus() {
    const baseStatus = super.getHealthStatus();
    const totalProfit = this.liquidationHistory.reduce((sum, liq) => sum + liq.profit, 0);
    const totalVolume = this.liquidationHistory.reduce((sum, liq) => sum + liq.liquidationUSD, 0);
    
    return {
      ...baseStatus,
      chainsMonitored: 1,
      marketsTracked: Object.keys(this.markets).length,
      borrowersMonitored: this.borrowers.size,
      liquidationsExecuted: this.liquidationHistory.length,
      totalProfitUSD: totalProfit,
      totalVolumeUSD: totalVolume
    };
  }
}

module.exports = Liquidator;
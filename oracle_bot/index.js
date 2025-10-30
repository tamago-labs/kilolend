const axios = require('axios');
const { ethers } = require('ethers');
const dotenv = require('dotenv');
const express = require('express');

// Load environment variables
dotenv.config();

// KiloPriceOracle ABI
const KILO_PRICE_ORACLE_ABI = [
  "function setDirectPrice(address asset, uint256 price) external",
  "function getUnderlyingPrice(address cToken) external view returns (uint256)",
  "function whitelist(address) external view returns (bool)",
  "function addToWhitelist(address user) external",
  "function removeFromWhitelist(address user) external",
  "function owner() external view returns (address)"
];

class OracleBot {
  constructor() {
    this.rpcUrl = process.env.RPC_URL;
    this.privateKey = process.env.PRIVATE_KEY;
    this.oracleAddress = process.env.ORACLE_ADDRESS;
    this.priceApiUrl = process.env.PRICE_API_URL;
    this.updateInterval = parseInt(process.env.UPDATE_INTERVAL_MINUTES) * 60 * 1000; // Convert to milliseconds

    // Token address mapping - underlying tokens for price updates
    this.tokenAddresses = {
      // 'KAIA': ethers.ZeroAddress, // Native KAIA not needed since we use Orakl Oracle
      // 'USDT': process.env.USDT_ADDRESS // USDT is fixed at 1, so no updates are needed
      'BORA': process.env.BORA_ADDRESS,
      'SIX': process.env.SIX_ADDRESS,
      'MARBLEX': process.env.MBX_ADDRESS,  // API returns MARBLEX but we call it MBX
      'STAKED_KAIA': process.env.STAKED_KAIA_ADDRESS,  // New stKAIA token 
    };

    this.provider = null;
    this.wallet = null;
    this.oracleContract = null;
    this.isInitialized = false;
    this.lastUpdateTime = null;
    this.updateCount = 0;
    this.errorCount = 0;

    this.init();
  }

  async init() {
    try {
      console.log('🔧 Initializing Oracle Bot...');

      // Validate environment variables
      this.validateConfig();

      // Setup provider and wallet
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      this.wallet = new ethers.Wallet(this.privateKey, this.provider);

      // Setup oracle contract
      this.oracleContract = new ethers.Contract(
        this.oracleAddress,
        KILO_PRICE_ORACLE_ABI,
        this.wallet
      );

      console.log('✅ Oracle Bot initialized successfully');
      console.log(`📍 Wallet address: ${this.wallet.address}`);
      console.log(`📍 Oracle contract: ${this.oracleAddress}`);
      console.log(`⏱️  Update interval: ${process.env.UPDATE_INTERVAL_MINUTES} minutes`);

      // Check if wallet is whitelisted
      await this.checkWhitelistStatus();

      this.isInitialized = true;

      // Start the update loop
      this.startUpdateLoop();

    } catch (error) {
      console.error('❌ Failed to initialize Oracle Bot:', error.message);
      this.isInitialized = false;
    }
  }

  validateConfig() {
    const required = [
      'RPC_URL', 'PRIVATE_KEY', 'ORACLE_ADDRESS', 'PRICE_API_URL',
      'BORA_ADDRESS', 'SIX_ADDRESS', 'MBX_ADDRESS', 'STAKED_KAIA_ADDRESS', 'USDT_ADDRESS'
    ];

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }

  async checkWhitelistStatus() {
    try {
      const isWhitelisted = await this.oracleContract.whitelist(this.wallet.address);
      console.log(`📋 Wallet whitelist status: ${isWhitelisted ? 'WHITELISTED ✅' : 'NOT WHITELISTED ❌'}`);

      if (!isWhitelisted) {
        console.warn('⚠️  WARNING: Wallet is not whitelisted. Price updates will fail.');
        console.warn('💡 Contact the oracle owner to add your address to the whitelist.');

        // Try to get owner address
        try {
          const owner = await this.oracleContract.owner();
          console.warn(`📋 Oracle owner: ${owner}`);
        } catch (error) {
          console.warn('Failed to get oracle owner address');
        }
      }
    } catch (error) {
      console.error('❌ Failed to check whitelist status:', error.message);
    }
  }

  async fetchPrices() {
    try {
      console.log('🔍 Fetching prices from API...');

      const response = await axios.get(this.priceApiUrl, {
        timeout: 10000 // 10 second timeout
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
        if (this.tokenAddresses[symbol]) {
          // Convert price to 18-decimal format (e18 based)
          // For example: 1.01 becomes 101e16 = 1.01e18
          const priceInWei = ethers.parseEther(item.price.toString());

          prices[symbol] = {
            address: this.tokenAddresses[symbol],
            price: priceInWei,
            rawPrice: item.price
          };

          console.log(`💰 ${symbol}: $${item.price} (${priceInWei.toString()} wei = ${item.price}e18)`);
        }
      }

      console.log(`✅ Successfully fetched ${Object.keys(prices).length} prices`);
      return prices;

    } catch (error) {
      console.error('❌ Failed to fetch prices:', error.message);
      throw error;
    }
  }

  async updatePrices(priceData) {
    try {
      console.log('📝 Updating oracle prices...');

      if (Object.keys(priceData).length === 0) {
        console.log('⚠️  No prices to update');
        return;
      }

      // Check current gas price
      const feeData = await this.provider.getFeeData();
      console.log(`⛽ Gas price: ${ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei`);

      // Update each price individually using setDirectPrice
      let successCount = 0;
      let failCount = 0;

      for (const [symbol, data] of Object.entries(priceData)) {
        try {
          console.log(`🔄 Updating ${symbol} price: $${data.rawPrice}`);

          const tx = await this.oracleContract.setDirectPrice(data.address, data.price, {
            gasLimit: 200000, // Set a reasonable gas limit per transaction
          });

          console.log(`📤 Transaction sent for ${symbol}: ${tx.hash}`);
          console.log('⏳ Waiting for confirmation...');

          const receipt = await tx.wait();

          if (receipt.status === 1) {
            console.log(`✅ ${symbol} price update successful!`);
            console.log(`📊 Block: ${receipt.blockNumber}, Gas used: ${receipt.gasUsed.toString()}`);
            successCount++;
          } else {
            console.log(`❌ ${symbol} transaction failed`);
            failCount++;
          }

          // Wait a bit between transactions to avoid nonce issues
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`❌ Failed to update ${symbol} price:`, error.message);
          failCount++;

          // Check specific error types
          if (error.message.includes('Not whitelisted')) {
            console.log('💡 Tip: This wallet is not whitelisted for price updates.');
            break; // Stop trying other tokens if not whitelisted
          }

          if (error.message.includes('gas')) {
            console.log('💡 Tip: This might be a gas estimation issue. Check if wallet has enough balance.');
          }
        }
      }

      console.log(`📊 Update Summary: ${successCount} successful, ${failCount} failed`);

    } catch (error) {
      console.error('❌ Failed to update prices:', error.message);
      throw error;
    }
  }

  async runUpdate() {
    try {
      console.log('\n🔄 Starting price update cycle...');
      console.log(`⏰ ${new Date().toISOString()}`);

      // Fetch latest prices
      const priceData = await this.fetchPrices();

      // Update oracle
      await this.updatePrices(priceData);

      this.lastUpdateTime = new Date().toISOString();
      this.updateCount++;
      console.log('✅ Update cycle completed successfully\n');

    } catch (error) {
      console.error('❌ Update cycle failed:', error.message);
      this.errorCount++;
      console.log('🔄 Will retry on next cycle\n');
    }
  }

  startUpdateLoop() {
    console.log('🚀 Starting price update loop...');

    // Run immediately on start
    this.runUpdate();

    // Then run on interval
    setInterval(() => {
      this.runUpdate();
    }, this.updateInterval);

    console.log(`⏱️  Updates scheduled every ${process.env.UPDATE_INTERVAL_MINUTES} minutes`);
  }

  // Graceful shutdown
  shutdown() {
    console.log('🛑 Shutting down Oracle Bot...');
    process.exit(0);
  }

  // Health check status
  getHealthStatus() {
    return {
      status: this.isInitialized ? 'healthy' : 'unhealthy',
      initialized: this.isInitialized,
      lastUpdate: this.lastUpdateTime,
      updateCount: this.updateCount,
      errorCount: this.errorCount,
      oracle: this.oracleAddress,
      timestamp: new Date().toISOString()
    };
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  process.exit(0);
});

// Start the bot and health check server
console.log('🎯 KiloLend Oracle Bot Starting...');
console.log('================================');

const bot = new OracleBot();

// Create Express server for health checks
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  const health = bot.getHealthStatus();
  
  if (health.status === 'healthy') {
    res.status(200).json(health);
  } else {
    res.status(503).json(health);
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
  console.log(`📊 Health check available at: /health`);
});

const { ethers } = require('ethers');
const dotenv = require('dotenv');
const express = require('express');
const KiloPointCalculator = require('./src/KiloPointCalculator.js');
const PriceManager = require('./src/PriceManager.js');
const StatsManager = require('./src/StatsManager.js');
const DatabaseService = require('./src/DatabaseService.js');
const BalanceManager = require('./src/BalanceManager.js');

// Load environment variables
dotenv.config();

// CToken ABI - events we need to listen to
const CTOKEN_ABI = [
  "event Mint(address minter, uint256 mintAmount, uint256 mintTokens)",
  "event Redeem(address redeemer, uint256 redeemAmount, uint256 redeemTokens)",
  "event Borrow(address borrower, uint256 borrowAmount, uint256 accountBorrows, uint256 totalBorrows)",
  "event RepayBorrow(address payer, address borrower, uint256 repayAmount, uint256 accountBorrows, uint256 totalBorrows)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function underlying() view returns (address)"
];

class KiloPointBot {
  constructor() {
    this.rpcUrl = process.env.RPC_URL;
    this.pollInterval = parseInt(process.env.POLL_INTERVAL_SECONDS || '60') * 1000;
    
    // Smart scanning configuration
    this.scanWindowSeconds = parseInt(process.env.SCAN_WINDOW_SECONDS || '60');
    this.maxBlocksPerScan = parseInt(process.env.MAX_BLOCKS_PER_SCAN || '100');
    
    // KILO Points distribution configuration
    const dailyKiloDistribution = parseInt(process.env.DAILY_KILO_DISTRIBUTION || '100000');
    
    // Market configuration
    this.markets = {
      [process.env.CUSDT_ADDRESS]: {
        symbol: 'cUSDT',
        underlying: process.env.USDT_ADDRESS,
        underlyingSymbol: 'USDT',
        decimals: 6
      },
      [process.env.CSIX_ADDRESS]: {
        symbol: 'cSIX', 
        underlying: process.env.SIX_ADDRESS,
        underlyingSymbol: 'SIX',
        decimals: 18
      },
      [process.env.CBORA_ADDRESS]: {
        symbol: 'cBORA',
        underlying: process.env.BORA_ADDRESS, 
        underlyingSymbol: 'BORA',
        decimals: 18
      },
      [process.env.CMBX_ADDRESS]: {
        symbol: 'cMBX',
        underlying: process.env.MBX_ADDRESS,
        underlyingSymbol: 'MBX', 
        decimals: 18
      },
      [process.env.CKAIA_ADDRESS]: {
        symbol: 'cKAIA',
        underlying: ethers.ZeroAddress,
        underlyingSymbol: 'KAIA',
        decimals: 18
      },
      [process.env.CSTKAIA_ADDRESS]: {
        symbol: 'cSTKAIA',
        underlying: process.env.STKAIA_ADDRESS,
        underlyingSymbol: 'STKAIA',
        decimals: 18
      }
    };

    this.lastProcessedBlock = null;
    this.provider = null;
    
    this.init();
  }

  async init() {
    try {
      console.log('🔧 Initializing Kilo Point Bot...');
      
      this.validateConfig();
      
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);

      const network = await this.provider.getNetwork();
      console.log(`📡 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

      this.lastProcessedBlock = await this.provider.getBlockNumber();

      // Initialize managers
      this.databaseService = new DatabaseService(process.env.API_BASE_URL);
      this.priceManager = new PriceManager(`${process.env.API_BASE_URL}/prices`);
      this.balanceManager = new BalanceManager(this.provider, this.markets);
      this.statsManager = new StatsManager(this.databaseService);
      this.kiloCalculator = new KiloPointCalculator(parseInt(process.env.DAILY_KILO_DISTRIBUTION || '100000'));

      console.log('✅ Kilo Point Bot initialized successfully'); 
      console.log(`📍 Starting from block: ${this.lastProcessedBlock} (current)`);
      console.log(`📍 Tracking ${Object.keys(this.markets).length} markets`);
      console.log(`⏱️  Scan window: ${this.scanWindowSeconds} seconds (~${this.scanWindowSeconds} blocks)`);
      console.log(`🎯 Daily KILO distribution: ${this.kiloCalculator.dailyKiloDistribution.toLocaleString()} KILO`);
      console.log('💡 Base TVL calculated from cToken balance percentages');
      
      // Log market info
      for (const [cTokenAddress, market] of Object.entries(this.markets)) {
        console.log(`  ${market.symbol} (${market.underlyingSymbol}): ${cTokenAddress}`);
      }

      await this.priceManager.fetchPrices();
      
      // Test database connection
      await this.databaseService.testConnection();
      
      // Initialize with existing users
      await this.initializeExistingUsers();
      
      console.log('🎯 Using smart polling for reliable monitoring...');
      this.startSmartPolling();
      
    } catch (error) {
      console.error('❌ Failed to initialize Kilo Point Bot:', error.message);
      process.exit(1);
    }
  }

  validateConfig() {
    const required = [
      'RPC_URL', 'CUSDT_ADDRESS', 'CSIX_ADDRESS', 
      'CBORA_ADDRESS', 'CMBX_ADDRESS', 'CKAIA_ADDRESS', 'CSTKAIA_ADDRESS'
    ];
    
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }

  formatTokenAmount(amount, decimals) {
    return ethers.formatUnits(amount, decimals);
  }

  async calculateUSDValue(underlyingSymbol, amount, decimals) {
    try {
      const tokenAmount = parseFloat(this.formatTokenAmount(amount, decimals));
      const tokenPrice = await this.priceManager.getTokenPrice(underlyingSymbol);
      const usdValue = tokenAmount * tokenPrice;
      
      return {
        tokenAmount,
        tokenPrice,
        usdValue
      };
    } catch (error) {
      console.warn('⚠️  Failed to calculate USD value:', error.message);
      return {
        tokenAmount: 0,
        tokenPrice: 0,
        usdValue: 0
      };
    }
  }

  /**
   * Initialize existing users and calculate their base TVL
   * This ensures users who contributed before the script started are included
   */
  async initializeExistingUsers() {
    try {
      console.log('\n📊 INITIALIZING EXISTING USERS...');
      console.log('=================================');
      
      // Fetch all users from the API
      const allUsers = await this.databaseService.getAllUsers();
      
      if (allUsers.length === 0) {
        console.log('💭 No existing users found in the system');
        return;
      }
      
      console.log(`🚀 Found ${allUsers.length} existing users, calculating base TVL...`);
      
      // Calculate base TVL for all existing users
      const existingUserBaseTVL = await this.balanceManager.calculateBaseTVLForUsers(allUsers);
      
      // Initialize stats manager with existing users' base TVL
      let usersWithTVL = 0;
      let usersWithZeroTVL = 0;
      let usersWithErrors = 0;
      
      for (const userAddress of allUsers) {
        const baseTVLData = existingUserBaseTVL[userAddress];
        
        if (baseTVLData && baseTVLData.error) {
          console.log(`❌ Error calculating TVL for ${userAddress.slice(0, 8)}...: ${baseTVLData.error}`);
          usersWithErrors++;
          // Still initialize with zero TVL to ensure user is tracked
          this.statsManager.initializeUserBaseTVL(userAddress, 0, {});
        } else if (baseTVLData) {
          if (baseTVLData.totalBaseTVL > 0) {
            this.statsManager.initializeUserBaseTVL(userAddress, baseTVLData.totalBaseTVL, baseTVLData.marketBreakdown);
            console.log(`✅ Initialized ${userAddress.slice(0, 8)}... with ${baseTVLData.totalBaseTVL.toFixed(2)} base TVL (${baseTVLData.marketsWithBalance} markets)`);
            usersWithTVL++;
          } else {
            this.statsManager.initializeUserBaseTVL(userAddress, 0, baseTVLData.marketBreakdown);
            console.log(`💭 Initialized ${userAddress.slice(0, 8)}... with 0.00 base TVL (no balances)`);
            usersWithZeroTVL++;
          }
        } else {
          console.log(`⚠️  No TVL data found for ${userAddress.slice(0, 8)}...`);
          usersWithErrors++;
          // Still initialize with zero TVL to ensure user is tracked
          this.statsManager.initializeUserBaseTVL(userAddress, 0, {});
        }
      }
      
      console.log(`\n🏆 Initialization Complete:`);
      console.log(`   • Total users loaded: ${allUsers.length}`);
      console.log(`   • Users with TVL > 0: ${usersWithTVL}`);
      console.log(`   • Users with TVL = 0: ${usersWithZeroTVL}`);
      console.log(`   • Users with errors: ${usersWithErrors}`);
      console.log(`   • Total users tracked: ${this.statsManager.getUsers().length}`);
      console.log('=================================\n');
      
      // Verify all users are being tracked
      const trackedUsers = this.statsManager.getUsers();
      if (trackedUsers.length !== allUsers.length) {
        console.warn(`⚠️  Warning: Only ${trackedUsers.length}/${allUsers.length} users are being tracked!`);
        console.warn(`📍 Missing users: ${allUsers.filter(u => !trackedUsers.includes(u)).map(u => u.slice(0, 8) + '...').join(', ')}`);
      } else {
        console.log(`✅ All ${allUsers.length} users are successfully being tracked`);
      }
      
    } catch (error) {
      console.error('❌ Error initializing existing users:', error.message);
      console.log('💡 Continuing without existing user data - new events will still be tracked');
    }
  }

  async updateDailyStats(user, market, usdValue, type) {
    const newDay = this.statsManager.updateDailyStats(user, market, usdValue, type);
    
    // If new day started, print summary and reset
    if (newDay) {
      this.statsManager.printDailySummary(this.kiloCalculator, this.balanceManager);
      this.statsManager.reset();
      
      // NEW: Re-initialize existing users after daily reset
      await this.statsManager.reinitializeExistingUsers(this.databaseService, this.balanceManager);
      
      // Re-update for the new day
      this.statsManager.updateDailyStats(user, market, usdValue, type);
    }
  }

  async handleMintEvent(minter, mintAmount, mintTokens, event, market) {
    try {
      const calculation = await this.calculateUSDValue(
        market.underlyingSymbol,
        mintAmount,
        market.decimals
      );

      console.log('🟢 SUPPLY (MINT) EVENT');
      console.log(`📍 Market: ${market.symbol} (${market.underlyingSymbol})`);
      console.log(`👤 User: ${minter}`);
      console.log(`💰 Amount: ${calculation.tokenAmount.toFixed(6)} ${market.underlyingSymbol}`);
      console.log(`💵 Price: $${calculation.tokenPrice.toFixed(6)}`);
      console.log(`💲 USD Value: $${calculation.usdValue.toFixed(2)}`);
      console.log(`📦 Block: ${event.blockNumber}`);
      console.log(`🆔 Tx: ${event.transactionHash}`);
      console.log('─'.repeat(50));

      await this.updateDailyStats(minter, market.underlyingSymbol, calculation.usdValue, 'mint');
      
    } catch (error) {
      console.error('❌ Error handling Mint event:', error.message);
    }
  }

  async handleRedeemEvent(redeemer, redeemAmount, redeemTokens, event, market) {
    try {
      const calculation = await this.calculateUSDValue(
        market.underlyingSymbol,
        redeemAmount,
        market.decimals
      );

      console.log('🔴 WITHDRAW (REDEEM) EVENT');
      console.log(`📍 Market: ${market.symbol} (${market.underlyingSymbol})`);
      console.log(`👤 User: ${redeemer}`);
      console.log(`💰 Amount: ${calculation.tokenAmount.toFixed(6)} ${market.underlyingSymbol}`);
      console.log(`💵 Price: $${calculation.tokenPrice.toFixed(6)}`);
      console.log(`💲 USD Value: $${calculation.usdValue.toFixed(2)}`);
      console.log(`📦 Block: ${event.blockNumber}`);
      console.log(`🆔 Tx: ${event.transactionHash}`);
      console.log('─'.repeat(50));

      await this.updateDailyStats(redeemer, market.underlyingSymbol, calculation.usdValue, 'redeem');
      
    } catch (error) {
      console.error('❌ Error handling Redeem event:', error.message);
    }
  }

  async handleBorrowEvent(borrower, borrowAmount, accountBorrows, totalBorrows, event, market) {
    try {
      const calculation = await this.calculateUSDValue(
        market.underlyingSymbol,
        borrowAmount,
        market.decimals
      );

      console.log('🟠 BORROW EVENT');
      console.log(`📍 Market: ${market.symbol} (${market.underlyingSymbol})`);
      console.log(`👤 User: ${borrower}`);
      console.log(`💰 Amount: ${calculation.tokenAmount.toFixed(6)} ${market.underlyingSymbol}`);
      console.log(`💵 Price: $${calculation.tokenPrice.toFixed(6)}`);
      console.log(`💲 USD Value: $${calculation.usdValue.toFixed(2)}`);
      console.log(`📦 Block: ${event.blockNumber}`);
      console.log(`🆔 Tx: ${event.transactionHash}`);
      console.log('─'.repeat(50));

      await this.updateDailyStats(borrower, market.underlyingSymbol, calculation.usdValue, 'borrow');
      
    } catch (error) {
      console.error('❌ Error handling Borrow event:', error.message);
    }
  }

  async handleRepayBorrowEvent(payer, borrower, repayAmount, accountBorrows, totalBorrows, event, market) {
    try {
      const calculation = await this.calculateUSDValue(
        market.underlyingSymbol,
        repayAmount,
        market.decimals
      );

      console.log('🟡 REPAY EVENT');
      console.log(`📍 Market: ${market.symbol} (${market.underlyingSymbol})`);
      console.log(`👤 Payer: ${payer}`);
      console.log(`👤 Borrower: ${borrower}`);
      console.log(`💰 Amount: ${calculation.tokenAmount.toFixed(6)} ${market.underlyingSymbol}`);
      console.log(`💵 Price: $${calculation.tokenPrice.toFixed(6)}`);
      console.log(`💲 USD Value: $${calculation.usdValue.toFixed(2)}`);
      console.log(`📦 Block: ${event.blockNumber}`);
      console.log(`🆔 Tx: ${event.transactionHash}`);
      console.log('─'.repeat(50));

      await this.updateDailyStats(borrower, market.underlyingSymbol, calculation.usdValue, 'repay');
      
    } catch (error) {
      console.error('❌ Error handling RepayBorrow event:', error.message);
    }
  }

  startSmartPolling() {
    console.log('🔄 Starting smart polling mode...');
    console.log(`⏱️  Polling every ${this.pollInterval / 1000} seconds`);
    console.log(`🎯 Scanning only last ${this.scanWindowSeconds} seconds (~${this.scanWindowSeconds} blocks)`);
    console.log('─'.repeat(50));

    this.processRecentEvents();
    
    setInterval(() => {
      this.processRecentEvents();
    }, this.pollInterval);

    // Print daily summary every hour
    setInterval(() => {
        this.statsManager.printDailySummary(this.kiloCalculator, this.balanceManager);
    }, 60 * 60 * 1000);
  }

  async processRecentEvents() {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      
      // Validate current block number
      if (!currentBlock || currentBlock <= 0) {
        console.warn('⚠️  Invalid current block number, skipping scan');
        return;
      }

      const blocksToScan = Math.min(this.scanWindowSeconds, this.maxBlocksPerScan);
      const fromBlock = Math.max(currentBlock - blocksToScan, this.lastProcessedBlock || currentBlock - blocksToScan);
      const toBlock = currentBlock;

      if (toBlock <= fromBlock) {
        return;
      }

      // Validate block range before scanning
      if (!(await this.validateBlockRange(fromBlock, toBlock))) {
        console.warn(`⚠️  Invalid block range ${fromBlock}-${toBlock}, adjusting scan window`);
        // Fallback to smaller range
        const fallbackFromBlock = Math.max(currentBlock - 10, 0);
        if (fallbackFromBlock >= currentBlock) {
          return;
        }
        return this.scanBlockRange(fallbackFromBlock, currentBlock);
      }

      console.log(`🔍 Scanning recent blocks ${fromBlock} to ${toBlock} (${toBlock - fromBlock + 1} blocks)...`);
      
      await this.scanBlockRange(fromBlock, toBlock);
      
    } catch (error) {
      console.error('❌ Error processing recent events:', error.message);
      // Don't update lastProcessedBlock on error to retry next time
    }
  }

  /**
   * Validate that a block range exists and is accessible
   */
  async validateBlockRange(fromBlock, toBlock) {
    try {
      // Test the latest block first
      const latestBlock = await this.provider.getBlock(toBlock);
      if (!latestBlock) {
        console.warn(`⚠️  Block ${toBlock} does not exist`);
        return false;
      }

      // Test the earliest block
      if (fromBlock > 0) {
        const earliestBlock = await this.provider.getBlock(fromBlock);
        if (!earliestBlock) {
          console.warn(`⚠️  Block ${fromBlock} does not exist`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.warn(`⚠️  Block range validation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Scan a validated block range for events
   */
  async scanBlockRange(fromBlock, toBlock) {
    let totalEventsFound = 0;
    let successfulMarkets = 0;
    let failedMarkets = 0;

    for (const [cTokenAddress, market] of Object.entries(this.markets)) {
      try {
        const events = await this.getMarketEvents(cTokenAddress, market, fromBlock, toBlock);
        
        if (events.length > 0) {
          console.log(`✅ Processed ${events.length} events for ${market.symbol}`);
          totalEventsFound += events.length;
        }
        
        successfulMarkets++;
        
      } catch (error) {
        console.error(`❌ Error processing events for ${market.symbol}:`, error.message);
        failedMarkets++;
        
        // Continue with other markets even if one fails
        continue;
      }
    }

    // Update last processed block only if at least one market succeeded
    if (successfulMarkets > 0) {
      this.lastProcessedBlock = toBlock;
    }

    console.log(`📊 Scan summary: ${successfulMarkets} successful, ${failedMarkets} failed markets`);
    
    if (totalEventsFound === 0) {
      console.log(`✅ Scan complete - no events found in range ${fromBlock}-${toBlock}`);
    } else {
      console.log(`🎯 Total events processed: ${totalEventsFound}`);
    }
  }

  /**
   * Get events for a specific market with retry logic
   */
  async getMarketEvents(cTokenAddress, market, fromBlock, toBlock, maxRetries = 3) {
    const contract = new ethers.Contract(cTokenAddress, CTOKEN_ABI, this.provider);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const [mintEvents, redeemEvents, borrowEvents, repayEvents] = await Promise.all([
          contract.queryFilter(contract.filters.Mint(), fromBlock, toBlock),
          contract.queryFilter(contract.filters.Redeem(), fromBlock, toBlock),
          contract.queryFilter(contract.filters.Borrow(), fromBlock, toBlock),
          contract.queryFilter(contract.filters.RepayBorrow(), fromBlock, toBlock)
        ]);

        const allEvents = [
          ...mintEvents.map(e => ({ ...e, type: 'mint' })),
          ...redeemEvents.map(e => ({ ...e, type: 'redeem' })),
          ...borrowEvents.map(e => ({ ...e, type: 'borrow' })),
          ...repayEvents.map(e => ({ ...e, type: 'repay' }))
        ];

        // Sort events by block number and transaction index
        allEvents.sort((a, b) => {
          if (a.blockNumber !== b.blockNumber) {
            return a.blockNumber - b.blockNumber;
          }
          return a.transactionIndex - b.transactionIndex;
        });

        // Process events
        for (const event of allEvents) {
          switch (event.type) {
            case 'mint':
              await this.handleMintEvent(event.args[0], event.args[1], event.args[2], event, market);
              break;
            case 'redeem':
              await this.handleRedeemEvent(event.args[0], event.args[1], event.args[2], event, market);
              break;
            case 'borrow':
              await this.handleBorrowEvent(event.args[0], event.args[1], event.args[2], event.args[3], event, market);
              break;
            case 'repay':
              await this.handleRepayBorrowEvent(event.args[0], event.args[1], event.args[2], event.args[3], event.args[4], event, market);
              break;
          }
        }

        return allEvents;

      } catch (error) {
        console.warn(`⚠️  Attempt ${attempt}/${maxRetries} failed for ${market.symbol}: ${error.message}`);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async shutdown() {
    console.log('🛑 Shutting down Kilo Point Bot...');
    
    if (this.statsManager.getTotalEvents() > 0) {
      await this.statsManager.printDailySummary(this.kiloCalculator, this.balanceManager);
    }
    
    process.exit(0);
  }

  // Health check status
  getHealthStatus() {
    return {
      status: this.provider ? 'healthy' : 'unhealthy',
      initialized: !!this.provider,
      lastProcessedBlock: this.lastProcessedBlock,
      marketsTracked: Object.keys(this.markets).length,
      pollInterval: this.pollInterval,
      scanWindow: this.scanWindowSeconds,
      timestamp: new Date().toISOString()
    };
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Received SIGINT, shutting down...');
  if (global.pointBot) {
    global.pointBot.shutdown();
  } else {
    process.exit(0);
  }
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 Received SIGTERM, shutting down...');
  if (global.pointBot) {
    global.pointBot.shutdown();
  } else {
    process.exit(0);
  }
});

// Start the bot
console.log('🎯 KiloLend Point Bot Starting...');
console.log('==================================');

const bot = new KiloPointBot();
global.pointBot = bot;

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

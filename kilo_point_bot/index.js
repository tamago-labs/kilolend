const { ethers } = require('ethers');
const dotenv = require('dotenv');
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
      'CBORA_ADDRESS', 'CMBX_ADDRESS', 'CKAIA_ADDRESS'
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
      for (const userAddress of allUsers) {
        const baseTVLData = existingUserBaseTVL[userAddress];
        if (baseTVLData && baseTVLData.totalBaseTVL > 0) {
          this.statsManager.initializeUserBaseTVL(userAddress, baseTVLData.totalBaseTVL, baseTVLData.marketBreakdown);
          console.log(`✅ Initialized ${userAddress.slice(0, 8)}... with ${baseTVLData.totalBaseTVL.toFixed(2)} base TVL`);
          usersWithTVL++;
        }
      }
      
      console.log(`\n🏆 Initialization Complete:`);
      console.log(`   • Total users: ${allUsers.length}`);
      console.log(`   • Users with TVL: ${usersWithTVL}`);
      console.log(`   • Ready to track new events!`);
      console.log('=================================\n');
      
    } catch (error) {
      console.error('❌ Error initializing existing users:', error.message);
      console.log('💡 Continuing without existing user data - new events will still be tracked');
    }
  }

  updateDailyStats(user, market, usdValue, type) {
    const newDay = this.statsManager.updateDailyStats(user, market, usdValue, type);
    
    // If new day started, print summary and reset
    if (newDay) {
      this.statsManager.printDailySummary(this.kiloCalculator, this.balanceManager);
      this.statsManager.reset();
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

      this.updateDailyStats(minter, market.underlyingSymbol, calculation.usdValue, 'mint');
      
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

      this.updateDailyStats(redeemer, market.underlyingSymbol, calculation.usdValue, 'redeem');
      
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

      this.updateDailyStats(borrower, market.underlyingSymbol, calculation.usdValue, 'borrow');
      
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

      this.updateDailyStats(borrower, market.underlyingSymbol, calculation.usdValue, 'repay');
      
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
      
      const blocksToScan = Math.min(this.scanWindowSeconds, this.maxBlocksPerScan);
      const fromBlock = Math.max(currentBlock - blocksToScan, this.lastProcessedBlock || currentBlock - blocksToScan);
      const toBlock = currentBlock;

      if (toBlock <= fromBlock) {
        return;
      }

      console.log(`🔍 Scanning recent blocks ${fromBlock} to ${toBlock} (${toBlock - fromBlock + 1} blocks)...`);

      let totalEventsFound = 0;

      for (const [cTokenAddress, market] of Object.entries(this.markets)) {
        const contract = new ethers.Contract(cTokenAddress, CTOKEN_ABI, this.provider);

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

          allEvents.sort((a, b) => {
            if (a.blockNumber !== b.blockNumber) {
              return a.blockNumber - b.blockNumber;
            }
            return a.transactionIndex - b.transactionIndex;
          });

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

          if (allEvents.length > 0) {
            console.log(`✅ Processed ${allEvents.length} events for ${market.symbol}`);
            totalEventsFound += allEvents.length;
          }

        } catch (error) {
          console.error(`❌ Error processing events for ${market.symbol}:`, error.message);
        }
      }

      if (totalEventsFound === 0) {
        console.log(`✅ Scan complete - no events found in last ${this.scanWindowSeconds}s`);
      } else {
        console.log(`🎯 Total events processed: ${totalEventsFound}`);
      }

      this.lastProcessedBlock = currentBlock;
      
    } catch (error) {
      console.error('❌ Error processing recent events:', error.message);
    }
  }

  async shutdown() {
    console.log('🛑 Shutting down Kilo Point Bot...');
    
    if (this.statsManager.getTotalEvents() > 0) {
      await this.statsManager.printDailySummary(this.kiloCalculator, this.balanceManager);
    }
    
    process.exit(0);
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

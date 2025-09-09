import { ethers } from 'ethers';
import axios from 'axios';
import dotenv from 'dotenv';

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
    this.priceApiUrl = process.env.PRICE_API_URL;
    this.pollInterval = parseInt(process.env.POLL_INTERVAL_SECONDS || '60') * 1000;
    
    // Smart scanning configuration
    this.scanWindowSeconds = parseInt(process.env.SCAN_WINDOW_SECONDS || '60'); // Only scan last 60 seconds
    this.maxBlocksPerScan = parseInt(process.env.MAX_BLOCKS_PER_SCAN || '100'); // Safety limit
    
    // Market configuration
    this.markets = {
      [process.env.CUSDT_ADDRESS]: {
        symbol: 'cUSDT',
        underlying: process.env.USDT_ADDRESS,
        underlyingSymbol: 'USDT',
        decimals: 6 // USDT has 6 decimals
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
        underlying: ethers.ZeroAddress, // Native KAIA
        underlyingSymbol: 'KAIA',
        decimals: 18
      }
    };

    // Price cache to avoid repeated API calls
    this.priceCache = {
      data: {},
      lastUpdate: 0,
      cacheDuration: 15 * 60 * 1000 // 15 minutes cache
    };

    // Daily statistics tracking
    this.dailyStats = {
      users: new Set(),
      tvlChanges: {},
      borrowChanges: {},
      totalEvents: 0
    };

    this.lastProcessedBlock = null;
    this.provider = null;
    this.currentDate = this.getCurrentDate();
    
    this.init();
  }

  getCurrentDate() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  async init() {
    try {
      console.log('🔧 Initializing Kilo Point Bot...');
      
      // Validate environment variables
      this.validateConfig();
      
      // Setup provider
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);

      // Test connection
      const network = await this.provider.getNetwork();
      console.log(`📡 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

      // Initialize starting block (current block for smart scanning)
      this.lastProcessedBlock = await this.provider.getBlockNumber();

      console.log('✅ Kilo Point Bot initialized successfully');
      console.log(`📍 Price API: ${this.priceApiUrl}`);
      console.log(`📍 Starting from block: ${this.lastProcessedBlock} (current)`);
      console.log(`📍 Tracking ${Object.keys(this.markets).length} markets`);
      console.log(`⏱️  Scan window: ${this.scanWindowSeconds} seconds (~${this.scanWindowSeconds} blocks)`);
      
      // Log market info
      for (const [cTokenAddress, market] of Object.entries(this.markets)) {
        console.log(`  ${market.symbol} (${market.underlyingSymbol}): ${cTokenAddress}`);
      }

      // Test price API connection
      await this.fetchPrices();
      
      // Start smart polling
      console.log('🎯 Using smart polling for reliable monitoring...');
      this.startSmartPolling();
      
    } catch (error) {
      console.error('❌ Failed to initialize Kilo Point Bot:', error.message);
      process.exit(1);
    }
  }

  validateConfig() {
    const required = [
      'RPC_URL', 'PRICE_API_URL', 'CUSDT_ADDRESS', 'CSIX_ADDRESS', 
      'CBORA_ADDRESS', 'CMBX_ADDRESS', 'CKAIA_ADDRESS'
    ];
    
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }

  async fetchPrices() {
    try {
      // Check cache first
      const now = Date.now();
      if (now - this.priceCache.lastUpdate < this.priceCache.cacheDuration) {
        return this.priceCache.data;
      }

      const response = await axios.get(this.priceApiUrl, {
        timeout: 10000 // 10 second timeout
      });
      
      if (!response.data || !response.data.success) {
        throw new Error('API response indicates failure');
      }
      
      const prices = {
        // USDT is always $1.00
        'USDT': 1.0
      };
      const priceData = response.data.data;
      
      // Process each price from API
      for (const item of priceData) {
        const symbol = item.symbol;
        
        // Map API symbols to our markets (skip USDT since we hardcode it)
        if (symbol === 'MARBLEX') {
          prices['MBX'] = item.price;
        } else if (symbol !== 'USDT') { // Skip USDT from API
          prices[symbol] = item.price;
        }
      }
      
      // Update cache
      this.priceCache.data = prices;
      this.priceCache.lastUpdate = now;
      
      console.log(`✅ Successfully fetched ${Object.keys(prices).length} prices`);
      console.log(`   USDT: $1.00 (stablecoin - hardcoded)`);
      for (const [symbol, price] of Object.entries(prices)) {
        if (symbol !== 'USDT') {
          console.log(`   ${symbol}: $${price}`);
        }
      }
      
      return prices;
      
    } catch (error) {
      console.error('❌ Failed to fetch prices:', error.message);
      // Return cached prices if available, with USDT fallback
      if (Object.keys(this.priceCache.data).length > 0) {
        console.log('⚠️  Using cached prices');
        return this.priceCache.data;
      }
      
      // Emergency fallback with just USDT
      console.log('⚠️  Using emergency fallback prices');
      return { 'USDT': 1.0 };
    }
  }

  async getTokenPrice(underlyingSymbol) {
    try {
      const prices = await this.fetchPrices();
      
      // USDT is always $1.00
      if (underlyingSymbol === 'USDT') {
        return 1.0;
      }
      
      return prices[underlyingSymbol] || 0;
    } catch (error) {
      console.warn(`⚠️  Failed to get price for ${underlyingSymbol}:`, error.message);
      
      // Return $1 for USDT even on error
      if (underlyingSymbol === 'USDT') {
        return 1.0;
      }
      
      return 0;
    }
  }

  formatTokenAmount(amount, decimals) {
    return ethers.formatUnits(amount, decimals);
  }

  async calculateUSDValue(underlyingSymbol, amount, decimals) {
    try {
      const tokenAmount = parseFloat(this.formatTokenAmount(amount, decimals));
      const tokenPrice = await this.getTokenPrice(underlyingSymbol);
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

  updateDailyStats(user, market, usdValue, type) {
    // Check if we need to reset daily stats (new day)
    const currentDate = this.getCurrentDate();
    if (currentDate !== this.currentDate) {
      this.printDailySummary();
      this.resetDailyStats();
      this.currentDate = currentDate;
    }

    // Track unique users
    this.dailyStats.users.add(user);
    this.dailyStats.totalEvents++;

    // Initialize market stats if needed
    if (!this.dailyStats.tvlChanges[market]) {
      this.dailyStats.tvlChanges[market] = 0;
    }
    if (!this.dailyStats.borrowChanges[market]) {
      this.dailyStats.borrowChanges[market] = 0;
    }

    // Update stats based on event type
    switch (type) {
      case 'mint':
        this.dailyStats.tvlChanges[market] += usdValue; // Add to TVL
        break;
      case 'redeem':
        this.dailyStats.tvlChanges[market] -= usdValue; // Subtract from TVL
        break;
      case 'borrow':
        this.dailyStats.borrowChanges[market] += usdValue; // Add to borrows
        break;
      case 'repay':
        this.dailyStats.borrowChanges[market] -= usdValue; // Subtract from borrows
        break;
    }
  }

  resetDailyStats() {
    this.dailyStats = {
      users: new Set(),
      tvlChanges: {},
      borrowChanges: {},
      totalEvents: 0
    };
  }

  printDailySummary() {
    console.log('\\n📊 DAILY SUMMARY');
    console.log('================');
    console.log(`📅 Date: ${this.currentDate}`);
    console.log(`👥 Unique Users: ${this.dailyStats.users.size}`);
    console.log(`🎯 Total Events: ${this.dailyStats.totalEvents}`);
    
    console.log('\\n💰 TVL Changes:');
    let totalTVLChange = 0;
    for (const [market, change] of Object.entries(this.dailyStats.tvlChanges)) {
      console.log(`  ${market}: ${change >= 0 ? '+' : ''}$${change.toFixed(2)}`);
      totalTVLChange += change;
    }
    console.log(`  🏆 Net TVL Change: ${totalTVLChange >= 0 ? '+' : ''}$${totalTVLChange.toFixed(2)}`);

    console.log('\\n🏦 Borrow Changes:');
    let totalBorrowChange = 0;
    for (const [market, change] of Object.entries(this.dailyStats.borrowChanges)) {
      console.log(`  ${market}: ${change >= 0 ? '+' : ''}$${change.toFixed(2)}`);
      totalBorrowChange += change;
    }
    console.log(`  🏆 Net Borrow Change: ${totalBorrowChange >= 0 ? '+' : ''}$${totalBorrowChange.toFixed(2)}`);
    console.log('================\\n');
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

      // Update daily stats
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

      // Update daily stats
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

      // Update daily stats
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

      // Update daily stats (use borrower for user tracking)
      this.updateDailyStats(borrower, market.underlyingSymbol, calculation.usdValue, 'repay');
      
    } catch (error) {
      console.error('❌ Error handling RepayBorrow event:', error.message);
    }
  }

  // Smart Polling Approach - only scan recent blocks
  startSmartPolling() {
    console.log('🔄 Starting smart polling mode...');
    console.log(`⏱️  Polling every ${this.pollInterval / 1000} seconds`);
    console.log(`🎯 Scanning only last ${this.scanWindowSeconds} seconds (~${this.scanWindowSeconds} blocks)`);
    console.log('─'.repeat(50));

    // Process events immediately
    this.processRecentEvents();
    
    // Then poll for new events
    setInterval(() => {
      this.processRecentEvents();
    }, this.pollInterval);

    // Print daily summary every hour
    setInterval(() => {
      if (this.dailyStats.totalEvents > 0) {
        this.printDailySummary();
      }
    }, 60 * 60 * 1000); // Every hour
  }

  async processRecentEvents() {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      
      // Calculate block range for the last scan window (e.g., 60 seconds)
      const blocksToScan = Math.min(this.scanWindowSeconds, this.maxBlocksPerScan);
      const fromBlock = Math.max(currentBlock - blocksToScan, this.lastProcessedBlock || currentBlock - blocksToScan);
      const toBlock = currentBlock;

      if (toBlock <= fromBlock) {
        return; // No new blocks to process
      }

      console.log(`🔍 Scanning recent blocks ${fromBlock} to ${toBlock} (${toBlock - fromBlock + 1} blocks)...`);

      let totalEventsFound = 0;

      // Process each market
      for (const [cTokenAddress, market] of Object.entries(this.markets)) {
        const contract = new ethers.Contract(cTokenAddress, CTOKEN_ABI, this.provider);

        try {
          // Get all events for this contract in the recent block range
          const [mintEvents, redeemEvents, borrowEvents, repayEvents] = await Promise.all([
            contract.queryFilter(contract.filters.Mint(), fromBlock, toBlock),
            contract.queryFilter(contract.filters.Redeem(), fromBlock, toBlock),
            contract.queryFilter(contract.filters.Borrow(), fromBlock, toBlock),
            contract.queryFilter(contract.filters.RepayBorrow(), fromBlock, toBlock)
          ]);

          // Process all events
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

          // Process events in order
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

  // Graceful shutdown
  shutdown() {
    console.log('🛑 Shutting down Kilo Point Bot...');
    
    if (this.dailyStats.totalEvents > 0) {
      this.printDailySummary();
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
global.pointBot = bot; // Store reference for graceful shutdown

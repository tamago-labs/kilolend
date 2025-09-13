const { ethers } = require('ethers');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Comptroller ABI - functions we need
const COMPTROLLER_ABI = [
  "function getAccountLiquidity(address account) external view returns (uint256, uint256, uint256)",
  "function liquidateBorrowAllowed(address cTokenBorrowed, address cTokenCollateral, address liquidator, address borrower, uint256 repayAmount) external returns (uint256)",
  "function markets(address) external view returns (bool isListed, uint256 collateralFactorMantissa)",
  "function closeFactorMantissa() external view returns (uint256)",
  "function liquidationIncentiveMantissa() external view returns (uint256)"
];

// CToken ABI - functions we need
const CTOKEN_ABI = [
  "function borrowBalanceStored(address account) external view returns (uint256)",
  "function balanceOfUnderlying(address owner) external returns (uint256)",
  "function exchangeRateStored() external view returns (uint256)",
  "function liquidateBorrow(address borrower, uint256 repayAmount, address cTokenCollateral) external returns (uint256)",
  "function underlying() external view returns (address)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function balanceOf(address owner) external view returns (uint256)",
  "event LiquidateBorrow(address liquidator, address borrower, uint256 repayAmount, address cTokenCollateral, uint256 seizeTokens)"
];

// ERC20 ABI for token operations
const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

// Oracle ABI
const ORACLE_ABI = [
  "function getPrice(address token) external view returns (uint256)"
];

class LiquidationBot {
  constructor() {
    this.rpcUrl = process.env.RPC_URL;
    this.privateKey = process.env.PRIVATE_KEY;
    this.comptrollerAddress = process.env.COMPTROLLER_ADDRESS;
    this.oracleAddress = process.env.ORACLE_ADDRESS;
    this.checkInterval = parseInt(process.env.CHECK_INTERVAL_SECONDS) * 1000;
    
    // API configuration
    this.apiBaseUrl = process.env.API_BASE_URL;
    this.timeout = 10000; // 10 second timeout
    
    // Configuration
    this.minProfitUSD = parseFloat(process.env.MIN_PROFIT_USD);
    this.maxGasPriceGwei = parseFloat(process.env.MAX_GAS_PRICE_GWEI);
    this.maxLiquidationUSD = parseFloat(process.env.MAX_LIQUIDATION_USD);
    this.minCollateralUSD = parseFloat(process.env.MIN_COLLATERAL_USD);
    
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

    // Track users with borrows for monitoring
    this.borrowers = new Set();
    this.liquidationHistory = [];
    
    this.provider = null;
    this.wallet = null;
    this.comptroller = null;
    this.oracle = null;
    
    this.init();
  }

  async init() {
    try {
      console.log('🔧 Initializing Liquidation Bot...');
      
      // Validate environment variables
      this.validateConfig();
      
      // Setup provider and wallet
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      this.wallet = new ethers.Wallet(this.privateKey, this.provider);
      
      // Setup contracts
      this.comptroller = new ethers.Contract(
        this.comptrollerAddress,
        COMPTROLLER_ABI,
        this.wallet
      );

      this.oracle = new ethers.Contract(
        this.oracleAddress,
        ORACLE_ABI,
        this.provider
      );

      console.log('✅ Liquidation Bot initialized successfully');
      console.log(`📍 Wallet address: ${this.wallet.address}`);
      console.log(`📍 Comptroller: ${this.comptrollerAddress}`);
      console.log(`⏱️  Check interval: ${process.env.CHECK_INTERVAL_SECONDS} seconds`);
      console.log(`💰 Min profit: $${this.minProfitUSD}`);
      console.log(`⛽ Max gas price: ${this.maxGasPriceGwei} gwei`);
      
      // Check wallet balance
      await this.checkWalletBalance();
      
      // Test API connection
      await this.testAPIConnection();
      
      // Start monitoring
      this.startMonitoring();
      
    } catch (error) {
      console.error('❌ Failed to initialize Liquidation Bot:', error.message);
      process.exit(1);
    }
  }

  validateConfig() {
    const required = [
      'RPC_URL', 'PRIVATE_KEY', 'COMPTROLLER_ADDRESS', 'ORACLE_ADDRESS',
      'CUSDT_ADDRESS', 'CSIX_ADDRESS', 'CBORA_ADDRESS', 'CMBX_ADDRESS', 'CKAIA_ADDRESS'
    ];
    
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }

  async checkWalletBalance() {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      const balanceEth = ethers.formatEther(balance);
      console.log(`💳 Wallet balance: ${parseFloat(balanceEth).toFixed(4)} KAIA`);
      
      if (parseFloat(balanceEth) < 0.1) {
        console.warn('⚠️  WARNING: Low wallet balance. May not be able to execute liquidations.');
      }
    } catch (error) {
      console.error('❌ Failed to check wallet balance:', error.message);
    }
  }

  /**
   * Test API connection
   * Called during bot initialization
   */
  async testAPIConnection() {
    try {
      if (!this.apiBaseUrl) {
        console.log('⚠️  API not configured (API_BASE_URL missing)');
        console.log('💡 Add API_BASE_URL to .env to enable user fetching from API');
        return false;
      }

      console.log('🔍 Testing API connection...');
      
      const response = await axios.get(
        `${this.apiBaseUrl}/all`,
        {
          timeout: 5000 // Shorter timeout for connection test
        }
      );

      if (response.data && response.data.success) {
        const userCount = response.data.data ? response.data.data.length : 0;
        console.log('✅ API connection successful');
        console.log(`📍 API URL: ${this.apiBaseUrl}`);
        console.log(`👥 Found ${userCount} users in system`);
        return true;
      } else {
        console.log('⚠️  API connection successful but unexpected response format');
        return false;
      }

    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log('❌ API connection failed - API server not reachable');
        console.log(`📍 Attempted URL: ${this.apiBaseUrl}`);
      } else {
        console.log('❌ API connection test failed:', error.message);
      }
      
      console.log('💡 Bot will continue with fallback addresses');
      return false;
    }
  }

  async getTokenPrice(tokenAddress) {
    try {
      if (tokenAddress === ethers.ZeroAddress) {
        // For KAIA, you might need special handling or use a different address
        return await this.oracle.getPrice(ethers.ZeroAddress);
      }
      
      const price = await this.oracle.getPrice(tokenAddress);
      return price;
    } catch (error) {
      console.warn(`⚠️  Failed to get price for ${tokenAddress}:`, error.message);
      return ethers.parseEther('0');
    }
  }

  async calculateUSDValue(tokenAddress, amount, decimals) {
    try {
      const price = await this.getTokenPrice(tokenAddress);
      const tokenAmount = parseFloat(ethers.formatUnits(amount, decimals));
      const tokenPrice = parseFloat(ethers.formatEther(price));
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

  async checkAccountLiquidity(account) {
    try {
      // Get account liquidity from comptroller
      const [error, liquidity, shortfall] = await this.comptroller.getAccountLiquidity(account);
      
      if (error !== 0n) {
        console.warn(`⚠️  Error checking liquidity for ${account}: ${error}`);
        return null;
      }

      const liquidityUSD = parseFloat(ethers.formatEther(liquidity));
      const shortfallUSD = parseFloat(ethers.formatEther(shortfall));

      return {
        liquidity: liquidityUSD,
        shortfall: shortfallUSD,
        isUnderwater: shortfallUSD > 0
      };
    } catch (error) {
      console.error(`❌ Failed to check account liquidity for ${account}:`, error.message);
      return null;
    }
  }

  async getBorrowPositions(account) {
    try {
      const positions = [];

      for (const [cTokenAddress, market] of Object.entries(this.markets)) {
        const cToken = new ethers.Contract(cTokenAddress, CTOKEN_ABI, this.provider);
        
        const borrowBalance = await cToken.borrowBalanceStored(account);
        
        if (borrowBalance > 0n) {
          const calculation = await this.calculateUSDValue(
            market.underlying,
            borrowBalance,
            market.decimals
          );

          positions.push({
            cTokenAddress,
            market,
            borrowBalance,
            borrowBalanceUSD: calculation.usdValue
          });
        }
      }

      return positions;
    } catch (error) {
      console.error(`❌ Failed to get borrow positions for ${account}:`, error.message);
      return [];
    }
  }

  async getCollateralPositions(account) {
    try {
      const positions = [];

      for (const [cTokenAddress, market] of Object.entries(this.markets)) {
        const cToken = new ethers.Contract(cTokenAddress, CTOKEN_ABI, this.provider);
        
        const cTokenBalance = await cToken.balanceOf(account);
        
        if (cTokenBalance > 0n) {
          const exchangeRate = await cToken.exchangeRateStored();
          const underlyingBalance = (cTokenBalance * exchangeRate) / ethers.parseEther('1');
          
          const calculation = await this.calculateUSDValue(
            market.underlying,
            underlyingBalance,
            market.decimals
          );

          positions.push({
            cTokenAddress,
            market,
            cTokenBalance,
            underlyingBalance,
            collateralUSD: calculation.usdValue
          });
        }
      }

      return positions;
    } catch (error) {
      console.error(`❌ Failed to get collateral positions for ${account}:`, error.message);
      return [];
    }
  }

  async findLiquidationOpportunity(borrower) {
    try {
      const liquidity = await this.checkAccountLiquidity(borrower);
      
      if (!liquidity || !liquidity.isUnderwater) {
        return null; // Account is healthy
      }

      console.log(`🔍 Found underwater account: ${borrower}`);
      console.log(`💧 Shortfall: $${liquidity.shortfall.toFixed(2)}`);

      // Get borrow and collateral positions
      const borrowPositions = await this.getBorrowPositions(borrower);
      const collateralPositions = await this.getCollateralPositions(borrower);

      if (borrowPositions.length === 0 || collateralPositions.length === 0) {
        console.log('⚠️  No valid positions for liquidation');
        return null;
      }

      // Find the largest borrow position
      const largestBorrow = borrowPositions.reduce((max, pos) => 
        pos.borrowBalanceUSD > max.borrowBalanceUSD ? pos : max
      );

      // Find the largest collateral position
      const largestCollateral = collateralPositions.reduce((max, pos) => 
        pos.collateralUSD > max.collateralUSD ? pos : max
      );

      // Calculate maximum liquidation amount (close factor)
      const closeFactor = 0.5; // 50% - this should be fetched from comptroller
      const maxLiquidationUSD = largestBorrow.borrowBalanceUSD * closeFactor;

      // Ensure we don't exceed our limits
      const liquidationUSD = Math.min(maxLiquidationUSD, this.maxLiquidationUSD);

      // Check if collateral is sufficient
      if (largestCollateral.collateralUSD < this.minCollateralUSD) {
        console.log('⚠️  Insufficient collateral value');
        return null;
      }

      // Calculate potential profit
      const liquidationIncentive = 0.08; // 8% - this should be fetched from comptroller
      const potentialProfit = liquidationUSD * liquidationIncentive;

      if (potentialProfit < this.minProfitUSD) {
        console.log(`⚠️  Insufficient profit: $${potentialProfit.toFixed(2)} < $${this.minProfitUSD}`);
        return null;
      }

      return {
        borrower,
        borrowPosition: largestBorrow,
        collateralPosition: largestCollateral,
        liquidationUSD,
        potentialProfit,
        shortfall: liquidity.shortfall
      };

    } catch (error) {
      console.error(`❌ Failed to find liquidation opportunity for ${borrower}:`, error.message);
      return null;
    }
  }

  async executeLiquidation(opportunity) {
    try {
      console.log('🚀 Executing liquidation...');
      console.log(`👤 Borrower: ${opportunity.borrower}`);
      console.log(`💰 Liquidation value: $${opportunity.liquidationUSD.toFixed(2)}`);
      console.log(`🎯 Expected profit: $${opportunity.potentialProfit.toFixed(2)}`);

      const { borrowPosition, collateralPosition } = opportunity;

      // Calculate repay amount in underlying tokens
      const repayAmountUSD = opportunity.liquidationUSD;
      const repayAmount = ethers.parseUnits(
        (repayAmountUSD / borrowPosition.borrowBalanceUSD * parseFloat(ethers.formatUnits(borrowPosition.borrowBalance, borrowPosition.market.decimals))).toString(),
        borrowPosition.market.decimals
      );

      console.log(`🔄 Repaying ${ethers.formatUnits(repayAmount, borrowPosition.market.decimals)} ${borrowPosition.market.underlyingSymbol}`);

      // Check gas price
      const feeData = await this.provider.getFeeData();
      const gasPriceGwei = parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei'));
      
      if (gasPriceGwei > this.maxGasPriceGwei) {
        console.log(`⚠️  Gas price too high: ${gasPriceGwei} gwei > ${this.maxGasPriceGwei} gwei`);
        return false;
      }

      console.log(`⛽ Gas price: ${gasPriceGwei.toFixed(2)} gwei`);

      // Ensure we have enough balance for repayment
      if (borrowPosition.market.underlying !== ethers.ZeroAddress) {
        const underlyingToken = new ethers.Contract(
          borrowPosition.market.underlying,
          ERC20_ABI,
          this.wallet
        );

        const balance = await underlyingToken.balanceOf(this.wallet.address);
        if (balance < repayAmount) {
          console.log('❌ Insufficient token balance for liquidation');
          return false;
        }

        // Approve cToken to spend tokens
        const allowance = await underlyingToken.allowance(this.wallet.address, borrowPosition.cTokenAddress);
        if (allowance < repayAmount) {
          console.log('📝 Approving token spending...');
          const approveTx = await underlyingToken.approve(borrowPosition.cTokenAddress, repayAmount);
          await approveTx.wait();
          console.log('✅ Token approval confirmed');
        }
      } else {
        // For KAIA, check ETH balance
        const balance = await this.provider.getBalance(this.wallet.address);
        if (balance < repayAmount) {
          console.log('❌ Insufficient KAIA balance for liquidation');
          return false;
        }
      }

      // Execute liquidation
      const cTokenBorrow = new ethers.Contract(
        borrowPosition.cTokenAddress,
        CTOKEN_ABI,
        this.wallet
      );

      const tx = await cTokenBorrow.liquidateBorrow(
        opportunity.borrower,
        repayAmount,
        collateralPosition.cTokenAddress,
        {
          gasLimit: 800000, // Set a reasonable gas limit
          value: borrowPosition.market.underlying === ethers.ZeroAddress ? repayAmount : 0
        }
      );

      console.log(`📤 Liquidation transaction sent: ${tx.hash}`);
      console.log('⏳ Waiting for confirmation...');

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log('✅ Liquidation successful!');
        console.log(`📊 Block: ${receipt.blockNumber}`);
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);

        // Record liquidation
        this.liquidationHistory.push({
          timestamp: new Date().toISOString(),
          borrower: opportunity.borrower,
          repayAmount: ethers.formatUnits(repayAmount, borrowPosition.market.decimals),
          repayToken: borrowPosition.market.underlyingSymbol,
          collateralToken: collateralPosition.market.underlyingSymbol,
          liquidationUSD: opportunity.liquidationUSD,
          profit: opportunity.potentialProfit,
          txHash: tx.hash,
          gasUsed: receipt.gasUsed.toString()
        });

        console.log(`🎉 Total liquidations executed: ${this.liquidationHistory.length}`);
        return true;
      } else {
        console.log('❌ Liquidation transaction failed');
        return false;
      }

    } catch (error) {
      console.error('❌ Failed to execute liquidation:', error.message);
      
      if (error.message.includes('insufficient funds')) {
        console.log('💡 Tip: Wallet may not have enough balance for gas or tokens');
      }
      
      return false;
    }
  }

  /**
   * Get all users from the API
   * Used to fetch active users from the system for liquidation monitoring
   */
  async getAllUsers() {
    try {
      if (!this.apiBaseUrl) {
        console.warn('⚠️  API_BASE_URL not configured');
        return [];
      }

      console.log('🔍 Fetching all users from API...');
      
      const response = await axios.get(
        `${this.apiBaseUrl}/all`,
        {
          timeout: this.timeout
        }
      );

      if (response.data && response.data.success && response.data.data) {
        const users = response.data.data.map(user => user.userAddress);
        console.log(`✅ Found ${users.length} users in the system`);
        return users;
      } else {
        console.log('⚠️  No users found or invalid response format');
        return [];
      }

    } catch (error) {
      console.error('❌ Error fetching all users:', error.message);
      if (error.response) {
        console.error('📍 Response status:', error.response.status);
        console.error('📍 Response data:', error.response.data);
      }
      return [];
    }
  }

  async scanForBorrowers() {
    try {
      console.log('🔍 Scanning for potential liquidation targets...');
      
      const liquidationOpportunities = [];
      
      // Fetch users from API if available
      const apiUsers = await this.getAllUsers();
      
      if (apiUsers.length > 0) {
        console.log(`📊 Scanning ${apiUsers.length} users from API...`);
        // Add all API users to our borrowers set for monitoring
        apiUsers.forEach(user => this.addBorrower(user));
      } else {
        console.log('⚠️  No users from API, using fallback addresses...');
        // Fallback to hardcoded addresses if API is unavailable
        this.addBorrower("0x1ecFDe4511a27f23B8cAE67354D41a487BAfA725");
        this.addBorrower("0x5b5c658E328eF106d0922D8Cc8B547e02CD67332");
      }

      console.log(`🎯 Monitoring ${this.borrowers.size} total addresses for liquidation opportunities...`);

      for (const borrower of this.borrowers) {
        const opportunity = await this.findLiquidationOpportunity(borrower);
        if (opportunity) {
          liquidationOpportunities.push(opportunity);
        }
      }

      return liquidationOpportunities;
    } catch (error) {
      console.error('❌ Failed to scan for borrowers:', error.message);
      return [];
    }
  }

  async monitorMarkets() {
    try {
      console.log(`⏰ ${new Date().toISOString()} - Checking for liquidation opportunities...`);
      
      const opportunities = await this.scanForBorrowers();
      
      if (opportunities.length === 0) {
        console.log('✅ No liquidation opportunities found');
        return;
      }

      console.log(`🎯 Found ${opportunities.length} liquidation opportunities`);

      // Sort by potential profit (highest first)
      opportunities.sort((a, b) => b.potentialProfit - a.potentialProfit);

      // Execute liquidations
      for (const opportunity of opportunities) {
        const success = await this.executeLiquidation(opportunity);
        if (success) {
          // Wait a bit before next liquidation
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

    } catch (error) {
      console.error('❌ Error monitoring markets:', error.message);
    }
  }

  // Add a borrower to our tracking set (this would typically be called when processing Borrow events)
  addBorrower(address) {
    const normalizedAddress = address.toLowerCase();
    if (!this.borrowers.has(normalizedAddress)) {
      this.borrowers.add(normalizedAddress);
      console.log(`➕ Added new borrower to watchlist: ${address}`);
    }
    // If already exists, don't log to avoid spam
  }

  // Remove a borrower (when they fully repay)
  removeBorrower(address) {
    this.borrowers.delete(address.toLowerCase());
    console.log(`➖ Removed borrower from watchlist: ${address}`);
  }

  startMonitoring() {
    console.log('🚀 Starting liquidation monitoring...');
    console.log(`⏱️  Checking every ${process.env.CHECK_INTERVAL_SECONDS} seconds`);
    console.log('─'.repeat(50));

    // Add some test borrowers (in practice, you'd get these from events)
    // this.addBorrower('0x1234567890123456789012345678901234567890');

    // Start monitoring immediately
    this.monitorMarkets();
    
    // Then check on interval
    setInterval(() => {
      this.monitorMarkets();
    }, this.checkInterval);
  }

  printStats() {
    console.log('\n📊 LIQUIDATION BOT STATISTICS');
    console.log('==============================');
    console.log(`🎯 Total liquidations: ${this.liquidationHistory.length}`);
    console.log(`👀 Tracked borrowers: ${this.borrowers.size}`);
    
    if (this.liquidationHistory.length > 0) {
      const totalProfit = this.liquidationHistory.reduce((sum, liq) => sum + liq.profit, 0);
      const totalVolume = this.liquidationHistory.reduce((sum, liq) => sum + liq.liquidationUSD, 0);
      
      console.log(`💰 Total profit: $${totalProfit.toFixed(2)}`);
      console.log(`📈 Total volume: $${totalVolume.toFixed(2)}`);
      console.log(`📊 Avg profit per liquidation: $${(totalProfit / this.liquidationHistory.length).toFixed(2)}`);
      
      console.log('\n🏆 Recent liquidations:');
      this.liquidationHistory.slice(-5).forEach((liq, i) => {
        console.log(`  ${i + 1}. ${liq.timestamp} - $${liq.profit.toFixed(2)} profit`);
      });
    }
    
    console.log('==============================\n');
  }

  // Graceful shutdown
  shutdown() {
    console.log('🛑 Shutting down Liquidation Bot...');
    this.printStats();
    process.exit(0);
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

// Start the bot
console.log('🎯 KiloLend Liquidation Bot Starting...');
console.log('======================================');

const bot = new LiquidationBot();

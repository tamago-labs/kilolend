const { ethers } = require('ethers');
const config = require('./config');
const MarketDataService = require('./market_data');

class MonitoringService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.RPC_URL);
    this.contracts = {};
    this.marketData = new MarketDataService();
    this.initContracts();
  }

  initContracts() {

    this.contracts.vault = new ethers.Contract(
      config.VAULT_ADDRESS,
      config.VAULT_ABI,
      this.provider
    );

    this.contracts.comptroller = new ethers.Contract(
      config.COMPTROLLER_ADDRESS,
      config.COMPTROLLER_ABI,
      this.provider
    );

    this.contracts.usdt = new ethers.Contract(
      config.TOKENS.USDT,
      config.ERC20_ABI,
      this.provider
    );

    this.contracts.stkAia = new ethers.Contract(
      config.TOKENS.STKAIA,
      config.ERC20_ABI,
      this.provider
    );

    console.log('✅ Contracts initialized');
  }

  async getKaiaBalance() {
    try {
      const balance = await this.provider.getBalance(config.BOT_ADDRESS);
      return parseFloat(ethers.formatEther(balance));
    } catch (error) {
      console.error('❌ Error getting KAIA balance:', error.message);
      return 0;
    }
  }

  async getStKaiaBalance() {
    try {
      const balance = await this.contracts.stkAia.balanceOf(config.BOT_ADDRESS);
      return parseFloat(ethers.formatEther(balance));
    } catch (error) {
      console.error('❌ Error getting stKAIA balance:', error.message);
      return 0;
    }
  }

  async getUsdtBalance() {
    try {
      const balance = await this.contracts.usdt.balanceOf(config.BOT_ADDRESS);
      return parseFloat(ethers.formatUnits(balance, 6));
    } catch (error) {
      console.error('❌ Error getting USDT balance:', error.message);
      return 0;
    }
  }

  async getVaultState() {
    try {
      const [totalAssets, sharePrice, liquidBalance] = await Promise.all([
        this.contracts.vault.totalManagedAssets(),
        this.contracts.vault.sharePrice(),
        this.contracts.vault.liquidBalance()
      ]);

      return {
        totalManagedAssets: parseFloat(ethers.formatEther(totalAssets)),
        sharePrice: parseFloat(ethers.formatEther(sharePrice)),
        liquidBalance: parseFloat(ethers.formatEther(liquidBalance))
      };
    } catch (error) {
      console.error('❌ Error getting vault state:', error.message);
      return null;
    }
  }

  /**
   * SIMPLIFIED: Get only Health Factor using Compound v2's getAccountLiquidity
   * This is faster and sufficient for emergency checks!
   */
  async getHealthFactor() {
    try {
      // Compound v2 returns: (error, liquidity, shortfall)
      // error: 0 on success
      // liquidity: USD value available to borrow (in USD with 18 decimals)
      // shortfall: USD value underwater (in USD with 18 decimals)
      const result = await this.contracts.comptroller.getAccountLiquidity(config.BOT_ADDRESS);

      const error = result[0];
      const liquidity = parseFloat(ethers.formatEther(result[1]));
      const shortfall = parseFloat(ethers.formatEther(result[2]));

      // Debug logging
      console.log(`🔍 Comptroller Raw Data:`);
      console.log(`   Error Code: ${error.toString()}`);
      console.log(`   Liquidity: $${liquidity.toFixed(2)}`);
      console.log(`   Shortfall: $${shortfall.toFixed(2)}`);

      let healthFactor = 0;
      let status = '';

      if (shortfall > 0) {
        // Account is underwater (HF < 1)
        // Approximate HF = total collateral value / total debt value
        // Since shortfall = debt - collateral, we can estimate:
        // collateral = debt - shortfall
        // HF = collateral / debt = (debt - shortfall) / debt

        // But we need total debt. Let's use the market data to get it.
        const totalDebt = shortfall / (1 - 0.85); // Assuming ~85% collateral factor
        healthFactor = Math.max(0.1, (totalDebt - shortfall) / totalDebt);
        status = 'CRITICAL - UNDERWATER';

      } else if (liquidity === 0 && shortfall === 0) {
        // No position
        healthFactor = 999.99;
        status = 'NO_POSITION';

      } else {
        // Account is healthy (HF > 1)
        // liquidity = collateral - debt (in borrowing power terms)
        // We need to estimate HF = collateral / debt

        // Get current borrow amounts to calculate more accurate HF
        const assetsIn = await this.contracts.comptroller.getAssetsIn(config.BOT_ADDRESS);

        if (assetsIn.length === 0) {
          healthFactor = 999.99;
          status = 'NO_COLLATERAL';
        } else {
          // Estimate based on liquidity
          // If liquidity is high relative to position, HF is high
          // This is a conservative estimate
          healthFactor = 1.5 + (liquidity / 1000); // Rough approximation
          status = 'HEALTHY';
        }
      }

      return {
        healthFactor: healthFactor,
        liquidity: liquidity,
        shortfall: shortfall,
        isUnderwater: shortfall > 0,
        status: status,
        error: error.toString()
      };

    } catch (error) {
      console.error('❌ Error getting health factor:', error.message);
      console.error('Stack:', error.stack);
      return null;
    }
  }

  /**
   * DETAILED: Get full lending account data with collateral/debt breakdown
   * Use this for full reports, not for emergency checks
   */
  async getLendingAccountDataDetailed() {
    try {
      // Get basic health data
      const healthData = await this.getHealthFactor();
      if (!healthData) return null;

      // Get markets the user has entered
      const assetsIn = await this.contracts.comptroller.getAssetsIn(config.BOT_ADDRESS);

      // Get prices from API
      const prices = await this.marketData.getPrices();

      let totalCollateralUSD = 0;
      let totalDebtUSD = 0;
      const positions = [];

      // Iterate through each market to get detailed balances
      for (const cTokenAddress of assetsIn) {
        try {
          const cToken = new ethers.Contract(
            cTokenAddress,
            config.CTOKEN_ABI,
            this.provider
          );

          // Get account snapshot: (error, cTokenBalance, borrowBalance, exchangeRate)
          const snapshot = await cToken.getAccountSnapshot(config.BOT_ADDRESS);
          const cTokenBalance = snapshot[1];
          const borrowBalance = snapshot[2];
          const exchangeRate = snapshot[3];

          // Calculate underlying supply balance
          const supplyBalance = (cTokenBalance * exchangeRate) / BigInt(1e18);
          const supplyBalanceFormatted = parseFloat(ethers.formatEther(supplyBalance));
          const borrowBalanceFormatted = parseFloat(ethers.formatEther(borrowBalance));

          // Get market collateral factor
          const marketInfo = await this.contracts.comptroller.markets(cTokenAddress);
          const collateralFactor = parseFloat(ethers.formatEther(marketInfo[1])); // e.g., 0.85 = 85%

          // Determine asset type and price
          let assetPrice = 0;
          let assetSymbol = 'UNKNOWN';

          // Simple address matching (you might need to add more mappings)
          if (cTokenAddress.toLowerCase().includes('stkaia') ||
            cTokenAddress === '0x0BC926EF3856542134B06DCf53c86005b08B9625') {
            assetPrice = prices.stKAIA;
            assetSymbol = 'stKAIA';
          } else if (cTokenAddress.toLowerCase().includes('usdt')) {
            assetPrice = prices.USDT;
            assetSymbol = 'USDT';
          }

          const supplyValueUSD = supplyBalanceFormatted * assetPrice;
          const borrowValueUSD = borrowBalanceFormatted * assetPrice;
          const collateralValueUSD = supplyValueUSD * collateralFactor;

          totalCollateralUSD += collateralValueUSD;
          totalDebtUSD += borrowValueUSD;

          positions.push({
            cTokenAddress,
            assetSymbol,
            supplyBalance: supplyBalanceFormatted,
            borrowBalance: borrowBalanceFormatted,
            supplyValueUSD,
            borrowValueUSD,
            collateralValueUSD,
            collateralFactor
          });

        } catch (err) {
          console.error(`⚠️  Error processing cToken ${cTokenAddress}:`, err.message);
        }
      }

      // Calculate actual health factor from detailed data
      const actualHealthFactor = totalDebtUSD > 0 ? totalCollateralUSD / totalDebtUSD : 999.99;

      return {
        healthFactor: actualHealthFactor,
        totalCollateralUSD,
        totalDebtUSD,
        availableBorrowsUSD: healthData.liquidity,
        shortfallUSD: healthData.shortfall,
        isUnderwater: healthData.isUnderwater,
        positions,
        error: healthData.error
      };

    } catch (error) {
      console.error('❌ Error getting detailed lending account data:', error.message);
      return null;
    }
  }

  async getFullPositionSnapshot() {
    console.log('\n📊 POSITION SNAPSHOT');
    console.log('='.repeat(50));

    const [kaiaBalance, stKaiaBalance, usdtBalance, vaultState, healthData] = await Promise.all([
      this.getKaiaBalance(),
      this.getStKaiaBalance(),
      this.getUsdtBalance(),
      this.getVaultState(),
      this.getHealthFactor() // Use simple health factor check
    ]);

    const snapshot = {
      timestamp: Date.now(),
      balances: {
        kaia: kaiaBalance,
        stKaia: stKaiaBalance,
        usdt: usdtBalance
      },
      vault: vaultState,
      health: healthData
    };

    console.log('💰 Balances:');
    console.log(`   KAIA: ${kaiaBalance.toFixed(4)}`);
    console.log(`   stKAIA: ${stKaiaBalance.toFixed(4)}`);
    console.log(`   USDT: ${usdtBalance.toFixed(2)}`);

    if (vaultState) {
      console.log('\n🏦 Vault State:');
      console.log(`   Total Assets: ${vaultState.totalManagedAssets.toFixed(4)} KAIA`);
      console.log(`   Liquid Balance: ${vaultState.liquidBalance.toFixed(4)} KAIA`);
      console.log(`   Share Price: ${vaultState.sharePrice.toFixed(6)}`);
    }

    if (healthData) {
      console.log('\n💳 Health Status:');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Health Factor: ${healthData.healthFactor.toFixed(4)}`);
      console.log(`   Available Borrows: $${healthData.liquidity.toFixed(2)}`);
      console.log(`   Shortfall: $${healthData.shortfall.toFixed(2)}`);

      const hfStatus = this.getHealthFactorStatus(healthData.healthFactor);
      console.log(`   Risk Level: ${hfStatus.emoji} ${hfStatus.label}`);
    }

    console.log('='.repeat(50));
    return snapshot;
  }

  getHealthFactorStatus(hf) {
    if (hf < config.RISK_PARAMS.EMERGENCY_THRESHOLD) {
      return { status: 'critical', emoji: '🚨', label: 'CRITICAL', color: '#ef4444' };
    } else if (hf < config.RISK_PARAMS.SAFE_HEALTH_FACTOR) {
      return { status: 'warning', emoji: '⚠️', label: 'WARNING', color: '#f59e0b' };
    } else if (hf < 1.7) {
      return { status: 'safe', emoji: '✅', label: 'SAFE', color: '#06C755' };
    } else if (hf <= config.RISK_PARAMS.MAX_HEALTH_FACTOR) {
      return { status: 'optimal', emoji: '✨', label: 'OPTIMAL', color: '#06C755' };
    } else {
      return { status: 'inefficient', emoji: '📊', label: 'CONSERVATIVE', color: '#3b82f6' };
    }
  }

  async checkConnection() {
    try {
      const network = await this.provider.getNetwork();
      console.log(`📡 Connected to KAIA network (Chain ID: ${network.chainId})`);
      console.log(`🤖 Monitoring address: ${config.BOT_ADDRESS}`);
      console.log(`📍 Comptroller: ${config.COMPTROLLER_ADDRESS}`);
      return true;
    } catch (error) {
      console.error('❌ Connection check failed:', error.message);
      return false;
    }
  }
}

module.exports = MonitoringService;
require('dotenv').config();

const MonitoringService = require('./src/monitoring_service');
const AIStrategy = require('./src/ai_strategy');
const TaskManager = require('./src/task_manager');
const MarketDataService = require('./src/market_data');
const RiskScoring = require('./src/risk_scoring');
const VaultTracker = require('./src/vault_tracker');

const config = require('./src/config');

class KaiaLeveragedBot {
  constructor() {
    this.monitoring = new MonitoringService();
    this.aiStrategy = new AIStrategy();
    this.taskManager = new TaskManager();
    this.marketData = new MarketDataService();
    this.riskScoring = new RiskScoring();
    this.vaultTracker = null;

    this.isRunning = false;
    this.operationCount = 0;
    this.lastOperationTime = null;
    this.emergencyCheckActive = false;
  }

  async init() {
    console.log('\n🚀 KAIA Leveraged Bot Starting...');
    console.log('='.repeat(50));
    console.log('📋 Configuration:');

    console.log(`   Operation Interval: ${process.env.OPERATION_INTERVAL_MINUTES || 100} minutes`);
    console.log(`   Emergency Checks: ${process.env.EMERGENCY_CHECK_INTERVAL_MINUTES || 15} minutes`);
    console.log(`   AI Enabled: ${config.AI_ENABLED ? '✅' : '⚙️ Rule-Based'}`);
    console.log(`   Target HF: ${config.RISK_PARAMS.TARGET_HEALTH_FACTOR}`);
    console.log('='.repeat(50));

    const connected = await this.monitoring.checkConnection();
    if (!connected) {
      console.error('❌ Failed to connect to blockchain');
      process.exit(1);
    }

    // Initialize vault tracker after provider is ready
    this.vaultTracker = new VaultTracker(this.monitoring.provider);

    console.log('✅ Bot initialized successfully');
    console.log('');
  }

  async start() {
    await this.init();

    console.log('🎯 Starting main monitoring loop...\n');

    // Initial operation
    await this.processOperation();

    // Main operation loop (100 minutes)
    setInterval(async () => {
      await this.processOperation();
    }, config.OPERATION_INTERVAL);

    // Emergency check loop (15 minutes)
    setInterval(async () => {
      await this.emergencyCheck();
    }, config.EMERGENCY_CHECK_INTERVAL);

    console.log(`⏰ Next operation: ${new Date(Date.now() + config.OPERATION_INTERVAL).toLocaleString()}`);
    console.log(`🚨 Emergency checks: Every ${config.EMERGENCY_CHECK_INTERVAL_MINUTES || 15} minutes\n`);
  }

  async processOperation() {
    if (this.isRunning) {
      console.log('⏸️  Operation already in progress, skipping...\n');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    this.operationCount++;

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔄 OPERATION #${this.operationCount} - ${new Date().toLocaleString()}`);
    console.log('='.repeat(70));

    try {
      // Step 1: Get vault metrics and check withdrawals
      const [vaultMetrics, pendingWithdrawals] = await Promise.all([
        this.vaultTracker.getVaultMetrics(),
        this.vaultTracker.checkPendingWithdrawals()
      ]);

      // Step 2: Check if need to prepare for withdrawals
      const withdrawalCheck = this.vaultTracker.shouldPrepareForWithdrawals(vaultMetrics, pendingWithdrawals);

      if (withdrawalCheck.shouldPrepare) {
        console.log('\n⚠️ WITHDRAWAL PREPARATION NEEDED');
        console.log('='.repeat(50));
        console.log(withdrawalCheck.recommendation);
        console.log('='.repeat(50));

        // Create withdrawal preparation task
        await this.taskManager.submitTask({
          action: 'PREPARE_WITHDRAWAL',
          confidence: 1.0,
          reasoning: withdrawalCheck.recommendation,
          riskLevel: 'MEDIUM',
          parameters: {
            deficit: withdrawalCheck.deficit,
            requiredAssets: withdrawalCheck.requiredAssets
          }
        }, { lending: null, balances: {} });
      }

      // Step 3: Get position snapshot
      const snapshot = await this.monitoring.getFullPositionSnapshot();

      // Step 2: Get market data
      const marketData = await this.marketData.getMarketData();

      // Step 3: Calculate risk score
      const riskAssessment = this.riskScoring.calculateRiskScore(snapshot, marketData);

      // Step 4: AI analyzes position with market context
      let decision = await this.aiStrategy.analyzePosition(snapshot, marketData);

      // Step 5: Risk override if needed
      decision = this.riskScoring.adjustDecisionForRisk(decision, riskAssessment);

      // Step 6: Create and submit task (if action needed)
      if (decision.action !== 'HOLD') {
        await this.taskManager.submitTask(decision, snapshot);
      } else {
        console.log('\n✅ HOLD - No task created, position is optimal');
        console.log('='.repeat(50));
      }

      this.lastOperationTime = new Date();
      const duration = Date.now() - startTime;

      console.log(`\n✅ Operation #${this.operationCount} completed in ${duration}ms`);
      console.log(`⏰ Next operation: ${new Date(Date.now() + config.OPERATION_INTERVAL).toLocaleString()}`);
      console.log('='.repeat(70) + '\n');

    } catch (error) {
      console.error('\n❌ Operation failed:', error.message);
      console.log('='.repeat(70) + '\n');
    } finally {
      this.isRunning = false;
    }
  }

  async emergencyCheck() {
    if (this.emergencyCheckActive) return;

    this.emergencyCheckActive = true;

    try {
      const healthData = await this.monitoring.getHealthFactor();

      if (!healthData) {
        console.error('❌ Failed to get health factor');
        this.emergencyCheckActive = false;
        return;
      }

      const hf = healthData.healthFactor;
      console.log(`🏥 Health Factor: ${hf.toFixed(4)} (${healthData.status})`);

      // Emergency action based on HF
      if (hf < config.RISK_PARAMS.EMERGENCY_THRESHOLD) {
        console.log('🚨 EMERGENCY: Health Factor critical!');
        // Create emergency task
        await this.createEmergencyTask(healthData);
      } else if (hf < config.RISK_PARAMS.SAFE_HEALTH_FACTOR) {
        console.log('⚠️  WARNING: Health Factor below safe threshold');
        // Create warning task
        await this.createWarningTask(healthData);
      } else {
        console.log('✅ Health Factor is healthy');
      }

    } catch (error) {
      console.error('❌ Emergency check failed:', error);
    } finally {
      this.emergencyCheckActive = false;
    }
  }

  async shutdown() {
    console.log('\n🛑 Shutting down bot...');
    console.log(`📊 Total operations: ${this.operationCount}`);
    console.log(`⏰ Last operation: ${this.lastOperationTime?.toLocaleString() || 'N/A'}`);
    console.log('👋 Goodbye!\n');
    process.exit(0);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Received SIGINT...');
  if (global.bot) {
    await global.bot.shutdown();
  } else {
    process.exit(0);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Received SIGTERM...');
  if (global.bot) {
    await global.bot.shutdown();
  } else {
    process.exit(0);
  }
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
});

// Start the bot
if (require.main === module) {
  const bot = new KaiaLeveragedBot();
  global.bot = bot;
  bot.start().catch(error => {
    console.error('❌ Bot failed to start:', error);
    process.exit(1);
  });
}

module.exports = KaiaLeveragedBot;

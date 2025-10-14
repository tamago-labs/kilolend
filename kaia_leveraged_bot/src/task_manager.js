const axios = require('axios');
const config = require('./config');

class TaskManager {
  constructor() {
    this.apiBaseUrl = config.API_BASE_URL;
    this.apiKey = config.API_KEY;
    this.tableName = config.USER_POINTS_TABLE_NAME;
  }

  async submitTask(decision, snapshot) {
    console.log('\n📝 TASK CREATION');
    console.log('='.repeat(50));

    const task = this.createTask(decision, snapshot);

    console.log(`🎯 Task Type: ${task.taskType}`);
    console.log(`📋 Description: ${task.description}`);
    console.log(`📊 Confidence: ${(task.confidenceScore * 100).toFixed(0)}%`);
    console.log(`⚠️ Risk: ${task.riskAssessment}`);
    console.log(`📍 Status: ${task.status}`);

    try {
      await this.submitToAPI(task);
      console.log('✅ Task submitted successfully');
      console.log('='.repeat(50));
      return task;
    } catch (error) {
      console.error('❌ Failed to submit task:', error.message);
      console.log('='.repeat(50));
      throw error;
    }
  }

  createTask(decision, snapshot) {
    const taskId = `TASK_${Date.now()}_${this.generateHash()}`;

    const baseTask = {
      taskId,
      timestamp: Date.now(),
      userAddress: config.BOT_ADDRESS,
      taskType: decision.action,
      status: decision.action === 'EMERGENCY_STOP' ? 'URGENT_OPERATOR_ACTION' : 'PENDING_OPERATOR',
      
      aiReasoning: decision.reasoning,
      strategyType: 'KAIA_LEVERAGE_VAULT',
      confidenceScore: decision.confidence,
      riskAssessment: decision.riskLevel,
      
      healthFactorBefore: snapshot.lending?.healthFactor || 0,
      healthFactorAfter: decision.expectedHealthFactor || 0,
      leverageRatio: this.calculateLeverageRatio(snapshot.lending),
      
      timestamp: Date.now(),
      updatedAt: Date.now(),
      retryCount: 0,
      
      botVersion: '2.0.0',
      aiModel: config.AI_ENABLED ? 'Claude Sonnet 4' : 'Rule-Based'
    };

    switch (decision.action) {
      case 'LEVERAGE_UP':
        return {
          ...baseTask,
          description: 'Increase leverage position for better yields',
          steps: this.getLeverageUpSteps(decision.parameters),
          parameters: decision.parameters || {}
        };

      case 'LEVERAGE_DOWN':
        return {
          ...baseTask,
          description: 'Decrease leverage to reduce risk',
          steps: this.getLeverageDownSteps(decision.parameters),
          parameters: decision.parameters || {}
        };

      case 'EMERGENCY_STOP':
        return {
          ...baseTask,
          description: '🚨 CRITICAL: Close all positions immediately',
          steps: this.getEmergencySteps(snapshot),
          parameters: {
            currentHF: snapshot.lending?.healthFactor,
            urgency: 'CRITICAL'
          }
        };

      case 'REBALANCE':
        return {
          ...baseTask,
          description: 'Minor position adjustments',
          steps: this.getRebalanceSteps(snapshot),
          parameters: {}
        };

      case 'HOLD':
      default:
        return {
          ...baseTask,
          description: 'Position optimal, no action needed',
          steps: ['Monitor health factor', 'Continue current strategy'],
          parameters: {}
        };
    }
  }

  getLeverageUpSteps(params) {
    // Use actual available liquidity for borrow amount
    // Use actual vault/wallet balances for withdraw amount
    const borrowAmount = params?.borrowAmount || 'available';
    const withdrawAmount = params?.withdrawAmount || 'from_vault';

    return [
      `1. Withdraw KAIA from vault (if needed)`,
      `2. Stake KAIA to get stKAIA via Lair Finance`,
      `3. Supply stKAIA to KiloLend as collateral`,
      `4. Borrow ${typeof borrowAmount === 'number' ? borrowAmount.toFixed(2) : borrowAmount} USDT from KiloLend`,
      `5. Swap USDT to KAIA via DragonSwap`,
      `6. Stake swapped KAIA to stKAIA`,
      `7. Verify health factor remains above ${config.RISK_PARAMS.SAFE_HEALTH_FACTOR}`
    ];
  }

  getLeverageDownSteps(params) {
    const unstakeAmount = params?.unstakeAmount || 50;
    const repayAmount = params?.repayAmount || 40;

    return [
      `1. Unstake ${unstakeAmount} stKAIA from Lair Finance`,
      `2. Withdraw unstaked KAIA`,
      `3. Swap KAIA to USDT if needed via DragonSwap`,
      `4. Repay ${repayAmount} USDT to KiloLend`,
      `5. Withdraw excess collateral if safe`,
      `6. Deposit remaining KAIA back to vault`,
      `7. Verify health factor improved to safe range`
    ];
  }

  getEmergencySteps(snapshot) {
    return [
      '🚨 IMMEDIATE ACTION REQUIRED',
      '1. Unstake ALL stKAIA from Lair Finance',
      '2. Swap KAIA to USDT to cover debt',
      '3. Repay ALL USDT debt to KiloLend',
      '4. Withdraw ALL stKAIA collateral',
      '5. Unstake remaining stKAIA to KAIA',
      '6. Deposit all KAIA back to vault',
      '7. Verify debt = 0 OR health factor > 2.0',
      '⚠️ LIQUIDATION RISK - ACT IMMEDIATELY'
    ];
  }

  getRebalanceSteps(snapshot) {
    const hf = snapshot.lending?.healthFactor || 999;
    
    if (hf > config.RISK_PARAMS.TARGET_HEALTH_FACTOR) {
      return [
        '1. Slight leverage increase to optimize returns',
        '2. Borrow small amount of USDT',
        '3. Swap to KAIA and stake',
        '4. Monitor health factor'
      ];
    } else {
      return [
        '1. Slight leverage reduction for safety',
        '2. Repay small amount of USDT debt',
        '3. Adjust position marginally',
        '4. Monitor health factor'
      ];
    }
  }

  async submitToAPI(task) {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/bot/activity`,
        task,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': this.apiKey
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.success) {
        console.log('📡 API Response: Success');
        return response.data;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('API server not reachable');
      }
      throw error;
    }
  }

  calculateLeverageRatio(lendingData) {
    if (!lendingData || !lendingData.totalCollateralUSD || lendingData.totalCollateralUSD === 0) {
      return 1.0;
    }
    
    // Leverage Ratio = Total Assets / Equity
    // Total Assets = Collateral
    // Equity = Collateral - Debt
    const totalAssets = lendingData.totalCollateralUSD;
    const equity = totalAssets - lendingData.totalDebtUSD;
    
    if (equity <= 0) {
      return 999; // Extremely high leverage (underwater)
    }
    
    const ratio = totalAssets / equity;
    return parseFloat(ratio.toFixed(2));
  }

  generateHash() {
    return Math.random().toString(36).substring(2, 11);
  }
}

module.exports = TaskManager;

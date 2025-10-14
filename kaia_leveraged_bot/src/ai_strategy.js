const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const config = require('./config');

class AIStrategy {
  constructor() {
    if (config.AI_ENABLED) {
      this.client = new BedrockRuntimeClient({
        region: config.AWS_REGION,
        credentials: {
          accessKeyId: config.AWS_ACCESS_KEY_ID,
          secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
        }
      });
      console.log('🤖 AI Strategy Engine initialized (Claude Sonnet 4)');
    } else {
      console.log('⚙️ AI disabled, using rule-based decisions');
    }
  }

  async analyzePosition(snapshot, marketData = null) {
    console.log('\n🧠 AI ANALYSIS');
    console.log('='.repeat(50));

    const { balances, vault, lending } = snapshot;
    const hf = lending?.healthFactor || 999;

    if (!config.AI_ENABLED) {
      return this.getRuleBasedDecision(hf, balances, lending, marketData);
    }

    try {
      const context = {
        timestamp: new Date().toISOString(),
        balances: {
          kaia: balances.kaia.toFixed(4),
          stKaia: balances.stKaia.toFixed(4),
          usdt: balances.usdt.toFixed(2)
        },
        vault: vault ? {
          totalAssets: vault.totalManagedAssets.toFixed(4),
          liquidBalance: vault.liquidBalance.toFixed(4)
        } : null,
        lending: lending ? {
          collateral: lending.totalCollateralUSD.toFixed(2),
          debt: lending.totalDebtUSD.toFixed(2),
          healthFactor: hf.toFixed(4),
          availableBorrows: lending.availableBorrowsUSD.toFixed(2)
        } : null,
        market: marketData ? {
          kaiaPrice: marketData.prices.KAIA.toFixed(4),
          borrowRate: marketData.lendingRates.borrow.toFixed(2) + '%',
          supplyRate: marketData.lendingRates.supply.toFixed(2) + '%',
          utilization: marketData.utilizationRate.toFixed(2) + '%',
          volatility: marketData.volatility,
          condition: marketData.prices.stKAIA ? 
            `stKAIA premium: ${(((marketData.prices.stKAIA - marketData.prices.KAIA) / marketData.prices.KAIA) * 100).toFixed(2)}%` : 'N/A'
        } : null,
        riskThresholds: config.RISK_PARAMS
      };

      const prompt = `You are an AI vault manager for KiloLend's KAIA Leverage Vault.

Strategy: KAIA → Stake to stKAIA → Supply to KiloLend → Borrow USDT → Swap to KAIA → Repeat until HF ≈ ${config.RISK_PARAMS.TARGET_HEALTH_FACTOR}

Current Position:
${JSON.stringify(context, null, 2)}

Market Context:
${context.market ? `
- KAIA Price: ${context.market.kaiaPrice}
- Borrow Rate: ${context.market.borrowRate}
- Supply Rate: ${context.market.supplyRate}
- Pool Utilization: ${context.market.utilization}
- Market Volatility: ${context.market.volatility}
- ${context.market.condition}
` : 'Market data unavailable'}

Risk Parameters:
- Emergency Threshold: ${config.RISK_PARAMS.EMERGENCY_THRESHOLD} (must act immediately)
- Safe Minimum: ${config.RISK_PARAMS.SAFE_HEALTH_FACTOR} (maintain above this)
- Target: ${config.RISK_PARAMS.TARGET_HEALTH_FACTOR} (optimal efficiency)
- Maximum: ${config.RISK_PARAMS.MAX_HEALTH_FACTOR} (inefficient, can leverage up)

Analyze the current position and recommend ONE action:
- EMERGENCY_STOP: HF < ${config.RISK_PARAMS.EMERGENCY_THRESHOLD} (critical risk)
- LEVERAGE_DOWN: HF ${config.RISK_PARAMS.EMERGENCY_THRESHOLD}-${config.RISK_PARAMS.SAFE_HEALTH_FACTOR} (reduce risk)
- HOLD: HF ${config.RISK_PARAMS.SAFE_HEALTH_FACTOR}-${config.RISK_PARAMS.MAX_HEALTH_FACTOR} (optimal range)
- LEVERAGE_UP: HF > ${config.RISK_PARAMS.MAX_HEALTH_FACTOR} (can increase efficiency)
- REBALANCE: Minor adjustments needed

Respond in JSON format:
{
  "action": "HOLD",
  "confidence": 0.85,
  "reasoning": "Clear explanation of why this action is recommended",
  "riskLevel": "MEDIUM",
  "expectedHealthFactor": 1.75,
  "parameters": {
    "withdrawAmount": 100,
    "borrowAmount": 70
  }
}`;

      const response = await this.callClaude(prompt);
      const decision = this.parseAIResponse(response);

      console.log(`🎯 AI Decision: ${decision.action}`);
      console.log(`📊 Confidence: ${(decision.confidence * 100).toFixed(0)}%`);
      console.log(`⚠️ Risk Level: ${decision.riskLevel}`);
      console.log(`💭 Reasoning: ${decision.reasoning}`);
      console.log('='.repeat(50));

      return decision;

    } catch (error) {
      console.error('❌ AI analysis failed:', error.message);
      console.log('⚙️ Falling back to rule-based decision');
      return this.getRuleBasedDecision(hf, balances, lending, marketData);
    }
  }

  async callClaude(prompt) {
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    };

    const command = new InvokeModelCommand({
      contentType: "application/json",
      body: JSON.stringify(payload),
      modelId: config.BEDROCK_MODEL_ID,
    });

    const response = await this.client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return responseBody.content[0].text;
  }

  parseAIResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.warn('⚠️ Failed to parse AI response, using fallback');
      return {
        action: 'HOLD',
        confidence: 0.5,
        reasoning: 'AI response parsing failed, maintaining current position',
        riskLevel: 'MEDIUM'
      };
    }
  }

  getRuleBasedDecision(hf, balances, lending, marketData = null) {
    console.log('⚙️ Using Rule-Based Decision');

    if (!lending || hf === 999) {
      return {
        action: 'HOLD',
        confidence: 0.9,
        reasoning: 'No lending position detected, monitoring only',
        riskLevel: 'LOW',
        expectedHealthFactor: hf
      };
    }

    if (hf < config.RISK_PARAMS.EMERGENCY_THRESHOLD) {
      console.log('🚨 CRITICAL: Emergency stop needed');
      return {
        action: 'EMERGENCY_STOP',
        confidence: 0.95,
        reasoning: `Health Factor ${hf.toFixed(4)} is below emergency threshold ${config.RISK_PARAMS.EMERGENCY_THRESHOLD}. Immediate action required to prevent liquidation.`,
        riskLevel: 'CRITICAL',
        expectedHealthFactor: 2.5
      };
    }

    if (hf < config.RISK_PARAMS.SAFE_HEALTH_FACTOR) {
      console.log('⚠️ WARNING: Health factor below safe level');
      return {
        action: 'LEVERAGE_DOWN',
        confidence: 0.85,
        reasoning: `Health Factor ${hf.toFixed(4)} is below safe minimum ${config.RISK_PARAMS.SAFE_HEALTH_FACTOR}. Reducing leverage to increase safety buffer.`,
        riskLevel: 'HIGH',
        expectedHealthFactor: config.RISK_PARAMS.TARGET_HEALTH_FACTOR,
        parameters: {
          unstakeAmount: 50,
          repayAmount: 40
        }
      };
    }

    if (hf > config.RISK_PARAMS.MAX_HEALTH_FACTOR) {
      console.log('📈 OPPORTUNITY: Can increase leverage');
      
      // Calculate actual borrow amount based on available liquidity
      const availableBorrows = lending?.availableBorrowsUSD || 0;
      const borrowAmount = availableBorrows * 0.7; // Borrow 70% of available for safety
      
      return {
        action: 'LEVERAGE_UP',
        confidence: 0.8,
        reasoning: `Health Factor ${hf.toFixed(4)} is above maximum efficient level ${config.RISK_PARAMS.MAX_HEALTH_FACTOR}. Can safely increase leverage for better returns. Available to borrow: ${availableBorrows.toFixed(2)}, will borrow ${borrowAmount.toFixed(2)} (70% of max).`,
        riskLevel: 'MEDIUM',
        expectedHealthFactor: config.RISK_PARAMS.TARGET_HEALTH_FACTOR,
        parameters: {
          borrowAmount: borrowAmount,
          stakeAmount: 'ALL_KAIA',
          supplyAmount: 'ALL_STKAIA',
          swapToKaia: borrowAmount
        }
      };
    }

    console.log('✅ OPTIMAL: Position in target range');
    return {
      action: 'HOLD',
      confidence: 0.9,
      reasoning: `Health Factor ${hf.toFixed(4)} is in optimal range (${config.RISK_PARAMS.SAFE_HEALTH_FACTOR}-${config.RISK_PARAMS.MAX_HEALTH_FACTOR}). No action needed, position performing well.`,
      riskLevel: 'LOW',
      expectedHealthFactor: hf
    };
  }
}

module.exports = AIStrategy;

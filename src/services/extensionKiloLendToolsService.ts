import { ContractMarket } from '@/stores/contractMarketStore';
import { ContractUserPosition } from '@/stores/contractUserStore';
import { conversationMemory, type RecommendedAction } from './memory/conversationMemory'; 
import { actionIntegration } from './actionIntegration';

export interface ExtensionKiloLendTool {
  name: string;
  description: string;
  parameters: any;
  handler: (params: any, sessionId?: string) => Promise<any>;
}

export class ExtensionKiloLendToolsService {
  private tools: Map<string, ExtensionKiloLendTool> = new Map();
  private marketData: ContractMarket[] = [];
  private portfolioData: any = null;
  private userAddress: string | null = null;

  constructor() {
    this.initializeAdvancedTools();
  }

  setKiloLendData(markets: ContractMarket[], portfolio?: any, userAddress?: string) {
    this.marketData = markets;
    this.portfolioData = portfolio;
    this.userAddress = userAddress || null;
  }

  private initializeAdvancedTools() {
    const tools: ExtensionKiloLendTool[] = [
      {
        name: 'analyze_market_trends',
        description: 'Analyze market trends and provide insights on optimal timing for actions',
        parameters: {
          type: 'object',
          properties: {
            timeframe: {
              type: 'string',
              enum: ['1h', '24h', '7d', '30d'],
              description: 'Analysis timeframe'
            },
            focusAsset: {
              type: 'string',
              description: 'Specific asset to analyze (optional)'
            }
          },
          required: []
        },
        handler: async (params: { timeframe?: string; focusAsset?: string }, sessionId?: string) => {
          const trends = this.analyzeMarketTrends(params.timeframe, params.focusAsset);

          if (sessionId) {
            conversationMemory.addTopicToConversation(sessionId, 'market_trends');
            conversationMemory.updateMarketSnapshot(sessionId, {
              bestAPY: Math.max(...this.marketData.filter(m => !m.isCollateralOnly).map(m => m.supplyAPY)),
              totalTVL: this.marketData.reduce((sum, m) => sum + m.totalSupply + m.totalBorrow, 0),
              userPortfolioValue: this.portfolioData?.totalSupplied || 0
            });
          }

          return trends;
        }
      },

      {
        name: 'generate_personalized_strategy',
        description: 'Generate a comprehensive personalized strategy based on user goals and risk tolerance',
        parameters: {
          type: 'object',
          properties: {
            investmentAmount: { type: 'number', description: 'Amount to invest in USD' },
            timeHorizon: {
              type: 'string',
              enum: ['short', 'medium', 'long'],
              description: 'Investment time horizon'
            },
            primaryGoal: {
              type: 'string',
              enum: ['income', 'growth', 'preservation', 'learning'],
              description: 'Primary investment goal'
            },
            riskTolerance: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Risk tolerance level'
            }
          },
          required: ['investmentAmount', 'primaryGoal']
        },
        handler: async (
          params: {
            investmentAmount: number;
            timeHorizon?: string;
            primaryGoal: string;
            riskTolerance?: string;
          },
          sessionId?: string
        ) => {
          const strategy = await this.generatePersonalizedStrategy(params, sessionId);

          if (sessionId) {
            conversationMemory.addTopicToConversation(sessionId, 'strategy_planning');
            // Add stated goal
            const context = conversationMemory.getConversationContext(sessionId);
            if (context && !context.goals.stated.includes(params.primaryGoal)) {
              context.goals.stated.push(params.primaryGoal);
            }
          }

          return strategy;
        }
      },

      {
        name: 'execute_recommended_action',
        description: 'Execute a specific recommended action (supply, borrow, withdraw, repay)',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['supply', 'borrow', 'withdraw', 'repay'],
              description: 'Action to execute'
            },
            asset: {
              type: 'string',
              description: 'Asset symbol (USDT, MBX, BORA, SIX, KAIA)'
            },
            amount: { type: 'number', description: 'Amount in USD' },
            reasoning: { type: 'string', description: 'Reasoning for the action' }
          },
          required: ['action', 'asset', 'amount']
        },
        handler: async (
          params: {
            action: string;
            asset: string;
            amount: number;
            reasoning?: string;
          },
          sessionId?: string
        ) => {
          if (!sessionId) {
            return { error: 'Session ID required for action execution' };
          }

          const recommendation: RecommendedAction = {
            id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            action: params.action as any,
            asset: params.asset,
            amount: params.amount,
            reasoning: params.reasoning || 'User requested action',
            expectedOutcome: 'As requested by user',
            riskLevel: this.assessActionRisk(params.action, params.asset, params.amount),
            timestamp: Date.now(),
            priority: 5,
            status: 'pending'
          };

          // Add recommendation to conversation memory
          conversationMemory.addRecommendation(sessionId, recommendation);

          // Validate the action
          const validation = actionIntegration.validateAction(recommendation);
          if (!validation.isValid) {
            return {
              success: false,
              error: `Action cannot be executed: ${validation.blockers.join(', ')}`,
              warnings: validation.warnings,
              recommendations: validation.recommendations
            };
          }

          // Get action estimate
          const estimate = await actionIntegration.estimateOutcome(recommendation);

          // Execute the action (opens modal)
          const result = await actionIntegration.executeAction(recommendation, sessionId);

          return {
            success: result.success,
            actionId: recommendation.id,
            estimate,
            validation,
            message: result.success
              ? `Opening ${params.action} modal for ${params.asset}. Please complete the transaction in the modal.`
              : `Failed to execute action: ${result.error}`,
            nextSteps: result.success
              ? [
                  'Complete the transaction in the opened modal',
                  'Transaction will be processed on-chain',
                  'Return here for confirmation'
                ]
              : ['Review the error message', 'Adjust parameters if needed', 'Try again']
          };
        }
      }
    ];

    tools.forEach(tool => this.tools.set(tool.name, tool));
  }

  private analyzeMarketTrends(timeframe?: string, focusAsset?: string) {
    const markets = focusAsset
      ? this.marketData.filter(m => m.symbol === focusAsset.toUpperCase())
      : this.marketData.filter(m => !m.isCollateralOnly);

    const analysis = {
      timeframe: timeframe || '24h',
      marketCondition: this.determineMarketCondition(),
      trends: markets.map(market => ({
        asset: market.symbol,
        currentAPY: market.supplyAPY,
        utilization: market.utilization,
        trend: this.calculateTrend(market),
        momentum: this.calculateMomentum(market),
        recommendation: this.getTrendRecommendation(market)
      })),
      insights: this.generateMarketInsights(markets),
      optimalTiming: this.suggestOptimalTiming(markets)
    };

    return analysis;
  }

  private async generatePersonalizedStrategy(params: any, sessionId?: string) {
    const { investmentAmount, timeHorizon = 'medium', primaryGoal, riskTolerance = 'medium' } = params;

    // Get user memory for personalization
    const userMemory =
      sessionId && this.userAddress ? conversationMemory.getUserMemory(this.userAddress) : null;

    const strategy = {
      overview: {
        investmentAmount,
        timeHorizon,
        primaryGoal,
        riskTolerance,
        estimatedAPY: 0,
        riskScore: 0
      },
      allocation: await this.calculateOptimalAllocation(params, userMemory),
      actionPlan: await this.generateActionPlan(params, userMemory),
      riskManagement: this.generateRiskManagementPlan(params),
      milestones: this.generateMilestones(params),
      expectedOutcomes: this.calculateExpectedOutcomes(params)
    };

    return strategy;
  }

  // Helper methods
  private determineMarketCondition(): 'bullish' | 'bearish' | 'sideways' {
    const avgAPY =
      this.marketData.filter(m => !m.isCollateralOnly).reduce((sum, m) => sum + m.supplyAPY, 0) /
      this.marketData.filter(m => !m.isCollateralOnly).length;

    if (avgAPY > 8) return 'bullish';
    if (avgAPY < 4) return 'bearish';
    return 'sideways';
  }

  private calculateTrend(market: ContractMarket): 'up' | 'down' | 'stable' {
    if (Math.abs(market.priceChange24h) < 1) return 'stable';
    return market.priceChange24h > 0 ? 'up' : 'down';
  }

  private calculateMomentum(market: ContractMarket): 'strong' | 'weak' | 'neutral' {
    const absChange = Math.abs(market.priceChange24h);
    if (absChange > 5) return 'strong';
    if (absChange > 2) return 'weak';
    return 'neutral';
  }

  private getTrendRecommendation(market: ContractMarket): string {
    const trend = this.calculateTrend(market);
    const momentum = this.calculateMomentum(market);

    if (trend === 'up' && momentum === 'strong') {
      return 'Strong uptrend - consider increasing allocation';
    }
    if (trend === 'down' && momentum === 'strong') {
      return 'Strong downtrend - consider reducing exposure';
    }
    return 'Stable conditions - maintain current strategy';
  }

  private generateMarketInsights(markets: ContractMarket[]): string[] {
    const insights = [];

    const highUtilization = markets.filter(m => m.utilization > 80);
    if (highUtilization.length > 0) {
      insights.push(
        `High utilization in ${highUtilization.map(m => m.symbol).join(', ')} - potential supply shortage`
      );
    }

    const highAPY = markets.filter(m => m.supplyAPY > 10);
    if (highAPY.length > 0) {
      insights.push(`Exceptional yields available in ${highAPY.map(m => m.symbol).join(', ')}`);
    }

    return insights;
  }

  private suggestOptimalTiming(markets: ContractMarket[]): any {
    return {
      supply: 'Current conditions favor supply - yields are attractive',
      borrow: markets.some(m => m.utilization < 50)
        ? 'Good borrowing conditions - low utilization'
        : 'High demand - consider waiting',
      rebalance: 'Monthly rebalancing recommended based on current volatility'
    };
  }

  private assessActionRisk(action: string, asset: string, amount: number): 'low' | 'medium' | 'high' {
    const market = this.marketData.find(m => m.symbol === asset);
    if (!market) return 'high';

    let riskScore = 0;

    if (action === 'borrow') riskScore += 2;
    if (action === 'withdraw' && this.portfolioData?.totalBorrowed > 0) riskScore += 1;
    if (asset === 'USDT') riskScore -= 1;
    if (market.utilization > 90) riskScore += 1;
    if (amount > 10000) riskScore += 1;

    if (riskScore <= 1) return 'low';
    if (riskScore <= 3) return 'medium';
    return 'high';
  }

  private calculateOptimalAllocation(params: any, userMemory?: any): any {
    const { primaryGoal, riskTolerance } = params;

    if (primaryGoal === 'preservation' || riskTolerance === 'low') {
      return { USDT: 70, SIX: 20, MBX: 10, BORA: 0 };
    }

    if (primaryGoal === 'growth' || riskTolerance === 'high') {
      return { USDT: 30, SIX: 25, MBX: 25, BORA: 20 };
    }

    return { USDT: 50, SIX: 20, MBX: 20, BORA: 10 };
  }

  private generateActionPlan(params: any, userMemory?: any): any[] {
    const allocation = this.calculateOptimalAllocation(params, userMemory);
    const actions: any[] = [];

    Object.entries(allocation).forEach(([asset, percentage]: [string, any]) => {
      const amount = (params.investmentAmount * percentage) / 100;
      if (amount > 0) {
        actions.push({
          action: 'supply',
          asset,
          amount,
          priority: percentage > 30 ? 'high' : 'medium',
          reasoning: `Allocate ${percentage}% to ${asset} for ${params.primaryGoal} goal`
        });
      }
    });

    return actions;
  }

  private generateRiskManagementPlan(params: any): any {
    return {
      diversification: 'Spread investments across multiple assets',
      healthFactor: 'Maintain health factor above 2.0 for any borrowing',
      stopLoss: 'Consider reducing exposure if portfolio drops 20%',
      monitoring: 'Review portfolio weekly for rebalancing opportunities'
    };
  }

  private generateMilestones(params: any): any[] {
    const timeframes = {
      short: ['1 week', '1 month'],
      medium: ['1 month', '3 months', '6 months'],
      long: ['3 months', '6 months', '1 year']
    };

    const timeline = timeframes[params.timeHorizon as keyof typeof timeframes] || timeframes.medium;

    return timeline.map((period, index) => ({
      period,
      target: `${(index + 1) * 25}% of strategy implemented`,
      metrics: ['Portfolio allocation', 'Risk metrics', 'Yield generation']
    }));
  }

  private calculateExpectedOutcomes(params: any): any {
    const baseAPY = 6;
    const riskMultiplier = { low: 0.8, medium: 1.0, high: 1.3 };
    const expectedAPY =
      baseAPY * (riskMultiplier[params.riskTolerance as keyof typeof riskMultiplier] || 1.0);

    return {
      expectedAPY,
      projectedValue: params.investmentAmount * (1 + expectedAPY / 100),
      confidenceInterval: '±15%',
      timeToTarget: this.calculateTimeToTarget(params)
    };
  }

  private calculateTimeToTarget(params: any): string {
    const timeframes = { short: '1-3 months', medium: '3-12 months', long: '1-3 years' };
    return timeframes[params.timeHorizon as keyof typeof timeframes] || '6-12 months';
  }

  // Public interface methods
  getAvailableTools(): ExtensionKiloLendTool[] {
    return Array.from(this.tools.values());
  }

  async executeTool(toolName: string, params: any, sessionId?: string): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    try {
      return await tool.handler(params, sessionId);
    } catch (error) {
      console.error(`Error executing advanced tool ${toolName}:`, error);
      throw error;
    }
  }

  getClaudeToolsFormat(): any[] {
    return this.getAvailableTools().map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters
    }));
  }
}

export const extensionKiloLendToolsService = new ExtensionKiloLendToolsService();

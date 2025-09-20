import { ContractMarket } from '@/stores/contractMarketStore';
import { ContractUserPosition } from '@/stores/contractUserStore';

export interface KiloLendTool {
  name: string;
  description: string;
  parameters: any;
  handler: (params: any) => Promise<any>;
}

export interface MarketData {
  id: string;
  symbol: string;
  name: string;
  supplyAPY: number;
  borrowAPR: number;
  totalSupply: number;
  totalBorrow: number;
  utilization: number;
  price: number;
  priceChange24h: number;
  isActive: boolean;
  isCollateralOnly?: boolean;
}

export interface PortfolioSummary {
  totalSuppliedUSD: number;
  totalBorrowedUSD: number;
  totalCollateralUSD: number;
  netWorth: number;
  healthFactor: number;
  netAPY: number;
  positions: ContractUserPosition[];
  riskLevel: 'Low' | 'Medium' | 'High';
}

export class KiloLendToolsService {
  private tools: Map<string, KiloLendTool> = new Map();
  private marketData: ContractMarket[] = [];
  private portfolioData: any = null;
  private userAddress: string | null = null;

  constructor() {
    this.initializeTools();
  }

  setKiloLendData(markets: ContractMarket[], portfolio?: any, userAddress?: string) {
    
    this.marketData = markets;
    this.portfolioData = portfolio;
    this.userAddress = userAddress || null;
  }

  private initializeTools() {
    const tools: KiloLendTool[] = [
      {
        name: 'get_market_data',
        description: 'Get current market rates, TVL, and statistics for all KiloLend markets',
        parameters: {
          type: 'object',
          properties: {
            includeInactive: { type: 'boolean', description: 'Include inactive markets' },
            sortBy: { 
              type: 'string', 
              enum: ['supplyAPY', 'borrowAPR', 'utilization', 'totalSupply'],
              description: 'Sort markets by this field'
            }
          },
          required: []
        },
        handler: async (params: { includeInactive?: boolean; sortBy?: string }) => {
          let markets = this.marketData.filter(m => params.includeInactive || m.isActive);
          
          if (params.sortBy) {
            markets.sort((a, b) => {
              const aVal = (a as any)[params.sortBy!] || 0;
              const bVal = (b as any)[params.sortBy!] || 0;
              return bVal - aVal;
            });
          }

          const summary = {
            totalMarkets: markets.length,
            totalTVL: markets.reduce((sum, m) => sum + m.totalSupply + m.totalBorrow, 0),
            avgSupplyAPY: markets.filter(m => !m.isCollateralOnly).reduce((sum, m) => sum + m.supplyAPY, 0) / markets.filter(m => !m.isCollateralOnly).length,
            bestSupplyAPY: Math.max(...markets.filter(m => !m.isCollateralOnly).map(m => m.supplyAPY)),
            markets: markets.map(m => ({
              symbol: m.symbol,
              name: m.name,
              supplyAPY: m.supplyAPY,
              borrowAPR: m.borrowAPR,
              utilization: m.utilization,
              totalSupply: m.totalSupply,
              totalBorrow: m.totalBorrow,
              price: m.price,
              priceChange24h: m.priceChange24h,
              isCollateralOnly: m.isCollateralOnly || false
            }))
          };

          return summary;
        }
      },

      {
        name: 'get_user_portfolio',
        description: 'Get user portfolio summary including positions, health factor, and risk metrics',
        parameters: {
          type: 'object',
          properties: {
            includePositionDetails: { type: 'boolean', description: 'Include detailed position breakdown' },
            includeRiskAnalysis: { type: 'boolean', description: 'Include risk analysis and warnings' }
          },
          required: []
        },
        handler: async (params: { includePositionDetails?: boolean; includeRiskAnalysis?: boolean }) => {
          
          
          if (!this.portfolioData) {
            return {
              error: 'Portfolio data not available. User may need to connect wallet.',
              hasPositions: false
            };
          }

          const portfolio: PortfolioSummary = {
            totalSuppliedUSD: this.portfolioData.totalSupplied || 0,
            totalBorrowedUSD: this.portfolioData.totalBorrowed || 0,
            totalCollateralUSD: this.portfolioData.totalCollateralValue || 0,
            netWorth: (this.portfolioData.totalSupplied || 0) - (this.portfolioData.totalBorrowed || 0),
            healthFactor: this.portfolioData.healthFactor || 999,
            netAPY: this.portfolioData.netAPY || 0,
            positions: this.portfolioData.positions || [],
            riskLevel: this.calculateRiskLevel(this.portfolioData.healthFactor || 999)
          };

          let result: any = portfolio;

          if (params.includePositionDetails && portfolio.positions.length > 0) {
            result.positionDetails = portfolio.positions.map(pos => ({
              marketId: pos.marketId,
              type: pos.type,
              amountUSD: pos.usdValue,
              apy: pos.apy,
              isHealthy: pos.isHealthy
            }));
          }

          if (params.includeRiskAnalysis) {
            result.riskAnalysis = this.analyzePortfolioRisk(portfolio);
          }

          return result;
        }
      },

      {
        name: 'find_yield_opportunities',
        description: 'Find best yield opportunities based on risk tolerance and investment amount',
        parameters: {
          type: 'object',
          properties: {
            riskTolerance: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Risk tolerance level'
            },
            investmentAmount: { type: 'number', description: 'Amount to invest in USD' },
            excludeAssets: {
              type: 'array',
              items: { type: 'string' },
              description: 'Asset symbols to exclude'
            }
          },
          required: []
        },
        handler: async (params: { riskTolerance?: string; investmentAmount?: number; excludeAssets?: string[] }) => {
          const opportunities = this.marketData
            .filter(m => !m.isCollateralOnly && m.isActive)
            .filter(m => !params.excludeAssets?.includes(m.symbol))
            .map(m => ({
              symbol: m.symbol,
              name: m.name,
              supplyAPY: m.supplyAPY,
              utilization: m.utilization,
              tvl: m.totalSupply + m.totalBorrow,
              riskScore: this.calculateMarketRisk(m),
              recommendation: this.generateYieldRecommendation(m, params.riskTolerance),
              projectedEarnings: params.investmentAmount ? (params.investmentAmount * m.supplyAPY / 100) : null
            }))
            .filter(opp => this.matchesRiskTolerance(opp.riskScore, params.riskTolerance))
            .sort((a, b) => b.supplyAPY - a.supplyAPY);

          return {
            opportunities: opportunities.slice(0, 5),
            totalOpportunities: opportunities.length,
            riskTolerance: params.riskTolerance || 'medium',
            investmentAmount: params.investmentAmount,
            timestamp: new Date().toISOString()
          };
        }
      },

      {
        name: 'analyze_portfolio_risk',
        description: 'Analyze portfolio risk including liquidation scenarios and recommendations',
        parameters: {
          type: 'object',
          properties: {
            priceDropScenarios: {
              type: 'array',
              items: { type: 'number' },
              description: 'Price drop percentages to simulate (e.g., [10, 20, 30])'
            }
          },
          required: []
        },
        handler: async (params: { priceDropScenarios?: number[] }) => {
           
          
          if (!this.portfolioData || this.portfolioData.totalBorrowed === 0) {
            return {
              riskLevel: 'None',
              message: 'No borrowing positions - no liquidation risk',
              healthFactor: this.portfolioData?.healthFactor || 999
            };
          }

          const scenarios = (params.priceDropScenarios || [10, 20, 30]).map(dropPercent => {
            const adjustedCollateralValue = this.portfolioData.totalSupplied * (1 - dropPercent / 100);
            const newHealthFactor = adjustedCollateralValue * 0.75 / this.portfolioData.totalBorrowed;
            
            return {
              priceDropPercent: dropPercent,
              newHealthFactor,
              liquidationRisk: newHealthFactor < 1,
              marginOfSafety: Math.max(0, newHealthFactor - 1)
            };
          });

          const currentRisk = this.calculateRiskLevel(this.portfolioData.healthFactor);
          
          return {
            currentHealthFactor: this.portfolioData.healthFactor,
            riskLevel: currentRisk,
            scenarios,
            recommendations: this.generateRiskRecommendations(scenarios, currentRisk),
            liquidationPrice: this.calculateLiquidationPrice(),
            timestamp: new Date().toISOString()
          };
        }
      },

      {
        name: 'simulate_positions',
        description: 'Simulate the impact of potential position changes on portfolio metrics',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['supply', 'withdraw', 'borrow', 'repay'],
              description: 'Action to simulate'
            },
            asset: { type: 'string', description: 'Asset symbol (USDT, MBX, BORA, SIX, KAIA)' },
            amount: { type: 'number', description: 'Amount in USD to simulate' }
          },
          required: ['action', 'asset', 'amount']
        },
        handler: async (params: { action: string; asset: string; amount: number }) => {
           
          
          const market = this.marketData.find(m => m.symbol === params.asset);
          if (!market) {
            return { error: `Market for ${params.asset} not found` };
          }

          if (!this.portfolioData) {
            return { error: 'Portfolio data not available' };
          }

          const currentPortfolio = { ...this.portfolioData };
          let newPortfolio = { ...currentPortfolio };

          switch (params.action) {
            case 'supply':
              newPortfolio.totalSupplied += params.amount;
              break;
            case 'withdraw':
              newPortfolio.totalSupplied = Math.max(0, newPortfolio.totalSupplied - params.amount);
              break;
            case 'borrow':
              newPortfolio.totalBorrowed += params.amount;
              break;
            case 'repay':
              newPortfolio.totalBorrowed = Math.max(0, newPortfolio.totalBorrowed - params.amount);
              break;
          }

          // Recalculate health factor
          newPortfolio.healthFactor = newPortfolio.totalBorrowed > 0 
            ? (newPortfolio.totalSupplied * 0.75) / newPortfolio.totalBorrowed 
            : 999;

          return {
            action: params.action,
            asset: params.asset,
            amount: params.amount,
            before: {
              totalSupplied: currentPortfolio.totalSupplied,
              totalBorrowed: currentPortfolio.totalBorrowed,
              healthFactor: currentPortfolio.healthFactor,
              netWorth: currentPortfolio.totalSupplied - currentPortfolio.totalBorrowed
            },
            after: {
              totalSupplied: newPortfolio.totalSupplied,
              totalBorrowed: newPortfolio.totalBorrowed,
              healthFactor: newPortfolio.healthFactor,
              netWorth: newPortfolio.totalSupplied - newPortfolio.totalBorrowed
            },
            impact: {
              healthFactorChange: newPortfolio.healthFactor - currentPortfolio.healthFactor,
              netWorthChange: (newPortfolio.totalSupplied - newPortfolio.totalBorrowed) - (currentPortfolio.totalSupplied - currentPortfolio.totalBorrowed),
              riskChange: this.assessRiskChange(currentPortfolio.healthFactor, newPortfolio.healthFactor),
              recommendation: this.generateSimulationRecommendation(params.action, newPortfolio.healthFactor)
            },
            timestamp: new Date().toISOString()
          };
        }
      },

      {
        name: 'get_kilo_points',
        description: 'Get user KILO points balance and leaderboard information',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        },
        handler: async () => {
          try {
            // Check if user address is available
            if (!this.userAddress) {
              return {
                error: 'No wallet connected',
                message: 'Please connect your wallet to view KILO points',
                suggestion: 'Connect your wallet and try again'
              };
            }

            // Use the same API endpoint as the KiloModal
            const response = await fetch(
              `https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod/users/${this.userAddress}`
            );
            
            if (!response.ok) {
              throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
              return {
                userPoints: 0,
                userRank: null,
                dailyBreakdown: {},
                isNewUser: true,
                message: 'Start earning KILO points by supplying or borrowing assets!',
                howToEarn: [
                  '100,000 points are allocated daily at midnight GMT',
                  'Your share is based on your daily net contribution + overall TVL contribution',
                  'A multiplier is applied to calculate your final KILO points'
                ]
              };
            }
            
            // Process the daily points data same as KiloModal
            let totalPoints = 0;
            const dailyBreakdown: Record<string, number> = {};
            
            if (data.dailyPoints && Array.isArray(data.dailyPoints)) {
              data.dailyPoints.forEach((entry: any) => {
                const points = entry[entry.date] || 0;
                dailyBreakdown[entry.date] = points;
                totalPoints += points;
              });
            }
            
            // Get recent activities (last 7 days)
            const recentActivities = Object.entries(dailyBreakdown)
              .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
              .slice(0, 7)
              .map(([date, points]) => ({
                date,
                points,
                action: 'Daily rewards',
                formattedDate: new Date(date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              }));
            
            const result = {
              userPoints: totalPoints,
              userRank: null, // Not provided by current API
              dailyBreakdown,
              recentActivities,
              isNewUser: false,
              totalDaysActive: Object.keys(dailyBreakdown).length,
              averageDailyPoints: totalPoints > 0 ? Math.round(totalPoints / Math.max(1, Object.keys(dailyBreakdown).length)) : 0,
              howItWorks: {
                dailyAllocation: '100,000 KILO points allocated daily at midnight GMT',
                distribution: 'Based on your daily net contribution + overall TVL contribution',
                multiplier: 'A multiplier is applied to calculate final KILO points'
              },
              lastUpdated: new Date().toISOString()
            };
             
            
            return result;
            
          } catch (error: any) {
            console.error('Error fetching KILO points:', error);
            return {
              error: 'Failed to fetch KILO points data',
              message: 'Unable to retrieve your KILO points at this time. Please try again later.',
              details: error.message,
              userPoints: 0,
              isError: true
            };
          }
        }
      },
      {
        name: 'execute_secure_transaction',
        description: 'Execute a transaction (supply, withdraw, borrow, repay) securely via Nitro Enclave',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['supply', 'withdraw', 'borrow', 'repay'],
              description: 'The action to execute'
            },
            asset: {
              type: 'string',
              enum: ['USDT', 'MBX', 'BORA', 'SIX', 'KAIA'],
              description: 'The asset symbol'
            },
            amount: {
              type: 'string',
              description: 'Amount in token units (e.g., "100.5")'
            },
            maxGasPrice: {
              type: 'string',
              description: 'Maximum gas price in Gwei (optional, defaults to 50)'
            }
          },
          required: ['action', 'asset', 'amount']
        },
        handler: async (params: {
          action: string;
          asset: string;
          amount: string;
          maxGasPrice?: string;
        }) => {
          // Check if user is connected
          if (!this.userAddress) {
            return {
              error: 'No wallet connected',
              message: 'Please connect your wallet to execute transactions',
              requiresWalletConnection: true
            };
          }

          // Validate the request
          const validActions = ['supply', 'withdraw', 'borrow', 'repay'];
          const validAssets = ['USDT', 'MBX', 'BORA', 'SIX', 'KAIA'];

          if (!validActions.includes(params.action)) {
            return {
              error: 'Invalid action',
              message: `Action must be one of: ${validActions.join(', ')}`
            };
          }

          if (!validAssets.includes(params.asset)) {
            return {
              error: 'Invalid asset',
              message: `Asset must be one of: ${validAssets.join(', ')}`
            };
          }

          // Validate amount
          const amount = parseFloat(params.amount);
          if (isNaN(amount) || amount <= 0) {
            return {
              error: 'Invalid amount',
              message: 'Amount must be a positive number'
            };
          }

          try {
            // Submit task to execution API
            const apiUrl = 'https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod';
            
            const response = await fetch(`${apiUrl}/execute`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userAddress: this.userAddress,
                action: params.action,
                asset: params.asset,
                amount: params.amount,
                maxGasPrice: params.maxGasPrice || '50'
              })
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to submit transaction');
            }

            const result = await response.json();

            return {
              success: true,
              taskId: result.taskId,
              status: result.status,
              action: params.action,
              asset: params.asset,
              amount: params.amount,
              userAddress: this.userAddress,
              message: '🔐 Transaction submitted for secure execution in Nitro Enclave',
              estimatedTime: result.estimatedTime || '30-60 seconds',
              checkStatusUrl: result.checkStatusUrl,
              nextSteps: [
                '⚠️ This is an experimental feature available only to whitelisted users',
                '✅ Your transaction has been submitted to a secure Nitro Enclave',
                '🔒 The enclave will execute your transaction safely using isolated private keys',
                '⏱️ Execution typically takes 30-60 seconds',
                '🔍 You can check the status using the provided task ID',
                '📝 You will receive the transaction hash once completed'
              ],
              securityInfo: {
                executionEnvironment: 'AWS Nitro Enclave',
                securityFeatures: [
                  'Hardware-isolated execution',
                  'Private keys never leave secure enclave', 
                  'Cryptographically verifiable environment',
                  'No network access from enclave'
                ]
              }
            };

          } catch (error: any) {
            console.error('Transaction execution error:', error);
            return {
              error: 'Execution submission failed',
              message: error.message || 'Failed to submit transaction for execution',
              suggestion: 'Please try again or contact support if the issue persists'
            };
          }
        }
      },

      {
        name: 'check_transaction_status',
        description: 'Check the status of a previously submitted transaction',
        parameters: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'The task ID returned when transaction was submitted'
            }
          },
          required: ['taskId']
        },
        handler: async (params: { taskId: string }) => {
          try {
            const apiUrl = 'https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod';
            
            const response = await fetch(`${apiUrl}/execute/${params.taskId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            });

            if (!response.ok) {
              if (response.status === 404) {
                return {
                  error: 'Task not found',
                  message: 'The specified task ID could not be found',
                  taskId: params.taskId
                };
              }
              throw new Error('Failed to check transaction status');
            }

            const status = await response.json();

            // Format response based on status
            const response_data = {
              taskId: status.taskId,
              status: status.status,
              userAddress: status.userAddress,
              action: status.action,
              asset: status.asset,
              amount: status.amount,
              elapsedTime: `${status.elapsedSeconds} seconds`,
              retryCount: status.retryCount || 0
            };

            // Add status-specific information
            switch (status.status) {
              case 'PENDING':
                return {
                  ...response_data,
                  message: '⏳ Transaction is queued for execution',
                  nextStep: 'Your transaction will be processed shortly by the secure enclave'
                };

              case 'PROCESSING':
                return {
                  ...response_data,
                  message: '🔄 Transaction is being executed in the secure enclave',
                  nextStep: 'Please wait while the enclave signs and submits your transaction'
                };

              case 'COMPLETED':
                return {
                  ...response_data,
                  message: '✅ Transaction completed successfully!',
                  transactionHash: status.transactionHash,
                  gasUsed: status.gasUsed,
                  blockNumber: status.blockNumber,
                  nextStep: 'Your transaction is now confirmed on the blockchain'
                };

              case 'FAILED':
                return {
                  ...response_data,
                  message: '❌ Transaction execution failed',
                  error: status.error,
                  nextStep: 'You can try submitting the transaction again'
                };

              default:
                return {
                  ...response_data,
                  message: `Transaction status: ${status.status}`
                };
            }

          } catch (error: any) {
            console.error('Status check error:', error);
            return {
              error: 'Status check failed',
              message: error.message || 'Failed to check transaction status',
              taskId: params.taskId
            };
          }
        }
      }
    ];

    tools.forEach(tool => this.tools.set(tool.name, tool));
  }

  // Helper methods
  private calculateRiskLevel(healthFactor: number): 'Low' | 'Medium' | 'High' {
    if (healthFactor > 2.5) return 'Low';
    if (healthFactor > 1.5) return 'Medium';
    return 'High';
  }

  private calculateMarketRisk(market: ContractMarket): number {
    let riskScore = 0;
    
    // High utilization increases risk
    if (market.utilization > 90) riskScore += 3;
    else if (market.utilization > 70) riskScore += 2;
    else if (market.utilization > 50) riskScore += 1;

    // Price volatility risk
    if (Math.abs(market.priceChange24h) > 5) riskScore += 3;
    else if (Math.abs(market.priceChange24h) > 2) riskScore += 2;
    else if (Math.abs(market.priceChange24h) > 1) riskScore += 1;

    // TVL risk
    const tvl = market.totalSupply + market.totalBorrow;
    if (tvl < 100000) riskScore += 2;
    else if (tvl < 500000) riskScore += 1;

    // USDT is lower risk
    if (market.symbol === 'USDT') riskScore = Math.max(0, riskScore - 2);

    return Math.min(10, riskScore);
  }

  private matchesRiskTolerance(riskScore: number, tolerance?: string): boolean {
    switch (tolerance) {
      case 'low': return riskScore <= 3;
      case 'medium': return riskScore <= 6;
      case 'high': return true;
      default: return riskScore <= 5;
    }
  }

  private generateYieldRecommendation(market: ContractMarket, riskTolerance?: string): string {
    const risk = this.calculateMarketRisk(market);
    
    if (riskTolerance === 'low' && risk > 3) {
      return 'Too risky for conservative strategy';
    }
    if (market.supplyAPY > 7) {
      return 'High yield opportunity - suitable for growth strategies';
    }
    if (market.symbol === 'USDT') {
      return 'Stable returns - perfect for conservative allocation';
    }
    return 'Moderate opportunity - suitable for balanced strategies';
  }

  private analyzePortfolioRisk(portfolio: PortfolioSummary): any {
    const warnings = [];
    const recommendations = [];

    if (portfolio.healthFactor < 1.5) {
      warnings.push('⚠️ Health factor critically low - liquidation risk!');
      recommendations.push('Add more collateral or repay debt immediately');
    } else if (portfolio.healthFactor < 2.0) {
      warnings.push('⚠️ Health factor below safe threshold');
      recommendations.push('Consider adding collateral for safety margin');
    }

    if (portfolio.positions.length === 1) {
      warnings.push('Portfolio lacks diversification');
      recommendations.push('Consider spreading investments across multiple assets');
    }

    if (portfolio.netAPY < 2) {
      recommendations.push('Explore higher-yield opportunities to improve returns');
    }

    return {
      warnings,
      recommendations,
      concentrationRisk: this.calculateConcentrationRisk(portfolio.positions),
      liquidationDistance: portfolio.healthFactor > 1 ? ((portfolio.healthFactor - 1) / portfolio.healthFactor * 100).toFixed(1) + '%' : '0%'
    };
  }

  private calculateConcentrationRisk(positions: ContractUserPosition[]): string {
    if (positions.length <= 1) return 'High';
    
    const totalValue = positions.reduce((sum, pos) => sum + pos.usdValue, 0);
    const maxPosition = Math.max(...positions.map(pos => pos.usdValue / totalValue));
    
    if (maxPosition > 0.7) return 'High';
    if (maxPosition > 0.5) return 'Medium';
    return 'Low';
  }

  private generateRiskRecommendations(scenarios: any[], currentRisk: string): string[] {
    const recommendations = [];
    
    const criticalScenario = scenarios.find(s => s.liquidationRisk);
    if (criticalScenario) {
      recommendations.push(`⚠️ Liquidation risk at ${criticalScenario.priceDropPercent}% price drop`);
      recommendations.push('💰 Add more KAIA collateral to improve safety margin');
      recommendations.push('📱 Set up price alerts for your collateral assets');
    }
    
    if (currentRisk === 'High') {
      recommendations.push('🚨 Immediate action required - reduce borrowing or add collateral');
    } else if (currentRisk === 'Medium') {
      recommendations.push('⚡ Consider improving your position for better safety');
    }
    
    return recommendations;
  }

  private calculateLiquidationPrice(): number {
    if (!this.portfolioData || this.portfolioData.totalBorrowed === 0) return 0;
    
    const requiredCollateralValue = this.portfolioData.totalBorrowed / 0.75;
    const currentCollateralValue = this.portfolioData.totalSupplied;
    
    return currentCollateralValue > 0 ? (requiredCollateralValue / currentCollateralValue) * 100 : 0;
  }

  private assessRiskChange(oldHF: number, newHF: number): string {
    const change = newHF - oldHF;
    if (change > 0.5) return 'Risk significantly reduced';
    if (change > 0) return 'Risk slightly reduced';
    if (change > -0.5) return 'Risk slightly increased';
    return 'Risk significantly increased';
  }

  private generateSimulationRecommendation(action: string, newHealthFactor: number): string {
    if (newHealthFactor < 1.5) {
      return '🚨 This action would put you at high liquidation risk!';
    } else if (newHealthFactor < 2.0) {
      return '⚠️ This action reduces your safety margin - monitor closely';
    } else if (action === 'supply') {
      return '✅ This supply action improves your portfolio safety';
    } else if (action === 'repay') {
      return '✅ Repaying debt strengthens your position';
    }
    return 'This action appears safe for your portfolio';
  }

  // Public interface methods
  getAvailableTools(): KiloLendTool[] {
    return Array.from(this.tools.values());
  }

  async executeTool(toolName: string, params: any): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }
    
    try {
      return await tool.handler(params);
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
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

export const kilolendToolsService = new KiloLendToolsService();
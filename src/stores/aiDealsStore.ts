// import { create } from 'zustand';
// import { LendingAIService, PoolRecommendation } from '@/utils/aiService';
// import { PoolDataCollector } from '@/utils/poolDataCollector';

// export interface AIDeal {
//   id: string;
//   type: 'supply' | 'borrow';
//   marketId: string;
//   amount: number;
//   apy: number;
//   duration: string;
//   riskLevel: 'low' | 'medium' | 'high';
//   title: string;
//   description: string;
//   benefits: string[];
//   risks: string[];
//   estimatedEarnings?: number; // For supply deals
//   estimatedCost?: number; // For borrow deals
//   collateralRequired?: number; // For borrow deals
//   liquidationPrice?: number; // For borrow deals
//   recommendation: string;
//   confidence: number; // 0-100
// }

// export interface AIDealsState {
//   currentDeals: AIDeal[];
//   currentDealIndex: number;
//   isGenerating: boolean;
//   lastQuery: string;
//   swipedDeals: { dealId: string; action: 'accept' | 'reject' }[];
//   acceptedDeals: AIDeal[];
//   generateDeals: (userQuery: string) => Promise<void>;
//   swipeDeal: (dealId: string, action: 'accept' | 'reject') => void;
//   nextDeal: () => void;
//   resetDeals: () => void;
//   getCurrentDeal: () => AIDeal | null;
//   getAcceptedDeals: () => AIDeal[];
// }

// // AI response templates based on user query patterns
// const dealTemplates = {
//   safe_returns: [
//     {
//       type: 'supply' as const,
//       marketId: 'usdt',
//       riskLevel: 'low' as const,
//       title: 'Stable USDT Yield',
//       description: 'Low-risk stablecoin lending with consistent returns',
//       benefits: ['Capital preservation', 'Predictable income', 'High liquidity'],
//       risks: ['Smart contract risk', 'Platform risk'],
//       recommendation: 'Perfect for conservative investors seeking steady returns'
//     },
//     {
//       type: 'supply' as const,
//       marketId: 'krw',
//       riskLevel: 'low' as const,
//       title: 'KRW Stable Income',
//       description: 'Korean Won stablecoin with attractive yields',
//       benefits: ['Currency diversification', 'Stable returns', 'Lower competition'],
//       risks: ['Currency fluctuation', 'Regulatory changes'],
//       recommendation: 'Great for diversifying stablecoin exposure'
//     }
//   ],
//   borrow_kaia: [
//     {
//       type: 'borrow' as const,
//       marketId: 'usdt',
//       riskLevel: 'medium' as const,
//       title: 'USDT Leverage Play',
//       description: 'Borrow USDT against KAIA collateral for strategic positions',
//       benefits: ['Keep KAIA exposure', 'Access liquidity', 'Tax efficiency'],
//       risks: ['Liquidation risk', 'Interest rate volatility', 'KAIA price volatility'],
//       recommendation: 'Suitable for KAIA holders needing liquidity'
//     },
//     {
//       type: 'borrow' as const,
//       marketId: 'krw',
//       riskLevel: 'low' as const,
//       title: 'Low-Rate KRW Borrow',
//       description: 'Borrow KRW at attractive rates using KAIA as collateral',
//       benefits: ['Lower interest rates', 'Local currency access', 'Flexible terms'],
//       risks: ['Exchange rate risk', 'Liquidation threshold'],
//       recommendation: 'Ideal for Korean users or KRW needs'
//     }
//   ],
//   high_yield: [
//     {
//       type: 'supply' as const,
//       marketId: 'usdt',
//       riskLevel: 'medium' as const,
//       title: 'Premium USDT Pool',
//       description: 'Higher yield USDT lending with dynamic rates',
//       benefits: ['Above-market returns', 'Auto-compounding', 'Flexible withdrawal'],
//       risks: ['Rate volatility', 'Higher utilization risk'],
//       recommendation: 'For yield-focused investors comfortable with some volatility'
//     }
//   ],
//   strategy_1000: [
//     {
//       type: 'supply' as const,
//       marketId: 'usdt',
//       riskLevel: 'low' as const,
//       title: '$1000 USDT Strategy',
//       description: 'Optimized lending strategy for $1000 capital',
//       benefits: ['Optimized for size', 'Low fees', 'Easy management'],
//       risks: ['Opportunity cost', 'Platform dependency'],
//       recommendation: 'Perfect starting amount for DeFi lending'
//     }
//   ]
// };

// // Create AI service instance
// const aiService = new LendingAIService();

// export const useAIDealsStore = create<AIDealsState>((set, get) => ({
//   currentDeals: [],
//   currentDealIndex: 0,
//   isGenerating: false,
//   lastQuery: '',
//   swipedDeals: [],
//   acceptedDeals: [],

//   generateDeals: async (userQuery: string) => {
//     set({ isGenerating: true, lastQuery: userQuery });

//     try {
//       // Collect real pool data
//       const poolData = PoolDataCollector.collectPoolData();
      
//       // Initialize AI service
//       const aiService = new LendingAIService();
      
//       // Get AI recommendations based on real pool data
//       const recommendations = await aiService.getPoolRecommendations(
//         userQuery, 
//         poolData.pools
//       );

//       // Convert recommendations to AIDeal format
//       const deals: AIDeal[] = recommendations.map((rec, index) => ({
//         id: rec.id || `ai_deal_${Date.now()}_${index}`,
//         type: rec.type,
//         marketId: rec.poolId,
//         amount: rec.suggestedAmount || 1000,
//         apy: rec.apy,
//         duration: rec.duration || '30 days',
//         riskLevel: poolData.pools.find(p => p.id === rec.poolId)?.riskLevel || 'medium',
//         title: rec.name,
//         description: rec.reason,
//         benefits: rec.benefits,
//         risks: rec.riskWarnings,
//         estimatedEarnings: rec.estimatedEarnings,
//         estimatedCost: rec.estimatedCosts,
//         collateralRequired: rec.collateralRequired,
//         liquidationPrice: rec.liquidationPrice,
//         recommendation: rec.reason,
//         confidence: rec.score
//       }));

//       set({ 
//         currentDeals: deals, 
//         currentDealIndex: 0, 
//         isGenerating: false,
//         swipedDeals: []
//       });
//     } catch (error) {
//       console.error('Failed to generate AI deals:', error);
      
//       // Fallback to template-based deals if AI fails
//       const query = userQuery.toLowerCase();
//       let selectedTemplates: any[] = [];

//       if (query.includes('safe') || query.includes('4-5%') || query.includes('low risk')) {
//         selectedTemplates = dealTemplates.safe_returns;
//       } else if (query.includes('kaia') || query.includes('borrow')) {
//         selectedTemplates = dealTemplates.borrow_kaia;
//       } else if (query.includes('high') || query.includes('yield')) {
//         selectedTemplates = dealTemplates.high_yield;
//       } else if (query.includes('1000') || query.includes('$1000')) {
//         selectedTemplates = dealTemplates.strategy_1000;
//       } else {
//         selectedTemplates = dealTemplates.safe_returns;
//       }

//       const fallbackDeals: AIDeal[] = selectedTemplates.map((template, index) => {
//         const baseAmount = query.includes('1000') ? 1000 : Math.floor(Math.random() * 5000) + 500;
//         const rateVariation = (Math.random() - 0.5) * 1;
//         const baseRate = template.type === 'supply' ? 5.2 : 3.8;
//         const apy = Math.max(0.1, baseRate + rateVariation);
        
//         return {
//           id: `fallback_deal_${Date.now()}_${index}`,
//           type: template.type,
//           marketId: template.marketId,
//           amount: baseAmount,
//           apy: apy,
//           duration: ['30 days', '90 days', '180 days', '1 year'][Math.floor(Math.random() * 4)],
//           riskLevel: template.riskLevel,
//           title: `[Fallback] ${template.title}`,
//           description: template.description,
//           benefits: template.benefits,
//           risks: template.risks,
//           estimatedEarnings: template.type === 'supply' ? (baseAmount * apy) / 100 / 12 : undefined,
//           estimatedCost: template.type === 'borrow' ? (baseAmount * apy) / 100 / 12 : undefined,
//           collateralRequired: template.type === 'borrow' ? baseAmount * 1.5 : undefined,
//           liquidationPrice: template.type === 'borrow' ? Math.random() * 0.2 + 0.6 : undefined,
//           recommendation: template.recommendation,
//           confidence: Math.floor(Math.random() * 20) + 60
//         };
//       });

//       set({ 
//         currentDeals: fallbackDeals.slice(0, 3), 
//         currentDealIndex: 0, 
//         isGenerating: false,
//         swipedDeals: []
//       });
//     }
//   },

//   swipeDeal: (dealId: string, action: 'accept' | 'reject') => {
//     const { currentDeals, swipedDeals, acceptedDeals } = get();
//     const deal = currentDeals.find(d => d.id === dealId);
    
//     if (!deal) return;

//     const newSwipedDeals = [...swipedDeals, { dealId, action }];
//     const newAcceptedDeals = action === 'accept' ? [...acceptedDeals, deal] : acceptedDeals;

//     set({ 
//       swipedDeals: newSwipedDeals, 
//       acceptedDeals: newAcceptedDeals 
//     });

//     // Auto-advance to next deal
//     setTimeout(() => {
//       get().nextDeal();
//     }, 500);
//   },

//   nextDeal: () => {
//     const { currentDealIndex, currentDeals } = get();
//     if (currentDealIndex < currentDeals.length - 1) {
//       set({ currentDealIndex: currentDealIndex + 1 });
//     }
//   },

//   resetDeals: () => {
//     set({ 
//       currentDeals: [], 
//       currentDealIndex: 0, 
//       swipedDeals: [], 
//       acceptedDeals: [],
//       lastQuery: ''
//     });
//   },

//   getCurrentDeal: () => {
//     const { currentDeals, currentDealIndex } = get();
//     return currentDeals[currentDealIndex] || null;
//   },

//   getAcceptedDeals: () => {
//     return get().acceptedDeals;
//   }
// }));

// import React from 'react';
// import { useContractMarketStore, ContractMarket } from '@/stores/contractMarketStore';
// import { PoolInfo } from './aiService';

// export interface MarketAnalytics {
//     totalTVL: number;
//     averageAPY: number;
//     averageBorrowAPR: number;
//     averageUtilization: number;
//     topPerformingPool: string;
//     mostStablePool: string;
//     riskDistribution: {
//         low: number;
//         medium: number;
//         high: number;
//     };
// }

// export interface PoolDataSummary {
//     pools: PoolInfo[];
//     analytics: MarketAnalytics;
//     lastUpdated: number;
//     totalActivePools: number;
// }

// /**
//  * Utility class to collect and format pool data for AI analysis
//  */
// export class PoolDataCollector {
    
//     /**
//      * Calculate risk level for a pool based on various factors
//      */
//     private static calculateRiskLevel(market: ContractMarket): 'low' | 'medium' | 'high' {
//         let riskScore = 0;

//         // High utilization increases risk
//         if (market.utilization > 90) riskScore += 3;
//         else if (market.utilization > 70) riskScore += 2;
//         else if (market.utilization > 50) riskScore += 1;

//         // Low TVL increases risk (based on total supply + borrow)
//         const tvl = market.totalSupply + market.totalBorrow;
//         if (tvl < 100000) riskScore += 3;
//         else if (tvl < 500000) riskScore += 2;
//         else if (tvl < 1000000) riskScore += 1;

//         // High price volatility increases risk
//         if (Math.abs(market.priceChange24h) > 5) riskScore += 3;
//         else if (Math.abs(market.priceChange24h) > 2) riskScore += 2;
//         else if (Math.abs(market.priceChange24h) > 1) riskScore += 1;

//         // APY/APR spread analysis
//         const spread = market.borrowAPR - market.supplyAPY;
//         if (spread > 5) riskScore += 2;
//         else if (spread > 3) riskScore += 1;

//         // Stablecoin assets are generally lower risk
//         if (market.symbol === 'USDT' || market.symbol === 'KRW' || 
//             market.symbol === 'JPY' || market.symbol === 'THB') {
//             riskScore -= 1;
//         }

//         // Determine final risk level
//         if (riskScore >= 6) return 'high';
//         if (riskScore >= 3) return 'medium';
//         return 'low';
//     }

//     /**
//      * Convert ContractMarket to PoolInfo format for AI consumption
//      */
//     private static convertMarketToPoolInfo(market: ContractMarket): PoolInfo {
//         const tvl = (market.totalSupply + market.totalBorrow) * market.price;
        
//         return {
//             id: market.id,
//             name: market.name,
//             symbol: market.symbol,
//             apy: market.supplyAPY,
//             borrowAPR: market.borrowAPR,
//             tvl: tvl,
//             totalSupply: market.totalSupply,
//             totalBorrow: market.totalBorrow,
//             utilization: market.utilization,
//             riskLevel: this.calculateRiskLevel(market),
//             asset: market.symbol,
//             price: market.price,
//             priceChange24h: market.priceChange24h,
//             isActive: market.isActive,
//             description: market.description
//         };
//     }

//     /**
//      * Calculate market analytics from pool data
//      */
//     private static calculateAnalytics(pools: PoolInfo[]): MarketAnalytics {
//         const activePools = pools.filter(p => p.isActive);
        
//         if (activePools.length === 0) {
//             return {
//                 totalTVL: 0,
//                 averageAPY: 0,
//                 averageBorrowAPR: 0,
//                 averageUtilization: 0,
//                 topPerformingPool: '',
//                 mostStablePool: '',
//                 riskDistribution: { low: 0, medium: 0, high: 0 }
//             };
//         }

//         const totalTVL = activePools.reduce((sum, p) => sum + p.tvl, 0);
//         const averageAPY = activePools.reduce((sum, p) => sum + p.apy, 0) / activePools.length;
//         const averageBorrowAPR = activePools.reduce((sum, p) => sum + p.borrowAPR, 0) / activePools.length;
//         const averageUtilization = activePools.reduce((sum, p) => sum + p.utilization, 0) / activePools.length;
        
//         const topPerformingPool = activePools.reduce((top, current) => 
//             current.apy > top.apy ? current : top
//         ).symbol;
        
//         const mostStablePool = activePools.reduce((stable, current) => 
//             Math.abs(current.priceChange24h) < Math.abs(stable.priceChange24h) ? current : stable
//         ).symbol;

//         const riskDistribution = activePools.reduce((dist, pool) => {
//             dist[pool.riskLevel]++;
//             return dist;
//         }, { low: 0, medium: 0, high: 0 });

//         return {
//             totalTVL,
//             averageAPY,
//             averageBorrowAPR,
//             averageUtilization,
//             topPerformingPool,
//             mostStablePool,
//             riskDistribution
//         };
//     }

//     /**
//      * Main method to collect all pool data for AI analysis
//      */
//     static collectPoolData(): PoolDataSummary {
//         const { markets } = useContractMarketStore.getState();
        
//         // Filter active lending markets (exclude collateral-only)
//         const lendingMarkets = markets.filter(m => m.isActive && !m.isCollateralOnly);
        
//         // Convert to PoolInfo format
//         const pools = lendingMarkets.map(market => this.convertMarketToPoolInfo(market));
        
//         // Calculate analytics
//         const analytics = this.calculateAnalytics(pools);
        
//         return {
//             pools,
//             analytics,
//             lastUpdated: Date.now(),
//             totalActivePools: pools.length
//         };
//     }

//     /**
//      * Get pools filtered by specific criteria
//      */
//     static getFilteredPools(filters: {
//         riskLevel?: 'low' | 'medium' | 'high';
//         minAPY?: number;
//         maxAPY?: number;
//         minTVL?: number;
//         preferredAssets?: string[];
//     }): PoolInfo[] {
//         const { pools } = this.collectPoolData();
        
//         return pools.filter(pool => {
//             if (filters.riskLevel && pool.riskLevel !== filters.riskLevel) return false;
//             if (filters.minAPY && pool.apy < filters.minAPY) return false;
//             if (filters.maxAPY && pool.apy > filters.maxAPY) return false;
//             if (filters.minTVL && pool.tvl < filters.minTVL) return false;
//             if (filters.preferredAssets && !filters.preferredAssets.includes(pool.symbol)) return false;
//             return true;
//         });
//     }

//     /**
//      * Get top performing pools by APY
//      */
//     static getTopPerformingPools(limit: number = 3): PoolInfo[] {
//         const { pools } = this.collectPoolData();
//         return pools
//             .filter(p => p.isActive)
//             .sort((a, b) => b.apy - a.apy)
//             .slice(0, limit);
//     }

//     /**
//      * Get safest pools (lowest risk)
//      */
//     static getSafestPools(limit: number = 3): PoolInfo[] {
//         const { pools } = this.collectPoolData();
//         const riskOrder = { low: 0, medium: 1, high: 2 };
        
//         return pools
//             .filter(p => p.isActive)
//             .sort((a, b) => {
//                 // First sort by risk level
//                 const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
//                 if (riskDiff !== 0) return riskDiff;
//                 // Then by price stability (lower 24h change is better)
//                 return Math.abs(a.priceChange24h) - Math.abs(b.priceChange24h);
//             })
//             .slice(0, limit);
//     }

//     /**
//      * Validate pool data quality
//      */
//     static validatePoolData(): { isValid: boolean; issues: string[] } {
//         const { pools } = this.collectPoolData();
//         const issues: string[] = [];

//         if (pools.length === 0) {
//             issues.push('No active pools available');
//         }

//         pools.forEach(pool => {
//             if (pool.apy <= 0) issues.push(`${pool.symbol}: Invalid APY`);
//             if (pool.borrowAPR <= 0) issues.push(`${pool.symbol}: Invalid borrow APR`);
//             if (pool.tvl < 0) issues.push(`${pool.symbol}: Invalid TVL`);
//             if (pool.utilization < 0 || pool.utilization > 100) {
//                 issues.push(`${pool.symbol}: Invalid utilization rate`);
//             }
//         });

//         return {
//             isValid: issues.length === 0,
//             issues
//         };
//     }
// }

// /**
//  * Hook to use pool data in React components
//  */
// export const usePoolData = () => {
//     const { markets, isLoading, lastUpdate } = useContractMarketStore();
    
//     const poolData = React.useMemo(() => {
//         return PoolDataCollector.collectPoolData();
//     }, [markets, lastUpdate]);

//     const getFilteredPools = React.useCallback((filters: Parameters<typeof PoolDataCollector.getFilteredPools>[0]) => {
//         return PoolDataCollector.getFilteredPools(filters);
//     }, [markets]);

//     return {
//         poolData,
//         getFilteredPools,
//         isLoading,
//         topPools: PoolDataCollector.getTopPerformingPools(),
//         safestPools: PoolDataCollector.getSafestPools(),
//         validation: PoolDataCollector.validatePoolData()
//     };
// };
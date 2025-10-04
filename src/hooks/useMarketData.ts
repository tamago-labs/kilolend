import { useState, useEffect, useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract } from './useMarketContract';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';

export const useMarketData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { updateMarketData, setLoading, markets } = useContractMarketStore();
  const { getMarketInfo } = useMarketContract();

  /**
   * Fetch market info for a specific market
   */
  const fetchMarketInfo = useCallback(async (marketId: MarketId) => {
    try {
      const marketConfig = MARKET_CONFIG[marketId];
      if (!marketConfig.marketAddress) {
        console.log(`Skipping ${marketId}`);
        return;
      }

      console.log(`Fetching market info for ${marketId}...`);
      const marketInfo = await getMarketInfo(marketId);
      
      if (marketInfo) {
        console.log(`Market info for ${marketId}:`, marketInfo);
        
        // Use BigNumber for safe calculations
        const safeMarketInfo = {
          ...marketInfo,
          supplyAPY: new BigNumber(marketInfo.supplyAPY || 0).toNumber(),
          borrowAPR: new BigNumber(marketInfo.borrowAPR || 0).toNumber(),
          utilizationRate: new BigNumber(marketInfo.utilizationRate || 0).toNumber()
        };
        
        updateMarketData(marketId, safeMarketInfo);
      } else {
        console.warn(`No market info returned for ${marketId}`);
      }
    } catch (error) {
      console.error(`Error fetching market info for ${marketId}:`, error);
      // Don't throw error - just log it and continue with other markets
    }
  }, [getMarketInfo, updateMarketData]);

  /**
   * Fetch all market data
   */
  const fetchAllMarketData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLoading(true);

    try {
      console.log('Starting to fetch all market data...');
      
      // Get all market IDs and process them
      const marketIds = Object.keys(MARKET_CONFIG) as MarketId[];
      
      console.log('All markets to fetch:', marketIds);

      // Fetch market data for all markets
      const fetchPromises = marketIds.map(marketId => fetchMarketInfo(marketId));
      await Promise.allSettled(fetchPromises);

      setLastUpdate(new Date());
      console.log('Finished fetching all market data');
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError('Failed to fetch market data');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [fetchMarketInfo, setLoading]);

  /**
   * Fetch market data for a single market
   */
  const refreshMarket = useCallback(async (marketId: MarketId) => {
    try {
      await fetchMarketInfo(marketId);
    } catch (error) {
      console.error(`Error refreshing market ${marketId}:`, error);
    }
  }, [fetchMarketInfo]);

  /**
   * Auto-fetch market data on mount and periodically
   */
  useEffect(() => {
    // Initial fetch
    fetchAllMarketData();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAllMarketData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    isLoading,
    lastUpdate,
    error,
    fetchAllMarketData,
    refreshMarket,
    markets
  };
};

export default useMarketData;

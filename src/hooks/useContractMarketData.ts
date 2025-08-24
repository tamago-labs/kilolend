import { useEffect, useCallback } from 'react';
import { useMarketContract } from '@/hooks/useMarketContract';
import { usePriceOracle } from '@/hooks/usePriceOracle';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';

/**
 * Hook to fetch and update market data from smart contracts
 * Replaces mock data updating mechanism
 */
export const useContractMarketData = () => {
  const marketContract = useMarketContract();
  const priceOracle = usePriceOracle();

  const {
    updateMarketData,
    updatePriceData,
    setLoading,
    // setLastUpdate,
    lastUpdate,
  } = useContractMarketStore();

  // Fetch individual market data
  const fetchMarketData = useCallback(
    async (marketId: MarketId) => {
      try {
        const marketInfo = await marketContract.getMarketInfo(marketId);
        if (marketInfo) {
          updateMarketData(marketId, marketInfo);
        }
      } catch (error) {
        console.error(`Error fetching market data for ${marketId}:`, error);
      }
    },
    [marketContract, updateMarketData]
  );

  // Fetch price data
  const fetchPriceData = useCallback(
    async () => {
      try {
        const prices = await priceOracle.getAllPrices();
        if (prices) {
          updatePriceData(prices);
        }
      } catch (error) {
        console.error('Error fetching price data:', error);
      }
    },
    [priceOracle, updatePriceData]
  );

  // Fetch all market data
  const fetchAllMarketData = useCallback(
    async () => {
      setLoading(true);

      try {
        // Get all lending markets (exclude collateral-only)
        const lendingMarkets = Object.keys(MARKET_CONFIG).filter(
          (id) => MARKET_CONFIG[id as MarketId].marketAddress !== null
        ) as MarketId[];

        // Fetch market and price data in parallel
        await Promise.all([
          ...lendingMarkets.map(fetchMarketData),
          fetchPriceData(),
        ]);

        // Update last fetch timestamp
        // setLastUpdate(Date.now());
      } catch (error) {
        console.error('Error fetching all market data:', error);
      } finally {
        setLoading(false);
      }
    },
    [fetchMarketData, fetchPriceData, setLoading]
  );

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchAllMarketData();

    const interval = setInterval(fetchAllMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Manual refresh function
  const refreshData = useCallback(fetchAllMarketData, [fetchAllMarketData]);

  return {
    refreshData,
    fetchMarketData,
    fetchPriceData,
    lastUpdate,
  };
};

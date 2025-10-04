import { useEffect } from 'react';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { usePriceUpdates } from './usePriceUpdates';
import { useMarketData } from './useMarketData';

/**
 * Combined hook that manages both market data and price updates
 */
export const useMarketDataWithPrices = () => {
  const { updatePriceData } = useContractMarketStore();

  // Get market data (supplies/borrows/rates from contracts)
  const marketData = useMarketData();

  // Get real-time price data
  const priceData = usePriceUpdates({
    symbols: ['USDT', 'SIX', 'BORA', 'MBX', 'KAIA'], // All tokens we support
  });

  // Update market store with real price data when prices change
  useEffect(() => {
    if (priceData.prices && Object.keys(priceData.prices).length > 0) {
      // console.log('Updating market store with real prices:', priceData.prices);
      updatePriceData(priceData.prices);
    }
  }, [priceData.prices]);

  return {
    // Market data
    ...marketData,

    // Price data
    prices: priceData.prices,
    pricesLoading: priceData.isLoading,
    pricesError: priceData.error,

    // Combined loading state
    isLoading: marketData.isLoading || priceData.isLoading,

    refreshPrices: priceData.refetch,

  };
};

import { useEffect } from 'react';
import { useMarketStore } from '../stores/marketStore';
import { useAppStore } from '../stores/appStore';

export const usePriceUpdates = () => {
  const updateMarkets = useMarketStore(state => state.updateMarkets);
  const updateLastUpdated = useAppStore(state => state.updateLastUpdated);
  const priceUpdateInterval = useAppStore(state => state.priceUpdateInterval);

  useEffect(() => {
    // Initial update
    updateMarkets();
    updateLastUpdated();

    // Set up interval for live updates
    const interval = setInterval(() => {
      updateMarkets();
      updateLastUpdated();
    }, priceUpdateInterval);

    return () => clearInterval(interval);
  }, [updateMarkets, updateLastUpdated, priceUpdateInterval]);
};

'use client';

import { ReactNode } from 'react';
import { useMultiChainMarketData } from '@/hooks/v2/useMultiChainMarketData';

interface MarketDataProviderProps {
  children: ReactNode;
}

/**
 * This component initializes multi-chain market data fetching when the app loads
 * It fetches market data from all chains (KAIA, KUB, Etherlink) simultaneously
 * It doesn't render anything itself, just runs the hooks to fetch data
 */
export const MarketDataProvider = ({ children }: MarketDataProviderProps) => {
  // This hook will automatically start fetching market data from all chains
  useMultiChainMarketData();

  return <>{children}</>;
};

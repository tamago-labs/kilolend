'use client';

import { ReactNode } from 'react';
import { useMarketData } from '@/hooks/useMarketData';

interface MarketDataProviderProps {
  children: ReactNode;
}

/**
 * This component initializes market data fetching when the app loads
 * It doesn't render anything itself, just runs the hooks to fetch data
 */
export const MarketDataProvider = ({ children }: MarketDataProviderProps) => {
  // This hook will automatically start fetching market data
  useMarketData();

  return <>{children}</>;
};

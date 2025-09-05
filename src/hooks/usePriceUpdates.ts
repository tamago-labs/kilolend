import { useState, useEffect } from 'react';

interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: Date;
}

interface UsePriceUpdatesOptions {
  symbols: string[];
  updateInterval?: number; // in milliseconds
  enableRealTimeUpdates?: boolean;
}

export const usePriceUpdates = ({ 
  symbols, 
  updateInterval = 30000, // 30 seconds default
  enableRealTimeUpdates = false 
}: UsePriceUpdatesOptions) => {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock price data for development
  const getMockPrices = (): Record<string, TokenPrice> => {
    const mockData: Record<string, TokenPrice> = {
      'KAIA': {
        symbol: 'KAIA',
        price: 0.1245 + (Math.random() - 0.5) * 0.01,
        change24h: 2.34 + (Math.random() - 0.5) * 2,
        lastUpdated: new Date()
      },
      'USDT': {
        symbol: 'USDT',
        price: 1.0001 + (Math.random() - 0.5) * 0.001,
        change24h: 0.01 + (Math.random() - 0.5) * 0.1,
        lastUpdated: new Date()
      },
      'stKAIA': {
        symbol: 'stKAIA',
        price: 0.1289 + (Math.random() - 0.5) * 0.015,
        change24h: 3.54 + (Math.random() - 0.5) * 3,
        lastUpdated: new Date()
      },
      'MARBLEX': {
        symbol: 'MARBLEX',
        price: 0.0245 + (Math.random() - 0.5) * 0.005,
        change24h: -1.23 + (Math.random() - 0.5) * 4,
        lastUpdated: new Date()
      },
      'BORA': {
        symbol: 'BORA',
        price: 0.1156 + (Math.random() - 0.5) * 0.02,
        change24h: 5.67 + (Math.random() - 0.5) * 3,
        lastUpdated: new Date()
      }
    };

    return Object.fromEntries(
      symbols.map(symbol => [symbol, mockData[symbol] || {
        symbol,
        price: Math.random() * 10,
        change24h: (Math.random() - 0.5) * 20,
        lastUpdated: new Date()
      }])
    );
  };

  // Future: Implement real API calls
  const fetchRealPrices = async (): Promise<Record<string, TokenPrice>> => {
    // This would be replaced with actual API calls to CoinGecko, CoinMarketCap, etc.
    // For now, return mock data
    return getMockPrices();
  };

  const updatePrices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newPrices = enableRealTimeUpdates 
        ? await fetchRealPrices()
        : getMockPrices();
      
      setPrices(newPrices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    updatePrices();

    // Set up interval for updates
    const interval = setInterval(updatePrices, updateInterval);

    return () => clearInterval(interval);
  }, [symbols.join(','), updateInterval, enableRealTimeUpdates]);

  const getFormattedPrice = (symbol: string): string => {
    const price = prices[symbol];
    if (!price) return '$0.00';
    
    return `$${price.price.toFixed(4)}`;
  };

  const getFormattedChange = (symbol: string): { text: string; isPositive: boolean } => {
    const price = prices[symbol];
    if (!price) return { text: '0.00%', isPositive: true };
    
    const isPositive = price.change24h >= 0;
    return {
      text: `${isPositive ? '+' : ''}${price.change24h.toFixed(2)}%`,
      isPositive
    };
  };

  return {
    prices,
    isLoading,
    error,
    getFormattedPrice,
    getFormattedChange,
    refetch: updatePrices
  };
};

export type { TokenPrice, UsePriceUpdatesOptions };
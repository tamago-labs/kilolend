import { useState, useEffect } from 'react';

interface TokenPriceData {
  symbol: string;
  price: number;
  percent_change_24h: number;
  market_cap: number;
  volume_24h: number;
  last_updated: string;
  timestamp: string;
}

interface ApiResponse {
  success: boolean;
  data: TokenPriceData[];
  count: number;
}

interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: Date;
}

interface UsePriceUpdatesOptions {
  symbols: string[];
  enableRealTimeUpdates?: boolean;
}

const API_ENDPOINT = 'https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod/prices';

export const usePriceUpdates = ({ 
  symbols
}: UsePriceUpdatesOptions) => {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock price data for fallback
  const getMockPrices = (): Record<string, TokenPrice> => {
    const mockData: Record<string, TokenPrice> = {
      'KAIA': {
        symbol: 'KAIA',
        price: 0.0494479673135033,
        change24h: -10.7519334,
        lastUpdated: new Date()
      },
      'USDT': {
        symbol: 'USDT',
        price: 1.0001,
        change24h: 0.01,
        lastUpdated: new Date()
      },
      'MARBLEX': {
        symbol: 'MARBLEX',
        price: 0.15985057816369172,
        change24h: -0.34935448,
        lastUpdated: new Date()
      },
      'BORA': {
        symbol: 'BORA',
        price: 0.08699730881786927,
        change24h: 0.30747119,
        lastUpdated: new Date()
      },
      'SIX': {
        symbol: 'SIX',
        price: 0.021396823206553284,
        change24h: -0.00221476,
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

  // Fetch prices from backend API
  const fetchRealPrices = async (): Promise<Record<string, TokenPrice>> => {
    try {
      const response = await fetch(API_ENDPOINT);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiData: ApiResponse = await response.json();
      
      if (!apiData.success || !apiData.data) {
        throw new Error('Invalid API response format');
      }

      // Convert API data to our format
      const priceMap: Record<string, TokenPrice> = {};
      
      // Add USDT as stable coin (not in API)
      priceMap['USDT'] = {
        symbol: 'USDT',
        price: 1.0001,
        change24h: 0.01,
        lastUpdated: new Date()
      };

      // Process API data
      apiData.data.forEach((tokenData: TokenPriceData) => {
        if (symbols.includes(tokenData.symbol)) {
          priceMap[tokenData.symbol] = {
            symbol: tokenData.symbol,
            price: tokenData.price,
            change24h: tokenData.percent_change_24h,
            lastUpdated: new Date(tokenData.last_updated)
          };
        }
      });

      // Fill in any missing symbols with mock data
      symbols.forEach(symbol => {
        if (!priceMap[symbol]) {
          const mockData = getMockPrices();
          priceMap[symbol] = mockData[symbol];
        }
      });

      return priceMap;
    } catch (err) {
      console.error('Error fetching prices from API:', err);
      throw err;
    }
  };

  const updatePrices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newPrices = await fetchRealPrices()
      
      setPrices(newPrices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      // Fallback to mock data on error
      setPrices(getMockPrices());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updatePrices();
  }, [symbols.join(',')]);

  const getFormattedPrice = (symbol: string): string => {
    const price = prices[symbol];
    if (!price) return '$0.00';
    
    // Format based on price range for better readability
    if (price.price >= 1) {
      return `$${price.price.toFixed(4)}`;
    } else if (price.price >= 0.1) {
      return `$${price.price.toFixed(4)}`;
    } else {
      return `$${price.price.toFixed(6)}`;
    }
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

  const getLastUpdated = (symbol: string): Date | null => {
    const price = prices[symbol];
    return price ? price.lastUpdated : null;
  };

  return {
    prices,
    isLoading,
    error,
    getFormattedPrice,
    getFormattedChange,
    getLastUpdated,
    refetch: updatePrices
  };
};

export type { TokenPrice, UsePriceUpdatesOptions, TokenPriceData, ApiResponse };
import { useState, useEffect } from 'react';
import { PRICE_API_CONFIG } from '@/utils/tokenConfig';

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
  market_cap: number;
  volume_24h: number;
  lastUpdated: Date;
}

interface UsePriceUpdatesOptions {
  symbols: string[];
  updateInterval?: number; // in milliseconds
  enableRealTimeUpdates?: boolean;
}

const API_ENDPOINT = PRICE_API_CONFIG.endpoint;

export const usePriceUpdates = ({ 
  symbols
}: UsePriceUpdatesOptions) => {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Process API data and map symbols
      apiData.data.forEach((tokenData: TokenPriceData) => {
        let mappedSymbol = tokenData.symbol;
        
        // Handle symbol mapping (e.g., MARBLEX -> MBX)
        if (PRICE_API_CONFIG.symbolMapping[tokenData.symbol as keyof typeof PRICE_API_CONFIG.symbolMapping]) {
          mappedSymbol = PRICE_API_CONFIG.symbolMapping[tokenData.symbol as keyof typeof PRICE_API_CONFIG.symbolMapping];
        }
        
        if (symbols.includes(mappedSymbol)) {
          priceMap[mappedSymbol] = {
            symbol: mappedSymbol,
            price: tokenData.price,
            change24h: tokenData.percent_change_24h,
            market_cap: tokenData.market_cap,
            volume_24h: tokenData.volume_24h,
            lastUpdated: new Date(tokenData.last_updated)
          };
        }
      });

      // Add USDT as stable coin if not in API (always $1.00)
      if (symbols.includes('USDT') && !priceMap['USDT']) {
        priceMap['USDT'] = {
          symbol: 'USDT',
          price: 1.0001,
          change24h: 0.01,
          market_cap: 0,
          volume_24h: 0,
          lastUpdated: new Date()
        };
      }
 
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

  const getMarketData = (symbol: string) => {
    const price = prices[symbol];
    if (!price) return null;
    
    return {
      marketCap: price.market_cap,
      volume24h: price.volume_24h,
      lastUpdated: price.lastUpdated
    };
  };

  const refetch = async () => {
    await updatePrices();
  };

  return {
    prices,
    isLoading,
    error,
    getFormattedPrice,
    getFormattedChange,
    getLastUpdated,
    getMarketData,
    refetch
  };
};

export type { TokenPrice, UsePriceUpdatesOptions, TokenPriceData, ApiResponse };
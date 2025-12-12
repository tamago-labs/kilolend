"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';
import { PRICE_API_CONFIG } from '@/utils/tokenConfig';

// Types
export interface MarketData {
  supplyAPY: number;
  borrowAPY: number;
  totalSupply: string;
  totalBorrow: string;
  supplyBalance: string;
  borrowBalance: string;
  collateralFactor: number;
  price: number;
}

export interface PriceData {
  price: number;
  market_cap: number;
  volume_24h: number;
  change24h: number;
  lastUpdated: Date;
}

export interface MarketState {
  markets: Record<string, MarketData>;
  prices: Record<string, PriceData>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

// Action types
type MarketAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MARKETS'; payload: Record<string, MarketData> }
  | { type: 'SET_PRICES'; payload: Record<string, PriceData> }
  | { type: 'UPDATE_MARKET'; payload: { symbol: string; data: MarketData } }
  | { type: 'UPDATE_PRICE'; payload: { symbol: string; data: PriceData } }
  | { type: 'REFRESH_DATA' };

// Initial state
const initialState: MarketState = {
  markets: {},
  prices: {},
  isLoading: false,
  error: null,
  lastUpdated: Date.now(),
};

// Reducer
function marketReducer(state: MarketState, action: MarketAction): MarketState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case 'SET_MARKETS':
      return {
        ...state,
        markets: action.payload,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      };
    
    case 'SET_PRICES':
      return {
        ...state,
        prices: action.payload,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      };
    
    case 'UPDATE_MARKET':
      return {
        ...state,
        markets: {
          ...state.markets,
          [action.payload.symbol]: action.payload.data,
        },
        lastUpdated: Date.now(),
      };
    
    case 'UPDATE_PRICE':
      return {
        ...state,
        prices: {
          ...state.prices,
          [action.payload.symbol]: action.payload.data,
        },
        lastUpdated: Date.now(),
      };
    
    case 'REFRESH_DATA':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    default:
      return state;
  }
}

// Context
const MarketContext = createContext<{
  state: MarketState;
  actions: {
    refreshMarkets: () => Promise<void>;
    refreshPrices: () => Promise<void>;
    refreshAll: () => Promise<void>;
    getFormattedPrice: (symbol: string) => string;
    getFormattedChange: (symbol: string) => { text: string; isPositive: boolean };
    getTopMarketsByAPY: (limit?: number) => Array<{ symbol: string; data: MarketData }>;
    getTopTokensByMarketCap: (limit?: number) => Array<{ symbol: string; data: PriceData }>;
    getDisplaySymbol: (apiSymbol: string) => string;
    getApiSymbol: (displaySymbol: string) => string;
  };
} | null>(null);

// Provider component
export function MarketProvider({ children }: { children: ReactNode }) {
  
  const [state, dispatch] = useReducer(marketReducer, initialState);
  
  // Hooks for data fetching
  const { markets: storeMarkets, isLoading: marketsLoading, refreshAllData } = useContractMarketStore();
  const { prices: hookPrices, isLoading: pricesLoading, error: pricesError, refetch: refetchPrices } = usePriceUpdates({
    symbols: [...PRICE_API_CONFIG.supportedTokens]
  });

  // Transform store markets array to record format for context
  const transformMarketsToRecord = (markets: any[]): Record<string, MarketData> => {
    const record: Record<string, MarketData> = {};
    markets.forEach(market => {
      // Handle symbol mapping for consistency
      let symbol = market.symbol.toUpperCase();
      if (symbol === 'STKAIA') {
        symbol = 'STAKED_KAIA'; // Map store symbol to API symbol
      }
      
      record[symbol] = {
        supplyAPY: market.supplyAPY || 0,
        borrowAPY: market.borrowAPR || 0,
        totalSupply: market.totalSupply?.toString() || '0',
        totalBorrow: market.totalBorrow?.toString() || '0',
        supplyBalance: '0', // Not available in store
        borrowBalance: '0', // Not available in store
        collateralFactor: 0, // Not available in store
        price: market.price || 0,
      };
    });
    return record;
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Transform store markets to context format
        const marketsRecord = transformMarketsToRecord(storeMarkets);
        dispatch({ type: 'SET_MARKETS', payload: marketsRecord });
        
        // Fetch prices
        await refetchPrices();
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize market data' });
      }
    };

    initializeData();
  }, []);

  // Update state when store markets change
  useEffect(() => {
    if (storeMarkets && storeMarkets.length > 0) {
      const marketsRecord = transformMarketsToRecord(storeMarkets);
      dispatch({ type: 'SET_MARKETS', payload: marketsRecord });
    }
  }, [storeMarkets]);

  useEffect(() => {
    if (hookPrices && Object.keys(hookPrices).length > 0) {
      dispatch({ type: 'SET_PRICES', payload: hookPrices });
    }
  }, [hookPrices]);

  // Handle loading states
  useEffect(() => {
    if (marketsLoading || pricesLoading) {
      dispatch({ type: 'SET_LOADING', payload: true });
    }
  }, [marketsLoading, pricesLoading]);

  // Handle errors
  useEffect(() => {
    if (pricesError) {
      dispatch({ type: 'SET_ERROR', payload: pricesError || 'Unknown error' });
    }
  }, [pricesError]);

  // Actions
  const actions = {
    refreshMarkets: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        refreshAllData();
        // Transform updated markets to context format
        const marketsRecord = transformMarketsToRecord(storeMarkets);
        dispatch({ type: 'SET_MARKETS', payload: marketsRecord });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh markets' });
      }
    },

    refreshPrices: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await refetchPrices();
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh prices' });
      }
    },

    refreshAll: async () => {
      dispatch({ type: 'REFRESH_DATA' });
      try {
        refreshAllData();
        await refetchPrices();
        
        // Transform updated markets to context format
        const marketsRecord = transformMarketsToRecord(storeMarkets);
        dispatch({ type: 'SET_MARKETS', payload: marketsRecord });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh data' });
      }
    },

    getFormattedPrice: (symbol: string): string => {
      const price = state.prices[symbol]?.price || 0;
      if (price >= 1000) {
        return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (price >= 1) {
        return `$${price.toFixed(2)}`;
      } else {
        return `$${price.toFixed(4)}`;
      }
    },

    getFormattedChange: (symbol: string): { text: string; isPositive: boolean } => {
      const change = state.prices[symbol]?.change24h || 0;
      const isPositive = change >= 0;
      const text = `${Math.abs(change).toFixed(2)}%`;
      return { text, isPositive };
    },

    getTopMarketsByAPY: (limit = 6) => {
      return Object.entries(state.markets)
        .filter(([_, data]) => data && data.supplyAPY > 0)
        .sort(([_, a], [__, b]) => b.supplyAPY - a.supplyAPY)
        .slice(0, limit)
        .map(([symbol, data]) => ({ symbol, data }));
    },

    getTopTokensByMarketCap: (limit = 6) => {
      return Object.entries(state.prices)
        .sort(([_, a], [__, b]) => {
          if (a.market_cap > 0 && b.market_cap > 0) {
            return b.market_cap - a.market_cap;
          }
          if (a.market_cap > 0) return -1;
          if (b.market_cap > 0) return 1;
          return b.price - a.price;
        })
        .slice(0, limit)
        .map(([symbol, data]) => ({ symbol, data }));
    },

    // Helper function to get display symbol (API symbol -> display symbol)
    getDisplaySymbol: (apiSymbol: string): string => {
      const symbolMapping: Record<string, string> = {
        'STAKED_KAIA': 'stKAIA',
        'MARBLEX': 'MBX',
      };
      return symbolMapping[apiSymbol] || apiSymbol;
    },

    // Helper function to get API symbol (display symbol -> API symbol)
    getApiSymbol: (displaySymbol: string): string => {
      const reverseMapping: Record<string, string> = {
        'stKAIA': 'STAKED_KAIA',
        'MBX': 'MARBLEX',
      };
      return reverseMapping[displaySymbol] || displaySymbol;
    },
  };

  return (
    <MarketContext.Provider value={{ state, actions }}>
      {children}
    </MarketContext.Provider>
  );
}

// Hook to use the context
export function useMarketContext() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarketContext must be used within a MarketProvider');
  }
  return context;
}
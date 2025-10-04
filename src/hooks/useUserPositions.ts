import { useState, useEffect, useCallback, useRef } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useMarketContract } from '@/hooks/useMarketContract';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';

export interface UserPositionBalance {
  marketId: MarketId;
  symbol: string;
  supplyBalance: string;
  borrowBalance: string;
  formattedSupplyBalance: string;
  formattedBorrowBalance: string;
  cTokenBalance: string;
  isLoading: boolean;
  error: string | null;
}

export interface UserPositionsData {
  positions: any;
  totalSupplyUSD: number;
  totalBorrowUSD: number;
  isLoading: boolean;
  hasPositions: boolean;
  lastUpdate: Date | null;
}

export const useUserPositions = () => {
  const { account } = useWalletAccountStore();
  const { getUserPosition } = useMarketContract();
  const { markets } = useContractMarketStore();
  
  const [positions, setPositions] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Use refs to avoid stale closures
  const accountRef = useRef(account);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when dependencies change
  useEffect(() => {
    accountRef.current = account;
  }, [account]);

  /**
   * Fetch user position for a specific market
   */
  const fetchUserPosition = useCallback(async (marketId: MarketId): Promise<UserPositionBalance> => {
    const currentAccount = accountRef.current;
    
    if (!currentAccount) {
      return {
        marketId,
        symbol: MARKET_CONFIG[marketId].symbol,
        supplyBalance: '0',
        borrowBalance: '0',
        formattedSupplyBalance: '0.00',
        formattedBorrowBalance: '0.00',
        cTokenBalance: '0',
        isLoading: false,
        error: 'No wallet connected'
      };
    }

    try {
      const position = await getUserPosition(marketId, currentAccount);
      
      if (!position) {
        return {
          marketId,
          symbol: MARKET_CONFIG[marketId].symbol,
          supplyBalance: '0',
          borrowBalance: '0',
          formattedSupplyBalance: '0.00',
          formattedBorrowBalance: '0.00',
          cTokenBalance: '0',
          isLoading: false,
          error: 'Failed to fetch position'
        };
      }

      const decimals = MARKET_CONFIG[marketId].decimals;
      const formatDecimals = decimals === 6 ? 2 : 4;

      return {
        marketId,
        symbol: MARKET_CONFIG[marketId].symbol,
        supplyBalance: position.supplyBalance,
        borrowBalance: position.borrowBalance,
        formattedSupplyBalance: parseFloat(position.supplyBalance).toFixed(formatDecimals),
        formattedBorrowBalance: parseFloat(position.borrowBalance).toFixed(formatDecimals),
        cTokenBalance: position.cTokenBalance,
        isLoading: false,
        error: null
      };
    } catch (error) {
      console.error(`Error fetching user position for ${marketId}:`, error);
      return {
        marketId,
        symbol: MARKET_CONFIG[marketId].symbol,
        supplyBalance: '0',
        borrowBalance: '0',
        formattedSupplyBalance: '0.00',
        formattedBorrowBalance: '0.00',
        cTokenBalance: '0',
        isLoading: false,
        error: 'Failed to fetch position'
      };
    }
  }, [getUserPosition]);

  /**
   * Fetch all user positions
   */
  const fetchAllPositions = useCallback(async (showLoading = true) => {
    const currentAccount = accountRef.current;
    
    if (!currentAccount) {
      setPositions({});
      setLastUpdate(null);
      return;
    }

    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const marketIds = Object.keys(MARKET_CONFIG) as MarketId[];
      const positionPromises = marketIds.map(marketId => fetchUserPosition(marketId));
      const results = await Promise.allSettled(positionPromises);

      const newPositions: any = {};
      
      results.forEach((result, index) => {
        const marketId = marketIds[index];
        if (result.status === 'fulfilled') {
          newPositions[marketId] = result.value;
        } else {
          newPositions[marketId] = {
            marketId,
            symbol: MARKET_CONFIG[marketId].symbol,
            supplyBalance: '0',
            borrowBalance: '0',
            formattedSupplyBalance: '0.00',
            formattedBorrowBalance: '0.00',
            cTokenBalance: '0',
            isLoading: false,
            error: 'Failed to fetch position'
          };
        }
      });

      setPositions(newPositions);
      setLastUpdate(new Date());
      
      console.log('User positions updated:', newPositions);
    } catch (error) {
      console.error('Error fetching user positions:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [fetchUserPosition]);

  /**
   * Setup interval for auto-refresh
   */
  const setupInterval = useCallback(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only setup interval if we have an account
    if (accountRef.current) {
      intervalRef.current = setInterval(() => {
        fetchAllPositions(false); // Don't show loading for background updates
      }, 30000); // Increased to 30 seconds to reduce API calls
    }
  }, [fetchAllPositions]);

  /**
   * Clear interval
   */
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Manual refresh function
   */
  const refreshPositions = useCallback(() => {
    console.log('Manual refresh positions triggered');
    fetchAllPositions(true);
  }, [fetchAllPositions]);

  /**
   * Get position by market ID
   */
  const getPositionByMarketId = useCallback((marketId: MarketId): UserPositionBalance | undefined => {
    return positions[marketId];
  }, [positions]);

  /**
   * Get position by symbol
   */
  const getPositionBySymbol = useCallback((symbol: string): any => {
    return Object.values(positions).find((position: any) => position.symbol === symbol);
  }, [positions]);

  /**
   * Get formatted balance for display (includes both supply and borrow)
   */
  const getFormattedBalances = useCallback(() => {
    const balances: any = {};
    
    Object.values(positions).forEach((position: any) => {
      balances[position.symbol] = {
        supply: position.formattedSupplyBalance,
        borrow: position.formattedBorrowBalance
      };
    });
    
    return balances;
  }, [positions]);

  /**
   * Calculate total USD values
   */
  const calculateTotals = useCallback((): { totalSupplyUSD: number; totalBorrowUSD: number } => {
    let totalSupplyUSD = 0;
    let totalBorrowUSD = 0;

    Object.values(positions).forEach((position: any) => {
      const market = markets.find(m => m.id === position.marketId);
      if (market) {
        const supplyUSD = parseFloat(position.supplyBalance) * market.price;
        const borrowUSD = parseFloat(position.borrowBalance) * market.price;
        totalSupplyUSD += supplyUSD;
        totalBorrowUSD += borrowUSD;
      }
    });

    return { totalSupplyUSD, totalBorrowUSD };
  }, [positions, markets]);

  /**
   * Check if user has any positions
   */
  const hasPositions = useCallback((): boolean => {
    return Object.values(positions).some((position: any) => 
      parseFloat(position.supplyBalance) > 0 || parseFloat(position.borrowBalance) > 0
    );
  }, [positions]);

  /**
   * Handle account changes
   */
  useEffect(() => {
    console.log('Account changed in useUserPositions:', account);
    
    if (account) {
      // Fetch initial data
      fetchAllPositions(true);
      // Setup interval
      setupInterval();
    } else {
      // Clear data and interval
      setPositions({});
      setLastUpdate(null);
      clearCurrentInterval();
    }
  }, [account]); // Only depend on account

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearCurrentInterval();
    };
  }, []);

  const totals = calculateTotals();

  return {
    positions,
    isLoading,
    lastUpdate,
    refreshPositions,
    getPositionByMarketId,
    getPositionBySymbol,
    getFormattedBalances,
    totalSupplyUSD: totals.totalSupplyUSD,
    totalBorrowUSD: totals.totalBorrowUSD,
    hasPositions: hasPositions(),
    hasAccount: !!account
  };
};
import { useState, useEffect, useCallback, useRef } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';
import { ERC20_ABI } from '@/utils/contractABIs';
import { getProvider } from '@/utils/contractUtils';
import { ethers } from 'ethers';

export interface MarketTokenBalance {
  marketId: MarketId;
  symbol: string;
  balance: string;
  formattedBalance: string;
  decimals: number;
  isLoading: boolean;
  error: string | null;
}

export const useMarketTokenBalances = () => {
  const { account } = useWalletAccountStore();
  
  const [balances, setBalances] = useState<Record<string, MarketTokenBalance>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Use refs to avoid stale closures in intervals
  const accountRef = useRef(account);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update account ref when account changes
  useEffect(() => {
    accountRef.current = account;
  }, [account]);

  /**
   * Fetch balance for a specific market token
   */
  const fetchTokenBalance = useCallback(async (marketId: MarketId): Promise<MarketTokenBalance> => {
    const currentAccount = accountRef.current;
    
    if (!currentAccount) {
      return {
        marketId,
        symbol: MARKET_CONFIG[marketId].symbol,
        balance: '0',
        formattedBalance: '0.00',
        decimals: MARKET_CONFIG[marketId].decimals,
        isLoading: false,
        error: 'No wallet connected'
      };
    }

    const marketConfig = MARKET_CONFIG[marketId];
    const provider = getProvider();
    
    try {
      // For native KAIA
      if (marketConfig.tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        const balance = await provider.getBalance(currentAccount);
        const formattedBalance = ethers.formatEther(balance);
        
        return {
          marketId,
          symbol: marketConfig.symbol,
          balance: formattedBalance,
          formattedBalance: parseFloat(formattedBalance).toFixed(4),
          decimals: marketConfig.decimals,
          isLoading: false,
          error: null
        };
      }
      
      // For ERC20 tokens
      const contract = new ethers.Contract(
        marketConfig.tokenAddress,
        ERC20_ABI,
        provider
      );
      
      const balance = await contract.balanceOf(currentAccount);
      const formattedBalance = ethers.formatUnits(balance, marketConfig.decimals);
      
      return {
        marketId,
        symbol: marketConfig.symbol,
        balance: formattedBalance,
        formattedBalance: parseFloat(formattedBalance).toFixed(marketConfig.decimals === 6 ? 2 : 4),
        decimals: marketConfig.decimals,
        isLoading: false,
        error: null
      };
    } catch (error) {
      console.error(`Error fetching balance for ${marketId}:`, error);
      return {
        marketId,
        symbol: marketConfig.symbol,
        balance: '0',
        formattedBalance: '0.00',
        decimals: marketConfig.decimals,
        isLoading: false,
        error: 'Failed to fetch balance'
      };
    }
  }, []);

  /**
   * Fetch all market token balances
   */
  const fetchAllBalances = useCallback(async (showLoading = true) => {
    const currentAccount = accountRef.current;
    
    if (!currentAccount) {
      setBalances({});
      setLastUpdate(null);
      return;
    }

    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const marketIds = Object.keys(MARKET_CONFIG) as MarketId[];
      const balancePromises = marketIds.map(marketId => fetchTokenBalance(marketId));
      const results = await Promise.allSettled(balancePromises);

      const newBalances: Record<string, MarketTokenBalance> = {};
      
      results.forEach((result, index) => {
        const marketId = marketIds[index];
        if (result.status === 'fulfilled') {
          newBalances[marketId] = result.value;
        } else {
          newBalances[marketId] = {
            marketId,
            symbol: MARKET_CONFIG[marketId].symbol,
            balance: '0',
            formattedBalance: '0.00',
            decimals: MARKET_CONFIG[marketId].decimals,
            isLoading: false,
            error: 'Failed to fetch balance'
          };
        }
      });

      setBalances(newBalances);
      setLastUpdate(new Date());
      
      console.log('Token balances updated:', newBalances);
    } catch (error) {
      console.error('Error fetching market token balances:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [fetchTokenBalance]);

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
        fetchAllBalances(false); // Don't show loading for background updates
      }, 30000); // Increased to 30 seconds to reduce API calls
    }
  }, [fetchAllBalances]);

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
  const refreshBalances = useCallback(() => {
    console.log('Manual refresh triggered');
    fetchAllBalances(true);
  }, [fetchAllBalances]);

  /**
   * Get balance by market ID
   */
  const getBalanceByMarketId = useCallback((marketId: MarketId): MarketTokenBalance | undefined => {
    return balances[marketId];
  }, [balances]);

  /**
   * Get balance by symbol
   */
  const getBalanceBySymbol = useCallback((symbol: string): MarketTokenBalance | undefined => {
    return Object.values(balances).find(balance => balance.symbol === symbol);
  }, [balances]);

  /**
   * Handle account changes
   */
  useEffect(() => {
    console.log('Account changed in useMarketTokenBalances:', account);
    
    if (account) {
      // Fetch initial data
      fetchAllBalances(true);
      // Setup interval
      setupInterval();
    } else {
      // Clear data and interval
      setBalances({});
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

  return {
    balances,
    isLoading,
    lastUpdate,
    refreshBalances,
    getBalanceByMarketId,
    getBalanceBySymbol,
    hasAccount: !!account
  };
};

export default useMarketTokenBalances;
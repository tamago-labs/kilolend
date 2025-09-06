import { useState, useEffect, useCallback } from 'react';
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

  /**
   * Fetch balance for a specific market token
   */
  const fetchTokenBalance = useCallback(async (marketId: MarketId) => {
    if (!account) {
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
        const balance = await provider.getBalance(account);
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
      
      const balance = await contract.balanceOf(account);
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
  }, [account]);

  /**
   * Fetch all market token balances
   */
  const fetchAllBalances = useCallback(async () => {
    if (!account) {
      setBalances({});
      return;
    }

    setIsLoading(true);

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
    } catch (error) {
      console.error('Error fetching market token balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account, fetchTokenBalance]);

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
   * Refresh all balances
   */
  const refreshBalances = useCallback(() => {
    fetchAllBalances();
  }, [fetchAllBalances]);

  /**
   * Auto-fetch balances when account changes
   */
  useEffect(() => {
    if (account) {
      fetchAllBalances();
    } else {
      setBalances({});
      setLastUpdate(null);
    }
  }, [account, fetchAllBalances]);

  /**
   * Auto-refresh balances every 15 seconds
   */
  useEffect(() => {
    if (!account) return;

    const interval = setInterval(() => {
      fetchAllBalances();
    }, 15000);

    return () => clearInterval(interval);
  }, [account, fetchAllBalances]);

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

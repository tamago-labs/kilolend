import { useState, useEffect, useCallback } from 'react';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { KAIA_MAINNET_TOKENS, TokenSymbol } from '@/utils/tokenConfig';
import { formatTokenBalance, keiHexToKaiaDecimal, formatBalanceDisplay } from '@/utils/format';

export interface AITokenBalance {
  symbol: TokenSymbol | 'KAIA';
  name: string;
  balance: string;
  formattedBalance: string;
  address?: string;
  decimals: number;
  icon: string;
  iconType: 'image' | 'flag' | 'emoji';
  isLoading: boolean;
  error: string | null;
}

export const useAITokenBalances = (aiWalletAddress: string | null) => {
  const { getBalance, getErc20TokenBalance } = useKaiaWalletSdk();

  const [balances, setBalances] = useState<AITokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  /**
   * Fetch balance of an ERC20 token for AI wallet
   */
  const fetchTokenBalance = useCallback(
    async (
      tokenSymbol: TokenSymbol,
      tokenConfig: typeof KAIA_MAINNET_TOKENS[TokenSymbol]
    ): Promise<AITokenBalance> => {
      if (!aiWalletAddress) {
        return {
          symbol: tokenSymbol,
          name: tokenConfig.name,
          balance: '0',
          formattedBalance: '0',
          address: tokenConfig.address,
          decimals: tokenConfig.decimals,
          icon: tokenConfig.icon,
          iconType: tokenConfig.iconType,
          isLoading: false,
          error: 'No AI wallet address provided',
        };
      }

      try {
        const hexBalance = await getErc20TokenBalance(tokenConfig.address, aiWalletAddress);
        const balance = formatTokenBalance(hexBalance as string, tokenConfig.decimals);
        const formattedBalance = formatBalanceDisplay(balance, tokenConfig.decimals);

        return {
          symbol: tokenSymbol,
          name: tokenConfig.name,
          balance,
          formattedBalance,
          address: tokenConfig.address,
          decimals: tokenConfig.decimals,
          icon: tokenConfig.icon,
          iconType: tokenConfig.iconType,
          isLoading: false,
          error: null,
        };
      } catch (error) {
        console.error(`Error fetching ${tokenSymbol} balance for AI wallet:`, error);
        return {
          symbol: tokenSymbol,
          name: tokenConfig.name,
          balance: '0',
          formattedBalance: '0',
          address: tokenConfig.address,
          decimals: tokenConfig.decimals,
          icon: tokenConfig.icon,
          iconType: tokenConfig.iconType,
          isLoading: false,
          error: 'Failed to fetch balance',
        };
      }
    },
    [aiWalletAddress, getErc20TokenBalance]
  );

  /**
   * Fetch KAIA native balance for AI wallet
   */
  const fetchKAIABalance = useCallback(async (): Promise<AITokenBalance> => {
    if (!aiWalletAddress) {
      return {
        symbol: 'KAIA' as const,
        name: 'KAIA',
        balance: '0',
        formattedBalance: '0',
        decimals: 18,
        icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
        iconType: 'image' as const,
        isLoading: false,
        error: 'No AI wallet address provided',
      };
    }

    try {
      const hexBalance = await getBalance([aiWalletAddress, 'latest']);
      const balance = keiHexToKaiaDecimal(hexBalance as string);
      const formattedBalance = parseFloat(balance).toFixed(4);

      return {
        symbol: 'KAIA' as const,
        name: 'KAIA',
        balance,
        formattedBalance,
        decimals: 18,
        icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
        iconType: 'image' as const,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      console.error('Error fetching KAIA balance for AI wallet:', error);
      return {
        symbol: 'KAIA' as const,
        name: 'KAIA',
        balance: '0',
        formattedBalance: '0',
        decimals: 18,
        icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
        iconType: 'image' as const,
        isLoading: false,
        error: 'Failed to fetch balance',
      };
    }
  }, [aiWalletAddress, getBalance]);

  /**
   * Fetch all balances (KAIA + ERC20 tokens) for AI wallet
   */
  const fetchAllBalances = useCallback(async () => {
    if (!aiWalletAddress) {
      setBalances([]);
      return;
    }

    setIsLoading(true);

    try {
      const promises: Promise<AITokenBalance>[] = [];

      // Fetch KAIA native balance
      promises.push(fetchKAIABalance());

      // Fetch all ERC20 token balances
      Object.entries(KAIA_MAINNET_TOKENS).forEach(([symbol, config]) => {
        promises.push(fetchTokenBalance(symbol as TokenSymbol, config));
      });

      const results = await Promise.all(promises);

      setBalances(results);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching AI wallet balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [aiWalletAddress, fetchTokenBalance, fetchKAIABalance]);

  /**
   * Public API: Refresh all balances manually
   */
  const refreshBalances = useCallback(() => {
    fetchAllBalances();
  }, [fetchAllBalances]);

  /**
   * Public API: Get balance by token symbol
   */
  const getBalanceBySymbol = useCallback(
    (symbol: TokenSymbol | 'KAIA'): AITokenBalance | undefined => {
      return balances.find((b) => b.symbol === symbol);
    },
    [balances]
  );

  /**
   * Auto-fetch balances when AI wallet address changes
   */
  useEffect(() => {
    if (aiWalletAddress) {
      fetchAllBalances();
    } else {
      setBalances([]);
      setLastUpdate(null);
    }
  }, [aiWalletAddress]);

  /**
   * Auto-refresh balances every 30 seconds
   */
  useEffect(() => {
    if (!aiWalletAddress) return;

    const interval = setInterval(() => {
      fetchAllBalances();
    }, 30000);

    return () => clearInterval(interval);
  }, [aiWalletAddress]);

  return {
    balances,
    isLoading,
    lastUpdate,
    refreshBalances,
    getBalanceBySymbol,
    hasAIWallet: !!aiWalletAddress,
  };
};

export default useAITokenBalances;

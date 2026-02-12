import { useBalance, useConnection, useChainId } from 'wagmi';
import { useMemo, useCallback } from 'react';
import { kubChain, kaia, etherlink } from '@/wagmi_config';
import { KUB_TOKENS, KAIA_TOKENS, ETHERLINK_TOKENS, KUBTokenKey, KAIATokenKey, EtherlinkTokenKey, TokenConfig } from '@/config/tokens';

export interface Web3TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  address?: string;
  isNative: boolean;
  usdValue?: number;
  isLoading: boolean;
  error?: string;
}

export const useWeb3TokenBalances = () => {
  const { address } = useConnection();
  const chainId = useChainId();

  // Determine which chain we're on and get appropriate tokens
  const isKUBChain = chainId === kubChain.id;
  const isKAIAChain = chainId === kaia.id;
  const isEtherlinkChain = chainId === etherlink.id;
  const isSupportedChain = isKUBChain || isKAIAChain || isEtherlinkChain;

  // Create balance queries for ALL possible tokens to maintain consistent hook order
  const kubBalanceQueries = Object.values(KUB_TOKENS).map((tokenConfig) =>
    useBalance({
      address: address,
      token: tokenConfig.isNative ? undefined : ('address' in tokenConfig ? tokenConfig.address as `0x${string}` : undefined),
      chainId: isKUBChain ? kubChain.id : undefined,
      query: {
        enabled: !!address && isKUBChain,
        refetchOnWindowFocus: false,
        staleTime: 30000, // 30 seconds
      },
    })
  );

  const kaiaBalanceQueries = Object.values(KAIA_TOKENS).map((tokenConfig) =>
    useBalance({
      address: address,
      token: tokenConfig.isNative ? undefined : ('address' in tokenConfig ? tokenConfig.address as `0x${string}` : undefined),
      chainId: isKAIAChain ? kaia.id : undefined,
      query: {
        enabled: !!address && isKAIAChain,
        refetchOnWindowFocus: false,
        staleTime: 30000, // 30 seconds
      },
    })
  );

  const etherlinkBalanceQueries = Object.values(ETHERLINK_TOKENS).map((tokenConfig) =>
    useBalance({
      address: address,
      token: tokenConfig.isNative ? undefined : ('address' in tokenConfig ? tokenConfig.address as `0x${string}` : undefined),
      chainId: isEtherlinkChain ? etherlink.id : undefined,
      query: {
        enabled: !!address && isEtherlinkChain,
        refetchOnWindowFocus: false,
        staleTime: 30000, // 30 seconds
      },
    })
  );

  // Combine all balance data based on current chain
  const balances = useMemo(() => {
    if (!address || !isSupportedChain) {
      // Return empty array when not on supported chain
      return [];
    }

    if (isKUBChain) {
      return Object.values(KUB_TOKENS).map((tokenConfig, index) => {
        const query = kubBalanceQueries[index];
        const balance = query.data?.value?.toString() || '0';

        return {
          symbol: tokenConfig.symbol,
          name: tokenConfig.name,
          balance,
          decimals: tokenConfig.decimals,
          address: ('address' in tokenConfig) ? tokenConfig.address : undefined,
          isNative: tokenConfig.isNative,
          usdValue: 0, // TODO: Add price fetching if needed
          isLoading: query.isLoading,
          error: query.error?.message,
        } as Web3TokenBalance;
      });
    } else if (isKAIAChain) {
      return Object.values(KAIA_TOKENS).map((tokenConfig, index) => {
        const query = kaiaBalanceQueries[index];
        const balance = query.data?.value?.toString() || '0';

        return {
          symbol: tokenConfig.symbol,
          name: tokenConfig.name,
          balance,
          decimals: tokenConfig.decimals,
          address: ('address' in tokenConfig) ? tokenConfig.address : undefined,
          isNative: tokenConfig.isNative,
          usdValue: 0, // TODO: Add price fetching if needed
          isLoading: query.isLoading,
          error: query.error?.message,
        } as Web3TokenBalance;
      });
    } else if (isEtherlinkChain) {
      return Object.values(ETHERLINK_TOKENS).map((tokenConfig, index) => {
        const query = etherlinkBalanceQueries[index];
        const balance = query.data?.value?.toString() || '0';

        return {
          symbol: tokenConfig.symbol,
          name: tokenConfig.name,
          balance,
          decimals: tokenConfig.decimals,
          address: ('address' in tokenConfig) ? tokenConfig.address : undefined,
          isNative: tokenConfig.isNative,
          usdValue: 0, // TODO: Add price fetching if needed
          isLoading: query.isLoading,
          error: query.error?.message,
        } as Web3TokenBalance;
      });
    }

    return [];
  }, [address, isSupportedChain, isKUBChain, isKAIAChain, isEtherlinkChain, kubBalanceQueries, kaiaBalanceQueries, etherlinkBalanceQueries]);

  // Overall loading state
  const allQueries = [...kubBalanceQueries, ...kaiaBalanceQueries, ...etherlinkBalanceQueries];
  const isLoading = allQueries.some(query => query.isLoading);
  const hasError = allQueries.some(query => query.error);

  // Refetch function for on-demand fetching
  const refetch = useCallback(() => {
    if (isSupportedChain && address) {
      let activeQueries;
      if (isKUBChain) {
        activeQueries = kubBalanceQueries;
      } else if (isKAIAChain) {
        activeQueries = kaiaBalanceQueries;
      } else if (isEtherlinkChain) {
        activeQueries = etherlinkBalanceQueries;
      } else {
        return Promise.resolve();
      }
      return Promise.all(activeQueries.map(query => query.refetch()));
    }
    return Promise.resolve();
  }, [isSupportedChain, address, isKUBChain, isKAIAChain, isEtherlinkChain, kubBalanceQueries, kaiaBalanceQueries, etherlinkBalanceQueries]);

  return {
    balances,
    isLoading,
    hasError,
    refetch,
    isSupportedChain,
    isKUBChain,
    isKAIAChain,
    isEtherlinkChain,
    chainId,
  };
};

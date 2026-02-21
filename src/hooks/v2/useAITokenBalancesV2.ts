import { useBalance, useReadContract } from 'wagmi';
import { useMemo, useCallback } from 'react';
import { kubChain, kaia, etherlink } from '@/wagmi_config';
import { KUB_TOKENS, KAIA_TOKENS, ETHERLINK_TOKENS, TokenConfig } from '@/config/tokens';

// ERC20 ABI for balanceOf function
const erc20Abi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface AITokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  address?: string;
  isNative: boolean;
  isLoading: boolean;
  error?: string;
  rawBalance?: string;
  chainId: number;
}

export const useAITokenBalancesV2 = (aiWalletAddress: string | null | undefined) => {
  // Create balance queries for ALL possible tokens across all chains
  const kubBalanceQueries = Object.values(KUB_TOKENS).map((tokenConfig) => {
    if (tokenConfig.isNative) {
      return useBalance({
        address: aiWalletAddress as `0x${string}` | undefined,
        chainId: kubChain.id,
        query: {
          enabled: !!aiWalletAddress,
          refetchOnWindowFocus: false,
          staleTime: 30000,
        },
      });
    } else {
      return useReadContract({
        address: tokenConfig.address as `0x${string}` & {},
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [aiWalletAddress as any],
        chainId: kubChain.id,
        query: {
          enabled: !!aiWalletAddress,
          refetchOnWindowFocus: false,
          staleTime: 30000,
        },
      });
    }
  });

  const kaiaBalanceQueries = Object.values(KAIA_TOKENS).map((tokenConfig) => {
    if (tokenConfig.isNative) {
      return useBalance({
        address: aiWalletAddress as `0x${string}` | undefined,
        chainId: kaia.id,
        query: {
          enabled: !!aiWalletAddress,
          refetchOnWindowFocus: false,
          staleTime: 30000,
        },
      });
    } else {
      return useReadContract({
        address: tokenConfig.address as `0x${string}` & {},
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [aiWalletAddress as any],
        chainId: kaia.id,
        query: {
          enabled: !!aiWalletAddress,
          refetchOnWindowFocus: false,
          staleTime: 30000,
        },
      });
    }
  });

  const etherlinkBalanceQueries = Object.values(ETHERLINK_TOKENS).map((tokenConfig) => {
    if (tokenConfig.isNative) {
      return useBalance({
        address: aiWalletAddress as `0x${string}` | undefined,
        chainId: etherlink.id,
        query: {
          enabled: !!aiWalletAddress,
          refetchOnWindowFocus: false,
          staleTime: 30000,
        },
      });
    } else {
      return useReadContract({
        address: tokenConfig.address as `0x${string}` & {},
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [aiWalletAddress as any],
        chainId: etherlink.id,
        query: {
          enabled: !!aiWalletAddress,
          refetchOnWindowFocus: false,
          staleTime: 30000,
        },
      });
    }
  });

  // Combine all balance data from all chains
  const balances = useMemo(() => {
    if (!aiWalletAddress) {
      return [];
    }

    const allBalances: AITokenBalance[] = [];

    // Process KUB chain balances
    Object.values(KUB_TOKENS).forEach((tokenConfig, index) => {
      const query = kubBalanceQueries[index];
      let rawBalance: string;
      let formattedBalance: string;

      if (tokenConfig.isNative) {
        rawBalance = (query.data as any)?.value?.toString() || '0';
      } else {
        rawBalance = query.data?.toString() || '0';
      }

      // Format the balance: divide by 10^decimals to get human-readable value
      const divisor = BigInt(10 ** tokenConfig.decimals);
      const balanceBigInt = BigInt(rawBalance);
      const whole = balanceBigInt / divisor;
      const fraction = balanceBigInt % divisor;
      
      // Convert fraction to string with leading zeros
      const fractionStr = fraction.toString().padStart(tokenConfig.decimals, '0');
      // Remove trailing zeros
      const trimmedFraction = fractionStr.replace(/0+$/, '');
      
      if (trimmedFraction === '' || trimmedFraction === '0') {
        formattedBalance = whole.toString();
      } else {
        formattedBalance = `${whole}.${trimmedFraction}`;
      }

      allBalances.push({
        symbol: tokenConfig.symbol,
        name: tokenConfig.name,
        balance: formattedBalance,
        decimals: tokenConfig.decimals,
        address: ('address' in tokenConfig) ? tokenConfig.address : undefined,
        isNative: tokenConfig.isNative,
        isLoading: query.isLoading,
        error: query.error?.message,
        rawBalance,
        chainId: kubChain.id,
      });
    });

    // Process KAIA chain balances
    Object.values(KAIA_TOKENS).forEach((tokenConfig, index) => {
      const query = kaiaBalanceQueries[index];
      let rawBalance: string;
      let formattedBalance: string;

      if (tokenConfig.isNative) {
        rawBalance = (query.data as any)?.value?.toString() || '0';
      } else {
        rawBalance = query.data?.toString() || '0';
      }

      // Format the balance: divide by 10^decimals to get human-readable value
      const divisor = BigInt(10 ** tokenConfig.decimals);
      const balanceBigInt = BigInt(rawBalance);
      const whole = balanceBigInt / divisor;
      const fraction = balanceBigInt % divisor;
      
      // Convert fraction to string with leading zeros
      const fractionStr = fraction.toString().padStart(tokenConfig.decimals, '0');
      // Remove trailing zeros
      const trimmedFraction = fractionStr.replace(/0+$/, '');
      
      if (trimmedFraction === '' || trimmedFraction === '0') {
        formattedBalance = whole.toString();
      } else {
        formattedBalance = `${whole}.${trimmedFraction}`;
      }

      allBalances.push({
        symbol: tokenConfig.symbol,
        name: tokenConfig.name,
        balance: formattedBalance,
        decimals: tokenConfig.decimals,
        address: ('address' in tokenConfig) ? tokenConfig.address : undefined,
        isNative: tokenConfig.isNative,
        isLoading: query.isLoading,
        error: query.error?.message,
        rawBalance,
        chainId: kaia.id,
      });
    });

    // Process Etherlink chain balances
    Object.values(ETHERLINK_TOKENS).forEach((tokenConfig, index) => {
      const query = etherlinkBalanceQueries[index];
      let rawBalance: string;
      let formattedBalance: string;

      if (tokenConfig.isNative) {
        rawBalance = (query.data as any)?.value?.toString() || '0';
      } else {
        rawBalance = query.data?.toString() || '0';
      }

      // Format the balance: divide by 10^decimals to get human-readable value
      const divisor = BigInt(10 ** tokenConfig.decimals);
      const balanceBigInt = BigInt(rawBalance);
      const whole = balanceBigInt / divisor;
      const fraction = balanceBigInt % divisor;
      
      // Convert fraction to string with leading zeros
      const fractionStr = fraction.toString().padStart(tokenConfig.decimals, '0');
      // Remove trailing zeros
      const trimmedFraction = fractionStr.replace(/0+$/, '');
      
      if (trimmedFraction === '' || trimmedFraction === '0') {
        formattedBalance = whole.toString();
      } else {
        formattedBalance = `${whole}.${trimmedFraction}`;
      }

      allBalances.push({
        symbol: tokenConfig.symbol,
        name: tokenConfig.name,
        balance: formattedBalance,
        decimals: tokenConfig.decimals,
        address: ('address' in tokenConfig) ? tokenConfig.address : undefined,
        isNative: tokenConfig.isNative,
        isLoading: query.isLoading,
        error: query.error?.message,
        rawBalance,
        chainId: etherlink.id,
      });
    });

    return allBalances;
  }, [aiWalletAddress, kubBalanceQueries, kaiaBalanceQueries, etherlinkBalanceQueries]);

  // Overall loading state
  const allQueries = [...kubBalanceQueries, ...kaiaBalanceQueries, ...etherlinkBalanceQueries];
  const isLoading = allQueries.some(query => query.isLoading);
  const hasError = allQueries.some(query => query.error);

  // Refetch function for on-demand fetching
  const refetch = useCallback(() => {
    if (aiWalletAddress) {
      return Promise.all(allQueries.map(query => query.refetch()));
    }
    return Promise.resolve();
  }, [aiWalletAddress, allQueries]);

  // Helper function to get balances for a specific chain
  const getBalancesByChain = useCallback((chainId: number): AITokenBalance[] => {
    return balances.filter(b => b.chainId === chainId);
  }, [balances]);

  return {
    balances,
    isLoading,
    hasError,
    refetch,
    getBalancesByChain,
  };
};
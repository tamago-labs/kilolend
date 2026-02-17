import { useBalance, useReadContract, useConnection, useChainId } from 'wagmi';
import { useMemo, useCallback } from 'react';
import { kubChain, kaia, etherlink } from '@/wagmi_config';
import { KUB_TOKENS, KAIA_TOKENS, ETHERLINK_TOKENS, KUBTokenKey, KAIATokenKey, EtherlinkTokenKey, TokenConfig } from '@/config/tokens';

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

export interface Web3TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  address?: string;
  isNative: boolean;
  isLoading: boolean;
  error?: string;
  rawBalance?: string; // Keep raw wei value for reference
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
  const kubBalanceQueries = Object.values(KUB_TOKENS).map((tokenConfig) => {
    if (tokenConfig.isNative) {
      return useBalance({
        address: address,
        chainId: kubChain.id,
        query: {
          enabled: !!address && isKUBChain,
          refetchOnWindowFocus: false,
          staleTime: 30000,
        },
      });
    } else {
      return useReadContract({
        address: tokenConfig.address as `0x${string}` & {}, // Type assertion to remove undefined
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as any],
        chainId: kubChain.id,
        query: {
          enabled: !!address && isKUBChain,
          refetchOnWindowFocus: false,
          staleTime: 30000,
        },
      });
    }
  });

  const kaiaBalanceQueries = Object.values(KAIA_TOKENS).map((tokenConfig) => {
    if (tokenConfig.isNative) {
      return useBalance({
        address: address,
        chainId: kaia.id,
        query: {
          enabled: !!address && isKAIAChain,
          refetchOnWindowFocus: false,
          staleTime: 30000,
        },
      });
    } else {
      return useReadContract({
        address: tokenConfig.address as `0x${string}` & {}, // Type assertion to remove undefined
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as any],
        chainId: kaia.id,
        query: {
          enabled: !!address && isKAIAChain,
          refetchOnWindowFocus: false,
          staleTime: 30000,
        },
      });
    }
  });

  const etherlinkBalanceQueries = Object.values(ETHERLINK_TOKENS).map((tokenConfig) => {
    if (tokenConfig.isNative) {
      return useBalance({
        address: address,
        chainId: etherlink.id,
        query: {
          enabled: !!address && isEtherlinkChain,
          refetchOnWindowFocus: false,
          staleTime: 30000,
        },
      });
    } else {
      return useReadContract({
        address: tokenConfig.address as `0x${string}` & {}, // Type assertion to remove undefined
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as any],
        chainId: etherlink.id,
        query: {
          enabled: !!address && isEtherlinkChain,
          refetchOnWindowFocus: false,
          staleTime: 30000,
        },
      });
    }
  });

  // Combine all balance data based on current chain
  const balances = useMemo(() => {
    if (!address || !isSupportedChain) {
      // Return empty array when not on supported chain
      return [];
    }

    if (isKUBChain) {
      return Object.values(KUB_TOKENS).map((tokenConfig, index) => {
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

        return {
          symbol: tokenConfig.symbol,
          name: tokenConfig.name,
          balance: formattedBalance,
          decimals: tokenConfig.decimals,
          address: ('address' in tokenConfig) ? tokenConfig.address : undefined,
          isNative: tokenConfig.isNative,
          isLoading: query.isLoading,
          error: query.error?.message,
          rawBalance,
        } as Web3TokenBalance;
      });
    } else if (isKAIAChain) {
      return Object.values(KAIA_TOKENS).map((tokenConfig, index) => {
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

        return {
          symbol: tokenConfig.symbol,
          name: tokenConfig.name,
          balance: formattedBalance,
          decimals: tokenConfig.decimals,
          address: ('address' in tokenConfig) ? tokenConfig.address : undefined,
          isNative: tokenConfig.isNative,
          isLoading: query.isLoading,
          error: query.error?.message,
          rawBalance,
        } as Web3TokenBalance;
      });
    } else if (isEtherlinkChain) {
      return Object.values(ETHERLINK_TOKENS).map((tokenConfig, index) => {
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

        return {
          symbol: tokenConfig.symbol,
          name: tokenConfig.name,
          balance: formattedBalance,
          decimals: tokenConfig.decimals,
          address: ('address' in tokenConfig) ? tokenConfig.address : undefined,
          isNative: tokenConfig.isNative,
          isLoading: query.isLoading,
          error: query.error?.message,
          rawBalance,
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
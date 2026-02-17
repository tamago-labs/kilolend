import { useTokenBalances } from './useTokenBalances';
import { useWeb3TokenBalances } from './useWeb3TokenBalances';
import { useAuth } from '@/contexts/ChainContext';

export interface UnifiedTokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  address?: string;
  isNative?: boolean; 
}

export const useTokenBalancesV2 = () => {
  const { selectedAuthMethod } = useAuth();
  
  // Use LINE SDK balances for line_sdk auth method
  const lineSdkBalances = useTokenBalances();

  // Use Web3 balances for web3_wallet auth method
  const web3Balances = useWeb3TokenBalances();

  // Determine which hook to use based on auth method
  if (selectedAuthMethod === 'line_sdk') {
    // For LINE SDK, use existing hook
    const unifiedBalances: UnifiedTokenBalance[] = lineSdkBalances.balances.map(balance => ({
      symbol: balance.symbol,
      name: balance.name,
      balance: balance.balance,
      decimals: balance.decimals,
      address: balance.address,
      isNative: balance.symbol === 'KAIA', // KAIA is the native token for LINE SDK
    }));

    return {
      balances: unifiedBalances,
      isLoading: lineSdkBalances.isLoading,
      hasError: false, // LINE SDK doesn't expose error state easily
      refetch: lineSdkBalances.refreshBalances,
      authMethod: 'line_sdk',
      isCorrectChain: true, // LINE SDK is always on correct chain
    };
  } else {
    // For Web3 wallets, use new hook
    const unifiedBalances: UnifiedTokenBalance[] = web3Balances.balances.map(balance => ({
      symbol: balance.symbol,
      name: balance.name,
      balance: balance.balance,
      decimals: balance.decimals,
      address: balance.address,
      isNative: balance.isNative
    }));

    return {
      balances: unifiedBalances,
      isLoading: web3Balances.isLoading,
      hasError: web3Balances.hasError,
      refetch: web3Balances.refetch,
      authMethod: 'web3_wallet',
      isCorrectChain: web3Balances.isSupportedChain,
      chainId: web3Balances.chainId,
      isKUBChain: web3Balances.isKUBChain,
      isKAIAChain: web3Balances.isKAIAChain,
      isEtherlinkChain: web3Balances.isEtherlinkChain,
    };
  }
};
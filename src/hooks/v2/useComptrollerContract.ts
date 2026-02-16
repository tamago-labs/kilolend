import { useComptrollerContract as useLineSdkComptrollerContract } from '@/hooks/v1/useComptrollerContract';
import { useComptrollerContractWeb3 } from './useComptrollerContractWeb3';
import { useAuth } from '@/contexts/ChainContext';
import type { ComptrollerContractHook } from './useComptrollerContractWeb3';

/**
 * Unified Comptroller contract hook that supports both LINE SDK and Web3 Wallet modes
 * Similar to useMarketContract pattern
 */
export const useComptrollerContract = (): ComptrollerContractHook => {
  const { selectedAuthMethod } = useAuth();

  // Use LINE SDK Comptroller contract for line_sdk auth method
  const lineSdkComptroller = useLineSdkComptrollerContract();

  // Use Web3 Comptroller contract for web3_wallet auth method
  const web3Comptroller = useComptrollerContractWeb3();

  // Determine which hook to use based on auth method
  if (selectedAuthMethod === 'line_sdk') {
    // For LINE SDK, use existing hook
    return lineSdkComptroller;
  } else {
    // For Web3 wallets, use new hook
    return web3Comptroller;
  }
};

// Re-export types
export type { ComptrollerContractHook, AccountLiquidity, MarketInfo, TransactionResult } from './useComptrollerContractWeb3';
import { useCallback } from 'react';
import { useAuth } from '@/contexts/ChainContext';
import { useSendTransaction as useSendTransactionLineSDK } from '@/hooks/useSendTransaction';
import { useSendTransactionWeb3 } from './useSendTransactionWeb3';

export interface DepositTransactionParams {
  tokenSymbol: string;
  amount: string;
  recipient: string;
  isNative: boolean;
}

/**
 * Unified hook for deposit transactions that supports both LINE SDK and Web3 Wallet auth methods
 */
export const useDepositTransaction = () => {
  const { selectedAuthMethod } = useAuth();
  const lineSDKHook = useSendTransactionLineSDK();
  const web3Hook = useSendTransactionWeb3();

  const sendDeposit = useCallback(async (params: DepositTransactionParams) => {
    if (selectedAuthMethod === 'line_sdk') { 
      // Use LINE SDK hook
      return await lineSDKHook.sendTokens({
        tokenSymbol: params.tokenSymbol,
        amount: params.amount,
        recipient: params.recipient,
        isNative: params.tokenSymbol === "KAIA" ? true : false
      });
    } else if (selectedAuthMethod === 'web3_wallet') {
      // Use Web3 Wallet hook
      return await web3Hook.sendTokens({
        tokenSymbol: params.tokenSymbol,
        amount: params.amount,
        recipient: params.recipient
      });
    } else {
      throw new Error('Unsupported authentication method');
    }
  }, [selectedAuthMethod, lineSDKHook, web3Hook]);

  const isLoading = lineSDKHook.isLoading || web3Hook.isLoading;
  const error = lineSDKHook.error || web3Hook.error;
  const resetError = useCallback(() => {
    lineSDKHook.resetError();
    web3Hook.resetError();
  }, [lineSDKHook, web3Hook]);

  return {
    sendDeposit,
    isLoading,
    error,
    resetError
  };
};
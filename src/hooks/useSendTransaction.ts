import { useState, useCallback } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { KAIA_MAINNET_TOKENS, KAIA_TESTNET_TOKENS } from '@/utils/tokenConfig';
import { ethers } from 'ethers';
import { useAppStore } from '@/stores/appStore';


export interface SendTransactionParams {
  tokenSymbol: string;
  amount: string;
  recipient: string;
  isNative: boolean;
}

export const useSendTransaction = () => {
  const { account } = useWalletAccountStore();
  const { sendTransaction } = useKaiaWalletSdk();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { gasLimit } = useAppStore();
  
  // Determine which network we're on based on environment
  const isMainnet = process.env.NEXT_PUBLIC_CHAIN_ID === '8217';
  const TOKENS = isMainnet ? KAIA_MAINNET_TOKENS : KAIA_TESTNET_TOKENS;

  const sendTokens = useCallback(async ({
    tokenSymbol,
    amount,
    recipient,
    isNative
  }: SendTransactionParams) => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isNative) {
        // Native KAIA transfer
        const valueInWei = ethers.parseEther(amount);
        const transaction = {
          from: account,
          to: recipient,
          value: `0x${valueInWei.toString(16)}`,
          gas: `0x${Math.min(gasLimit, 300000).toString(16)}`, // Use gas limit from store 
        };

        await sendTransaction([transaction]);
      } else {
        // ERC-20 token transfer
        const tokenConfig = TOKENS[tokenSymbol as keyof typeof TOKENS];
        if (!tokenConfig) {
          throw new Error('Token configuration not found');
        }

        // Convert amount to token decimals
        const tokenAmount = ethers.parseUnits(amount, tokenConfig.decimals);

        // Encode transfer function call: transfer(address to, uint256 amount)
        const iface = new ethers.Interface([
          'function transfer(address to, uint256 amount) returns (bool)'
        ]);

        const data = iface.encodeFunctionData('transfer', [recipient, tokenAmount]);

        const transaction = {
          from: account,
          to: tokenConfig.address,
          value: '0x0',
          gas: `0x${Math.min(gasLimit, 300000).toString(16)}`, // Use gas limit from store 
          data: data
        };

        await sendTransaction([transaction]);
      }

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Transaction failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account, sendTransaction, gasLimit, TOKENS]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendTokens,
    isLoading,
    error,
    resetError
  };
};

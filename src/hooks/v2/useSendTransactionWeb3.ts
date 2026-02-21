import { useState, useCallback } from 'react';
import { useWriteContract, useSendTransaction as wagmiSendTransaction } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { useChainId, useConnection } from 'wagmi';
import { getTokenConfig, isNativeToken } from '@/config/multiChainTokens';

// ERC20 ABI for token transfers
const erc20Abi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export interface SendTransactionWeb3Params {
  tokenSymbol: string;
  amount: string;
  recipient: string;
  chainId?: number; // Optional chain ID, defaults to current chain
}

export const useSendTransactionWeb3 = () => {
  const chainId = useChainId();
  const { address } = useConnection();
  const writeContract = useWriteContract();
  const sendTransaction = wagmiSendTransaction();
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | undefined>(undefined);

  const sendTokens = useCallback(async ({
    tokenSymbol,
    amount,
    recipient,
    chainId: targetChainId
  }: SendTransactionWeb3Params) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    const activeChainId = targetChainId || chainId;
    
    // Get token configuration
    const tokenConfig = getTokenConfig(activeChainId, tokenSymbol);
    if (!tokenConfig) {
      throw new Error(`Token ${tokenSymbol} not found on chain ${activeChainId}`);
    }

    setIsLoading(true);
    setError(null);

    try {
      let hash: string;

      // Check if it's a native token
      const isNative = isNativeToken(activeChainId, tokenSymbol);

      if (isNative) {
        // Native token transfer
        const value = parseEther(amount);
        
        hash = await sendTransaction.mutateAsync({
          to: recipient as `0x${string}`,
          value,
          chainId: activeChainId,
        });
      } else {
        // ERC-20 token transfer
        if (!tokenConfig.address) {
          throw new Error('Token address not found');
        }

        // Convert amount to token decimals
        const tokenAmount = parseUnits(amount, tokenConfig.decimals);

        hash = await writeContract.mutateAsync({
          address: tokenConfig.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, tokenAmount],
          chainId: activeChainId,
        });
      }

      setTransactionHash(hash);

      return { success: true, hash };
    } catch (error: any) {
      const errorMessage = error.message || 'Transaction failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId, sendTransaction, writeContract]);

  const resetError = useCallback(() => {
    setError(null);
    setTransactionHash(undefined);
  }, []);

  return {
    sendTokens,
    isLoading: isLoading || writeContract.isPending || sendTransaction.isPending,
    error,
    resetError,
    transactionHash,
  };
};

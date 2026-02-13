import { useCallback } from 'react';
import { useWriteContract, useConnection, usePublicClient } from 'wagmi';
import { parseUnits, maxUint256, formatUnits } from 'viem';
import { ERC20_ABI } from '@/utils/contractABIs';
import { MARKET_CONFIG_V1, MarketId } from '@/utils/contractConfig';

export interface ApprovalResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface TokenAllowance {
  allowance: string;
  hasEnoughAllowance: boolean;
}

export const useTokenApprovalWeb3 = () => {
  const { address } = useConnection();
  const publicClient = usePublicClient();
  const writeContract = useWriteContract();

  /**
   * Check current allowance for a token
   */
  const checkAllowance = useCallback(async (
    marketId: MarketId,
    amount: string
  ): Promise<TokenAllowance> => {
    try {
      if (!address) {
        return { allowance: '0', hasEnoughAllowance: false };
      }

      const marketConfig = MARKET_CONFIG_V1[marketId];
      if (!marketConfig.marketAddress || !marketConfig.tokenAddress) {
        return { allowance: '0', hasEnoughAllowance: false };
      }

      // Skip approval check for native KAIA
      if (marketConfig.tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        return { allowance: 'unlimited', hasEnoughAllowance: true };
      }

      // Use publicClient to read allowance from the blockchain
      if (!publicClient) {
        return { allowance: '0', hasEnoughAllowance: false };
      }

      const allowance = await publicClient.readContract({
        address: marketConfig.tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, marketConfig.marketAddress as `0x${string}`],
      });

      const allowanceFormatted = formatUnits(allowance as bigint, marketConfig.decimals);
      const amountNum = parseFloat(amount);

      return {
        allowance: allowanceFormatted,
        hasEnoughAllowance: parseFloat(allowanceFormatted) >= amountNum
      };
    } catch (error) {
      console.error('Error checking allowance:', error);
      return { allowance: '0', hasEnoughAllowance: false };
    }
  }, [address]);

  /**
   * Approve token spending
   */
  const approveToken = useCallback(async (
    marketId: MarketId,
    amount?: string
  ): Promise<ApprovalResult> => {
    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      const marketConfig = MARKET_CONFIG_V1[marketId];
      if (!marketConfig.marketAddress || !marketConfig.tokenAddress) {
        throw new Error('Invalid market configuration');
      }

      // Skip approval for native KAIA
      if (marketConfig.tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        return { success: true };
      }

      // Use max approval if no specific amount provided
      const approvalAmount = amount
        ? parseUnits(amount, marketConfig.decimals)
        : maxUint256;

      console.log(`Approving ${marketConfig.symbol} for ${marketId}:`, {
        token: marketConfig.tokenAddress,
        spender: marketConfig.marketAddress,
        amount: approvalAmount.toString()
      });

      const hash = await writeContract.mutateAsync({
        address: marketConfig.tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [marketConfig.marketAddress as `0x${string}`, approvalAmount],
      });

      console.log(`Approval transaction sent:`, hash);

      return {
        success: true,
        hash: hash,
      };

    } catch (error: any) {
      console.error('Approval failed:', error);
      return {
        success: false,
        error: error.message || 'Approval failed'
      };
    }
  }, [address, writeContract]);

  /**
   * Check if approval is needed and approve if necessary
   */
  const ensureApproval = useCallback(async (
    marketId: MarketId,
    amount: string
  ): Promise<ApprovalResult> => {
    try {
      const { hasEnoughAllowance } = await checkAllowance(marketId, amount);

      if (hasEnoughAllowance) {
        return { success: true };
      }

      return await approveToken(marketId, amount);
    } catch (error: any) {
      console.error('Error ensuring approval:', error);
      return {
        success: false,
        error: error.message || 'Failed to ensure approval'
      };
    }
  }, [checkAllowance, approveToken]);

  return {
    checkAllowance,
    approveToken,
    ensureApproval
  };
};
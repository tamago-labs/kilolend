import { useCallback } from 'react';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { ERC20_ABI } from '@/utils/contractABIs';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';
import { getContract, parseTokenAmount } from '@/utils/contractUtils';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useAppStore } from '@/stores/appStore';

export interface ApprovalResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface TokenAllowance {
  allowance: string;
  hasEnoughAllowance: boolean;
}

export const useTokenApproval = () => {
  const { sendTransaction } = useKaiaWalletSdk();
  const { account } = useWalletAccountStore();
  const { gasLimit } = useAppStore();

  /**
   * Check current allowance for a token
   */
  const checkAllowance = useCallback(async (
    marketId: MarketId,
    amount: string
  ): Promise<TokenAllowance> => {
    try {
      if (!account) {
        return { allowance: '0', hasEnoughAllowance: false };
      }

      const marketConfig = MARKET_CONFIG[marketId];
      if (!marketConfig.marketAddress || !marketConfig.tokenAddress) {
        return { allowance: '0', hasEnoughAllowance: false };
      }

      // Skip approval check for native KAIA
      if (marketConfig.tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        return { allowance: 'unlimited', hasEnoughAllowance: true };
      }

      const tokenContract = await getContract(marketConfig.tokenAddress, ERC20_ABI, false);
      if (!tokenContract) {
        throw new Error('Failed to create token contract instance');
      }

      const allowance = await tokenContract.allowance(account, marketConfig.marketAddress);
      const allowanceFormatted = ethers.formatUnits(allowance, marketConfig.decimals);
      
      const amountBN = new BigNumber(amount);
      const allowanceBN = new BigNumber(allowanceFormatted);
      
      return {
        allowance: allowanceFormatted,
        hasEnoughAllowance: allowanceBN.isGreaterThanOrEqualTo(amountBN)
      };
    } catch (error) {
      console.error('Error checking allowance:', error);
      return { allowance: '0', hasEnoughAllowance: false };
    }
  }, [account]);

  /**
   * Approve token spending
   */
  const approveToken = useCallback(async (
    marketId: MarketId,
    amount?: string
  ): Promise<ApprovalResult> => {
    try {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      const marketConfig = MARKET_CONFIG[marketId];
      if (!marketConfig.marketAddress || !marketConfig.tokenAddress) {
        throw new Error('Invalid market configuration');
      }

      // Skip approval for native KAIA
      if (marketConfig.tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        return { success: true };
      }

      // Use max approval if no specific amount provided
      const approvalAmount = amount 
        ? parseTokenAmount(amount, marketConfig.decimals)
        : ethers.MaxUint256;

      // Create contract interface for encoding
      const iface = new ethers.Interface(ERC20_ABI);
      const data = iface.encodeFunctionData('approve', [marketConfig.marketAddress, approvalAmount]);

      const transaction = {
      from: account,
      to: marketConfig.tokenAddress,
      value: '0x0',
      gas: `0x${Math.min(gasLimit, 200000).toString(16)}`, // Use gas limit from store, max 200k for approvals
      data: data
      };

      console.log(`Approving ${marketConfig.symbol} for ${marketId}:`, {
        to: marketConfig.tokenAddress,
        spender: marketConfig.marketAddress,
        amount: approvalAmount.toString()
      });

      await sendTransaction([transaction]);
      
      return {
        success: true,
        hash: '' // Hash not immediately available in LINE MiniDapp
      };

    } catch (error: any) {
      console.error('Approval failed:', error);
      return {
        success: false,
        error: error.message || 'Approval failed'
      };
    }
  }, [account, sendTransaction, gasLimit]);

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

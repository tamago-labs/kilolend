import { useCallback, useState } from 'react';
import { useTokenContract } from './useTokenContract';
import { useMarketContract } from './useMarketContract';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';

export interface TransactionExecutionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

interface SimpleTransactionHook {
  executeSupply: (marketId: MarketId, amount: string) => Promise<TransactionExecutionResult>;
  executeBorrow: (marketId: MarketId, amount: string) => Promise<TransactionExecutionResult>;
  executeWithdraw: (marketId: MarketId, amount: string) => Promise<TransactionExecutionResult>;
  executeRepay: (marketId: MarketId, amount: string) => Promise<TransactionExecutionResult>;
  isProcessing: boolean;
}

export const useTransactions = (): SimpleTransactionHook => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { account } = useWalletAccountStore();

  const tokenContract = useTokenContract();
  const marketContract = useMarketContract();

  const checkAndApproveToken = useCallback(
    async (tokenAddress: string, spenderAddress: string, amount: string, decimals: number) => {
      if (!account) return { success: false, error: 'No wallet connected' };

      if (!tokenAddress || tokenAddress === 'null' || !spenderAddress || spenderAddress === 'null') {
        console.error('Invalid addresses:', { tokenAddress, spenderAddress });
        return { success: false, error: 'Invalid contract addresses' };
      }

      try {
        console.log('Checking allowance:', { tokenAddress, account, spenderAddress, amount });
        const currentAllowance = await tokenContract.getAllowance(tokenAddress, account, spenderAddress);
        const requiredAmount = parseFloat(amount);
        const currentAllowanceNum = parseFloat(currentAllowance || '0');

        if (currentAllowanceNum >= requiredAmount) return { success: true };

        const approvalAmount = Math.max(requiredAmount, 1000).toString();

        const approvalResult = await tokenContract.approve(tokenAddress, spenderAddress, approvalAmount, decimals);

        if (approvalResult.status === 'failed') {
          console.error('Approval failed:', approvalResult.error);
          return { success: false, error: approvalResult.error || 'Approval failed' };
        }

        console.log('Approval transaction submitted:', approvalResult.hash);
        return { success: true };
      } catch (error: any) {
        console.error('Approval error details:', error);
        return { success: false, error: error.message || 'Token approval failed' };
      }
    },
    [account, tokenContract]
  );

  const executeSupply = useCallback(
    async (marketId: MarketId, amount: string): Promise<TransactionExecutionResult> => {
      if (!account) return { success: false, error: 'Wallet not connected' };
      setIsProcessing(true);

      try {
        const marketConfig = MARKET_CONFIG[marketId];
        if (!marketConfig?.marketAddress) return { success: false, error: `Market ${marketId} not available` };

        const approvalResult = await checkAndApproveToken(
          marketConfig.tokenAddress,
          marketConfig.marketAddress,
          amount,
          marketConfig.decimals
        );

        if (!approvalResult.success) return { success: false, error: approvalResult.error };

        const supplyResult = await marketContract.supply(marketId, amount);
        if (supplyResult.status === 'failed') {
          return { success: false, error: supplyResult.error || 'Supply transaction failed' };
        }

        return { success: true, hash: supplyResult.hash };
      } catch (error: any) {
        console.error('Supply execution error:', error);
        return { success: false, error: error.message || 'Supply transaction failed' };
      } finally {
        setIsProcessing(false);
      }
    },
    [account, marketContract, checkAndApproveToken]
  );

  const executeBorrow = useCallback(
    async (marketId: MarketId, amount: string): Promise<TransactionExecutionResult> => {
      if (!account) return { success: false, error: 'Wallet not connected' };
      setIsProcessing(true);

      try {
        const marketConfig = MARKET_CONFIG[marketId];
        if (!marketConfig?.marketAddress) return { success: false, error: `Market ${marketId} not available` };

        const borrowResult = await marketContract.borrow(marketId, amount);
        if (borrowResult.status === 'failed') {
          return { success: false, error: borrowResult.error || 'Borrow transaction failed' };
        }

        return { success: true, hash: borrowResult.hash };
      } catch (error: any) {
        console.error('Borrow execution error:', error);
        return { success: false, error: error.message || 'Borrow transaction failed' };
      } finally {
        setIsProcessing(false);
      }
    },
    [account, marketContract]
  );

  const executeWithdraw = useCallback(
    async (marketId: MarketId, amount: string): Promise<TransactionExecutionResult> => {
      if (!account) return { success: false, error: 'Wallet not connected' };
      setIsProcessing(true);

      try {
        const marketConfig = MARKET_CONFIG[marketId];
        if (!marketConfig?.marketAddress) return { success: false, error: `Market ${marketId} not available` };

        const withdrawResult = await marketContract.withdraw(marketId, amount);
        if (withdrawResult.status === 'failed') {
          return { success: false, error: withdrawResult.error || 'Withdraw transaction failed' };
        }

        return { success: true, hash: withdrawResult.hash };
      } catch (error: any) {
        console.error('Withdraw execution error:', error);
        return { success: false, error: error.message || 'Withdraw transaction failed' };
      } finally {
        setIsProcessing(false);
      }
    },
    [account, marketContract]
  );

  const executeRepay = useCallback(
    async (marketId: MarketId, amount: string): Promise<TransactionExecutionResult> => {
      if (!account) return { success: false, error: 'Wallet not connected' };
      setIsProcessing(true);

      try {
        const marketConfig = MARKET_CONFIG[marketId];
        if (!marketConfig?.marketAddress) return { success: false, error: `Market ${marketId} not available` };

        const approvalResult = await checkAndApproveToken(
          marketConfig.tokenAddress,
          marketConfig.marketAddress,
          amount,
          marketConfig.decimals
        );
        if (!approvalResult.success) return { success: false, error: approvalResult.error };

        const repayResult = await marketContract.repay(marketId, amount);
        if (repayResult.status === 'failed') {
          return { success: false, error: repayResult.error || 'Repay transaction failed' };
        }

        return { success: true, hash: repayResult.hash };
      } catch (error: any) {
        console.error('Repay execution error:', error);
        return { success: false, error: error.message || 'Repay transaction failed' };
      } finally {
        setIsProcessing(false);
      }
    },
    [account, marketContract, checkAndApproveToken]
  );

  return { executeSupply, executeBorrow, executeWithdraw, executeRepay, isProcessing };
};

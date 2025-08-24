import { useCallback, useState } from 'react';
import { useTokenContract } from './useTokenContract';
import { useMarketContract } from './useMarketContract';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';
import { TransactionResult, TransactionStatus, waitForTransaction } from '@/utils/contractUtils';

export interface TransactionProgress {
  step: 'approval' | 'transaction' | 'confirmation' | 'completed';
  status: TransactionStatus;
  hash?: string;
  message: string;
  error?: string;
}

interface TransactionHook {
  executeSupply: (
    marketId: MarketId,
    amount: string,
    userAddress: string,
    onProgress?: (progress: TransactionProgress) => void
  ) => Promise<boolean>;
  
  executeBorrow: (
    marketId: MarketId,
    amount: string,
    userAddress: string,
    onProgress?: (progress: TransactionProgress) => void
  ) => Promise<boolean>;
  
  executeWithdraw: (
    marketId: MarketId,
    amount: string,
    onProgress?: (progress: TransactionProgress) => void
  ) => Promise<boolean>;
  
  executeRepay: (
    marketId: MarketId,
    amount: string,
    userAddress: string,
    onProgress?: (progress: TransactionProgress) => void
  ) => Promise<boolean>;
  
  executeCollateralDeposit: (
    marketId: MarketId,
    collateralType: 'wkaia' | 'stkaia',
    amount: string,
    userAddress: string,
    onProgress?: (progress: TransactionProgress) => void
  ) => Promise<boolean>;
  
  isProcessing: boolean;
}

export const useTransactions = (): TransactionHook => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const tokenContract = useTokenContract();
  const marketContract = useMarketContract();
  
  const checkAndApproveToken = async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    decimals: number,
    userAddress: string,
    onProgress?: (progress: TransactionProgress) => void
  ): Promise<boolean> => {
    try {
      // Check current allowance
      const currentAllowance = await tokenContract.getAllowance(
        tokenAddress,
        userAddress,
        spenderAddress
      );
      
      const requiredAmount = parseFloat(amount);
      const currentAllowanceNum = parseFloat(currentAllowance);
      
      if (currentAllowanceNum >= requiredAmount) {
        // Sufficient allowance already exists
        return true;
      }
      
      // Need to approve
      onProgress?.({
        step: 'approval',
        status: TransactionStatus.PENDING,
        message: 'Requesting token approval...'
      });
      
      const approveResult = await tokenContract.approve(
        tokenAddress,
        spenderAddress,
        amount,
        decimals
      );
      
      if (approveResult.status === TransactionStatus.FAILED) {
        onProgress?.({
          step: 'approval',
          status: TransactionStatus.FAILED,
          message: 'Token approval failed',
          error: approveResult.error
        });
        return false;
      }
      
      // Wait for approval confirmation
      onProgress?.({
        step: 'approval',
        status: TransactionStatus.PENDING,
        hash: approveResult.hash,
        message: 'Confirming token approval...'
      });
      
      const receipt = await waitForTransaction(approveResult.hash, 1);
      if (!receipt) {
        onProgress?.({
          step: 'approval',
          status: TransactionStatus.FAILED,
          message: 'Token approval confirmation failed'
        });
        return false;
      }
      
      return true;
    } catch (error: any) {
      onProgress?.({
        step: 'approval',
        status: TransactionStatus.FAILED,
        message: 'Token approval failed',
        error: error.message
      });
      return false;
    }
  };
  
  const executeSupply = useCallback(async (
    marketId: MarketId,
    amount: string,
    userAddress: string,
    onProgress?: (progress: TransactionProgress) => void
  ): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      const marketConfig = MARKET_CONFIG[marketId];
      if (!marketConfig.marketAddress) {
        throw new Error('Market not available for supply');
      }
      
      // Step 1: Check and approve token
      const approved = await checkAndApproveToken(
        marketConfig.tokenAddress,
        marketConfig.marketAddress,
        amount,
        marketConfig.decimals,
        userAddress,
        onProgress
      );
      
      if (!approved) return false;
      
      // Step 2: Execute supply transaction
      onProgress?.({
        step: 'transaction',
        status: TransactionStatus.PENDING,
        message: 'Executing supply transaction...'
      });
      
      const supplyResult = await marketContract.supply(marketId, amount);
      
      if (supplyResult.status === TransactionStatus.FAILED) {
        onProgress?.({
          step: 'transaction',
          status: TransactionStatus.FAILED,
          message: 'Supply transaction failed',
          error: supplyResult.error
        });
        return false;
      }
      
      // Step 3: Wait for confirmation
      onProgress?.({
        step: 'confirmation',
        status: TransactionStatus.PENDING,
        hash: supplyResult.hash,
        message: 'Confirming supply transaction...'
      });
      
      const receipt = await waitForTransaction(supplyResult.hash, 1);
      if (!receipt) {
        onProgress?.({
          step: 'confirmation',
          status: TransactionStatus.FAILED,
          message: 'Supply confirmation failed'
        });
        return false;
      }
      
      onProgress?.({
        step: 'completed',
        status: TransactionStatus.CONFIRMED,
        hash: supplyResult.hash,
        message: 'Supply completed successfully!'
      });
      
      return true;
    } catch (error: any) {
      onProgress?.({
        step: 'transaction',
        status: TransactionStatus.FAILED,
        message: 'Supply failed',
        error: error.message
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [tokenContract, marketContract]);
  
  const executeBorrow = useCallback(async (
    marketId: MarketId,
    amount: string,
    userAddress: string,
    onProgress?: (progress: TransactionProgress) => void
  ): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      const marketConfig = MARKET_CONFIG[marketId];
      if (!marketConfig.marketAddress) {
        throw new Error('Market not available for borrowing');
      }
      
      // Borrowing doesn't require token approval (we're receiving tokens)
      onProgress?.({
        step: 'transaction',
        status: TransactionStatus.PENDING,
        message: 'Executing borrow transaction...'
      });
      
      const borrowResult = await marketContract.borrow(marketId, amount);
      
      if (borrowResult.status === TransactionStatus.FAILED) {
        onProgress?.({
          step: 'transaction',
          status: TransactionStatus.FAILED,
          message: 'Borrow transaction failed',
          error: borrowResult.error
        });
        return false;
      }
      
      onProgress?.({
        step: 'confirmation',
        status: TransactionStatus.PENDING,
        hash: borrowResult.hash,
        message: 'Confirming borrow transaction...'
      });
      
      const receipt = await waitForTransaction(borrowResult.hash, 1);
      if (!receipt) {
        onProgress?.({
          step: 'confirmation',
          status: TransactionStatus.FAILED,
          message: 'Borrow confirmation failed'
        });
        return false;
      }
      
      onProgress?.({
        step: 'completed',
        status: TransactionStatus.CONFIRMED,
        hash: borrowResult.hash,
        message: 'Borrow completed successfully!'
      });
      
      return true;
    } catch (error: any) {
      onProgress?.({
        step: 'transaction',
        status: TransactionStatus.FAILED,
        message: 'Borrow failed',
        error: error.message
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [marketContract]);
  
  const executeWithdraw = useCallback(async (
    marketId: MarketId,
    amount: string,
    onProgress?: (progress: TransactionProgress) => void
  ): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      const marketConfig = MARKET_CONFIG[marketId];
      if (!marketConfig.marketAddress) {
        throw new Error('Market not available for withdrawal');
      }
      
      onProgress?.({
        step: 'transaction',
        status: TransactionStatus.PENDING,
        message: 'Executing withdraw transaction...'
      });
      
      const withdrawResult = await marketContract.withdraw(marketId, amount);
      
      if (withdrawResult.status === TransactionStatus.FAILED) {
        onProgress?.({
          step: 'transaction',
          status: TransactionStatus.FAILED,
          message: 'Withdraw transaction failed',
          error: withdrawResult.error
        });
        return false;
      }
      
      onProgress?.({
        step: 'confirmation',
        status: TransactionStatus.PENDING,
        hash: withdrawResult.hash,
        message: 'Confirming withdraw transaction...'
      });
      
      const receipt = await waitForTransaction(withdrawResult.hash, 1);
      if (!receipt) {
        onProgress?.({
          step: 'confirmation',
          status: TransactionStatus.FAILED,
          message: 'Withdraw confirmation failed'
        });
        return false;
      }
      
      onProgress?.({
        step: 'completed',
        status: TransactionStatus.CONFIRMED,
        hash: withdrawResult.hash,
        message: 'Withdraw completed successfully!'
      });
      
      return true;
    } catch (error: any) {
      onProgress?.({
        step: 'transaction',
        status: TransactionStatus.FAILED,
        message: 'Withdraw failed',
        error: error.message
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [marketContract]);
  
  const executeRepay = useCallback(async (
    marketId: MarketId,
    amount: string,
    userAddress: string,
    onProgress?: (progress: TransactionProgress) => void
  ): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      const marketConfig = MARKET_CONFIG[marketId];
      if (!marketConfig.marketAddress) {
        throw new Error('Market not available for repayment');
      }
      
      // Step 1: Check and approve token for repayment
      const approved = await checkAndApproveToken(
        marketConfig.tokenAddress,
        marketConfig.marketAddress,
        amount,
        marketConfig.decimals,
        userAddress,
        onProgress
      );
      
      if (!approved) return false;
      
      // Step 2: Execute repay transaction
      onProgress?.({
        step: 'transaction',
        status: TransactionStatus.PENDING,
        message: 'Executing repay transaction...'
      });
      
      const repayResult = await marketContract.repay(marketId, amount);
      
      if (repayResult.status === TransactionStatus.FAILED) {
        onProgress?.({
          step: 'transaction',
          status: TransactionStatus.FAILED,
          message: 'Repay transaction failed',
          error: repayResult.error
        });
        return false;
      }
      
      onProgress?.({
        step: 'confirmation',
        status: TransactionStatus.PENDING,
        hash: repayResult.hash,
        message: 'Confirming repay transaction...'
      });
      
      const receipt = await waitForTransaction(repayResult.hash, 1);
      if (!receipt) {
        onProgress?.({
          step: 'confirmation',
          status: TransactionStatus.FAILED,
          message: 'Repay confirmation failed'
        });
        return false;
      }
      
      onProgress?.({
        step: 'completed',
        status: TransactionStatus.CONFIRMED,
        hash: repayResult.hash,
        message: 'Repay completed successfully!'
      });
      
      return true;
    } catch (error: any) {
      onProgress?.({
        step: 'transaction',
        status: TransactionStatus.FAILED,
        message: 'Repay failed',
        error: error.message
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [tokenContract, marketContract]);
  
  const executeCollateralDeposit = useCallback(async (
    marketId: MarketId,
    collateralType: 'wkaia' | 'stkaia',
    amount: string,
    userAddress: string,
    onProgress?: (progress: TransactionProgress) => void
  ): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      const marketConfig = MARKET_CONFIG[marketId];
      const collateralConfig = MARKET_CONFIG[collateralType];
      
      if (!marketConfig.marketAddress) {
        throw new Error('Market not available');
      }
      
      // Step 1: Check and approve collateral token
      const approved = await checkAndApproveToken(
        collateralConfig.tokenAddress,
        marketConfig.marketAddress,
        amount,
        18, // Collateral tokens have 18 decimals
        userAddress,
        onProgress
      );
      
      if (!approved) return false;
      
      // Step 2: Deposit collateral
      onProgress?.({
        step: 'transaction',
        status: TransactionStatus.PENDING,
        message: 'Depositing collateral...'
      });
      
      const depositResult = await marketContract.depositCollateral(
        marketId,
        collateralType,
        amount
      );
      
      if (depositResult.status === TransactionStatus.FAILED) {
        onProgress?.({
          step: 'transaction',
          status: TransactionStatus.FAILED,
          message: 'Collateral deposit failed',
          error: depositResult.error
        });
        return false;
      }
      
      onProgress?.({
        step: 'confirmation',
        status: TransactionStatus.PENDING,
        hash: depositResult.hash,
        message: 'Confirming collateral deposit...'
      });
      
      const receipt = await waitForTransaction(depositResult.hash, 1);
      if (!receipt) {
        onProgress?.({
          step: 'confirmation',
          status: TransactionStatus.FAILED,
          message: 'Collateral deposit confirmation failed'
        });
        return false;
      }
      
      onProgress?.({
        step: 'completed',
        status: TransactionStatus.CONFIRMED,
        hash: depositResult.hash,
        message: 'Collateral deposited successfully!'
      });
      
      return true;
    } catch (error: any) {
      onProgress?.({
        step: 'transaction',
        status: TransactionStatus.FAILED,
        message: 'Collateral deposit failed',
        error: error.message
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [tokenContract, marketContract]);
  
  return {
    executeSupply,
    executeBorrow,
    executeWithdraw,
    executeRepay,
    executeCollateralDeposit,
    isProcessing
  };
};

import { useState, useCallback, useEffect } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import {
  dragonSwapService,
  SwapQuote,
  SwapParams,
  SwapResult,
} from '@/services/dragonSwapService';
import { DragonSwapToken, getTokenBySymbol } from '@/utils/dragonSwapTokenAdapter';
import { useAppStore } from '@/stores/appStore';

// DragonSwap V2 Router address for KAIA Mainnet - CORRECT ADDRESS FROM DRAGONSWAP FRONTEND
const DRAGONSWAP_ROUTER = '0x8203cBc504CE43c3Cad07Be0e057f25B1d4DB578';

export interface DragonSwapState {
  quote: SwapQuote | null;
  isLoading: boolean;
  isSwapping: boolean;
  error: string | null;
  needsApproval: boolean;
  isApproving: boolean;
}

export interface UseDragonSwapReturn {
  state: DragonSwapState;
  getQuote: (
    tokenInSymbol: string,
    tokenOutSymbol: string,
    amountIn: string,
    slippagePercent: number
  ) => Promise<void>;
  executeSwap: (
    tokenInSymbol: string,
    tokenOutSymbol: string,
    amountIn: string,
    slippagePercent: number
  ) => Promise<SwapResult>;
  approveToken: (tokenSymbol: string) => Promise<SwapResult>;
  checkApproval: (tokenSymbol: string, amount: string) => Promise<boolean>;
  resetState: () => void;
  clearError: () => void;
}

export const useDragonSwap = (): UseDragonSwapReturn => {
  const { account } = useWalletAccountStore();
  const { sendTransaction } = useKaiaWalletSdk();
  const { gasLimit } = useAppStore();

  const [state, setState] = useState<DragonSwapState>({
    quote: null,
    isLoading: false,
    isSwapping: false,
    error: null,
    needsApproval: false,
    isApproving: false,
  });

  const updateState = useCallback((updates: Partial<DragonSwapState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      quote: null,
      isLoading: false,
      isSwapping: false,
      error: null,
      needsApproval: false,
      isApproving: false,
    });
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  /**
   * Check if token approval is needed
   */
  const checkApprovalNeeded = useCallback(
    async (token: DragonSwapToken, owner: string, amount: string): Promise<boolean> => {
      try {
        if (token.isNative) {
          return false;
        }

        const allowance = await dragonSwapService.getTokenAllowance(
          token,
          owner,
          DRAGONSWAP_ROUTER
        );

        const allowanceAmount = parseFloat(allowance);
        const requiredAmount = parseFloat(amount);

        return allowanceAmount < requiredAmount;
      } catch (error) {
        console.error('Error checking approval:', error);
        return true;
      }
    },
    []
  );

  /**
   * Get swap quote
   */
  const getQuote = useCallback(
    async (
      tokenInSymbol: string,
      tokenOutSymbol: string,
      amountIn: string,
      slippagePercent: number
    ) => {
      if (!account) {
        updateState({ error: 'Wallet not connected', isLoading: false });
        return;
      }

      if (!amountIn || parseFloat(amountIn) <= 0) {
        updateState({ error: 'Invalid amount', isLoading: false });
        return;
      }

      if (tokenInSymbol === tokenOutSymbol) {
        updateState({ error: 'Cannot swap same token', isLoading: false });
        return;
      }

      updateState({ isLoading: true, error: null });

      try {
        const tokenIn = getTokenBySymbol(tokenInSymbol);
        const tokenOut = getTokenBySymbol(tokenOutSymbol);

        if (!tokenIn || !tokenOut) {
          throw new Error('Token not found');
        }

        const swapParams: SwapParams = {
          tokenIn,
          tokenOut,
          amountIn,
          slippagePercent,
          recipient: account,
        };

        const quote = await dragonSwapService.getSwapQuote(swapParams);

        // Check if approval is needed
        const needsApproval = await checkApprovalNeeded(tokenIn, account, amountIn);

        updateState({
          quote,
          isLoading: false,
          needsApproval,
          error: null,
        });
      } catch (error) {
        console.error('Error getting quote:', error);
        updateState({
          error: error instanceof Error ? error.message : 'Failed to get quote',
          isLoading: false,
          quote: null,
        });
      }
    },
    [account, updateState, checkApprovalNeeded]
  );

  /**
   * Check token approval status
   */
  const checkApproval = useCallback(
    async (tokenSymbol: string, amount: string): Promise<boolean> => {
      if (!account) return false;

      const token = getTokenBySymbol(tokenSymbol);
      if (!token) return false;

      return !(await checkApprovalNeeded(token, account, amount));
    },
    [account, checkApprovalNeeded]
  );

  /**
   * Approve token
   */
  const approveToken = useCallback(
    async (tokenSymbol: string): Promise<SwapResult> => {
      if (!account) {
        return { success: false, error: 'Wallet not connected' };
      }

      const token = getTokenBySymbol(tokenSymbol);
      if (!token) {
        return { success: false, error: 'Token not found' };
      }

      if (token.isNative) {
        return { success: true };
      }

      updateState({ isApproving: true, error: null });

      try {
        const approvalTx = dragonSwapService.createApprovalTransaction(
          token,
          DRAGONSWAP_ROUTER
        );

        // Format for LINE SDK
        const transaction = {
          from: account,
          to: approvalTx.to,
          value: approvalTx.value,
          gas: `0x${Math.min(gasLimit, 200000).toString(16)}`,
          data: approvalTx.data,
        };

        await sendTransaction([transaction]);

        updateState({ isApproving: false, needsApproval: false });

        return { success: true };
      } catch (error) {
        console.error('Error approving token:', error);
        const errorMessage = error instanceof Error ? error.message : 'Approval failed';

        updateState({
          isApproving: false,
          error: errorMessage,
        });

        return { success: false, error: errorMessage };
      }
    },
    [account, sendTransaction, gasLimit, updateState]
  );

  /**
   * Execute swap
   */
  const executeSwap = useCallback(
    async (
      tokenInSymbol: string,
      tokenOutSymbol: string,
      amountIn: string,
      slippagePercent: number
    ): Promise<SwapResult> => {
      if (!account) {
        return { success: false, error: 'Wallet not connected' };
      }

      if (!state.quote) {
        return { success: false, error: 'No quote available' };
      }

      updateState({ isSwapping: true, error: null });

      try {
        const tokenIn = getTokenBySymbol(tokenInSymbol);
        const tokenOut = getTokenBySymbol(tokenOutSymbol);

        if (!tokenIn || !tokenOut) {
          throw new Error('Token not found');
        }

        const swapParams: SwapParams = {
          tokenIn,
          tokenOut,
          amountIn,
          slippagePercent,
          recipient: account,
        };

        // Create swap transaction
        const swapTx = dragonSwapService.createSwapTransaction(state.quote, swapParams);

        // Format for LINE SDK
        const transaction = {
          from: account,
          to: swapTx.to,
          value: swapTx.value,
          gas: swapTx.gasLimit,
          data: swapTx.data,
        };

        // Execute via LINE SDK
        await sendTransaction([transaction]);

        updateState({ isSwapping: false });

        return { success: true };
      } catch (error) {
        console.error('Error executing swap:', error);
        const errorMessage = error instanceof Error ? error.message : 'Swap failed';

        updateState({
          isSwapping: false,
          error: errorMessage,
        });

        return { success: false, error: errorMessage };
      }
    },
    [account, state.quote, sendTransaction, updateState]
  );

  return {
    state,
    getQuote,
    executeSwap,
    approveToken,
    checkApproval,
    resetState,
    clearError,
  };
};

/**
 * Hook for getting token balances
 */
export const useDragonSwapBalances = (tokens: DragonSwapToken[]) => {
  const { account } = useWalletAccountStore();
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!account || tokens.length === 0) {
      setBalances({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balancePromises = tokens.map(async (token) => {
        try {
          const balance = await dragonSwapService.getTokenBalance(token, account);
          return [token.symbol, balance] as [string, string];
        } catch (err) {
          console.warn(`Failed to fetch balance for ${token.symbol}:`, err);
          return [token.symbol, '0'] as [string, string];
        }
      });

      const results = await Promise.all(balancePromises);
      const balanceMap = Object.fromEntries(results);

      setBalances(balanceMap);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  }, [account, tokens]);

  useEffect(() => {
    fetchBalances();
  }, []);

  return { balances, isLoading, error, refetch: fetchBalances };
};

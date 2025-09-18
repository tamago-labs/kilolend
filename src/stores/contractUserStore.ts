import { create } from 'zustand';
// import { UserPosition as ContractUserPosition } from '@/hooks/useMarketContract';

/**
 * User Position structure with contract-specific data
 */
export interface ContractUserPosition {
  id: string;
  marketId: string;
  type: 'supply' | 'borrow';

  // Core contract data
  amount: string;       // Token amount
  usdValue: number;     // Value in USD
  apy: number;          // Current APY/APR

  // Optional contract data
  supplyBalance?: string;
  borrowBalance?: string;
  collateralValue?: string;
  wkaiaCollateral?: string;
  stkaiaCollateral?: string;

  // Metadata
  timestamp: number;
  lastUpdated?: number;
  isHealthy?: boolean;
}

/**
 * On-chain transaction representation
 */
export interface ContractTransaction {
  id: string;
  type: 'supply' | 'withdraw' | 'borrow' | 'repay' | 'deposit_collateral' | 'withdraw_collateral';
  marketId: string;
  amount: string;
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  usdValue: number;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
}

/**
 * Zustand store interface for managing user DeFi positions & transactions
 */
export interface ContractUserState {
  positions: ContractUserPosition[];
  transactions: ContractTransaction[];

  // Aggregated portfolio stats
  totalSupplied: number;
  totalBorrowed: number;
  totalCollateralValue: number;
  netAPY: number;
  healthFactor: number;

  // Loading and sync states
  isLoading: boolean;
  lastUpdate: number;

  // Actions
  updateUserPosition: (marketId: string, positionData: ContractUserPosition) => void;
  addTransaction: (transaction: Omit<ContractTransaction, 'id'>) => void;
  updateTransactionStatus: (
    id: string,
    status: ContractTransaction['status'],
    receipt?: any
  ) => void;
  setLoading: (loading: boolean) => void;
  calculatePortfolioStats: (data: any) => void;
  clearUserData: () => void;
  refreshAllPositions: () => void;
}

/**
 * Zustand store definition
 */
export const useContractUserStore = create<ContractUserState>((set, get) => ({
  positions: [],
  transactions: [],
  totalSupplied: 0,
  totalBorrowed: 0,
  totalCollateralValue: 0,
  netAPY: 0,
  healthFactor: 999,
  isLoading: false,
  lastUpdate: 0,

  /**
   * Add or update a user's position for a given market
   */
  updateUserPosition: (marketId: any, positionData: any) => {
    set((state) => {
      const existingIndex = state.positions.findIndex(
        (pos: any) => pos.marketId === marketId && pos.type === positionData.type
      );

      const updatedPositions =
        existingIndex >= 0
          ? state.positions.map((pos, idx) =>
            idx === existingIndex
              ? { ...pos, ...positionData, lastUpdated: Date.now() }
              : pos
          )
          : [
            ...state.positions,
            {
              ...positionData,
              id: `pos_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              timestamp: Date.now(),
              lastUpdated: Date.now(),
            },
          ];

      return { positions: updatedPositions, lastUpdate: Date.now() };
    });

  },

  /**
   * Add a new transaction to the user's transaction history
   */
  addTransaction: (transactionData) => {
    const newTransaction: ContractTransaction = {
      ...transactionData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
      lastUpdate: Date.now(),
    }));
  },

  /**
   * Update the status of a pending transaction (and store gas data if available)
   */
  updateTransactionStatus: (id, status, receipt) => {
    set((state) => {
      const updatedTransactions = state.transactions.map((tx) =>
        tx.id === id
          ? {
            ...tx,
            status,
            ...(receipt && {
              gasUsed: receipt.gasUsed?.toString(),
              gasPrice: receipt.gasPrice?.toString(),
              blockNumber: receipt.blockNumber,
            }),
          }
          : tx
      );

      return { transactions: updatedTransactions, lastUpdate: Date.now() };
    });
  },

  /**
   * Toggle global loading state
   */
  setLoading: (loading) => set({ isLoading: loading }),

  /**
   * Calculate aggregated portfolio statistics
   */
  calculatePortfolioStats: (portfolioData: any) => {
    // const { positions } = get();

    // let totalSupplied = 0;
    // let totalBorrowed = 0;
    // let totalCollateralValue = 0;
    // let suppliedEarnings = 0;
    // let borrowedCosts = 0;

    // positions.forEach((position: any) => {
    //   if (position.type === 'supply') {
    //     totalSupplied += position.usdValue;
    //     suppliedEarnings += (position.usdValue * position.apy) / 100;
    //   } else if (position.type === 'borrow') {
    //     totalBorrowed += position.usdValue;
    //     borrowedCosts += (position.usdValue * position.apy) / 100;
    //   }

    //   if (position.collateralValue) {
    //     totalCollateralValue += parseFloat(position.collateralValue);
    //   }
    // });

    // const netEarnings = suppliedEarnings - borrowedCosts;
    // const netAPY = totalSupplied > 0 ? (netEarnings / totalSupplied) * 100 : 0;

    // const healthFactor =
    //   totalBorrowed > 0 ? (totalCollateralValue * 0.8) / totalBorrowed : 999;

    set({
      totalSupplied: portfolioData.totalSupplied,
      totalBorrowed: portfolioData.totalBorrowed,
      totalCollateralValue: portfolioData.totalCollateralValue,
      // netAPY,
      healthFactor: portfolioData.healthFactor,
      lastUpdate: Date.now(),
    });
  },

  /**
   * Reset all user data (used on logout/disconnect)
   */
  clearUserData: () =>
    set({
      positions: [],
      transactions: [],
      totalSupplied: 0,
      totalBorrowed: 0,
      totalCollateralValue: 0,
      netAPY: 0,
      healthFactor: 999,
      lastUpdate: Date.now(),
    }),

  /**
   * Force refresh positions (trigger external hooks to fetch again)
   */
  refreshAllPositions: () => set({ lastUpdate: Date.now() }),
}));

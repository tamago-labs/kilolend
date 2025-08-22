import { create } from 'zustand';

export interface UserPosition {
  id: string;
  marketId: string;
  type: 'supply' | 'borrow';
  amount: number;
  apy: number;
  timestamp: number;
  usdValue: number;
}

export interface Transaction {
  id: string;
  type: 'supply' | 'withdraw' | 'borrow' | 'repay';
  marketId: string;
  amount: number;
  timestamp: number;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  usdValue: number;
}

export interface UserState {
  positions: UserPosition[];
  transactions: Transaction[];
  totalSupplied: number;
  totalBorrowed: number;
  netAPY: number;
  healthFactor: number;
  addPosition: (position: Omit<UserPosition, 'id' | 'timestamp'>) => void;
  removePosition: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateTransactionStatus: (id: string, status: Transaction['status'], txHash?: string) => void;
  calculatePortfolioStats: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  positions: [],
  transactions: [],
  totalSupplied: 0,
  totalBorrowed: 0,
  netAPY: 0,
  healthFactor: 0,

  addPosition: (positionData) => {
    const newPosition: UserPosition = {
      ...positionData,
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    set((state) => ({
      positions: [...state.positions, newPosition]
    }));

    get().calculatePortfolioStats();
  },

  removePosition: (id) => {
    set((state) => ({
      positions: state.positions.filter(pos => pos.id !== id)
    }));

    get().calculatePortfolioStats();
  },

  addTransaction: (transactionData) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    set((state) => ({
      transactions: [newTransaction, ...state.transactions]
    }));
  },

  updateTransactionStatus: (id, status, txHash) => {
    set((state) => ({
      transactions: state.transactions.map(tx => 
        tx.id === id ? { ...tx, status, txHash } : tx
      )
    }));
  },

  calculatePortfolioStats: () => {
    const { positions } = get();
    
    const supplied = positions.filter(p => p.type === 'supply');
    const borrowed = positions.filter(p => p.type === 'borrow');

    const totalSupplied = supplied.reduce((sum, pos) => sum + pos.usdValue, 0);
    const totalBorrowed = borrowed.reduce((sum, pos) => sum + pos.usdValue, 0);

    // Calculate weighted average APY
    const suppliedEarnings = supplied.reduce((sum, pos) => sum + (pos.usdValue * pos.apy / 100), 0);
    const borrowedCosts = borrowed.reduce((sum, pos) => sum + (pos.usdValue * pos.apy / 100), 0);
    
    const netEarnings = suppliedEarnings - borrowedCosts;
    const netAPY = totalSupplied > 0 ? (netEarnings / totalSupplied) * 100 : 0;

    // Calculate health factor (simplified)
    const healthFactor = totalBorrowed > 0 ? (totalSupplied * 0.8) / totalBorrowed : 999;

    set({
      totalSupplied,
      totalBorrowed,
      netAPY,
      healthFactor
    });
  }
}));

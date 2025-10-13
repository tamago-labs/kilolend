// Shared types for BoostModal components

export interface VaultStrategy {
  id: string;
  name: string;
  asset: string;
  description: string;
  strategy: string;
  riskLevel: 'Low' | 'Medium' | 'Medium-High' | 'High';
  baseAPY: number;
  boostedAPY: number;
  leverageRatio: number;
  targetHealthFactor: number;
  minDeposit: string;
  withdrawalTime: string;
  tvl: string;
  totalUsers: number;
  icon: string;
  image: string;
}

export interface UserPosition {
  vaultId: string;
  depositIndex: number;
  shares: string;
  assets: string;
  deposited: string;
  currentValue: string;
  profitLoss: string;
  profitLossPercentage: number;
  depositedAt: number;
  unlockBlock: number;
  lockDuration: number;
  isLocked: boolean;
  canWithdraw: boolean;
  daysRemaining?: number;
  healthFactor?: number;
  leverageRatio?: number;
  collateralValue?: string;
  debtValue?: string;
}

export interface WithdrawalRequest {
  id: number;
  vaultId: string;
  vaultName: string;
  amount: string;
  status: 'pending' | 'processing' | 'ready' | 'claimed';
  requestedAt: number;
  estimatedReady?: number;
  txHash?: string;
  aiReasoning?: string;
  taskSteps?: string[];
}

export type TabType = 'deposit' | 'withdraw' | 'activity';
export type DepositStep = 1 | 2 | 3 | 4;
export type WithdrawStep = 1 | 2 | 3;

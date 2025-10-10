/**
 * Mock data for KAIA Leverage Vault ONLY (v1)
 * Matches bot implementation exactly
 */

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

// ONLY KAIA VAULT (v1)
export const VAULT_STRATEGIES: VaultStrategy[] = [
  {
    id: 'kaia-leverage',
    name: 'KAIA Leverage Vault',
    asset: 'KAIA',
    description: 'AI-managed leverage loop for maximized yields. Bot withdraws KAIA periodically, creates tasks for operators to execute leverage strategy.',
    strategy: 'Bot withdraws KAIA → Operator stakes to stKAIA (Lair Finance) → Supply to KiloLend → Borrow USDT → Swap to KAIA (DragonSwap) → Loop until HF ≈ 1.8 → AI monitors & auto-rebalances',
    riskLevel: 'Medium-High',
    baseAPY: 4.5,
    boostedAPY: 19.2,
    leverageRatio: 2.5,
    targetHealthFactor: 1.8, // Optimal target (updated from 1.5)
    minDeposit: '10 KAIA',
    withdrawalTime: '12-24 hours',
    tvl: '$56,567',
    totalUsers: 1542,
    icon: '🚀',
    image: "https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png"
  }
];

// Task structure matching bot implementation
export interface AIVaultTask {
  taskId: string;
  type: 'BOT_WITHDRAW' | 'LEVERAGE_UP' | 'LEVERAGE_DOWN' | 'REBALANCE' | 'EMERGENCY_STOP' | 'DEPOSIT' | 'WITHDRAW';
  description: string;
  steps: string[];
  parameters: {
    [key: string]: any;
  };
  reasoning: string;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING_OPERATOR' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'URGENT_OPERATOR_ACTION';
  timestamp: string;
  executionTime?: number;
  txHash?: string;
}

// AI Decision structure matching database
export interface AIDecision {
  decisionId: string;
  userAddress: string;
  timestamp: number;
  action: string;
  confidence: number;
  reasoning: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedOutcome: string;
  marketConditions: string;
  healthFactorBefore: number;
  totalCollateral: number;
  totalDebt: number;
  executionResult?: any;
  success?: boolean;
  gasUsed?: number;
  txHash?: string;
  botVersion: string;
  aiModel: string;
}

// Bot Activity Feed (matches actual bot operations)
export interface BotActivity {
  timestamp: number;
  action: string;
  reasoning: string;
  status: 'success' | 'pending' | 'warning' | 'info' | 'critical';
  details?: string;
  txHash?: string;
  healthFactor?: number;
  task?: AIVaultTask;
}

// KAIA Vault Activity (Real bot operations)
export const KAIA_VAULT_ACTIVITY: BotActivity[] = [
  {
    timestamp: Date.now() - 180000, // 3 min ago
    action: 'Bot Withdrew 100 KAIA',
    reasoning: 'AI detected optimal leverage opportunity. Health Factor: 2.1 (above max efficient 2.0). Withdrawing to increase position.',
    status: 'success',
    details: 'Automated withdrawal for leverage loop execution',
    txHash: '0xabc123...def456',
    healthFactor: 2.1,
    task: {
      taskId: 'TASK_1704890000_abc123',
      type: 'LEVERAGE_UP',
      description: 'Increase leverage position',
      steps: [
        '1. Withdraw 100 KAIA from vault',
        '2. Stake 100 KAIA to get stKAIA',
        '3. Supply 100 stKAIA to lending pool',
        '4. Borrow 70 USDT from lending pool',
        '5. Swap 70 USDT to KAIA',
        '6. Stake swapped KAIA again'
      ],
      parameters: {
        withdrawAmount: 100,
        borrowAmount: 70,
        expectedHealthFactor: 1.8
      },
      reasoning: 'Current HF 2.1 is inefficient. Can safely leverage up to HF 1.8 for better yields.',
      confidence: 0.87,
      riskLevel: 'MEDIUM',
      status: 'PENDING_OPERATOR',
      timestamp: new Date(Date.now() - 180000).toISOString()
    }
  },
  {
    timestamp: Date.now() - 600000, // 10 min ago
    action: 'Health Factor Monitored',
    reasoning: 'Current HF: 1.82 - Within optimal range (1.5-2.0). APY tracking at 19.1%. No action needed.',
    status: 'info',
    healthFactor: 1.82,
    details: 'Emergency check passed: All thresholds safe'
  },
  {
    timestamp: Date.now() - 1200000, // 20 min ago  
    action: 'AI Decision: HOLD',
    reasoning: 'Health Factor: 1.78 - Optimal. Market conditions stable. Confidence: 0.92. Position maintained.',
    status: 'info',
    healthFactor: 1.78,
    details: 'No rebalancing needed, position performing well'
  },
  {
    timestamp: Date.now() - 1800000, // 30 min ago
    action: 'Task Completed: Leverage Loop',
    reasoning: 'Operator successfully executed 3 leverage loops. Final HF: 1.79. Total collateral: 250 stKAIA, Total debt: 105 USDT.',
    status: 'success',
    txHash: '0xloop789...xyz123',
    healthFactor: 1.79,
    details: '3 loops completed in 25 minutes'
  },
  {
    timestamp: Date.now() - 3600000, // 1 hour ago
    action: 'Emergency Check Passed',
    reasoning: 'Health Factor: 1.81 - Safe. Gas price: 45 gwei - Acceptable. All systems operational.',
    status: 'info',
    healthFactor: 1.81
  },
  {
    timestamp: Date.now() - 7200000, // 2 hours ago
    action: 'Task Created: Rebalance',
    reasoning: 'Health Factor dropped to 1.52 due to market volatility. Creating task to slightly reduce leverage for safety.',
    status: 'warning',
    healthFactor: 1.52,
    task: {
      taskId: 'TASK_1704883200_def456',
      type: 'LEVERAGE_DOWN',
      description: 'Decrease leverage position to reduce risk',
      steps: [
        '1. Unstake 30 stKAIA from Lair Finance',
        '2. Swap unstaked KAIA to USDT if needed',
        '3. Repay 25 USDT to lending pool',
        '4. Withdraw remaining collateral if necessary',
        '5. Deposit 24 KAIA back to vault'
      ],
      parameters: {
        unstakeAmount: 30,
        repayAmount: 25,
        expectedHealthFactor: 1.85
      },
      reasoning: 'HF at 1.52 approaching safe minimum 1.5. Reducing leverage to maintain buffer.',
      confidence: 0.91,
      riskLevel: 'MEDIUM',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      executionTime: 1200000, // 20 minutes
      txHash: '0xrebal456...abc789'
    }
  },
  {
    timestamp: Date.now() - 10800000, // 3 hours ago
    action: 'Bot Startup',
    reasoning: 'KAIA Leveraged Bot v1.0.0 initialized. AI reasoning: ENABLED (Claude Sonnet 4). Connected to vault and lending pool.',
    status: 'info',
    details: 'All systems operational, monitoring active'
  }
];

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
  // Additional fields matching bot
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
  // Matching bot structure
  aiReasoning?: string;
  taskSteps?: string[];
}

// Mock user positions
export const MOCK_USER_POSITIONS: UserPosition[] = [
  {
    vaultId: 'kaia-leverage',
    depositIndex: 0,
    shares: '100.00',
    assets: '100.00',
    deposited: '100.00',
    currentValue: '104.82',
    profitLoss: '+4.82',
    profitLossPercentage: 4.82,
    depositedAt: Date.now() - 86400000 * 10, // 10 days ago
    unlockBlock: Date.now() / 1000 + 86400 * 5, // 5 days from now (credit card deposit - 15 day lock)
    lockDuration: 15,
    isLocked: true,
    canWithdraw: false,
    daysRemaining: 5,
    healthFactor: 1.78,
    leverageRatio: 2.3,
    collateralValue: '230.00 stKAIA',
    debtValue: '97.50 USDT'
  },
  {
    vaultId: 'kaia-leverage',
    depositIndex: 1,
    shares: '500.00',
    assets: '500.00',
    deposited: '500.00',
    currentValue: '523.45',
    profitLoss: '+23.45',
    profitLossPercentage: 4.69,
    depositedAt: Date.now() - 86400000 * 20, // 20 days ago
    unlockBlock: Date.now() / 1000 - 86400, // Already unlocked (no lock - direct deposit)
    lockDuration: 0,
    isLocked: false,
    canWithdraw: true,
    daysRemaining: 0,
    healthFactor: 1.82,
    leverageRatio: 2.4,
    collateralValue: '1,200.00 stKAIA',
    debtValue: '510.20 USDT'
  }
];

// Mock withdrawal requests (matching bot task structure)
export const MOCK_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  {
    id: 1,
    vaultId: 'kaia-leverage',
    vaultName: 'KAIA Leverage Vault',
    amount: '50.00 KAIA',
    status: 'processing',
    requestedAt: Date.now() - 3600000, // 1 hour ago
    estimatedReady: Date.now() + 7200000, // 2 hours from now
    aiReasoning: 'AI bot is unwinding your leverage position. Steps: 1) Repaying USDT debt 2) Withdrawing stKAIA collateral 3) Unstaking to KAIA. Est. completion: 2h',
    taskSteps: [
      'Swap KAIA to USDT to cover debt',
      'Repay 35 USDT to lending pool',
      'Withdraw 50 stKAIA collateral',
      'Unstake stKAIA to KAIA',
      'Process withdrawal to your wallet'
    ]
  },
  {
    id: 2,
    vaultId: 'kaia-leverage',
    vaultName: 'KAIA Leverage Vault',
    amount: '200.00 KAIA',
    status: 'ready',
    requestedAt: Date.now() - 86400000, // 1 day ago
    txHash: '0xwithdraw123...abc456',
    aiReasoning: 'Position successfully unwound. Your 200 KAIA is ready to claim.',
    taskSteps: [
      '✅ Repaid all USDT debt',
      '✅ Withdrew stKAIA collateral',
      '✅ Unstaked to KAIA',
      '✅ Withdrawal processed'
    ]
  }
];

export function getVaultActivity(vaultId: string): BotActivity[] {
  if (vaultId === 'kaia-leverage') {
    return KAIA_VAULT_ACTIVITY;
  }
  return [];
}

export function getVaultById(vaultId: string): VaultStrategy | undefined {
  return VAULT_STRATEGIES.find(v => v.id === vaultId);
}

// Health Factor Status Helper
export function getHealthFactorStatus(hf: number): {
  status: 'critical' | 'warning' | 'safe' | 'optimal' | 'inefficient';
  color: string;
  label: string;
} {
  if (hf < 1.3) {
    return { status: 'critical', color: '#ef4444', label: '🚨 Critical' };
  } else if (hf < 1.5) {
    return { status: 'warning', color: '#f59e0b', label: '⚠️ Warning' };
  } else if (hf < 1.7) {
    return { status: 'safe', color: '#06C755', label: '✅ Safe' };
  } else if (hf <= 2.0) {
    return { status: 'optimal', color: '#06C755', label: '✨ Optimal' };
  } else {
    return { status: 'inefficient', color: '#3b82f6', label: '📊 Conservative' };
  }
}

// Task Type Labels
export const TASK_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  'BOT_WITHDRAW': { label: 'Bot Withdraw', icon: '🤖', color: '#06C755' },
  'LEVERAGE_UP': { label: 'Leverage Up', icon: '🚀', color: '#3b82f6' },
  'LEVERAGE_DOWN': { label: 'Leverage Down', icon: '📉', color: '#f59e0b' },
  'REBALANCE': { label: 'Rebalance', icon: '⚖️', color: '#8b5cf6' },
  'EMERGENCY_STOP': { label: 'Emergency Stop', icon: '🚨', color: '#ef4444' },
  'DEPOSIT': { label: 'Deposit', icon: '💰', color: '#06C755' },
  'WITHDRAW': { label: 'Withdraw', icon: '💸', color: '#f59e0b' }
};
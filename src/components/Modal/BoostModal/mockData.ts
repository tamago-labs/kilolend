/**
 * Mock data for AI Boost Vaults
 * Three vault strategies with distinct risk/return profiles
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

export const VAULT_STRATEGIES: VaultStrategy[] = [
  {
    id: 'kaia-leverage',
    name: 'KAIA Leverage Vault',
    asset: 'KAIA',
    description: 'DeFi leverage loop strategy for maximum yields',
    strategy: 'KAIA → Stake to stKAIA → Supply to KiloLend → Borrow USDT → Swap to stKAIA (via Swapscanner) → Repeat until Health Factor ≈ 1.5 → AI auto-rebalances',
    riskLevel: 'Medium-High',
    baseAPY: 4.5,
    boostedAPY: 19.2,
    leverageRatio: 2.5,
    targetHealthFactor: 1.5,
    minDeposit: '10 KAIA',
    withdrawalTime: '1-2 hours',
    tvl: '$56,567',
    totalUsers: 1542,
    icon: '🚀',
    image:"https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png"
  },
  {
    id: 'usdt-treasury',
    name: 'USDT Stability Vault',
    asset: 'USDT',
    description: 'US Treasury-backed yields with low risk',
    strategy: 'USDT → Bridge via Chainlink CCIP → Ethereum → Convert to USDY (Ondo Finance) → Earn U.S. Treasury yields → Borrow USDT → Reinvest',
    riskLevel: 'Low',
    baseAPY: 3.8,
    boostedAPY: 8.1,
    leverageRatio: 1.5,
    targetHealthFactor: 2.0,
    minDeposit: '100 USDT',
    withdrawalTime: '24-48 hours',
    tvl: '$145,120',
    totalUsers: 2341,
    icon: '🏛️',
    image : "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png"
  },
  {
    id: 'jpyc-nikkei',
    name: 'JPYC Japan Vault',
    asset: 'JPYC',
    description: 'Tokenized Japanese equities for diversified growth',
    strategy: 'JPYC → Tokenized Nikkei 225 stocks → Supply as collateral → Borrow JPYC/USDT → Reinvest → AI manages leverage and risk',
    riskLevel: 'Medium',
    baseAPY: 6.5,
    boostedAPY: 11.7,
    leverageRatio: 1.8,
    targetHealthFactor: 1.6,
    minDeposit: '¥10,000',
    withdrawalTime: '2-4 hours',
    tvl: '¥12,450,000',
    totalUsers: 834,
    icon: '🗾',
    image:"https://s2.coinmarketcap.com/static/img/coins/64x64/20648.png"
  }
];

export interface BotActivity {
  timestamp: number;
  action: string;
  reasoning: string;
  status: 'success' | 'pending' | 'warning' | 'info';
  txHash?: string;
}

// KAIA Vault Activities
export const KAIA_VAULT_ACTIVITY: BotActivity[] = [
  {
    timestamp: Date.now() - 180000, // 3 min ago
    action: 'Leverage Complete',
    reasoning: 'Achieved 2.3x leverage with Health Factor: 1.52. Position stable and profitable.',
    status: 'success',
    txHash: '0xabc123...def456'
  },
  {
    timestamp: Date.now() - 600000, // 10 min ago
    action: 'Swap Executed',
    reasoning: 'Swapped 350 USDT → 345.2 stKAIA on DragonSwap. Slippage: 0.12%',
    status: 'success',
    txHash: '0x789xyz...123abc'
  },
  {
    timestamp: Date.now() - 900000, // 15 min ago
    action: 'USDT Borrowed',
    reasoning: 'Borrowed 350 USDT at 3.8% APY. LTV: 70%, Health Factor: 1.58',
    status: 'success',
    txHash: '0xdef456...abc789'
  },
  {
    timestamp: Date.now() - 1200000, // 20 min ago
    action: 'stKAIA Supplied',
    reasoning: 'Supplied 500 stKAIA to lending protocol. Starting leverage loop #1',
    status: 'success',
    txHash: '0x456def...789xyz'
  },
  {
    timestamp: Date.now() - 1800000, // 30 min ago
    action: 'Health Check',
    reasoning: 'Current HF: 1.54 - Optimal range. APY tracking at 9.1%',
    status: 'info'
  },
  {
    timestamp: Date.now() - 3600000, // 1 hour ago
    action: 'Monitoring Active',
    reasoning: 'All positions stable. Total vault value: $1.23M across 1,542 users',
    status: 'info'
  },
  {
    timestamp: Date.now() - 7200000, // 2 hours ago
    action: 'Rebalance Check',
    reasoning: 'Market conditions favorable. No rebalancing needed.',
    status: 'info'
  }
];

// USDT Vault Activities
export const USDT_VAULT_ACTIVITY: BotActivity[] = [
  {
    timestamp: Date.now() - 300000, // 5 min ago
    action: 'Yield Distribution',
    reasoning: 'Monthly yield distributed: $142.50 across vault participants',
    status: 'success'
  },
  {
    timestamp: Date.now() - 1800000, // 30 min ago
    action: 'NAV Updated',
    reasoning: 'Net Asset Value per share: $1.0042. Weekly growth: +0.42%',
    status: 'info'
  },
  {
    timestamp: Date.now() - 3600000, // 1 hour ago
    action: 'Treasury Yield Accrued',
    reasoning: 'Daily yield from US Treasury: $384.20 (4.8% annualized)',
    status: 'success'
  },
  {
    timestamp: Date.now() - 5400000, // 1.5 hours ago
    action: 'Compliance Check',
    reasoning: 'Ondo Finance regulatory compliance: PASSED. All holdings verified.',
    status: 'success'
  },
  {
    timestamp: Date.now() - 7200000, // 2 hours ago
    action: 'USDY Conversion',
    reasoning: 'Converted 10,000 USDT → 9,998 USDY. Fee: 0.02%',
    status: 'success',
    txHash: '0xusdy12...3456ab'
  },
  {
    timestamp: Date.now() - 10800000, // 3 hours ago
    action: 'KYC Verified',
    reasoning: 'New user KYC verification completed for USDY access',
    status: 'success'
  },
  {
    timestamp: Date.now() - 14400000, // 4 hours ago
    action: 'Portfolio Review',
    reasoning: 'US Treasury allocation: 100% short-term bills (90-180 days maturity)',
    status: 'info'
  }
];

// JPYC Vault Activities
export const JPYC_VAULT_ACTIVITY: BotActivity[] = [
  {
    timestamp: Date.now() - 240000, // 4 min ago
    action: 'Dividend Received',
    reasoning: 'Sony Q4 dividend: ¥125,000. Total quarterly dividends: ¥342,000',
    status: 'success'
  },
  {
    timestamp: Date.now() - 900000, // 15 min ago
    action: 'Portfolio Rebalanced',
    reasoning: 'Shifted 5% from tech to financials. Nikkei tracking optimization.',
    status: 'success',
    txHash: '0xjpyc89...45def2'
  },
  {
    timestamp: Date.now() - 1800000, // 30 min ago
    action: 'Stock Purchase',
    reasoning: 'Bought 25 tokenized Toyota shares @ ¥2,850 each',
    status: 'success',
    txHash: '0xtoyota...abc123'
  },
  {
    timestamp: Date.now() - 3600000, // 1 hour ago
    action: 'Nikkei Update',
    reasoning: 'Nikkei 225 +1.8% today. Portfolio tracking: +1.6% (slight underperformance)',
    status: 'info'
  },
  {
    timestamp: Date.now() - 5400000, // 1.5 hours ago
    action: 'Earnings Alert',
    reasoning: 'Mitsubishi Q3 earnings beat estimates by 12%. Stock +3.2%',
    status: 'success'
  },
  {
    timestamp: Date.now() - 7200000, // 2 hours ago
    action: 'Currency Hedge',
    reasoning: 'JPY/USD volatility detected. Applied 10% hedge via futures.',
    status: 'warning'
  },
  {
    timestamp: Date.now() - 10800000, // 3 hours ago
    action: 'Portfolio Value',
    reasoning: 'Total vault value: ¥892.45M. YTD return: +11.2%',
    status: 'info'
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
}

// Mock user positions
export const MOCK_USER_POSITIONS: UserPosition[] = [
  {
    vaultId: 'kaia-leverage',
    depositIndex: 0,
    shares: '100.00',
    assets: '100.00',
    deposited: '100.00',
    currentValue: '102.43',
    profitLoss: '+2.43',
    profitLossPercentage: 2.43,
    depositedAt: Date.now() - 86400000 * 10, // 10 days ago
    unlockBlock: Date.now() / 1000 + 86400 * 5, // 5 days from now
    lockDuration: 15,
    isLocked: true,
    canWithdraw: false,
    daysRemaining: 5
  },
  {
    vaultId: 'usdt-treasury',
    depositIndex: 0,
    shares: '500.00',
    assets: '500.00',
    deposited: '500.00',
    currentValue: '502.10',
    profitLoss: '+2.10',
    profitLossPercentage: 0.42,
    depositedAt: Date.now() - 86400000 * 16, // 16 days ago
    unlockBlock: Date.now() / 1000 - 86400, // Already unlocked
    lockDuration: 15,
    isLocked: true,
    canWithdraw: true,
    daysRemaining: 0
  }
];

// Mock withdrawal requests
export const MOCK_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  {
    id: 1,
    vaultId: 'kaia-leverage',
    vaultName: 'KAIA Leverage Vault',
    amount: '50.00 KAIA',
    status: 'processing',
    requestedAt: Date.now() - 3600000, // 1 hour ago
    estimatedReady: Date.now() + 3600000, // 1 hour from now
  },
  {
    id: 2,
    vaultId: 'usdt-treasury',
    vaultName: 'USDT Stability Vault',
    amount: '200.00 USDT',
    status: 'ready',
    requestedAt: Date.now() - 86400000 * 2, // 2 days ago
    txHash: '0xready123...abc456'
  }
];

export function getVaultActivity(vaultId: string): BotActivity[] {
  switch (vaultId) {
    case 'kaia-leverage':
      return KAIA_VAULT_ACTIVITY;
    case 'usdt-treasury':
      return USDT_VAULT_ACTIVITY;
    case 'jpyc-nikkei':
      return JPYC_VAULT_ACTIVITY;
    default:
      return [];
  }
}

export function getVaultById(vaultId: string): VaultStrategy | undefined {
  return VAULT_STRATEGIES.find(v => v.id === vaultId);
}

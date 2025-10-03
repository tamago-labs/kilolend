/**
 * Mock data for Boost Vault UI
 * Based on realistic stKAIA leverage strategy
 */

export interface VaultMockData {
  // Asset info
  baseAsset: string;
  stakingAPY: number;
  borrowAPY: number;
  
  // Vault strategy
  leverageRatio: number;
  targetHealthFactor: number;
  isActive: boolean;
  isProfitable: boolean;
  
  // APY calculations
  grossEarnings: number;
  borrowCosts: number;
  netAPY: number;
  boostMultiplier: number;
  
  // Vault stats
  totalValueLocked: string;
  totalUsers: number;
  avgHealthFactor: number;
  
  // User position (null if not deposited)
  userDeposit: string | null;
  userShares: string | null;
  currentValue: string | null;
  profitLoss: string | null;
}

export const MOCK_VAULT_DATA: VaultMockData = {
  // Asset info
  baseAsset: 'stKAIA',
  stakingAPY: 5.5,        // stKAIA staking rewards (realistic)
  borrowAPY: 3.8,         // Optimistic USDT borrow rate
  
  // Vault strategy
  leverageRatio: 2.5,
  targetHealthFactor: 1.5,
  isActive: true,
  isProfitable: true,
  
  // APY calculations
  // Gross = stakingAPY × leverageRatio = 5.5 × 2.5 = 13.75
  grossEarnings: 13.75,
  // Borrow = borrowAPY × (leverageRatio - 1) = 3.8 × 1.5 = 5.7
  borrowCosts: 5.7,
  // Net = gross - borrow = 13.75 - 5.7 = 8.05
  netAPY: 8.05,
  // Boost = net / base = 8.05 / 5.5 = 1.46
  boostMultiplier: 1.46,
  
  // Vault stats
  totalValueLocked: '87,450',
  totalUsers: 34,
  avgHealthFactor: 1.52,
  
  // User position (empty for first-time users)
  userDeposit: null,
  userShares: null,
  currentValue: null,
  profitLoss: null,
};

// Mock data for user with existing position
export const MOCK_VAULT_DATA_WITH_POSITION: VaultMockData = {
  ...MOCK_VAULT_DATA,
  
  // User has deposited
  userDeposit: '1000.00',     // Initial KAIA deposit
  userShares: '987.50',        // kKAIA shares received
  currentValue: '1024.30',    // Current value in KAIA
  profitLoss: '+24.30',       // Profit in KAIA
};

// Mock bot activity logs
export interface BotActivity {
  timestamp: number;
  action: string;
  reasoning: string;
  healthFactor: number;
  txHash: string;
}

export const MOCK_BOT_ACTIVITY: BotActivity[] = [
  {
    timestamp: Date.now() - 300000, // 5 min ago
    action: 'leverage_success',
    reasoning: 'HF = 1.62 > 1.6 and 500 KAIA available. Safe to leverage more.',
    healthFactor: 1.52,
    txHash: '0xabc123def456...',
  },
  {
    timestamp: Date.now() - 900000, // 15 min ago
    action: 'health_check',
    reasoning: 'Current HF: 1.58, Vault Balance: 450 KAIA',
    healthFactor: 1.58,
    txHash: 'N/A',
  },
  {
    timestamp: Date.now() - 1800000, // 30 min ago
    action: 'leverage_success',
    reasoning: 'Leverage loop complete. New HF: 1.56',
    healthFactor: 1.56,
    txHash: '0x789xyz123abc...',
  },
  {
    timestamp: Date.now() - 3600000, // 1 hour ago
    action: 'monitor',
    reasoning: 'All good! HF = 1.54, in optimal range [1.45, 1.6]',
    healthFactor: 1.54,
    txHash: 'N/A',
  },
  {
    timestamp: Date.now() - 7200000, // 2 hours ago
    action: 'startup',
    reasoning: 'Bot initialized and ready',
    healthFactor: 0,
    txHash: 'N/A',
  },
];

/**
 * Calculate leveraged APY
 * Formula: (supplyAPY × leverage) - (borrowAPY × (leverage - 1))
 */
export function calculateLeveragedAPY(
  supplyAPY: number,
  borrowAPY: number,
  leverageRatio: number
): {
  grossEarnings: number;
  borrowCosts: number;
  netAPY: number;
  boostMultiplier: number;
} {
  const grossEarnings = supplyAPY * leverageRatio;
  const borrowCosts = borrowAPY * (leverageRatio - 1);
  const netAPY = grossEarnings - borrowCosts;
  const boostMultiplier = netAPY / supplyAPY;
  
  return {
    grossEarnings,
    borrowCosts,
    netAPY,
    boostMultiplier,
  };
}

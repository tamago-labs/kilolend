// Re-export commonly used utilities for easier imports
export {
  getProvider,
  getSigner,
  getContract,
  parseTokenAmount,
  checkNetwork,
  switchToKaiaMainnet,
  estimateGas,
  getGasPrice,
  waitForTransaction,
  formatAddress,
  isValidAddress,
  formatWei,
  TransactionStatus
} from './contractUtils'; 

export type { TransactionResult } from './contractUtils';
 

// Contract addresses and config
export { 
  CONTRACT_ADDRESSES,
  MARKET_CONFIG
} from './contractConfig';

export type { MarketId, ContractName } from './contractConfig';

// ABIs
export {
  BASE_LENDING_MARKET_ABI,
  USDT_MARKET_ABI,
  ERC20_ABI,
  PRICE_ORACLE_ABI,
  INTEREST_RATE_MODEL_ABI
} from './contractABIs';

// Common contract interaction patterns
export const COMMON_CONTRACT_ERRORS = {
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INSUFFICIENT_ALLOWANCE: 'Insufficient allowance',
  INSUFFICIENT_COLLATERAL: 'Insufficient collateral',
  POSITION_NOT_HEALTHY: 'Position not healthy',
  MARKET_NOT_ACTIVE: 'Market not active',
  AMOUNT_TOO_SMALL: 'Amount too small',
  NETWORK_MISMATCH: 'Wrong network',
  USER_REJECTED: 'User rejected transaction',
  GAS_ESTIMATION_FAILED: 'Gas estimation failed',
} as const;

// Helper to parse contract error messages
export const parseContractError = (error: any): string => {
  if (typeof error === 'string') return error;

  const message = error?.message || error?.reason || 'Transaction failed';

  // Check for common error patterns
  if (message.includes('insufficient balance')) return COMMON_CONTRACT_ERRORS.INSUFFICIENT_BALANCE;
  if (message.includes('insufficient allowance')) return COMMON_CONTRACT_ERRORS.INSUFFICIENT_ALLOWANCE;
  if (message.includes('user rejected')) return COMMON_CONTRACT_ERRORS.USER_REJECTED;
  if (message.includes('gas')) return COMMON_CONTRACT_ERRORS.GAS_ESTIMATION_FAILED;

  // Return the original message if no pattern matches
  return message;
};
 

// Helper to validate transaction parameters
export const validateTransactionParams = (
  amount: string,
  balance?: string,
  minAmount?: string
): { isValid: boolean; error?: string } => {
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: 'Invalid amount' };
  }

  if (minAmount && numAmount < parseFloat(minAmount)) {
    return { isValid: false, error: COMMON_CONTRACT_ERRORS.AMOUNT_TOO_SMALL };
  }

  if (balance && numAmount > parseFloat(balance)) {
    return { isValid: false, error: COMMON_CONTRACT_ERRORS.INSUFFICIENT_BALANCE };
  }

  return { isValid: true };
};

// Helper to format APY/APR percentages
export const formatAPY = (rate: number, decimals: number = 2): string => {
  return `${rate.toFixed(decimals)}%`;
};

// Helper to calculate USD values
export const calculateUSDValue = (amount: string, price: number): number => {
  return parseFloat(amount) * price;
};
 

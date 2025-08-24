import { MARKET_CONFIG, PROTOCOL_CONFIG, MarketId } from './contractConfig';

/**
 * Utility functions for handling token amounts and decimals
 */

// Get minimum borrow amount (raw, in token smallest units)
export const getMinimumBorrowAmount = (marketId: MarketId): string => {
  switch (marketId) {
    case 'usdt':
      return PROTOCOL_CONFIG.MIN_BORROW_USDT;
    case 'krw':
      return PROTOCOL_CONFIG.MIN_BORROW_KRW;
    case 'jpy':
      return PROTOCOL_CONFIG.MIN_BORROW_JPY;
    case 'thb':
      return PROTOCOL_CONFIG.MIN_BORROW_THB;
    default:
      return '1';
  }
};

// Convert minimum amount to human-readable format
export const getMinimumDisplayAmount = (marketId: MarketId): string => {
  const config = MARKET_CONFIG[marketId];
  const minAmount = parseFloat(getMinimumBorrowAmount(marketId));
  const decimals = config.decimals;

  return (minAmount / 10 ** decimals).toString();
};

// Validate user amount against minimum requirement
export const validateMinimumAmount = (
  marketId: MarketId,
  amount: string
): { isValid: boolean; error?: string; minimum: string } => {
  const minDisplayAmount = parseFloat(getMinimumDisplayAmount(marketId));
  const userAmount = parseFloat(amount);
  const symbol = MARKET_CONFIG[marketId].symbol;

  if (userAmount < minDisplayAmount) {
    return {
      isValid: false,
      error: `Minimum amount is ${minDisplayAmount} ${symbol}`,
      minimum: minDisplayAmount.toString()
    };
  }

  return { isValid: true, minimum: minDisplayAmount.toString() };
};

// Format amount for display based on token decimals
export const formatTokenAmount = (amount: string, marketId: MarketId): string => {
  const config = MARKET_CONFIG[marketId];
  const numAmount = parseFloat(amount);

  switch (config.decimals) {
    case 0:
      return numAmount.toFixed(0);
    case 2:
      return numAmount.toFixed(2);
    case 6:
      return numAmount.toFixed(6);
    case 18:
    default:
      return numAmount.toFixed(6);
  }
};

// Convert user input to contract-compatible string
export const parseUserAmount = (amount: string, marketId: MarketId): string => {
  const config = MARKET_CONFIG[marketId];
  const numAmount = parseFloat(amount);

  const contractAmount = numAmount * 10 ** config.decimals;
  return Math.floor(contractAmount).toString(); // Avoid scientific notation
};

// Format contract amount to display-friendly string
export const formatContractAmount = (contractAmount: string, marketId: MarketId): string => {
  const config = MARKET_CONFIG[marketId];
  const numAmount = parseFloat(contractAmount);
  const displayAmount = numAmount / 10 ** config.decimals;

  return formatTokenAmount(displayAmount.toString(), marketId);
};

// Get input step size for forms
export const getInputStep = (marketId: MarketId): string => {
  const decimals = MARKET_CONFIG[marketId].decimals;

  switch (decimals) {
    case 0:
      return '1';
    case 2:
      return '0.01';
    case 6:
      return '0.000001';
    case 18:
    default:
      return '0.000001';
  }
};

// Validate decimal places of user input
export const validateDecimalPlaces = (
  amount: string,
  marketId: MarketId
): { isValid: boolean; error?: string } => {
  const config = MARKET_CONFIG[marketId];
  const decimalPlaces = amount.includes('.') ? amount.split('.')[1].length : 0;

  if (decimalPlaces > config.decimals) {
    return {
      isValid: false,
      error: `Maximum ${config.decimals} decimal places allowed for ${config.symbol}`
    };
  }

  return { isValid: true };
};

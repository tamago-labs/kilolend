import { MARKET_CONFIG, PROTOCOL_CONFIG, MarketId } from './contractConfig';

/**
 * Utility functions for handling token amounts and decimals
 */

  

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
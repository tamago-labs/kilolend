import { MARKET_CONFIG, MarketId } from './contractConfig';
import { ethers } from 'ethers';

/**
 * Utility functions for handling token amounts and decimals
 */

/**
 * Maximum safe decimal places for each token type to prevent precision errors
 */
const MAX_SAFE_DECIMALS: Record<number, number> = {
  0: 0,    // Integer tokens
  2: 2,    // USDC-style tokens
  6: 6,    // USDT-style tokens  
  8: 6,    // Wrapped BTC style (limit to 6 for safety)
  18: 8,   // Most ERC20 tokens (limit to 8 for safety)
};

/**
 * Get the maximum safe decimal places for a token
 */
export const getMaxSafeDecimals = (tokenDecimals: number): number => {
  return MAX_SAFE_DECIMALS[tokenDecimals] || Math.min(tokenDecimals, 8);
};

/**
 * Truncate a number to safe decimal places without rounding
 */
export function truncateToSafeDecimals(value: string | number, tokenDecimals: number): string {
  const maxDecimals = getMaxSafeDecimals(tokenDecimals);
  const [intPart, decPart = ""] = String(value).split(".");
  
  if (decPart.length === 0 || maxDecimals === 0) {
    return intPart;
  }
  
  const truncatedDecPart = decPart.slice(0, maxDecimals);
  return `${intPart}.${truncatedDecPart}`;
}


export function truncateToDecimals(value: string | number, decimals: number): string {
  if (!value || value === '') return '0';
  
  try {
    const [intPart, decPart = ""] = String(value).split(".");
    
    if (decimals === 0) {
      return intPart;
    }
    
    if (decPart.length === 0) {
      return intPart;
    }
    
    const truncatedDecPart = decPart.slice(0, decimals);
    return `${intPart}.${truncatedDecPart}`;
  } catch (error) {
    console.warn('Error truncating decimals:', error);
    return '0';
  }
}

/**
 * Safe parseTokenAmount that handles precision issues
 */
export const safeParseTokenAmount = (amount: string, decimals: number): bigint => {
  try {
    // First, ensure the amount doesn't have too many decimal places
    const safeAmount = truncateToSafeDecimals(amount, decimals);
    
    // Validate that the amount is a valid number
    const numAmount = parseFloat(safeAmount);
    if (isNaN(numAmount) || numAmount < 0) {
      throw new Error('Invalid amount');
    }
    
    // Use ethers.parseUnits with the safe amount
    return ethers.parseUnits(safeAmount, decimals);
  } catch (error) {
    console.error('Error parsing token amount:', error, { amount, decimals });
    throw new Error(`Failed to parse amount: ${amount}`);
  }
};

/**
 * Format amount for display based on token decimals with safe precision
 */
export const formatTokenAmount = (amount: string, marketId: MarketId): string => {
  const config = MARKET_CONFIG[marketId];
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) return '0';
  
  const maxDecimals = getMaxSafeDecimals(config.decimals);
  
  switch (config.decimals) {
    case 0:
      return numAmount.toFixed(0);
    case 2:
      return numAmount.toFixed(2);
    case 6:
      return numAmount.toFixed(Math.min(6, maxDecimals));
    case 18:
    default:
      return numAmount.toFixed(Math.min(6, maxDecimals));
  }
};

/**
 * Convert user input to contract-compatible string with precision control
 */
export const parseUserAmount = (amount: string, marketId: MarketId): string => {
  try {
    const config = MARKET_CONFIG[marketId];
    const safeAmount = truncateToSafeDecimals(amount, config.decimals);
    const numAmount = parseFloat(safeAmount);
    
    if (isNaN(numAmount) || numAmount < 0) {
      throw new Error('Invalid amount');
    }
    
    const contractAmount = numAmount * (10 ** config.decimals);
    return Math.floor(contractAmount).toString(); // Avoid scientific notation
  } catch (error) {
    console.error('Error parsing user amount:', error);
    throw error;
  }
};

/**
 * Format contract amount to display-friendly string
 */
export const formatContractAmount = (contractAmount: string, marketId: MarketId): string => {
  try {
    const config = MARKET_CONFIG[marketId];
    const numAmount = parseFloat(contractAmount);
    
    if (isNaN(numAmount)) return '0';
    
    const displayAmount = numAmount / (10 ** config.decimals);
    return formatTokenAmount(displayAmount.toString(), marketId);
  } catch (error) {
    console.error('Error formatting contract amount:', error);
    return '0';
  }
};

/**
 * Get input step size for forms with safe precision
 */
export const getInputStep = (marketId: MarketId): string => {
  const config = MARKET_CONFIG[marketId];
  const maxDecimals = getMaxSafeDecimals(config.decimals);
  
  switch (maxDecimals) {
    case 0:
      return '1';
    case 2:
      return '0.01';
    case 6:
      return '0.000001';
    case 8:
    default:
      return '0.00000001';
  }
};


// Validate decimal places of user input

export const validateDecimalPlaces = (
  amount: string,
  marketId: MarketId
): { isValid: boolean; error?: string; suggestedAmount?: string } => {
  try {
    const config = MARKET_CONFIG[marketId];
    const maxSafeDecimals = getMaxSafeDecimals(config.decimals);
    const decimalPlaces = amount.includes('.') ? amount.split('.')[1].length : 0;
    
    if (decimalPlaces > maxSafeDecimals) {
      const suggestedAmount = truncateToSafeDecimals(amount, config.decimals);
      return {
        isValid: false,
        error: `Maximum ${maxSafeDecimals} decimal places allowed for ${config.symbol}`,
        suggestedAmount
      };
    }
    
    // Additional validation for very small amounts
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && numAmount < (1 / (10 ** maxSafeDecimals))) {
      return {
        isValid: false,
        error: `Amount too small. Minimum: ${1 / (10 ** maxSafeDecimals)} ${config.symbol}`
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid amount format'
    };
  }
};
 
 
import BigNumber from 'bignumber.js';

/**
 * Format a number as USD currency string
 */
export function formatUSD(value: string | number, decimals: number = 2): string {
  if (!value) return '$0.00';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0.00';
  
  // For very small amounts, show more precision
  if (num > 0 && num < 0.01 && decimals === 2) {
    return `$${num.toFixed(6)}`;
  }
  
  // For large amounts, use compact notation
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  }
  
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  }
  
  return `$${num.toFixed(decimals)}`;
}

/**
 * Format a token amount with proper decimals
 */
export function formatTokenAmount(value: string | number, symbol: string, decimals: number = 4): string {
  if (!value) return `0.00 ${symbol}`;
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `0.00 ${symbol}`;
  
  // For very small amounts, show more precision
  if (num > 0 && num < 0.0001 && decimals === 4) {
    return `${num.toFixed(8)} ${symbol}`;
  }
  
  return `${num.toFixed(decimals)} ${symbol}`;
}

/**
 * Format percentage value
 */
export function formatPercent(value: string | number, decimals: number = 2): string {
  if (!value) return '0.00%';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00%';
  
  return `${num.toFixed(decimals)}%`;
}

/**
 * Format a large number with compact notation (K, M, B)
 */
export function formatCompactNumber(value: string | number, decimals: number = 2): string {
  if (!value) return '0';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(decimals)}B`;
  }
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(decimals)}M`;
  }
  
  if (num >= 1000) {
    return `${(num / 1000).toFixed(decimals)}K`;
  }
  
  return num.toFixed(decimals);
}

/**
 * Calculate USD value from token amount and price
 */
export function calculateUSDValue(tokenAmount: string | number, tokenPrice: string | number): string {
  const amountBN = new BigNumber(tokenAmount || 0);
  const priceBN = new BigNumber(tokenPrice || 0);
  
  return amountBN.multipliedBy(priceBN).toFixed(2);
}

/**
 * Parse a user input amount, handling various formats
 */
export function parseUserAmount(input: string): string {
  if (!input || input.trim() === '') return '0';
  
  // Remove any currency symbols or commas
  const cleaned = input.replace(/[,$%]/g, '');
  
  // Try to parse as number
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0) return '0';
  
  return num.toString();
}

/**
 * Check if an amount is valid for transactions
 */
export function isValidAmount(amount: string, maxAmount?: string): boolean {
  const amountNum = parseFloat(amount || '0');
  
  if (isNaN(amountNum) || amountNum <= 0) return false;
  
  if (maxAmount) {
    const maxNum = parseFloat(maxAmount);
    if (amountNum > maxNum) return false;
  }
  
  return true;
}

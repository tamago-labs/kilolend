import { ethers } from 'ethers';
import { Wallet } from '@kaiachain/ethers-ext/v6';
import { KAIA_MAINNET_CONFIG } from './tokenConfig';

// Create provider instance for KAIA testnet
export const getKaiaProvider = () => {
  return new ethers.JsonRpcProvider(KAIA_MAINNET_CONFIG.rpcUrl);
};

// Format different token amounts based on decimals
export const formatTokenAmount = (amount: bigint | string, decimals: number): string => {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;

  if (decimals === 0) {
    return amountBigInt.toString();
  }

  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = amountBigInt / divisor;
  const remainder = amountBigInt % divisor;

  if (remainder === BigInt(0)) {
    return whole.toString();
  }

  const fracPart = remainder.toString().padStart(decimals, '0');
  const fracTrimmed = fracPart.replace(/0+$/, '');

  return `${whole.toString()}.${fracTrimmed}`;
};

// Parse token amount to smallest unit
export const parseTokenAmount = (amount: string, decimals: number): bigint => {
  if (decimals === 0) {
    return BigInt(Math.floor(parseFloat(amount)));
  }

  const [whole = '0', frac = ''] = amount.split('.');
  const fracPadded = frac.padEnd(decimals, '0').slice(0, decimals);

  const wholeBigInt = BigInt(whole) * (BigInt(10) ** BigInt(decimals));
  const fracBigInt = BigInt(fracPadded);

  return wholeBigInt + fracBigInt;
};

// Get readable transaction error message
export const getTransactionErrorMessage = (error: any): string => {
  if (error?.reason) {
    return error.reason;
  }
  if (error?.message) {
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient KAIA balance for gas fees';
    }
    if (error.message.includes('user rejected')) {
      return 'Transaction cancelled by user';
    }
    return error.message;
  }
  return 'Transaction failed. Please try again.';
};

export const KAIA_SCAN_URL = "https://kaiascan.io"


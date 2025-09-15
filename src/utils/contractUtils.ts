import { ethers } from 'ethers';
import { KAIA_MAINNET_CONFIG } from './contractConfig';
import { safeParseTokenAmount } from './tokenUtils';

/**
 * Contract interaction utilities
 */

// Get ethers provider
export const getProvider = () => {
  return new ethers.JsonRpcProvider(KAIA_MAINNET_CONFIG.rpcUrl);
};

// Get signer from window.ethereum if available
export const getSigner = async (): Promise<ethers.JsonRpcSigner | null> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return signer;
    } catch (error) {
      console.error('Error getting signer:', error);
      return null;
    }
  }
  return null;
};

// Get contract instance
export const getContract = async (
  address: string, 
  abi: any[], 
  needsSigner: boolean = false
): Promise<ethers.Contract | null> => {
  try {
    if (needsSigner) {
      const signer = await getSigner();
      if (!signer) {
        throw new Error('No signer available');
      }
      return new ethers.Contract(address, abi, signer);
    } else {
      const provider = getProvider();
      return new ethers.Contract(address, abi, provider);
    }
  } catch (error) {
    console.error('Error creating contract instance:', error);
    return null;
  }
};

/**
 * Safe parse units based on decimals - replaces the original parseTokenAmount
 * This prevents precision errors by using our enhanced safeParseTokenAmount
 */
export const parseTokenAmount = (amount: string, decimals: number): bigint => {
  return safeParseTokenAmount(amount, decimals);
};

/**
 * Format units based on decimals
 */
export const formatTokenAmount = (amount: bigint, decimals: number): string => {
  try {
    return ethers.formatUnits(amount, decimals);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};

/**
 * Safe version of ethers.parseUnits that handles edge cases
 */
export const safeParseUnits = (value: string, decimals: number): bigint => {
  try {
    // Use our enhanced safe parsing
    return safeParseTokenAmount(value, decimals);
  } catch (error) {
    console.error('Error in safeParseUnits:', error);
    throw new Error(`Cannot parse amount: ${value} with ${decimals} decimals`);
  }
};

/**
 * Safe version of ethers.formatUnits that handles edge cases
 */
export const safeFormatUnits = (value: bigint, decimals: number): string => {
  try {
    return ethers.formatUnits(value, decimals);
  } catch (error) {
    console.error('Error in safeFormatUnits:', error);
    return '0';
  }
};

// Check if user is connected to correct network
export const checkNetwork = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      return network.chainId === BigInt(KAIA_MAINNET_CONFIG.chainId);
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }
  return false;
};

// Switch to Kaia Mainnet
export const switchToKaiaMainnet = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${KAIA_MAINNET_CONFIG.chainId.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${KAIA_MAINNET_CONFIG.chainId.toString(16)}`,
                chainName: KAIA_MAINNET_CONFIG.chainName,
                rpcUrls: [KAIA_MAINNET_CONFIG.rpcUrl],
                blockExplorerUrls: [KAIA_MAINNET_CONFIG.blockExplorer],
                nativeCurrency: KAIA_MAINNET_CONFIG.nativeCurrency,
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      return false;
    }
  }
  return false;
};

// Estimate gas for a transaction
export const estimateGas = async (
  contract: ethers.Contract,
  methodName: string,
  params: any[],
  options: any = {}
): Promise<bigint> => {
  try {
    const gasEstimate = await contract[methodName].estimateGas(...params, options);
    // Add 20% buffer
    return gasEstimate * BigInt(120) / BigInt(100);
  } catch (error) {
    console.error('Error estimating gas:', error);
    // Return a reasonable default gas limit
    return BigInt(600000);
  }
};

// Get gas price
export const getGasPrice = async (): Promise<bigint> => {
  try {
    const provider = getProvider();
    const feeData = await provider.getFeeData();
    return feeData.gasPrice || ethers.parseUnits('25', 'gwei');
  } catch (error) {
    console.error('Error getting gas price:', error);
    return ethers.parseUnits('25', 'gwei'); // Default to 25 Gwei
  }
};

// Wait for transaction confirmation
export const waitForTransaction = async (
  txHash: string,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt | null> => {
  try {
    const provider = getProvider();
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    return receipt;
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    return null;
  }
};

// Format address for display
export const formatAddress = (address: string, startLength: number = 6, endLength: number = 4): string => {
  if (!address) return '';
  if (address.length < startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

// Check if address is valid
export const isValidAddress = (address: string): boolean => {
  try {
    ethers.getAddress(address);
    return true;
  } catch {
    return false;
  }
};

// Convert wei to human readable format with safe parsing
export const formatWei = (wei: bigint, decimals: number = 18, precision: number = 4): string => {
  try {
    const formatted = ethers.formatUnits(wei, decimals);
    const num = parseFloat(formatted);
    if (isNaN(num)) return '0';
    return num.toFixed(precision);
  } catch (error) {
    console.error('Error formatting wei:', error);
    return '0';
  }
};

// Transaction status enum
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

// Transaction result interface
export interface TransactionResult {
  hash: string;
  status: TransactionStatus;
  receipt?: ethers.TransactionReceipt;
  error?: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
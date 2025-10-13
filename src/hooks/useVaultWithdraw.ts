import { useCallback, useState } from 'react';
import { ethers } from 'ethers';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useAppStore } from '@/stores/appStore';
import { KAIA_MAINNET_CONFIG } from '@/utils/tokenConfig';

const RPC_URL = KAIA_MAINNET_CONFIG.rpcUrl;
const VAULT_ADDRESS = '0xFe575cdE21BEb23d9D9F35e11E443d41CE8e68E3';

const VAULT_ABI = [
  // Withdrawal functions
  "function requestWithdrawal(uint256 depositIndex, uint256 shares) external returns (uint256 requestId)",
  "function claimWithdrawal(uint256 requestId) external",
  "function withdrawalRequests(uint256 requestId) external view returns (address user, uint256 depositIndex, uint256 shares, uint256 assets, uint256 timestamp, bool processed, bool claimed)",
  "function userRequests(address user, uint256 index) external view returns (uint256)",
  "function getUserDepositCount(address user) external view returns (uint256)",
  "function getUserDeposit(address user, uint256 index) external view returns (uint256, uint256, uint256, uint256, bool, address, bool, uint256, bool, uint256)"
];

export interface WithdrawalRequestData {
  requestId: number;
  user: string;
  depositIndex: number;
  shares: string;
  assets: string;
  timestamp: number;
  processed: boolean;
  claimed: boolean;
}

export interface VaultWithdrawResult {
  success: boolean;
  requestId?: number;
  hash?: string;
  error?: string;
}

/**
 * Hook for vault withdrawal operations
 * No mocks - real smart contract integration
 */
export function useVaultWithdraw() {
  const { sendTransaction } = useKaiaWalletSdk();
  const { account } = useWalletAccountStore();
  const { gasLimit } = useAppStore();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Request withdrawal from vault
   * This creates a withdrawal request that bot will process
   */
  const requestWithdrawal = useCallback(async (
    depositIndex: number,
    shares: string
  ): Promise<VaultWithdrawResult> => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    setIsWithdrawing(true);
    setError(null);

    try {
      console.log('🏦 Requesting withdrawal:', { depositIndex, shares, account });

      const sharesWei = ethers.parseEther(shares);
      const iface = new ethers.Interface(VAULT_ABI);
      const data = iface.encodeFunctionData('requestWithdrawal', [depositIndex, sharesWei]);

      const transaction: any = {
        from: account,
        to: VAULT_ADDRESS,
        data: data,
        gas: `0x${gasLimit.toString(16)}`
      };

      console.log('📤 Sending withdrawal request transaction');

      await sendTransaction([transaction]);

      return {
        success: true
      };

    } catch (error: any) {
      console.error('❌ Withdrawal request failed:', error);
      setError(error.message || 'Withdrawal request failed');
      
      return {
        success: false,
        error: error.message || 'Withdrawal request failed'
      };
    } finally {
      setIsWithdrawing(false);
    }
  }, [account, sendTransaction, gasLimit]);

  /**
   * Claim processed withdrawal
   */
  const claimWithdrawal = useCallback(async (
    requestId: number
  ): Promise<VaultWithdrawResult> => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    setIsWithdrawing(true);
    setError(null);

    try {
      console.log('💰 Claiming withdrawal:', { requestId, account });

      const iface = new ethers.Interface(VAULT_ABI);
      const data = iface.encodeFunctionData('claimWithdrawal', [requestId]);

      const transaction: any = {
        from: account,
        to: VAULT_ADDRESS,
        data: data,
        gas: `0x${gasLimit.toString(16)}`
      };

      console.log('📤 Sending claim transaction');

      await sendTransaction([transaction]);

      return {
        success: true
      };

    } catch (error: any) {
      console.error('❌ Claim failed:', error);
      setError(error.message || 'Claim failed');
      
      return {
        success: false,
        error: error.message || 'Claim failed'
      };
    } finally {
      setIsWithdrawing(false);
    }
  }, [account, sendTransaction, gasLimit]);

  /**
   * Get user's withdrawal requests
   */
  const getUserWithdrawalRequests = useCallback(async (
    userAddress: string
  ): Promise<WithdrawalRequestData[]> => {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

      // Get all request IDs for user (we'll need to track this or scan events)
      // For now, we'll return empty array - frontend can maintain local state
      // TODO: Add event scanning or backend API to track user requests
      
      return [];

    } catch (error) {
      console.error('Failed to get withdrawal requests:', error);
      return [];
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    requestWithdrawal,
    claimWithdrawal,
    getUserWithdrawalRequests,
    isWithdrawing,
    error,
    resetError
  };
}

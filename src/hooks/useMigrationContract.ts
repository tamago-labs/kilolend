'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { useAppStore } from '@/stores/appStore';
import { getContract } from '@/utils/contractUtils';

// Migration Bonus Contract ABI
const MIGRATION_BONUS_ABI = [
  // Read functions
  'function isHackathonEligible(address user) view returns (bool)',
  'function isV1Eligible(address user) view returns (bool)',
  'function getBonusStatus(address user) view returns (bool eligible, bool claimed, uint256 amount)',
  'function BONUS_AMOUNT() view returns (uint256)',
  'function hasClaimed(address user) view returns (bool)',
  'function getBalance() view returns (uint256)',
  'function getBonusesRemaining() view returns (uint256)',
  'function getTotalBonusesDistributed() view returns (uint256)',
  'function totalHackathonParticipants() view returns (uint256)',
  'function totalClaimed() view returns (uint256)',
  'function paused() view returns (bool)',
  'function admin() view returns (address)',
  'function v1Comptroller() view returns (address)',
  
  // Write functions
  'function claimBonus()',
    
  // Events
  'event BonusClaimed(address indexed user, uint256 amount)',
  'event HackathonEligibilitySet(address indexed user, bool eligible)',
  'event V1EligibilitySet(address indexed user, bool eligible)',
  'event ContractPaused(bool paused)',
  'event FundsDeposited(address indexed from, uint256 amount)',
];

// Migration Bonus Contract Address  
const MIGRATION_BONUS_ADDRESS = '0xd8fb9aFD5beeB7F5a703eBd4f2320AD40DAC9De7';

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
}

export interface BonusStatus {
  eligible: boolean;
  claimed: boolean;
  amount: string; // In KAIA
}

export interface MigrationStats {
  totalHackathonParticipants: number;
  totalClaimed: number;
  bonusesRemaining: number;
  totalBonusesDistributed: string;
  contractBalance: string;
  isPaused: boolean;
}

export const useMigrationContract = () => {
  const { account } = useWalletAccountStore();
  const { sendTransaction } = useKaiaWalletSdk();
  const { gasLimit } = useAppStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [bonusStatus, setBonusStatus] = useState<BonusStatus | null>(null);
  const [migrationStats, setMigrationStats] = useState<MigrationStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get contract instance
   */
  const getContractInstance = useCallback(async () => {
    return await getContract(MIGRATION_BONUS_ADDRESS, MIGRATION_BONUS_ABI, false);
  }, []);

  /**
   * Check if user is hackathon eligible
   */
  const checkHackathonEligibility = useCallback(async (userAddress: string): Promise<boolean> => {
    try {
      if (!userAddress) return false;
      
      const contract = await getContractInstance();
      if (!contract) {
        console.error('Failed to create contract instance');
        return false;
      }

      const isEligible = await contract.isHackathonEligible(userAddress);
      console.log(`Hackathon eligibility for ${userAddress}:`, isEligible);
      return isEligible;
    } catch (error) {
      console.error('Error checking hackathon eligibility:', error);
      return false;
    }
  }, [getContractInstance]);

  /**
   * Check if user has V1 activity
   */
  const checkV1Eligibility = useCallback(async (userAddress: string): Promise<boolean> => {
    try {
      if (!userAddress) return false;
      
      const contract = await getContractInstance();
      if (!contract) {
        console.error('Failed to create contract instance');
        return false;
      }

      const isEligible = await contract.isV1Eligible(userAddress);
      console.log(`V1 eligibility for ${userAddress}:`, isEligible);
      return isEligible;
    } catch (error) {
      console.error('Error checking V1 eligibility:', error);
      return false;
    }
  }, [getContractInstance]);

  /**
   * Get bonus status for user
   */
  const getBonusStatus = useCallback(async (userAddress?: string): Promise<BonusStatus | null> => {
    try {
      const addressToCheck = userAddress || account;
      if (!addressToCheck) {
        console.log('No address provided for bonus status check');
        return null;
      }

      const contract = await getContractInstance();
      if (!contract) {
        console.error('Failed to create contract instance');
        return null;
      }

      const [eligible, claimed, amount] = await contract.getBonusStatus(addressToCheck);
      
      const status: BonusStatus = {
        eligible,
        claimed,
        amount: ethers.formatEther(amount)
      };

      console.log(`Bonus status for ${addressToCheck}:`, status);
      setBonusStatus(status);
      return status;
    } catch (error) {
      console.error('Error getting bonus status:', error);
      return null;
    }
  }, [account, getContractInstance]);

  /**
   * Get migration statistics
   */
  const getMigrationStats = useCallback(async (): Promise<MigrationStats | null> => {
    try {
      const contract = await getContractInstance();
      if (!contract) {
        console.error('Failed to create contract instance');
        return null;
      }

      const [
        totalHackathonParticipants,
        totalClaimed,
        bonusesRemaining,
        totalBonusesDistributed,
        contractBalance,
        isPaused
      ] = await Promise.all([
        contract.totalHackathonParticipants(),
        contract.totalClaimed(),
        contract.getBonusesRemaining(),
        contract.getTotalBonusesDistributed(),
        contract.getBalance(),
        contract.paused()
      ]);

      const stats: MigrationStats = {
        totalHackathonParticipants: Number(totalHackathonParticipants),
        totalClaimed: Number(totalClaimed),
        bonusesRemaining: Number(bonusesRemaining),
        totalBonusesDistributed: ethers.formatEther(totalBonusesDistributed),
        contractBalance: ethers.formatEther(contractBalance),
        isPaused
      };

      console.log('Migration stats:', stats);
      setMigrationStats(stats);
      return stats;
    } catch (error) {
      console.error('Error getting migration stats:', error);
      return null;
    }
  }, [getContractInstance]);

  /**
   * Claim bonus
   */
  const claimBonus = useCallback(async (): Promise<TransactionResult> => {
    if (!account) {
      return {
        hash: '',
        status: 'failed',
        error: 'Wallet not connected'
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check eligibility first
      const status = await getBonusStatus(account);
      if (!status || !status.eligible) {
        throw new Error('You are not eligible to claim the bonus');
      }

      if (status.claimed) {
        throw new Error('You have already claimed your bonus');
      }

      // Create contract interface for encoding transaction data
      const iface = new ethers.Interface(MIGRATION_BONUS_ABI);
      const data = iface.encodeFunctionData('claimBonus', []);

      // Prepare transaction
      const transaction = {
        from: account,
        to: MIGRATION_BONUS_ADDRESS,
        value: '0x0',
        gas: `0x${gasLimit.toString(16)}`,
        data: data
      };

      console.log('Claiming bonus transaction:', transaction);

      // Send transaction through Kaia Wallet SDK
      await sendTransaction([transaction]);

      // Refresh status
      await Promise.all([
        getBonusStatus(account),
        getMigrationStats()
      ]);

      return {
        hash: '', // Hash not immediately available in LINE MiniDapp
        status: 'confirmed'
      };

    } catch (error: any) {
      let errorMessage = 'Failed to claim bonus';
      
      if (error.message.includes('NotEligible')) {
        errorMessage = 'You are not eligible for the bonus';
      } else if (error.message.includes('AlreadyClaimed')) {
        errorMessage = 'You have already claimed your bonus';
      } else if (error.message.includes('InsufficientBalance')) {
        errorMessage = 'Contract has insufficient balance';
      } else if (error.message.includes('ContractIsPaused')) {
        errorMessage = 'Claiming is currently paused';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      console.error('Error claiming bonus:', error);
      
      return {
        hash: '',
        status: 'failed',
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [account, sendTransaction, gasLimit, getBonusStatus, getMigrationStats]);
 
 

  // Load initial data when account changes
  useEffect(() => {
    if (account) {
      getBonusStatus(account);
      getMigrationStats();
    }
  }, [account]); // Only depend on account

  return {
    // State
    bonusStatus,
    migrationStats,
    isLoading,
    error,
    
    // Functions
    checkHackathonEligibility,
    checkV1Eligibility,
    getBonusStatus,
    getMigrationStats,
    claimBonus,
     
  };
};

'use client';

import { useState, useEffect } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';

// Migration Bonus Contract ABI - generated from MigrationBonus.sol
const MIGRATION_BONUS_ABI = [
  // Read functions
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'isHackathonEligible',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'isV1Eligible',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getBonusStatus',
    outputs: [
      { internalType: 'bool', name: 'eligible', type: 'bool' },
      { internalType: 'bool', name: 'claimed', type: 'bool' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'BONUS_AMOUNT',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  
  // Write functions
  {
    inputs: [],
    name: 'claimBonus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  
  // Admin functions
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'setHackathonEligibility',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'users', type: 'address[]' },
      { internalType: 'bool', name: 'eligible', type: 'bool' }
    ],
    name: 'setBatchHackathonEligibility',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'setV1Eligibility',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'newAdmin', type: 'address' }],
    name: 'setAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'withdrawKAIA',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'bool', name: 'eligible', type: 'bool' }
    ],
    name: 'HackathonEligibilitySet',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'bool', name: 'eligible', type: 'bool' }
    ],
    name: 'V1EligibilitySet',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'BonusClaimed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'bool', name: 'paused', type: 'bool' }],
    name: 'ContractPaused',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'oldAdmin', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newAdmin', type: 'address' }
    ],
    name: 'AdminUpdated',
    type: 'event'
  }
];

// Mock contract address - replace with actual deployed contract address
const MIGRATION_BONUS_ADDRESS = '0x0000000000000000000000000000000000000000';

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
}

export interface BonusStatus {
  eligible: boolean;
  claimed: boolean;
  amount: number;
}

export const useMigrationContract = () => {
  const { account } = useWalletAccountStore();
  const [isLoading, setIsLoading] = useState(false);

  // Mock implementation - replace with actual contract calls
  const checkHackathonEligibility = async (userAddress: string): Promise<boolean> => {
    if (!userAddress) return false;
    
    // Mock logic - replace with actual contract call
    const eligibleAddresses = [
      '0x1234567890123456789012345678901234567890', // Example addresses
      '0x2345678901234567890123456789012345678901',
      // Add actual eligible hackathon user addresses here
    ];
    
    return eligibleAddresses.includes(userAddress.toLowerCase());
  };

  const checkV1Eligibility = async (userAddress: string): Promise<boolean> => {
    if (!userAddress) return false;
    
    // Mock logic - replace with actual contract call
    // User is eligible for V1 if they have supplied to any V1 market
    // This would check if user has any positions in V1 contracts
    return false; // Default to false until user supplies to V1
  };

  const getBonusStatus = async (userAddress: string): Promise<BonusStatus> => {
    if (!userAddress) return { eligible: false, claimed: false, amount: 100 };
    
    // Mock logic - replace with actual contract call
    return {
      eligible: false,
      claimed: false,
      amount: 100 // 100 KAIA bonus
    };
  };

  const claimBonus = async (): Promise<TransactionResult> => {
    if (!account) {
      return {
        hash: '',
        status: 'failed',
        error: 'Wallet not connected'
      };
    }

    setIsLoading(true);

    try {
      // Mock transaction - replace with actual contract call
      console.log('Claiming 100 KAIA bonus for account:', account);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful transaction
      const mockHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      return {
        hash: mockHash,
        status: 'confirmed'
      };
    } catch (error) {
      console.error('Error claiming bonus:', error);
      return {
        hash: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to claim bonus'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkHackathonEligibility,
    checkV1Eligibility,
    getBonusStatus,
    claimBonus,
    isLoading
  };
};

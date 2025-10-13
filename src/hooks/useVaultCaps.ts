import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { KAIA_MAINNET_CONFIG } from '@/utils/tokenConfig';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';

const RPC_URL = KAIA_MAINNET_CONFIG.rpcUrl;
const VAULT_ADDRESS = '0xFe575cdE21BEb23d9D9F35e11E443d41CE8e68E3';

const VAULT_ABI = [
  "function maxDepositPerUser() external view returns (uint256)",
  "function maxTotalDeposits() external view returns (uint256)",
  "function totalManagedAssets() external view returns (uint256)",
  "function getUserDepositCapRemaining(address user) external view returns (uint256)",
  "function getTotalDepositCapRemaining() external view returns (uint256)",
  "function userTotalDeposits(address user) external view returns (uint256)"
];

interface VaultCaps {
  maxPerUser: string;
  maxTotal: string;
  currentTVL: string;
  userRemaining: string;
  vaultRemaining: string;
  userDeposited: string;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch vault deposit caps and remaining capacity
 * No mocks - everything from smart contract
 */
export function useVaultCaps(): VaultCaps {
  const { account } = useWalletAccountStore();
  const [caps, setCaps] = useState<VaultCaps>({
    maxPerUser: '1000',
    maxTotal: '500000',
    currentTVL: '0',
    userRemaining: '1000',
    vaultRemaining: '500000',
    userDeposited: '0',
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchCaps();
  }, [account]);

  const fetchCaps = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

      // Fetch all cap data in parallel
      const [
        maxPerUser,
        maxTotal,
        totalManaged,
        userRemaining,
        vaultRemaining,
        userDeposited
      ] = await Promise.all([
        vault.maxDepositPerUser(),
        vault.maxTotalDeposits(),
        vault.totalManagedAssets(),
        account ? vault.getUserDepositCapRemaining(account) : Promise.resolve(0),
        vault.getTotalDepositCapRemaining(),
        account ? vault.userTotalDeposits(account) : Promise.resolve(0)
      ]);

      setCaps({
        maxPerUser: ethers.formatEther(maxPerUser),
        maxTotal: ethers.formatEther(maxTotal),
        currentTVL: ethers.formatEther(totalManaged),
        userRemaining: ethers.formatEther(userRemaining),
        vaultRemaining: ethers.formatEther(vaultRemaining),
        userDeposited: ethers.formatEther(userDeposited),
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Failed to fetch vault caps:', error);
      setCaps(prev => ({
        ...prev,
        loading: false,
        error: (error as Error).message
      }));
    }
  };

  return caps;
}

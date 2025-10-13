import { useCallback, useState } from 'react';
import { ethers } from 'ethers';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useAppStore } from '@/stores/appStore';
import { KAIA_MAINNET_CONFIG } from '@/utils/tokenConfig';

const RPC_URL = KAIA_MAINNET_CONFIG.rpcUrl
const VAULT_ADDRESS = '0xFe575cdE21BEb23d9D9F35e11E443d41CE8e68E3';

const VAULT_ABI = [
  // For native KAIA deposits
  {
    "inputs": [],
    "name": "depositNative",
    "outputs": [{"internalType": "uint256", "name": "depositIndex", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  // View functions
  "function totalManagedAssets() external view returns (uint256)",
  "function sharePrice() external view returns (uint256)",
  "function getUserDepositCount(address user) external view returns (uint256)",
  "function getUserDeposit(address user, uint256 index) external view returns (uint256, uint256, uint256, uint256, bool, address, bool, uint256, bool, uint256)"
];

export interface VaultDepositResult {
  hash: string;
  depositIndex?: number;
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
}

export function useVaultDeposit() {
  const { sendTransaction } = useKaiaWalletSdk();
  const { account } = useWalletAccountStore();
  const { gasLimit } = useAppStore();
  const [isDepositing, setIsDepositing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Deposit native KAIA to vault 
   */
  const depositNative = useCallback(async (amount: string): Promise<VaultDepositResult> => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    setIsDepositing(true);
    setError(null);

    try {
      console.log('🏦 Depositing to vault:', { amount, account });

      // Parse amount to wei
      const amountWei = ethers.parseEther(amount);
      const hexValue = '0x' + amountWei.toString(16);

      // Create interface for encoding
      const iface = new ethers.Interface(VAULT_ABI);
      const data = iface.encodeFunctionData('depositNative', []);

      // Prepare transaction for LINE MiniDapp
      const transaction = {
        from: account,
        to: VAULT_ADDRESS,
        value: hexValue, // Send KAIA value
        gas: `0x${gasLimit.toString(16)}`,
        data: data
      };

      console.log('📤 Sending vault deposit transaction:', {
        to: VAULT_ADDRESS,
        value: hexValue,
        amount: `${amount} KAIA`
      });

      // Send through Kaia Wallet SDK
      await sendTransaction([transaction]);

      return {
        hash: '', // Hash not immediately available in LINE MiniDapp
        status: 'confirmed'
      };

    } catch (error: any) {
      console.error('❌ Vault deposit failed:', error);
      setError(error.message || 'Deposit failed');
      
      return {
        hash: '',
        status: 'failed',
        error: error.message || 'Deposit failed'
      };
    } finally {
      setIsDepositing(false);
    }
  }, [account, sendTransaction, gasLimit]);

  /**
   * Get user's deposit positions from vault
   */
  const getUserPositions = useCallback(async (userAddress: string) => {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

      // Get deposit count
      const depositCount = await vaultContract.getUserDepositCount(userAddress);
      const count = Number(depositCount);

      if (count === 0) {
        return [];
      }

      // Fetch all deposits
      const deposits = [];
      for (let i = 0; i < count; i++) {
        const deposit = await vaultContract.getUserDeposit(userAddress, i);
        
        // Parse deposit data
        // returns: (shares, assets, unlockBlock, lockDuration, isLocked, beneficiary, isBotDeposit, depositBlock, canWithdraw, lastExtendedBlock)
        deposits.push({
          depositIndex: i,
          shares: ethers.formatEther(deposit[0]),
          assets: ethers.formatEther(deposit[1]),
          unlockBlock: Number(deposit[2]),
          lockDuration: Number(deposit[3]),
          isLocked: deposit[4],
          beneficiary: deposit[5],
          isBotDeposit: deposit[6],
          depositBlock: Number(deposit[7]),
          canWithdraw: deposit[8],
          lastExtendedBlock: Number(deposit[9])
        });
      }

      return deposits;

    } catch (error) {
      console.error('Failed to get user positions:', error);
      return [];
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    depositNative,
    getUserPositions,
    isDepositing,
    error,
    resetError
  };
}
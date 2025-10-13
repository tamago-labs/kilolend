import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { KAIA_MAINNET_CONFIG } from '@/utils/tokenConfig';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';

/**
 * Hook to fetch real KAIA balance from wallet 
 */
export function useKaiaBalance() {
  const { account } = useWalletAccountStore();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      fetchBalance();
    } else {
      setBalance('0');
      setLoading(false);
    }
  }, [account]);

  const fetchBalance = async () => {
    if (!account) return;

    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(KAIA_MAINNET_CONFIG.rpcUrl);
      const balanceWei = await provider.getBalance(account);
      const balanceKaia = ethers.formatEther(balanceWei);
      setBalance(balanceKaia);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch KAIA balance:', err);
      setError((err as Error).message);
      setBalance('0');
    } finally {
      setLoading(false);
    }
  };

  // Format balance for display (with commas)
  const formattedBalance = parseFloat(balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  });

  return {
    balance, // Raw balance string
    formattedBalance, // Formatted for display
    loading,
    error,
    refetch: fetchBalance
  };
}

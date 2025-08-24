import { useCallback, useState, useEffect } from 'react';
import { checkNetwork, switchToKaiaTestnet } from '@/utils/contractUtils';

export interface NetworkState {
  isCorrectNetwork: boolean;
  isChecking: boolean;
  chainId: number | null;
}

interface NetworkHook {
  networkState: NetworkState;
  switchNetwork: () => Promise<boolean>;
  checkNetworkStatus: () => Promise<void>;
}

export const useNetwork = (): NetworkHook => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isCorrectNetwork: false,
    isChecking: true,
    chainId: null,
  });

  const checkNetworkStatus = useCallback(async () => {
    setNetworkState((prev) => ({ ...prev, isChecking: true }));

    try {
      const isCorrect = await checkNetwork();

      // Get current chain ID
      let chainId: number | null = null;
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
          chainId = parseInt(currentChainId, 16);
        } catch (error) {
          console.error('Error getting chain ID:', error);
        }
      }

      setNetworkState({
        isCorrectNetwork: isCorrect,
        isChecking: false,
        chainId,
      });
    } catch (error) {
      console.error('Error checking network:', error);
      setNetworkState({
        isCorrectNetwork: false,
        isChecking: false,
        chainId: null,
      });
    }
  }, []);

  const switchNetwork = useCallback(async (): Promise<boolean> => {
    try {
      const success = await switchToKaiaTestnet();
      if (success) {
        await checkNetworkStatus(); // Recheck network status after switching
      }
      return success;
    } catch (error) {
      console.error('Error switching network:', error);
      return false;
    }
  }, [checkNetworkStatus]);

  // Check network on mount and when chain changes
  useEffect(() => {
    checkNetworkStatus();

    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = () => checkNetworkStatus();

      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkNetworkStatus]);

  return {
    networkState,
    switchNetwork,
    checkNetworkStatus,
  };
};

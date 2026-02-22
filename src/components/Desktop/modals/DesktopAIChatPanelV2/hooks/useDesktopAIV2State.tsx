import { useState, useEffect } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { aiWalletService } from '@/services/aiWalletService';
import { MessageLimitUtil } from '../utils/messageLimit';
import { DEFAULT_CHAIN_ID, DEFAULT_AGENT } from '../types';
import type { DesktopAIV2State, AIWalletStatus, ChainConfig } from '../types';

export const useDesktopAIV2State = () => {
  const { account } = useWalletAccountStore();
  const [currentState, setCurrentState] = useState<DesktopAIV2State>('idle');
  const [walletStatus, setWalletStatus] = useState<AIWalletStatus | null>(null);
  const [selectedChain, setSelectedChain] = useState(DEFAULT_CHAIN_ID);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected chain from localStorage
  useEffect(() => {
    const savedChain = MessageLimitUtil.getSelectedChain();
    if (savedChain) {
      setSelectedChain(savedChain);
    } else {
      // Save default chain to localStorage
      MessageLimitUtil.saveSelectedChain(DEFAULT_CHAIN_ID);
    }
  }, []);

  // Check wallet status on component mount or account change
  useEffect(() => {
    if (account) {
      checkWalletStatus();
    } else {
      setCurrentState('idle');
      setWalletStatus(null);
      setError(null);
    }
  }, [account]);

  const checkWalletStatus = async () => {
    if (!account) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const status = await aiWalletService.getAIWalletStatus(account);
      setWalletStatus(status);
      
      if (status.hasWallet) {
        // User has AI wallet, go directly to chat
        setCurrentState('chat-active');
      } else {
        // No wallet, stay idle
        setCurrentState('idle');
      }
    } catch (err) {
      console.error('Failed to check wallet status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check wallet status');
      setCurrentState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const createAIWallet = async () => {
    if (!account) return;

    setIsLoading(true);
    setError(null);
    
    try {
      await aiWalletService.createAIWallet(account);
      await checkWalletStatus(); // Refresh status after creation
    } catch (err) {
      console.error('Failed to create AI wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to create AI wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const changeChain = (chainId: number) => {
    setSelectedChain(chainId);
    MessageLimitUtil.saveSelectedChain(chainId);
  };

  const goToChat = () => {
    setCurrentState('chat-active');
  };

  const reset = () => {
    setCurrentState('idle');
    setWalletStatus(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    // State
    currentState,
    walletStatus,
    selectedChain,
    isLoading,
    error,
    
    // Data
    agent: DEFAULT_AGENT,
    
    // Actions
    checkWalletStatus,
    createAIWallet,
    changeChain,
    goToChat,
    reset,
    
    // Computed
    hasWallet: walletStatus?.hasWallet || false,
    messageLimitStatus: MessageLimitUtil.getStatus(),
  };
};
import { useState, useEffect } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { aiWalletService } from '@/services/aiWalletService';
import { signatureService } from '@/services/signatureService';
import { AGENT_PRESETS } from '@/types/aiAgent';
import type { DesktopAIState, AgentPreset, AIModel, AIWalletStatus } from '../types';

const AI_MODELS: AIModel[] = [
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    description: 'Advanced reasoning for complex trading strategies',
    capabilityLevel: 'advanced',
    icon: '/images/claude-icon.png'
  },
  {
    id: 'aws-nova-pro',
    name: 'AWS Nova Pro',
    provider: 'Amazon Web Services',
    description: 'Reliable execution for straightforward trades',
    capabilityLevel: 'standard',
    icon: '/images/amazon-nova.png'
  }
];

export const useDesktopAIState = () => {
  const { account } = useWalletAccountStore();
  const [currentState, setCurrentState] = useState<DesktopAIState>('idle');
  const [walletStatus, setWalletStatus] = useState<AIWalletStatus | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<AgentPreset | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [selectedSession, setSelectedSession] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Signature verification states
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isCheckingSignature, setIsCheckingSignature] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);

  // Check wallet status on component mount or account change
  useEffect(() => {
    if (account) {
      checkWalletStatus();
    } else {
      setCurrentState('idle');
      setWalletStatus(null);
      resetSelection();
      setIsSignedIn(false);
    }
  }, [account]);

  // Check signature status when entering chat-active state
  useEffect(() => {
    if (currentState === 'chat-active' && account) {
      checkSignatureStatus();
    }
  }, [currentState, account]);

  const checkWalletStatus = async () => {
    if (!account) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const status = await aiWalletService.getAIWalletStatus(account);
      setWalletStatus(status);
      
      if (status.hasWallet && status.agentId && status.modelId) {
        // User has existing agent, go directly to chat
        const agentPreset = AGENT_PRESETS.find(preset => preset.id === status.agentId);
        const model = AI_MODELS.find(model => model.id === status.modelId);
        
        if (agentPreset && model) {
          setSelectedCharacter(agentPreset);
          setSelectedModel(model);
          setCurrentState('chat-active');
        } else {
          // Incomplete configuration, start from character selection
          setCurrentState('character-selection');
        }
      } else if (status.hasWallet) {
        // Has wallet but no agent, go to character selection
        setCurrentState('character-selection');
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

  const checkSignatureStatus = async () => {
    if (!account) return;
    
    setIsCheckingSignature(true);
    setSignatureError(null);
    
    try {
      const isValid = await signatureService.isSignatureValid(account);
      setIsSignedIn(isValid);
      
      if (!isValid) {
        setSignatureError('Your session has expired or is invalid. Please sign the message to continue.');
      }
    } catch (err) {
      console.error('Failed to check signature status:', err);
      setSignatureError('Failed to verify signature status.');
      setIsSignedIn(false);
    } finally {
      setIsCheckingSignature(false);
    }
  };

  const handleSignMessage = async () => {
    if (!account) return;

    setIsLoading(true);
    setSignatureError(null);
    
    try {

      const result = await signatureService.completeSignatureFlow(account);
      
      if (result.valid) {
        setIsSignedIn(true);
        setSignatureError(null);
      } else {
        throw new Error(result.message || 'Signature verification failed');
      }
    } catch (err) {
      console.error('Failed to sign message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign message';
      setSignatureError(errorMessage);
      setIsSignedIn(false);
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

  const createAgent = async () => {
    if (!account || !selectedCharacter || !selectedModel) return;

    setIsLoading(true);
    setError(null);
    
    try {
      await aiWalletService.createAgent(account, selectedCharacter.id, selectedModel.id);
      await checkWalletStatus(); // Refresh status after creation
    } catch (err) {
      console.error('Failed to create AI agent:', err);
      setError(err instanceof Error ? err.message : 'Failed to create AI agent');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedCharacter(null);
    setSelectedModel(null);
    setSelectedSession(1);
    setError(null);
    setSignatureError(null);
  };

  const goToCharacterSelection = () => {
    resetSelection();
    setCurrentState('character-selection');
  };

  const goToModelSelection = () => {
    if (selectedCharacter) {
      setCurrentState('model-selection');
    }
  };

  const goToChat = () => {
    if (selectedCharacter && selectedModel) {
      setCurrentState('chat-active');
    }
  };

  const reset = () => {
    setCurrentState('idle');
    setWalletStatus(null);
    resetSelection();
    setIsLoading(false);
    setIsSignedIn(false);
    setIsCheckingSignature(false);
  };

  return {
    // State
    currentState,
    walletStatus,
    selectedCharacter,
    selectedModel,
    selectedSession,
    isLoading,
    error,
    
    // Signature states
    isSignedIn,
    isCheckingSignature,
    signatureError,
    
    // Data
    availableCharacters: AGENT_PRESETS,
    availableModels: AI_MODELS,
    
    // Actions
    checkWalletStatus,
    createAIWallet,
    createAgent,
    setSelectedCharacter,
    setSelectedModel,
    setSelectedSession,
    goToCharacterSelection,
    goToModelSelection,
    goToChat,
    reset,
    
    // Signature actions
    checkSignatureStatus,
    handleSignMessage,
    
    // Computed
    hasWallet: walletStatus?.hasWallet || false,
    hasAgent: !!(walletStatus?.agentId && walletStatus?.modelId),
    canProceedToModel: !!selectedCharacter,
    canProceedToChat: !!(selectedCharacter && selectedModel),
  };
};

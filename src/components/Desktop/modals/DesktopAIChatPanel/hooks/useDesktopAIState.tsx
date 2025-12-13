import { useState, useEffect } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { aiWalletService } from '@/services/aiWalletService';
import { AGENT_PRESETS } from '@/types/aiAgent';
import type { DesktopAIState, AgentPreset, AIModel, AIWalletStatus } from '../types';

const AI_MODELS: AIModel[] = [
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    description: 'Advanced reasoning with aggressive trading strategies for maximum returns',
    riskLevel: 'aggressive',
    icon: '/images/claude-icon.png'
  },
  {
    id: 'aws-nova-pro',
    name: 'AWS Nova Pro',
    provider: 'Amazon Web Services',
    description: 'Conservative approach focused on capital preservation and steady growth',
    riskLevel: 'conservative',
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

  // Check wallet status on component mount or account change
  useEffect(() => {
    if (account) {
      checkWalletStatus();
    } else {
      setCurrentState('idle');
      setWalletStatus(null);
      resetSelection();
    }
  }, [account]);

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
    
    // Computed
    hasWallet: walletStatus?.hasWallet || false,
    hasAgent: !!(walletStatus?.agentId && walletStatus?.modelId),
    canProceedToModel: !!selectedCharacter,
    canProceedToChat: !!(selectedCharacter && selectedModel),
  };
};

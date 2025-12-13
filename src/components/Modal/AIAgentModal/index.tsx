import React, { useState } from 'react';
import { BaseModal } from '../BaseModal';
import { Container, StepContent, StepIndicator, StepDot } from './styled';
import { InfoStep } from './InfoStep';
import { CharacterSelectionStep } from './CharacterSelectionStep';
import { ModelSelectionStep } from './ModelSelectionStep';
import { ReviewStep } from './ReviewStep';
import { ChatInterface } from './ChatInterface';
import { AgentSettingsModal } from './AgentSettingsModal';
import { AIWalletBalancesModal } from './AIWalletBalancesModal';
import type { AgentPreset } from '@/types/aiAgent';
import { AGENT_PRESETS } from '@/types/aiAgent';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { aiWalletService } from '@/services/aiWalletService';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  riskLevel: 'aggressive' | 'conservative';
  icon: string;
}

type Step = 'info' | 'character' | 'model' | 'review' | 'chat';

export interface AIAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAgentModal: React.FC<AIAgentModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [selectedCharacter, setSelectedCharacter] = useState<AgentPreset | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [isAgentCreated, setIsAgentCreated] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBalancesModal, setShowBalancesModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(1);
  const { account, setAccount } = useWalletAccountStore();

  const resetModal = () => {
    setCurrentStep('info');
    setSelectedCharacter(null);
    setSelectedModel(null);
    setIsAgentCreated(false);
    setIsCreatingWallet(false);
    setCreationError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleCharacterSelect = (character: AgentPreset) => {
    setSelectedCharacter(character);
  };

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model);
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'character':
        setCurrentStep('model');
        break;
      case 'model':
        setCurrentStep('review');
        break;
      case 'review':
        handleCreateAgent();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'model':
        setCurrentStep('character');
        break;
      case 'review':
        setCurrentStep('model');
        break;
    }
  };

  const handleCreateAgent = async () => {
    if (!account || !selectedCharacter || !selectedModel) return;

    setIsCreatingWallet(true); // Reuse loading state
    setCreationError(null);
    try {
      const result = await aiWalletService.createAgent(account, selectedCharacter.id, selectedModel.id);
      setIsAgentCreated(true);
      setCurrentStep('chat');
    } catch (error) {
      console.error('Failed to create AI agent:', error);
      setCreationError(error instanceof Error ? error.message : 'Failed to create AI agent');
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleCreateAIWallet = async () => {
    if (!account) return;

    setIsCreatingWallet(true);
    setCreationError(null);
    try {
      const result = await aiWalletService.createAIWallet(account);
      // After successful creation, the InfoStep will automatically detect the new state
      // and allow proceeding to character selection
    } catch (error) {
      console.error('Failed to create AI wallet:', error);
      setCreationError(error instanceof Error ? error.message : 'Failed to create AI wallet');
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleProceedToCharacterSelection = () => {
    setCurrentStep('character');
  };

  const handleProceedToChat = async () => {
    if (!account) return;

    try {
      // Get the current AI wallet status to retrieve agent info
      const status = await aiWalletService.getAIWalletStatus(account);

      if (status.agentId && status.modelId) {
        // Find the agent preset based on the agentId
        const agentPreset = AGENT_PRESETS.find(preset => preset.id === status.agentId);

        // Find the model based on the modelId
        const availableModels = [
          {
            id: 'claude-sonnet-4.5',
            name: 'Claude Sonnet 4.5',
            provider: 'Anthropic',
            description: 'Advanced reasoning with aggressive trading strategies for maximum returns',
            riskLevel: 'aggressive' as const,
            icon: '/images/icon-robot.png'
          },
          {
            id: 'aws-nova-pro',
            name: 'AWS Nova Pro',
            provider: 'Amazon Web Services',
            description: 'Conservative approach focused on capital preservation and steady growth',
            riskLevel: 'conservative' as const,
            icon: '/images/icon-credit-card.png'
          }
        ];

        const model = availableModels.find(model => model.id === status.modelId);

        if (agentPreset && model) {
          setSelectedCharacter(agentPreset);
          setSelectedModel(model);
          setIsAgentCreated(true);
          setCurrentStep('chat');
        } else {
          setCreationError('Failed to load agent configuration: Agent or model not found');
        }
      } else {
        setCreationError('No existing agent found or agent configuration incomplete');
      }
    } catch (error) {
      console.error('Failed to load existing agent:', error);
      setCreationError(error instanceof Error ? error.message : 'Failed to load existing agent');
    }
  };

  const getStepNumber = (step: Step): number => {
    switch (step) {
      case 'character': return 1;
      case 'model': return 2;
      case 'review': return 3;
      case 'chat': return 4;
      default: return 1;
    }
  };

  const renderStepContent = () => {
    if (isAgentCreated && currentStep === 'chat') {
      return (
        <ChatInterface
          character={selectedCharacter!}
          model={selectedModel!}
          onClose={handleClose}
          onSettingsClick={handleSettingsClick}
          onBalancesClick={handleBalancesClick}
          onConversationDeleteSuccess={handleConversationDeleteSuccess}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
        />
      );
    }

    switch (currentStep) {
      case 'info':
        return (
          <InfoStep
            onProceed={handleProceedToCharacterSelection}
            onProceedToChat={handleProceedToChat}
            onClose={handleClose}
            onCreateAIWallet={handleCreateAIWallet}
            isCreatingWallet={isCreatingWallet}
            creationError={creationError}
          />
        );

      case 'character':
        return (
          <CharacterSelectionStep
            selectedCharacter={selectedCharacter}
            onCharacterSelect={handleCharacterSelect}
            onNext={handleNext}
          />
        );

      case 'model':
        return (
          <ModelSelectionStep
            selectedModel={selectedModel}
            onModelSelect={handleModelSelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 'review':
        return (
          <ReviewStep
            selectedCharacter={selectedCharacter!}
            selectedModel={selectedModel!}
            onConfirm={handleNext}
            onBack={handleBack}
            isCreatingWallet={isCreatingWallet}
            creationError={creationError}
          />
        );

      default:
        return null;
    }
  };

  const renderStepIndicator = () => {
    if (isAgentCreated || currentStep === 'info') return null; // Don't show steps in chat mode or info step

    const steps: Step[] = ['character', 'model', 'review'];

    return (
      <StepIndicator>
        {steps.map((step) => {
          const stepNumber = getStepNumber(step);
          const isCompleted = getStepNumber(currentStep) > stepNumber;
          const isActive = currentStep === step;

          return (
            <StepDot
              key={step}
              $active={isActive}
              $completed={isCompleted}
            />
          );
        })}
      </StepIndicator>
    );
  };

  const getModalTitle = () => {
    if (isAgentCreated) return "Your AI Agent";
    if (currentStep === 'info') return "AI Agent Setup";
    return "Your AI Agent";
  };

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
  };

  const handleSettingsClose = () => {
    setShowSettingsModal(false);
  };

  const handleBalancesClick = () => {
    setShowBalancesModal(true);
  };

  const handleBalancesClose = () => {
    setShowBalancesModal(false);
  };

  const handleDeleteSuccess = () => {
    handleClose(); // Close the main modal after successful deletion
  };

  const handleConversationDeleteSuccess = () => {
    handleClose();
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title={getModalTitle()}
        isFull={true}
      >
        <Container>
          {renderStepIndicator()}
          <StepContent>
            {renderStepContent()}
          </StepContent>
        </Container>
      </BaseModal>

      {showSettingsModal && selectedCharacter && selectedModel && (
        <AgentSettingsModal
          character={selectedCharacter}
          model={selectedModel}
          selectedSession={selectedSession}
          onClose={handleSettingsClose}
          onDeleteSuccess={handleDeleteSuccess}
          onConversationDeleteSuccess={handleConversationDeleteSuccess}
        />
      )}

      {showBalancesModal && (
        <AIWalletBalancesModal
          onClose={handleBalancesClose}
        />
      )}
    </>
  );
};

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDesktopAIState } from './hooks/useDesktopAIState';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { IdleState } from './states/IdleState';
import { CharacterSelectionState } from './states/CharacterSelectionState';
import { ModelSelectionState } from './states/ModelSelectionState';
import { ChatActiveState } from './states/ChatActiveState';
import { aiChatServiceV1 } from '@/services/AIChatServiceV1';
import { AgentSettingsModal } from '@/components/Modal/AIAgentModal/AgentSettingsModal';
import { AIWalletBalancesModal } from '@/components/Modal/AIAgentModal/AIWalletBalancesModal';
import type { DesktopAIChatPanelProps } from './types';
import type { AgentPreset } from '@/types/aiAgent';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  riskLevel: 'aggressive' | 'conservative';
  icon: string;
}

const PanelContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 480px;
  height: 85vh;
  max-height: 900px;
  min-height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 1000;
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(100%)'};
  opacity: ${props => props.$isOpen ? 1 : 0};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  @media (max-height: 800px) {
    height: 90vh;
  }
  
  @media (max-height: 600px) {
    height: 95vh;
    min-height: 500px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(0, 0, 0, 0.2);
    color: #1e293b;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ToggleButton = styled.button<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #06C755, #059212);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  transition: all 0.3s ease;
  z-index: 999;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(6, 199, 85, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${props => props.$isOpen && `
    transform: scale(0);
    opacity: 0;
    pointer-events: none;
  `}
`;

const AIIcon = styled.img`
  width: 28px;
  height: 28px;
  filter: brightness(0) invert(1);
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #ef4444;
  font-size: 24px;
`;

const ErrorMessage = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const ErrorDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
  line-height: 1.4;
`;

const RetryButton = styled.button`
  padding: 8px 16px;
  background: #06C755;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #059212;
  }
`;

const ErrorMessageBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #dc2626;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DesktopAIChatPanel: React.FC<DesktopAIChatPanelProps> = ({
  isOpen,
  onToggle
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBalancesModal, setShowBalancesModal] = useState(false);
  const { account } = useWalletAccountStore();
  
  const {
    currentState,
    walletStatus,
    selectedCharacter,
    selectedModel,
    selectedSession,
    isLoading,
    error,
    availableCharacters,
    availableModels,
    createAIWallet,
    createAgent,
    setSelectedCharacter,
    setSelectedModel,
    setSelectedSession,
    goToCharacterSelection,
    goToModelSelection,
    goToChat,
    reset,
    hasWallet,
    hasAgent,
    canProceedToModel,
    canProceedToChat,
  } = useDesktopAIState();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
      // Ctrl/Cmd + K to toggle AI chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  const handleSendMessage = async (message: string) => {
    if (!selectedCharacter || !account) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Create a temporary AI message for streaming
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage = {
        id: aiMessageId,
        type: 'agent' as const,
        content: '',
        timestamp: new Date(),
        agent: selectedCharacter,
        isStreaming: true
      };

      setMessages(prev => [...prev, aiMessage]);

      // Stream the AI response
      let fullResponse = '';
      await aiChatServiceV1.streamChat(
        message,
        account,
        selectedSession,
        {
          onChunk: (chunk: string) => {
            fullResponse += chunk;
            setMessages(prev => 
              prev.map(msg => 
                msg.id === aiMessageId 
                  ? { ...msg, content: fullResponse }
                  : msg
              )
            );
          },
          onComplete: async () => {
            // Mark streaming as complete
            setMessages(prev => 
              prev.map(msg => 
                msg.id === aiMessageId 
                  ? { ...msg, isStreaming: false }
                  : msg
              )
            );
            
            // Reload message history to get the final state from backend
            try {
              const response = await aiChatServiceV1.getMessages(account, selectedSession);
              const chatMessages = response.messages.map((msg: any) => ({
                id: `msg-${msg.message_id}`,
                type: msg.role === 'user' ? 'user' as const : 'agent' as const,
                content: msg.content,
                timestamp: new Date(msg.created_at),
                agent: selectedCharacter
              }));
              setMessages(chatMessages);
            } catch (error) {
              console.error('Failed to reload messages after streaming:', error);
            }
          },
          onError: (error: Error) => {
            console.error('Streaming error:', error);
            // Remove the streaming message and add an error message
            setMessages(prev => {
              const filtered = prev.filter(msg => !msg.isStreaming);
              return [
                ...filtered,
                {
                  id: (Date.now() + 2).toString(),
                  type: 'agent' as const,
                  content: 'Sorry, I encountered an error while processing your message. Please try again.',
                  timestamp: new Date(),
                  agent: selectedCharacter,
                  isError: true
                }
              ];
            });
          }
        }
      );

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove the streaming message and add an error message
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isStreaming);
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            type: 'agent' as const,
            content: 'Sorry, I encountered an error while processing your message. Please try again.',
            timestamp: new Date(),
            agent: selectedCharacter,
            isError: true
          }
        ];
      });
    }
  };


  const handleSettings = () => {
    setShowSettingsModal(true);
  };

  const handleBalancesClick = () => {
    setShowBalancesModal(true);
  };

  const handleSettingsClose = () => {
    setShowSettingsModal(false);
  };

  const handleBalancesClose = () => {
    setShowBalancesModal(false);
  };

  const handleDeleteSuccess = () => {
    // Close the desktop panel after successful agent deletion
    onToggle();
    reset();
  };

  const handleConversationDeleteSuccess = () => {
    // Clear messages after conversation deletion
    setMessages([]);
  };

  const renderCurrentState = () => {
    // Show error message for non-error states
    if (error && currentState !== 'error') {
      return (
        <>
          <ErrorMessageBox>
            <span>⚠️</span>
            {error}
          </ErrorMessageBox>
          {renderStateContent()}
        </>
      );
    }

    return renderStateContent();
  };

  const renderStateContent = () => {
    switch (currentState) {
      case 'idle':
        return (
          <IdleState
            onCreateWallet={createAIWallet}
            onContinueToSetup={goToCharacterSelection}
            isLoading={isLoading}
            onToggle={onToggle}
          />
        );

      case 'character-selection':
        return (
          <CharacterSelectionState
            agents={availableCharacters}
            selectedAgent={selectedCharacter}
            onAgentSelect={setSelectedCharacter}
            onNext={goToModelSelection}
            onBack={reset}
            isLoading={isLoading}
          />
        );

      case 'model-selection':
        return (
          <ModelSelectionState
            models={availableModels}
            selectedModel={selectedModel}
            selectedAgent={selectedCharacter!}
            onModelSelect={setSelectedModel}
            onNext={createAgent}
            onBack={goToCharacterSelection}
            isLoading={isLoading}
          />
        );

      case 'chat-active':
        return (
          <ChatActiveState
            agent={selectedCharacter!}
            messages={messages}
            onSendMessage={handleSendMessage}
            onSettings={handleSettings}
            onBalancesClick={handleBalancesClick}
            onMessagesUpdate={setMessages}
            isLoading={isLoading}
          />
        );

      case 'loading':
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            fontSize: '14px',
            color: '#64748b'
          }}>
            Loading...
          </div>
        );

      case 'error':
        return (
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorMessage>Something went wrong</ErrorMessage>
            <ErrorDescription>{error || 'An unexpected error occurred'}</ErrorDescription>
            <RetryButton onClick={reset}>
              Try Again
            </RetryButton>
          </ErrorContainer>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <PanelContainer $isOpen={isOpen}>
        <CloseButton onClick={onToggle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </CloseButton>
        {renderCurrentState()}
      </PanelContainer>

      <ToggleButton $isOpen={isOpen} onClick={onToggle}>
        <AIIcon src="/images/icon-robot.png" alt="AI Agent" />
      </ToggleButton>

      {/* Settings Modal */}
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

      {/* Balances Modal */}
      {showBalancesModal && (
        <AIWalletBalancesModal
          onClose={handleBalancesClose}
        />
      )}
    </>
  );
};

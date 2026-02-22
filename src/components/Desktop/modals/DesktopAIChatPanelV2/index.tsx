import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDesktopAIV2State } from './hooks/useDesktopAIV2State';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { IdleStateV2 } from './states/IdleStateV2';
import { ChatActiveStateV2 } from './states/ChatActiveStateV2';
import { AISettingsModalV2 } from './modals/AISettingsModalV2';
import { MessageLimitUtil } from './utils/messageLimit';
import { aiChatServiceV2 } from '@/services/AIChatServiceV2';
import type { ChatMessage } from './types';

interface DesktopAIChatPanelV2Props {
  isOpen: boolean;
  onToggle: () => void;
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

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #06C755;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
`;

export const DesktopAIChatPanelV2: React.FC<DesktopAIChatPanelV2Props> = ({
  isOpen,
  onToggle
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const { account } = useWalletAccountStore();
  
  const {
    currentState,
    walletStatus,
    selectedChain,
    isLoading,
    error,
    agent,
    createAIWallet,
    changeChain,
    reset,
    hasWallet,
    messageLimitStatus,
  } = useDesktopAIV2State();

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

  // Load messages from backend when component mounts
  useEffect(() => { 
    if (isOpen && account && hasWallet) {
      loadMessageHistory();
    }
  }, [account, hasWallet, isOpen]);

  const loadMessageHistory = async () => {
    if (!account) return;

    try {
      const response = await aiChatServiceV2.getMessages(account, selectedChain);
 
      const chatMessages = response.messages.map((msg: any) => ({
        id: `msg-${msg.message_id}`,
        type: msg.role === 'user' ? 'user' as const : 'agent' as const,
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load message history:', error);
      // Fallback to localStorage if backend fails
      const savedMessages = MessageLimitUtil.loadMessages(account);
      setMessages(savedMessages);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!account || !hasWallet) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsMessageLoading(true);

    try {
      // Save to localStorage
      MessageLimitUtil.saveMessages(account, newMessages);
      
      // The actual message sending is handled by ChatActiveStateV2
      // This is just a placeholder for the interface
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsMessageLoading(false);
    }
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
  };

  const handleSettingsClose = () => {
    setShowSettingsModal(false);
  };

  const handleClearChatHistory = async () => {
    if (!account) return;

    try {
      // Call API to clear conversation history
      await aiChatServiceV2.deleteMessages(account, selectedChain);
      
      // Clear local state and localStorage
      setMessages([]);
      MessageLimitUtil.clearMessages(account);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      // Still clear local state even if API fails
      setMessages([]);
      MessageLimitUtil.clearMessages(account);
    }
  };

  const handleChainChange = (chainId: number) => {
    changeChain(chainId);
    // Clear messages when switching chains
    if (account) {
      setMessages([]);
      MessageLimitUtil.clearMessages(account);
    }
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
          <IdleStateV2
            onCreateWallet={createAIWallet}
            isLoading={isLoading}
            onToggle={onToggle}
            account={account}
          />
        );

      case 'chat-active':
        return (
          <ChatActiveStateV2
            agent={agent}
            messages={messages}
            onSendMessage={handleSendMessage}
            onSettings={handleSettings}
            onMessagesUpdate={setMessages}
            isLoading={isMessageLoading}
            selectedChain={selectedChain}
            userAddress={account || ''}
            messageLimitStatus={messageLimitStatus}
          />
        );

      case 'loading':
        return (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading AI Assistant...</LoadingText>
          </LoadingContainer>
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
      <AISettingsModalV2
        isOpen={showSettingsModal}
        onClose={handleSettingsClose}
        selectedChain={selectedChain}
        onChainChange={handleChainChange}
        messageLimitStatus={messageLimitStatus}
        onClearChatHistory={handleClearChatHistory}
      />
    </>
  );
};
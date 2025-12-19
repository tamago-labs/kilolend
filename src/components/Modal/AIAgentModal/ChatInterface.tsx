import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import type { AgentPreset } from '@/types/aiAgent';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { aiWalletService } from '@/services/aiWalletService';
import { aiChatServiceV1, TextProcessor, type MessageResponse } from '@/services/AIChatServiceV1';
import { MarkdownRenderer } from './MarkdownRenderer';
import { EmptyState } from './EmptyState';
import { SigningPrompt } from './SigningPrompt';
import { useModalSigningState } from './hooks/useModalSigningState';
import {
  ChatContainer,
  ChatHeader,
  ChatTitle,
  ChatMessages,
  Message,
  MessageBubble,
  ChatInputContainer,
  ChatInputWrapper,
  ChatInput,
  SendButton,
  SettingsButton,
  BalancesButton,
  SessionSelector,
  LoadingIndicator
} from './styled';

// Status indicator components
const AgentStatus = styled.span<{ $status: 'online' | 'signing-required' | 'loading' | 'error' }>`
  font-size: 12px;
  color: ${props => {
    switch (props.$status) {
      case 'online': return '#06C755';
      case 'signing-required': return '#f59e0b';
      case 'loading': return '#64748b';
      case 'error': return '#dc2626';
      default: return '#64748b';
    }
  }};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusDot = styled.div<{ $status: 'online' | 'signing-required' | 'loading' | 'error' }>`
  width: 6px;
  height: 6px;
  background: ${props => {
    switch (props.$status) {
      case 'online': return '#06C755';
      case 'signing-required': return '#f59e0b';
      case 'loading': return '#64748b';
      case 'error': return '#dc2626';
      default: return '#64748b';
    }
  }};
  border-radius: 50%;
  animation: ${props => props.$status === 'online' ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const HistoryLoadingIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
  font-size: 14px;
  
  span {
    margin-bottom: 8px;
  }
`;

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilityLevel: 'advanced' | 'standard';
  icon: string;
}

interface ChatInterfaceProps {
  character: AgentPreset;
  model: AIModel;
  onClose: () => void;
  onSettingsClick: () => void;
  onBalancesClick: () => void;
  onConversationDeleteSuccess: () => void;
  selectedSession: number;
  setSelectedSession: (session: number) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  character,
  model,
  onClose,
  onSettingsClick,
  onBalancesClick,
  onConversationDeleteSuccess,
  selectedSession,
  setSelectedSession,
}) => {
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingText, setCurrentStreamingText] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { account } = useWalletAccountStore();
  
  // Signing state management
  const {
    isSignedIn,
    isCheckingSignature,
    signingStatus,
    signatureError,
    handleSignMessage,
    clearError
  } = useModalSigningState();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load message history from backend
  const loadMessageHistory = async () => {
    if (!account || !isSignedIn) return;

    setIsLoadingHistory(true);
    try {
      const response = await aiChatServiceV1.getMessages(account, selectedSession);
      
      // Convert backend message format to frontend ChatMessage format
      const chatMessages: ChatMessage[] = response.messages.map((msg: MessageResponse) => ({
        id: `msg-${msg.message_id}`,
        text: msg.role === 'user' ? msg.content : msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.created_at)
      }));

      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load message history:', error);
      // Don't show error to user, just start with empty chat
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load messages on component mount and when account or session changes
  useEffect(() => {
    if (account && isSignedIn) {
      loadMessageHistory();
    }
  }, [account, selectedSession, isSignedIn]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingText]);

  // Handle suggestion clicks from EmptyState
  useEffect(() => {
    const handleSuggestionClick = (event: CustomEvent) => {
      setInputText(event.detail);
    };

    window.addEventListener('suggestionClick', handleSuggestionClick as EventListener);
    return () => {
      window.removeEventListener('suggestionClick', handleSuggestionClick as EventListener);
    };
  }, []);


  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !account || !isSignedIn) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    const aiMessageId = `ai-${Date.now()}`;
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      text: '',
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInputText('');
    setIsLoading(true);
    setCurrentStreamingText('');

    try {
      await aiChatServiceV1.streamChat(
        inputText.trim(),
        account,
        selectedSession,
        {
          onChunk: (chunk: string) => {
            setMessages(prev => {
              const updatedMessages = prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, text: TextProcessor.processChunk(chunk, msg.text) }
                  : msg
              );

              // Update current streaming text for the loading indicator
              const currentAIMessage = updatedMessages.find(msg => msg.id === aiMessageId);
              if (currentAIMessage) {
                setCurrentStreamingText(currentAIMessage.text);
              }

              return updatedMessages;
            });
          },
          onComplete: () => {
            setIsLoading(false);
            setCurrentStreamingText('');
            // Reload message history to get the final state
            loadMessageHistory();
          },
          onError: (error: Error) => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, text: `Error: ${error.message}` }
                  : msg
              )
            );
            setIsLoading(false);
            setCurrentStreamingText('');
          }
        }
      );
    } catch (error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, text: `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}` }
            : msg
        )
      );
      setIsLoading(false);
      setCurrentStreamingText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteSuccess = () => {
    onClose(); // Close the chat modal after successful deletion
  };

  const getStatusText = () => {
    switch (signingStatus) {
      case 'loading': return 'Checking...';
      case 'online': return 'Online';
      case 'signing-required': return 'Signing Required';
      case 'error': return 'Error';
      default: return 'Offline';
    }
  };

  return (
    <ChatContainer>
      <ChatHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={character.image}
            alt={character.name}
            onError={(e) => {
              e.currentTarget.src = '/images/icon-ai.png'; // fallback image
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <div>
            <ChatTitle>{character.name}</ChatTitle>
            <AgentStatus $status={signingStatus}>
              <StatusDot $status={signingStatus} />
              {getStatusText()}
            </AgentStatus>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Session:</span>
            <SessionSelector
              value={selectedSession}
              onChange={(e) => setSelectedSession(Number(e.target.value))}
              disabled={isLoading || isLoadingHistory || !isSignedIn}
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </SessionSelector>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <BalancesButton
              onClick={onBalancesClick}
              disabled={isLoading || !isSignedIn}
              title="AI Wallet Balances"
            >
              💰
            </BalancesButton>
            <SettingsButton
              onClick={onSettingsClick}
              disabled={isLoading || !isSignedIn}
              title="Agent Settings"
            >
              ⚙️
            </SettingsButton>
          </div>
        </div>
      </ChatHeader>

      <ChatMessages>
        {!isSignedIn ? (
          <SigningPrompt
            agentName={character.name}
            isLoading={isCheckingSignature}
            signatureError={signatureError}
            onSignMessage={handleSignMessage}
          />
        ) : isLoadingHistory ? (
          <HistoryLoadingIndicator>
            <span>Loading conversation history...</span>
            <LoadingIndicator />
          </HistoryLoadingIndicator>
        ) : (
          <>
            {messages.length === 0 && !isLoading && (
              <EmptyState characterName={character.name} />
            )}

            {messages.map((message) => {
              // Skip rendering empty user messages
              if (message.isUser && (!message.text || message.text.trim() === '')) {
                return null;
              }
              
              return (
                <Message key={message.id} $isUser={message.isUser}>
                  <MessageBubble $isUser={message.isUser} $isCompact={true}>
                    {message.isUser ? (
                      message.text
                    ) : (
                      <MarkdownRenderer 
                        content={message.text} 
                        isUser={false} 
                        compact={true}
                      />
                    )}
                  </MessageBubble>
                </Message>
              );
            })}

            {isLoading && !currentStreamingText && (
              <Message $isUser={false}>
                <MessageBubble $isUser={false} $isCompact={true}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{character.name} is processing</span>
                    <LoadingIndicator />
                  </span>
                </MessageBubble>
              </Message>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </ChatMessages>

      <ChatInputContainer>
        <ChatInputWrapper>
          <ChatInput
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isSignedIn ? "Ask me anything about your wallet, trading, or portfolio..." : "Please sign in to chat..."}
            disabled={isLoading || !isSignedIn}
          />
          <SendButton
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading || !isSignedIn}
          >
            Send
          </SendButton>
        </ChatInputWrapper>
      </ChatInputContainer>
    </ChatContainer>
  );
};

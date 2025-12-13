import React, { useState, useRef, useEffect } from 'react';
import type { AgentPreset } from '@/types/aiAgent';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { aiWalletService } from '@/services/aiWalletService';
import { aiChatServiceV1, TextProcessor, type MessageResponse } from '@/services/AIChatServiceV1';
import { MarkdownRenderer } from './MarkdownRenderer';
import { EmptyState } from './EmptyState';
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
  riskLevel: 'aggressive' | 'conservative';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load message history from backend
  const loadMessageHistory = async () => {
    if (!account) return;

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
    if (account) {
      loadMessageHistory();
    }
  }, [account, selectedSession]);

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
    if (!inputText.trim() || isLoading || !account) return;

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
          <ChatTitle>{character.name}</ChatTitle>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Session:</span>
            <SessionSelector
              value={selectedSession}
              onChange={(e) => setSelectedSession(Number(e.target.value))}
              disabled={isLoading || isLoadingHistory}
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
              disabled={isLoading}
              title="AI Wallet Balances"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
              </svg>
            </BalancesButton>
            <SettingsButton
              onClick={onSettingsClick}
              disabled={isLoading}
              title="Agent Settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24"></path>
              </svg>
            </SettingsButton>
          </div>
        </div>
      </ChatHeader>

      <ChatMessages>
        {messages.length === 0 && !isLoading && !isLoadingHistory && (
          <EmptyState characterName={character.name} />
        )}

        {messages.map((message) => (
          <Message key={message.id} $isUser={message.isUser}>
            <MessageBubble $isUser={message.isUser} $isCompact={true}>
              {message.isUser ? (
                message.text || "🤔"
              ) : (
                <MarkdownRenderer 
                  content={message.text} 
                  isUser={false} 
                  compact={true}
                />
              )}
            </MessageBubble>
          </Message>
        ))}

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

        <div ref={messagesEndRef} />
      </ChatMessages>

      <ChatInputContainer>
        <ChatInputWrapper>
          <ChatInput
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your wallet, trading, or portfolio..."
            disabled={isLoading}
          />
          <SendButton
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            Send
          </SendButton>
        </ChatInputWrapper>
      </ChatInputContainer>
    </ChatContainer>
  );
};

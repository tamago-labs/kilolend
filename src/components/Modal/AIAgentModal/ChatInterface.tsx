import React, { useState, useRef, useEffect } from 'react';
import type { AgentPreset } from '@/types/aiAgent';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { aiWalletService } from '@/services/aiWalletService';
import { aiChatServiceV1, TextProcessor, type MessageResponse } from '@/services/AIChatServiceV1';
// import { MarkdownRenderer } from './MarkdownRenderer';
import { EmptyState } from './EmptyState';
import { AgentSettingsModal } from './AgentSettingsModal';
import { AIWalletBalancesModal } from './AIWalletBalancesModal';
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
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  character,
  model,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingText, setCurrentStreamingText] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBalancesModal, setShowBalancesModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { account } = useWalletAccountStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Simple markdown parser for bold (**text**), italic (*text*), and headers (# ## ###)
  const parseSimpleMarkdown = (text: string): string => {
    if (!text) return '';
    
    // First escape HTML to prevent XSS
    let processed = text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#39;');
    // Process headers (# ## ###) - all become bold
    processed = processed.replace(/^(#{1,3})\s+(.+)$/gm, '<strong>$2</strong>');
    
    // Process bold text (**text**)
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Process italic text (*text*)
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return processed;
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

  const handleBalancesClick = () => {
    setShowBalancesModal(true);
  };

  const handleBalancesClose = () => {
    setShowBalancesModal(false);
  };

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

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
  };

  const handleSettingsClose = () => {
    setShowSettingsModal(false);
  };

  const handleDeleteSuccess = () => {
    onClose(); // Close the chat modal after successful deletion
  };

  const handleConversationDeleteSuccess = () => {
    // Reload message history after successful conversation deletion
    loadMessageHistory();
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
              onClick={handleBalancesClick}
              disabled={isLoading}
              title="AI Wallet Balances"
            >
              💰
            </BalancesButton>
            <SettingsButton
              onClick={handleSettingsClick}
              disabled={isLoading}
              title="Agent Settings"
            >
              ⚙️
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
            <MessageBubble $isUser={message.isUser}>
              {message.isUser ? (
                message.text || "🤔"
              ) : (
                <span 
                  dangerouslySetInnerHTML={{ 
                    __html: parseSimpleMarkdown(message.text) 
                  }} 
                />
              )}
            </MessageBubble>
          </Message>
        ))}

        {isLoading && !currentStreamingText && (
          <Message $isUser={false}>
            <MessageBubble $isUser={false}>
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

      {showSettingsModal && (
        <AgentSettingsModal
          character={character}
          model={model}
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
    </ChatContainer>
  );
};

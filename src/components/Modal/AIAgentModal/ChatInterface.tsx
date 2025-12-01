import React, { useState, useRef, useEffect } from 'react';
import type { AgentPreset } from '@/types/aiAgent';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { aiWalletService } from '@/services/aiWalletService';
import { aiChatServiceV1, TextProcessor } from '@/services/AIChatServiceV1';
import { MarkdownRenderer } from './MarkdownRenderer';
import { EmptyState } from './EmptyState';
import { AgentSettingsModal } from './AgentSettingsModal';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { account } = useWalletAccountStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
            
            // Final cleanup of thinking tags
            setMessages(prev => 
              prev.map(msg => 
                msg.id === aiMessageId 
                  ? { ...msg, text: TextProcessor.cleanThinkingTags(msg.text) }
                  : msg
              )
            );
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
        <SettingsButton
          onClick={handleSettingsClick}
          disabled={isLoading}
          title="Agent Settings"
        >
          ⚙️ Settings
        </SettingsButton>
      </ChatHeader>

      <ChatMessages>
        {messages.length === 0 && !isLoading && (
          <EmptyState characterName={character.name} />
        )}
        
        {messages.map((message) => (
          <Message key={message.id} $isUser={message.isUser}>
            <MessageBubble $isUser={message.isUser}>
              {message.isUser ? (
                message.text
              ) : (
                <MarkdownRenderer content={message.text} isUser={false} />
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
          onClose={handleSettingsClose}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </ChatContainer>
  );
};
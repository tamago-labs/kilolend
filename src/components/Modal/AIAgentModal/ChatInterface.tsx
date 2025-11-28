import React, { useState, useRef, useEffect } from 'react';
import type { AgentPreset } from '@/types/aiAgent';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { aiWalletService } from '@/services/aiWalletService';
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
  DeleteButton
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
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { account } = useWalletAccountStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when component mounts
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      text: `${character.name} at your service! I'm powered by ${model.name} and ready to help you with your DeFi trading strategies. What would you like to accomplish today?`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [character, model]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response (in real implementation, this would call backend)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: `I understand you want to "${inputText}". Based on your ${model.riskLevel} risk profile, I'll analyze the best DeFi strategies for you. Let me check current market conditions and prepare some recommendations...`,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteAgent = async () => {
    if (!account) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${character.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await aiWalletService.deleteAgent(account);
      onClose(); // Close the modal after successful deletion
    } catch (error) {
      console.error('Failed to delete agent:', error);
      alert('Failed to delete agent. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>{character.name}</ChatTitle>
      </ChatHeader>

      <ChatMessages>
        {messages.map((message) => (
          <Message key={message.id} $isUser={message.isUser}>
            <MessageBubble $isUser={message.isUser}>
              {message.text}
            </MessageBubble>
          </Message>
        ))}
        
        {isLoading && (
          <Message $isUser={false}>
            <MessageBubble $isUser={false}>
              Thinking...
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
            placeholder="Ask about trading strategies, market analysis, or portfolio optimization..."
            disabled={isLoading || isDeleting}
          />
          <SendButton
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading || isDeleting}
          >
            Send
          </SendButton>
          <DeleteButton
            onClick={handleDeleteAgent}
            disabled={isDeleting || isLoading}
            title="Delete Agent"
          >
            {isDeleting ? '...' : '🗑️'}
          </DeleteButton>
        </ChatInputWrapper>
      </ChatInputContainer>
    </ChatContainer>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Settings, MessageSquare, AlertCircle, Clock, User } from 'react-feather';
import { MarkdownRenderer } from '@/components/Modal/AIAgentModal/MarkdownRenderer';
import { MessageLimitUtil } from '../utils/messageLimit';
import { aiChatServiceV2, TextProcessor } from '@/services/AIChatServiceV2';
import type { ChatMessage } from '../types';

interface ChatActiveStateV2Props {
  agent: any;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSettings: () => void;
  onMessagesUpdate: (messages: ChatMessage[]) => void;
  isLoading: boolean;
  selectedChain: number;
  userAddress: string;
  messageLimitStatus: {
    used: number;
    total: number;
    remaining: number;
    resetTime: string;
    canSend: boolean;
  };
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px 16px 0 0;
`;

const AgentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AgentAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
`;

const AgentDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AgentName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const AgentStatus = styled.div`
  font-size: 12px;
  color: #06C755;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  background: #06C755;
  border-radius: 50%;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 40px; /* Add space to avoid overlap with close button */
`;

const SettingsButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
`;

const WelcomeMessage = styled.div`
  background: linear-gradient(135deg, #f8fafc, #e0f2fe);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e2e8f0;
`;

const WelcomeIcon = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
`;

const WelcomeTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px;
`;

const WelcomeText = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
`;

const Message = styled.div<{ $isUser: boolean }>`
  display: flex;
  gap: 12px;
  max-width: 80%;
  ${props => props.$isUser ? 'margin-left: auto;' : 'margin-right: auto;'}
`;

const MessageAvatar = styled.div<{ $isUser: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => props.$isUser ? `
    background: #06C755;
    color: white;
  ` : `
    background: #f1f5f9;
    color: #64748b;
  `}
`;

const MessageContent = styled.div<{ $isUser: boolean }>`
  background: ${props => props.$isUser ? '#06C755' : '#f8fafc'};
  color: ${props => props.$isUser ? 'white' : '#1e293b'};
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  border: ${props => props.$isUser ? 'none' : '1px solid #e2e8f0'};
`;

const MessageTime = styled.div<{ $isUser: boolean }>`
  font-size: 11px;
  color: ${props => props.$isUser ? 'rgba(255, 255, 255, 0.7)' : '#94a3b8'};
  margin-top: 4px;
  ${props => props.$isUser ? 'text-align: right;' : 'text-align: left;'}
`;

const InputContainer = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background: white;
  border-radius: 0 0 16px 16px;
`;

const MessageLimitWarning = styled.div`
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #92400e;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const Input = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
  
  &:disabled {
    background: #f8fafc;
    color: #94a3b8;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button<{ $disabled?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: ${props => props.$disabled ? '#e2e8f0' : '#06C755'};
  color: ${props => props.$disabled ? '#94a3b8' : 'white'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #059212;
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  color: #64748b;
  font-size: 14px;
  font-style: italic;
`;

const TypingDot = styled.div`
  width: 4px;
  height: 4px;
  background: #94a3b8;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
  
  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes typing {
    0%, 80%, 100% { transform: scale(1); opacity: 0.5; }
    40% { transform: scale(1.3); opacity: 1; }
  }
`;

export const ChatActiveStateV2: React.FC<ChatActiveStateV2Props> = ({
  agent,
  messages,
  onSendMessage,
  onSettings,
  onMessagesUpdate,
  isLoading,
  selectedChain,
  userAddress,
  messageLimitStatus
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || !messageLimitStatus.canSend) return;

    const message = inputValue.trim();
    setInputValue('');
    setIsTyping(true);
    
    // Increment message count
    MessageLimitUtil.incrementMessageCount();
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    onMessagesUpdate(newMessages);

    try {
      // Create AI message placeholder
      const aiMessageId = (Date.now() + 1).toString();
      let fullResponse = '';
      
      const aiMessage: ChatMessage = {
        id: aiMessageId,
        type: 'agent',
        content: '',
        timestamp: new Date()
      };

      const messagesWithAI = [...newMessages, aiMessage];
      onMessagesUpdate(messagesWithAI);

      // Stream response
      await aiChatServiceV2.streamChat(
        message,
        userAddress,
        selectedChain,
        {
          onChunk: (chunk: string) => {
            fullResponse = TextProcessor.processChunk(chunk, fullResponse);
            const updatedMessages = messagesWithAI.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, content: fullResponse }
                : msg
            );
            onMessagesUpdate(updatedMessages);
          },
          onComplete: async () => {
            const finalContent = TextProcessor.finalizeText(fullResponse);
            const finalMessages = messagesWithAI.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, content: finalContent }
                : msg
            );
            onMessagesUpdate(finalMessages);
            setIsTyping(false);
            
            // Reload message history from backend to get the final state
            // try {
            //   const response = await aiChatServiceV2.getMessages(userAddress, selectedChain);
            //   const chatMessages = response.messages.map((msg: any) => ({
            //     id: `msg-${msg.message_id}`,
            //     type: msg.role === 'user' ? 'user' as const : 'agent' as const,
            //     content: msg.content,
            //     timestamp: new Date(msg.created_at)
            //   }));
            //   onMessagesUpdate(chatMessages);
            // } catch (error) {
            //   console.error('Failed to reload messages after streaming:', error);
            // }
          },
          onError: (error: Error) => {
            console.error('Streaming error:', error);
            const errorMessages = messagesWithAI.map(msg => 
              msg.id === aiMessageId 
                ? { 
                    ...msg, 
                    content: 'Sorry, I encountered an error. Please try again.',
                    type: 'system' as const
                  }
                : msg
            );
            onMessagesUpdate(errorMessages);
            setIsTyping(false);
          }
        }
      );

    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      
      onMessagesUpdate([...newMessages, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Container>
      <Header>
        <AgentInfo>
          <AgentAvatar 
            src={agent.image} 
            alt={agent.name}
            onError={(e) => {
              e.currentTarget.src = '/images/icon-robot.png';
            }}
          />
          <AgentDetails>
            <AgentName>
              Agent Playground
            </AgentName>
            <AgentStatus>
              <StatusDot />
              {messageLimitStatus.remaining} messages remaining today
            </AgentStatus>
          </AgentDetails>
        </AgentInfo>
        <HeaderActions>
          <SettingsButton onClick={onSettings}>
            <Settings size={18} />
          </SettingsButton>
        </HeaderActions>
      </Header>

      <MessagesContainer>
        {messages.length === 0 ? (
          <WelcomeMessage>
            <WelcomeIcon 
              src={agent.image} 
              alt={agent.name}
              onError={(e) => {
                e.currentTarget.src = '/images/icon-robot.png';
              }}
            />
            <WelcomeTitle>Agent Playground</WelcomeTitle>
            <WelcomeText>
              You are in playground mode with limited daily usage. We encourage you to use OpenClaw agent for full functionality. Try checking our docs for how to setup.
            </WelcomeText>
          </WelcomeMessage>
        ) : (
          messages.map((message) => (
            <Message key={message.id} $isUser={message.type === 'user'}>
              {message.type === 'user' ? (
                <MessageAvatar $isUser={true}>
                  <User size={16} />
                </MessageAvatar>
              ) : (
                <MessageAvatar $isUser={false}>
                  <img 
                    src={agent.image} 
                    alt={agent.name}
                    style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                    onError={(e) => {
                      e.currentTarget.src = '/images/icon-robot.png';
                    }}
                  />
                </MessageAvatar>
              )}
              <div>
                <MessageContent $isUser={message.type === 'user'}>
                  {typeof message.content === 'string' ? (
                    <MarkdownRenderer 
                      content={message.content} 
                      isUser={message.type === 'user'}
                    />
                  ) : (
                    message.content
                  )}
                </MessageContent>
                <MessageTime $isUser={message.type === 'user'}>
                  {formatTime(message.timestamp)}
                </MessageTime>
              </div>
            </Message>
          ))
        )}
        
        {isTyping && (
          <Message $isUser={false}>
            <MessageAvatar $isUser={false}>
              <img 
                src={agent.image} 
                alt={agent.name}
                style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                onError={(e) => {
                  e.currentTarget.src = '/images/icon-robot.png';
                }}
              />
            </MessageAvatar>
            <TypingIndicator>
              <TypingDot />
              <TypingDot />
              <TypingDot />
            </TypingIndicator>
          </Message>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        {!messageLimitStatus.canSend && (
          <MessageLimitWarning>
            <Clock size={14} />
            Daily message limit reached. Resets at {messageLimitStatus.resetTime}
          </MessageLimitWarning>
        )}
        
        <InputWrapper>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              messageLimitStatus.canSend 
                ? `Ask about KiloLend... (${messageLimitStatus.remaining} left today)`
                : 'Message limit reached for today'
            }
            disabled={isLoading || !messageLimitStatus.canSend}
            rows={1}
            style={{
              minHeight: '44px',
              maxHeight: '120px'
            }}
          />
          <SendButton 
            onClick={handleSend}
            $disabled={!inputValue.trim() || isLoading || !messageLimitStatus.canSend}
          >
            {isLoading ? (
              <MessageSquare size={18} />
            ) : (
              <Send size={18} />
            )}
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </Container>
  );
};
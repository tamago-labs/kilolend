import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ChatMessageComponent } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { aiChatServiceV1, type MessageResponse } from '@/services/AIChatServiceV1';
import type { ChatMessage, AgentPreset } from '../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, rgba(6, 199, 85, 0.05), rgba(5, 146, 18, 0.05));
`;

const AgentIdentityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const StatusControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AgentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AgentAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
`;

const AgentDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AgentName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const AgentStatus = styled.span`
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
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SessionSelector = styled.select`
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #06C755;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #1e293b;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const WelcomeMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
  text-align: center;
`;

const WelcomeTitle = styled.h3`
  font-size: 1.2em;
  font-weight: 500;
  color: #666666;
  margin-bottom: 16px;
`;

const WelcomeText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
`;

const InfoBox = styled.div`
  background: #f0f8ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  max-width: 500px;
  font-size: 0.85em;
  color: #0066cc;
  line-height: 1.4;
`;

const InfoBoxContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const InfoIcon = styled.span`
  font-size: 1.2em;
  font-weight: bold;
  margin-top: -2px;
`;

const Suggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 500px;
`;

const Suggestion = styled.button`
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: #ffffff;
  color: #666666;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #f8f9fa;
    border-color: #007bff;
    color: #007bff;
  }
`;

interface ChatActiveStateProps {
  agent: AgentPreset;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSettings: () => void;
  onBalancesClick?: () => void;
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
  isLoading?: boolean;
  selectedSession: number;
  setSelectedSession: (session: number) => void;
}

const WELCOME_SUGGESTIONS = [
  "Help me check my wallet balance",
  "What are current KiloLend lending rates?",
  "Help swap 5 USDT to KAIA on DragonSwap",
  "Check prices for major KAIA tokens"
];

export const ChatActiveState: React.FC<ChatActiveStateProps> = ({
  agent,
  messages,
  onSendMessage,
  onSettings,
  onBalancesClick,
  onMessagesUpdate,
  isLoading = false,
  selectedSession,
  setSelectedSession
}) => {
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { account } = useWalletAccountStore();

  // Load message history from backend
  const loadMessageHistory = async () => {
    if (!account || !onMessagesUpdate) return;

    setIsLoadingHistory(true);
    try {
      const response = await aiChatServiceV1.getMessages(account, selectedSession);
      
      // Convert backend message format to frontend ChatMessage format
      const chatMessages: ChatMessage[] = response.messages.map((msg: MessageResponse) => ({
        id: `msg-${msg.message_id}`,
        type: msg.role === 'user' ? 'user' as const : 'agent' as const,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        agent: agent
      }));

      // Update parent component with loaded messages
      onMessagesUpdate(chatMessages);
    } catch (error) {
      console.error('Failed to load message history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load messages on component mount and when account or session changes
  useEffect(() => {
    if (account && onMessagesUpdate) {
      loadMessageHistory();
    }
  }, [account, selectedSession, onMessagesUpdate]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  const renderWelcomeMessage = () => (
    <WelcomeMessage>
      <AgentAvatar 
        src={agent.image} 
        alt={agent.name}
        onError={(e) => {
          e.currentTarget.src = '/images/icon-ai.png';
        }}
        style={{ margin: '0 auto 16px', width: '48px', height: '48px' }}
      />
      <WelcomeTitle>What would you {agent.name} to help you with?</WelcomeTitle>
      
      <InfoBox>
        <InfoBoxContent>
          <InfoIcon>ℹ️</InfoIcon>
          <div>
            <strong>Early Access:</strong> Your AI agent operates with an isolated wallet, separate from your main wallet. This ensures safe experimentation with AI-driven trading strategies.
          </div>
        </InfoBoxContent>
      </InfoBox>
      
      <Suggestions>
        {WELCOME_SUGGESTIONS.map((suggestion, index) => (
          <Suggestion
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            disabled={isLoading}
          >
            {suggestion}
          </Suggestion>
        ))}
      </Suggestions>
    </WelcomeMessage>
  );

  return (
    <Container>
      <Header>
        <AgentIdentityRow>
          <AgentAvatar 
            src={agent.image} 
            alt={agent.name}
            onError={(e) => {
              e.currentTarget.src = '/images/icon-ai.png';
            }}
          />
          <AgentDetails>
            <AgentName>{agent.name}</AgentName>
            <AgentStatus>
              <StatusDot />
              Online
            </AgentStatus>
          </AgentDetails>
        </AgentIdentityRow>
        
        <StatusControlsRow>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Session:</span>
            <SessionSelector
              value={selectedSession}
              onChange={(e) => setSelectedSession(Number(e.target.value))}
              disabled={isLoading}
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </SessionSelector>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onBalancesClick && (
              <ActionButton onClick={onBalancesClick} disabled={isLoading} title="AI Wallet Balances">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
                </svg>
              </ActionButton>
            )}
            <ActionButton onClick={onSettings} disabled={isLoading} title="Settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24"></path>
              </svg>
            </ActionButton>
          </div>
        </StatusControlsRow>
      </Header>
      
      <MessagesContainer>
        {messages.length === 0 ? (
          renderWelcomeMessage()
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                agent={agent}
              />
            ))}
            {isLoading && (
              <ChatMessageComponent
                message={{
                  id: 'loading',
                  type: 'agent',
                  content: 'Thinking...',
                  timestamp: new Date()
                }}
                agent={agent}
              />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={isLoading}
        placeholder={`Message ${agent.name}...`}
      />
    </Container>
  );
};

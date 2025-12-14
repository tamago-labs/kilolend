import React from 'react';
import styled from 'styled-components';
import { MarkdownRenderer } from '@/components/Modal/AIAgentModal/MarkdownRenderer';
import type { ChatMessage, AgentPreset } from '../types';

const MessageContainer = styled.div<{ $type: 'user' | 'agent' | 'system' }>`
  display: flex;
  margin-bottom: 16px;
  
  ${props => props.$type === 'user' && `
    justify-content: flex-end;
  `}
  
  ${props => props.$type === 'agent' && `
    justify-content: flex-start;
  `}
  
  ${props => props.$type === 'system' && `
    justify-content: center;
  `}
`;

const MessageBubble = styled.div<{ $type: 'user' | 'agent' | 'system' }>`
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  
  ${props => props.$type === 'user' && `
    background: linear-gradient(135deg, #06C755, #059212);
    color: white;
    border-bottom-right-radius: 4px;
  `}
  
  ${props => props.$type === 'agent' && `
    background: #f8fafc;
    color: #1e293b;
    border: 1px solid #e2e8f0;
    border-bottom-left-radius: 4px;
  `}
  
  ${props => props.$type === 'system' && `
    background: #f1f5f9;
    color: #64748b;
    font-size: 12px;
    text-align: center;
    font-style: italic;
    border-radius: 8px;
  `}
`;

const AgentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const AgentAvatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
`;

const AgentName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
`;

const MessageContent = styled.div`
  margin-bottom: 4px;
`;

const MessageTime = styled.div<{ $type: 'user' | 'agent' | 'system' }>`
  font-size: 11px;
  opacity: 0.7;
  
  ${props => props.$type === 'user' && `
    text-align: right;
    color: rgba(255, 255, 255, 0.8);
  `}
  
  ${props => props.$type === 'agent' && `
    text-align: left;
    color: #94a3b8;
  `}
  
  ${props => props.$type === 'system' && `
    text-align: center;
    color: #94a3b8;
  `}
`;

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

interface ChatMessageProps {
  message: ChatMessage;
  agent?: AgentPreset;
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, agent }) => {
  // Check if message content is empty or whitespace-only
  const isEmptyContent = () => {
    if (typeof message.content === 'string') {
      return message.content.trim() === '';
    }
    return false; // React nodes are considered non-empty
  };

  // Skip rendering empty user messages
  if (message.type === 'user' && isEmptyContent()) {
    return null;
  }

  const renderMessageContent = () => {
    if (message.type === 'system') {
      return <MessageContent>{message.content}</MessageContent>;
    }

    if (message.type === 'agent' && agent) {
      return (
        <>
          <AgentHeader>
            <AgentAvatar 
              src={agent.image} 
              alt={agent.name}
              onError={(e) => {
                e.currentTarget.src = '/images/icon-ai.png';
              }}
            />
            <AgentName>{agent.name}</AgentName>
          </AgentHeader>
          <MessageContent>
            {typeof message.content === 'string' ? (
              <MarkdownRenderer 
                content={message.content} 
                isUser={false}
              />
            ) : (
              message.content
            )}
          </MessageContent>
        </>
      );
    }

    return (
      <MessageContent>
        {typeof message.content === 'string' ? (
          <MarkdownRenderer 
            content={message.content} 
            isUser={true}
          />
        ) : (
          message.content
        )}
      </MessageContent>
    );
  };

  return (
    <MessageContainer $type={message.type}>
      <MessageBubble $type={message.type}>
        {renderMessageContent()}
        <MessageTime $type={message.type}>
          {formatTime(message.timestamp)}
        </MessageTime>
      </MessageBubble>
    </MessageContainer>
  );
};

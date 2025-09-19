'use client';

import React, { useRef, useEffect } from 'react';
import { Send, Pause, ArrowLeft } from 'react-feather';
import {
  ChatContainer,
  ChatHeader,
  AgentAvatar,
  AgentInfo,
  AgentName,
  ChatMessages,
  MessageBubble,
  MessageAvatar,
  MessageContent,
  ChatInputContainer,
  ChatInput,
  SendButton,
  ChatActions,
  ActionButton,
  TypingIndicator,
  LoadingSpinner,
  ChatCounter,
  InputContainer,
  StopButton
} from './styled';
import MarkdownRenderer from './MarkdownRenderer';
import InputTemplates from './InputTemplates';
import type { AIAgent } from '@/types/aiAgent';
import { useExecutionAIChat } from '@/hooks/ai/useExecutionAIChat';

interface ChatStepProps {
  agent: AIAgent;
  onBack: () => void;
  onReset: () => void;
}

export const ChatStepWithExecution: React.FC<ChatStepProps> = ({ agent, onBack, onReset }) => {
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    stopStreaming,
    canSendMessage,
    messageCount,
    needsClear
  } = useExecutionAIChat(agent);

  const [inputValue, setInputValue] = React.useState('');
  const [showTemplates, setShowTemplates] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !canSendMessage) return;

    const messageToSend = inputValue;
    setInputValue('');
    setShowTemplates(false); // Hide templates when sending
    await sendMessage(messageToSend);
  };

  const handleStopStreaming = () => {
    stopStreaming();
  };

  const handleInputFocus = () => {
    if (!inputValue.trim()) {
      setShowTemplates(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowTemplates(!value.trim()); // Show templates only when input is empty
  };

  const handleTemplateSelect = (template: string) => {
    setInputValue(template);
    setShowTemplates(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape') {
      setShowTemplates(false);
    }
  };

  const handleReset = () => {
    clearMessages();
    // onReset();
  };

  return (
    <ChatContainer> 
      <ChatMessages>
        {messages.map((message) => (
          <MessageBubble key={message.id} $isUser={message.sender === 'user'}>
            <MessageAvatar>
              {message.sender === 'user' ? '👤' : (
                <img src={`./images/icon-${agent.personality}.png`} alt={`${agent.name} Avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </MessageAvatar>
            <MessageContent $isUser={message.sender === 'user'}>
              <MarkdownRenderer
                content={message.content}
                isUser={message.sender === 'user'}
              />
            </MessageContent>
          </MessageBubble>
        ))}

        {isStreaming && (
          <MessageBubble $isUser={false}>
            <MessageAvatar>
              <img src={`./images/icon-${agent.personality}.png`} alt={`${agent.name} Avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </MessageAvatar>
            <TypingIndicator />
          </MessageBubble>
        )}

        {error && (
          <MessageBubble $isUser={false}>
            <MessageAvatar>⚠️</MessageAvatar>
            <MessageContent $isUser={false}>
              <div style={{ color: '#ef4444' }}>
                {error}
                <div style={{ marginTop: '8px' }}>
                  <ActionButton onClick={retryLastMessage} style={{ fontSize: '12px', padding: '4px 8px' }}>
                    🔄 Retry
                  </ActionButton>
                </div>
              </div>
            </MessageContent>
          </MessageBubble>
        )}

        {needsClear && (
          <MessageBubble $isUser={false}>
            <MessageAvatar>⚠️</MessageAvatar>
            <MessageContent $isUser={false}>
              <div style={{
                color: '#f59e0b',
                background: 'rgba(251, 191, 36, 0.1)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(251, 191, 36, 0.3)'
              }}>
                <strong>Message Limit Reached</strong>
                <p style={{ margin: '8px 0', fontSize: '14px' }}>
                  You've reached the {messageCount}/10 message limit. Please clear the chat to continue our conversation.
                </p>
                <ActionButton
                  onClick={handleReset}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Clear Chat
                </ActionButton>
              </div>
            </MessageContent>
          </MessageBubble>
        )}

        <div ref={messagesEndRef} />
      </ChatMessages>

      <ChatInputContainer style={{ position: 'relative' }}>
        {/* Input Templates */}
        <InputTemplates
          agent={agent}
          onTemplateSelect={handleTemplateSelect}
          isVisible={showTemplates && canSendMessage}
        />

        <InputContainer>
          <ChatInput
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleInputFocus}
            onBlur={() => {
              // Delay hiding templates to allow clicking on them
              setTimeout(() => setShowTemplates(false), 150);
            }}
            placeholder={needsClear ? "Clear chat to continue..." : showTemplates ? "Choose a template or type your message..." : "Ask about lending, borrowing, portfolio, or market data..."}
            disabled={!canSendMessage}
            style={{
              opacity: canSendMessage ? 1 : 0.6,
              cursor: canSendMessage ? 'text' : 'not-allowed'
            }}
          />

          {isStreaming ? (
            <StopButton onClick={handleStopStreaming}>
              <Pause size={20} />
            </StopButton>
          ) : (
            <SendButton
              onClick={handleSendMessage}
              $disabled={!canSendMessage || !inputValue.trim()}
              disabled={!canSendMessage || !inputValue.trim()}
            >
              {isLoading ? <LoadingSpinner /> : <Send size={16} />}
            </SendButton>
          )}
        </InputContainer>

      </ChatInputContainer>

      <ChatActions>
        <ActionButton $variant="secondary" onClick={onBack}>
          Change Agent
        </ActionButton>
        <ActionButton $variant="secondary" onClick={handleReset}>
          Clear Chat
        </ActionButton>
      </ChatActions>
    </ChatContainer>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background: white;
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const Input = styled.textarea`
  width: 100%;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
  line-height: 1.4;
  resize: none;
  outline: none;
  font-family: inherit;
  
  &:focus {
    border-color: #06C755;
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const SendButton = styled.button<{ $disabled: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$disabled ? '#e2e8f0' : 'linear-gradient(135deg, #06C755, #059212)'};
  color: white;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  padding: 0 16px;
`;

const QuickAction = styled.button`
  padding: 4px 8px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const QUICK_SUGGESTIONS = [
  "What's my portfolio status?",
  "Show me best lending rates",
  "Analyze my health factor",
  "Suggest optimization strategies"
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Ask your AI agent..."
}) => {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled && !isComposing) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // const handleQuickSuggestion = (suggestion: string) => {
  //   if (!disabled) {
  //     setMessage(suggestion);
  //     textareaRef.current?.focus();
  //   }
  // };

  return (
    <>
      {/*<QuickActions>
        {QUICK_SUGGESTIONS.map((suggestion, index) => (
          <QuickAction
            key={index}
            onClick={() => handleQuickSuggestion(suggestion)}
            disabled={disabled}
          >
            {suggestion}
          </QuickAction>
        ))}
      </QuickActions>*/}
      
      <InputContainer>
        <InputWrapper>
          <Input
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
          />
        </InputWrapper>
        
        <SendButton
          onClick={handleSubmit}
          disabled={disabled || !message.trim() || isComposing}
          $disabled={disabled || !message.trim() || isComposing}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </SendButton>
      </InputContainer>
    </>
  );
};

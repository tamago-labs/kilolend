import React from 'react';
import styled from 'styled-components';

const SigningPromptContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
  text-align: center;
`;

const SigningPromptIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #fef3c7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: #f59e0b;
`;

const SigningPromptTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const SigningPromptText = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 24px 0;
  max-width: 400px;
`;

const SignMessageButton = styled.button<{ $loading?: boolean }>`
  padding: 12px 24px;
  background: linear-gradient(135deg, #06C755, #059212);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
  }
`;

const LoadingIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;

  &::before,
  &::after {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
    animation: loadingDots 1.4s infinite ease-in-out;
  }

  &::before {
    animation-delay: -0.32s;
  }

  &::after {
    animation-delay: 0.32s;
  }

  @keyframes loadingDots {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 16px;
  color: #dc2626;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 400px;
`;

interface SigningPromptProps {
  agentName: string;
  isLoading: boolean;
  signatureError: string | null;
  onSignMessage: () => void;
}

export const SigningPrompt: React.FC<SigningPromptProps> = ({
  agentName,
  isLoading,
  signatureError,
  onSignMessage
}) => {
  return (
    <SigningPromptContainer> 
      
      <SigningPromptTitle>Signing Required</SigningPromptTitle>
      <SigningPromptText>
        Your session has expired or is invalid. Please sign the message to continue chatting with {agentName}.
      </SigningPromptText>
      
      <SignMessageButton 
        onClick={onSignMessage} 
        $loading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <LoadingIndicator />
            Signing...
          </>
        ) : (
          'Sign Message'
        )}
      </SignMessageButton>
      
      {signatureError && (
        <ErrorMessage>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {signatureError}
        </ErrorMessage>
      )}
    </SigningPromptContainer>
  );
};

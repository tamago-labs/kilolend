'use client';

import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 400px;
`;

const LoadingIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #00C300, #00A000);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const LoadingTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
`;

const LoadingText = styled.p`
  color: #64748b;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 8px;
`;

const LoadingSteps = styled.div`
  margin-top: 20px;
  font-size: 14px;
  color: #94a3b8;
`;

const StepItem = styled.div<{ $active?: boolean }>`
  padding: 4px 0;
  color: ${props => props.$active ? '#00C300' : '#94a3b8'};
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.3s ease;
`;

interface AILoadingProps {
  query: string;
}

export const AILoading = ({ query }: AILoadingProps) => {
  return (
    <Container>
      <LoadingIcon>🤖</LoadingIcon>
      <LoadingTitle>AI is Working...</LoadingTitle>
      <LoadingText>
        Analyzing your request: "{query.slice(0, 50)}{query.length > 50 ? '...' : ''}"
      </LoadingText>
      
      <LoadingSteps>
        <StepItem $active={true}>✓ Understanding your needs</StepItem>
        <StepItem $active={true}>✓ Scanning market data</StepItem>
        <StepItem $active={true}>✓ Calculating optimal strategies</StepItem>
        <StepItem $active={false}>⏳ Generating personalized deals</StepItem>
      </LoadingSteps>
    </Container>
  );
};

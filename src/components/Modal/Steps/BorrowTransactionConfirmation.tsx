'use client';

import { useState, useEffect } from 'react';
import { Loader } from 'react-feather';
import { styled, keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;

const ConfirmationContainer = styled.div`
  text-align: center;
  padding: 2rem 1rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  
  svg {
    animation: ${spin} 2s linear infinite;
    color: #00C300;
    width: 48px;
    height: 48px;
  }
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6B7280;
  margin-bottom: 2rem;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const ProgressContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const ProgressDot = styled.div<{ $delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00C300;
  animation: ${pulse} 1.5s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
`;

const TransactionInfo = styled.div`
  background: #F9FAFB;
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  border: 1px solid #E5E7EB;
`;

const TransactionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TransactionLabel = styled.span`
  color: #6B7280;
  font-size: 0.875rem;
`;

const TransactionValue = styled.span`
  color: #1F2937;
  font-weight: 600;
  font-size: 0.875rem;
`;

const HelperText = styled.p`
  color: #9CA3AF;
  font-size: 0.8rem;
  margin-top: 1rem;
  font-style: italic;
`;

interface BorrowTransactionConfirmationProps {
  asset: string;
  amount: string;
}

export const BorrowTransactionConfirmation = ({ 
  asset, 
  amount 
}: BorrowTransactionConfirmationProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  return (
    <ConfirmationContainer>
      <LoadingSpinner>
        <Loader />
      </LoadingSpinner>
      
      <Title>Transaction is being confirmed</Title>
      <Subtitle>
        Waiting blockchain for confirmation of your borrow transaction...
      </Subtitle>

      <ProgressContainer>
        {[0, 1, 2].map((index) => (
          <ProgressDot key={index} $delay={index * 0.2} />
        ))}
      </ProgressContainer>

      <TransactionInfo>
        <TransactionRow>
          <TransactionLabel>Asset:</TransactionLabel>
          <TransactionValue>{asset}</TransactionValue>
        </TransactionRow>
        <TransactionRow>
          <TransactionLabel>Amount:</TransactionLabel>
          <TransactionValue>{amount} {asset}</TransactionValue>
        </TransactionRow>
        <TransactionRow>
          <TransactionLabel>Time Elapsed:</TransactionLabel>
          <TransactionValue>{formatTime(elapsedTime)}</TransactionValue>
        </TransactionRow>
      </TransactionInfo>

      <HelperText>
        This usually takes 15-30 seconds. Please keep this window open.
      </HelperText>
    </ConfirmationContainer>
  );
};

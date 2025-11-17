'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Loader } from 'react-feather';

const ConfirmationContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

const LoadingSpinner = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  
  svg {
    animation: spin 1s linear infinite;
    color: #00C300;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ConfirmationTitle = styled.h3`
  color: #1e293b;
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 600;
`;

const ConfirmationMessage = styled.p`
  color: #64748b;
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.4;
`;

const ProgressIndicator = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const ProgressDot = styled.div<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.$active ? '#00C300' : '#e2e8f0'};
  transition: all 0.3s ease;
  
  animation: ${props => props.$active ? 'pulse 1.5s ease-in-out infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const HelperText = styled.div`
  font-size: 12px;
  color: #94a3b8;
  margin-top: 8px;
`;

interface SupplyTransactionConfirmationProps {
  asset?: string;
  amount?: string;
}

export const SupplyTransactionConfirmation = ({
  asset,
  amount
}: SupplyTransactionConfirmationProps) => {
  const [activeDot, setActiveDot] = useState(0);

  // Animate progress dots
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <ConfirmationContainer>
      <LoadingSpinner>
        <Loader size={40} color="#00C300" />
      </LoadingSpinner>
      
      <ConfirmationTitle>Transaction is being confirmed</ConfirmationTitle>
      
      <ConfirmationMessage>
        Waiting blockchain for confirmation...
        {asset && amount && ` Supplying ${amount} ${asset}`}
      </ConfirmationMessage>
      
      <ProgressIndicator>
        <ProgressDot $active={activeDot === 0} />
        <ProgressDot $active={activeDot === 1} />
        <ProgressDot $active={activeDot === 2} />
      </ProgressIndicator>
      
      <HelperText>
        This usually takes 15-30 seconds
      </HelperText>
    </ConfirmationContainer>
  );
};

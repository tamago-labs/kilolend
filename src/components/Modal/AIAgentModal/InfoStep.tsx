import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { aiWalletService, AIWalletStatus } from '@/services/aiWalletService';
import { CreditCard, Plus, CheckCircle, AlertCircle, ArrowRight, User } from 'react-feather';

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;

  @media (max-width: 480px) {
    padding: 20px;
  }

`;

const StatusMessage = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  margin-bottom: 8px;
  line-height: 1.4;
`;

const StatusIcon = styled.div<{ $type: 'wallet' | 'ai-wallet' | 'ready' | 'error' }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  background: ${({ $type }) => {
    switch ($type) {
      case 'wallet': return 'linear-gradient(135deg, #00C300, #00A000)';
      case 'ai-wallet': return 'linear-gradient(135deg, #00C300, #00A000)';
      case 'ready': return 'linear-gradient(135deg, #00C300, #00A000)';
      case 'error': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #64748b, #475569)';
    }
  }};
  color: white;
`;

const BenefitsSection = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
`;

const BenefitsTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #475569;

  &:last-child {
    margin-bottom: 0;
  }

  &::before {
    content: '✓';
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: #10b981;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
    flex-shrink: 0;
  }
`;

const CapacitySection = styled.div`
  background: linear-gradient(135deg, #fef3c7, #fef9e7);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CapacityIcon = styled.div`
  color: #f59e0b;
  flex-shrink: 0;
`;

const CapacityContent = styled.div`
  flex: 1;
`;

const CapacityTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 4px;
`;

const CapacityText = styled.div`
  font-size: 13px;
  color: #78350f;
`;

const WalletInfo = styled.div`
  background: #f0f9ff;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const WalletAddress = styled.div`
  font-family: monospace;
  font-size: 14px;
  color: #64748b;
  margin-top: 8px;
  word-break: break-all;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  margin-top: 8px;

  ${({ $variant }) =>
    $variant === 'primary'
      ? `
    background: linear-gradient(135deg, #00C300, #00A000);
    color: white;
    border: none;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 195, 0, 0.3);
    }
  `
      : `
    background: white;
    color: #1e293b;
    border: 1px solid #e2e8f0;

    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #64748b;
`;

const ErrorState = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
`;

const LoadingSpinner = styled.div<{ size?: number }>`
  width: ${({ size = 32 }) => size}px;
  height: ${({ size = 32 }) => size}px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

type SetupState = 'no-wallet' | 'no-ai-wallet' | 'ai-wallet-ready' | 'ai-wallet-funded' | 'loading' | 'error';

interface InfoStepProps {
  onProceed: () => void;
  onProceedToChat?: () => void;
  onClose: () => void;
  onCreateAIWallet: () => void;
  isCreatingWallet?: boolean;
  creationError?: string | null;
}

export const InfoStep: React.FC<InfoStepProps> = ({ 
  onProceed, 
  onProceedToChat,
  onClose, 
  onCreateAIWallet, 
  isCreatingWallet = false,
  creationError = null
}) => {
  const { account } = useWalletAccountStore();
  const [setupState, setSetupState] = useState<SetupState>('loading');
  const [aiWalletData, setAiWalletData] = useState<AIWalletStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSetupState();
  }, [account]);

  // Refresh status when wallet creation completes
  useEffect(() => {
    if (!isCreatingWallet && setupState === 'no-ai-wallet') {
      // If wallet creation just finished, refresh the status
      const timer = setTimeout(() => {
        checkSetupState();
      }, 1000); // Small delay to ensure backend is updated
      return () => clearTimeout(timer);
    }
  }, [isCreatingWallet, setupState]);

  const checkSetupState = async () => {
    if (!account) {
      setSetupState('no-wallet');
      return;
    }

    try {


      setError(null);
      const status = await aiWalletService.getAIWalletStatus(account);

      setAiWalletData(status);

      if (!status.hasWallet) {
        setSetupState('no-ai-wallet');
      } else if (status.agentId) {
        // AI agent already exists, automatically proceed to chat
        if (onProceedToChat) {
          onProceedToChat();
        }
      } else {
        // AI wallet exists but no agent yet
        setSetupState('ai-wallet-ready');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check AI wallet status');
      setSetupState('error');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const renderContent = () => {
    switch (setupState) {
      case 'loading':
        return (
          <LoadingState>
            <div>Checking your setup...</div>
          </LoadingState>
        );

      case 'error':
        return (
          <ErrorState>
            <AlertCircle size={16} />
            {error || 'Failed to check setup status'}
          </ErrorState>
        );

      case 'no-wallet':
        return (
          <InfoContainer>
            <StatusIcon $type="wallet">
              <User size={32} />
            </StatusIcon>
            <StatusMessage>
              Please connect your wallet first to continue
            </StatusMessage>
            <ActionButton onClick={onClose} $variant="secondary">
              Close
            </ActionButton>
          </InfoContainer>
        );

      case 'no-ai-wallet':
        // Check if capacity is reached
        const isCapacityReached = aiWalletData?.status?.usedWallets !== undefined && 
                                  aiWalletData?.status?.totalWallets !== undefined &&
                                  aiWalletData.status.usedWallets >= aiWalletData.status.totalWallets;

        return (
          <InfoContainer>
            <StatusIcon $type="ai-wallet">
              {isCreatingWallet ? (
                <LoadingSpinner size={32} />
              ) : (
                <Plus size={32} />
              )}
            </StatusIcon>
            <StatusMessage>
              {isCreatingWallet 
                ? 'Creating your AI-agent wallet... This may take a moment.'
                : 'You don\'t have an AI-agent wallet yet. Create one to start autonomous trading.'
              }
            </StatusMessage>
 
            {creationError && (
              <ErrorState>
                <AlertCircle size={16} />
                {creationError}
              </ErrorState>
            )}

            {aiWalletData?.status && !isCreatingWallet && (
              <CapacitySection>
                <CapacityIcon>
                  <AlertCircle size={20} />
                </CapacityIcon>
                <CapacityContent>
                  <CapacityTitle>Limited spots available</CapacityTitle>
                  <CapacityText>
                    Beta phase: {aiWalletData.status.usedWallets}/{aiWalletData.status.totalWallets} slots available
                    {isCapacityReached && (
                      <div style={{ marginTop: '8px', fontWeight: '600', color: '#dc2626' }}>
                        All slots are currently taken. Please check back later.
                      </div>
                    )}
                  </CapacityText>
                </CapacityContent>
              </CapacitySection>
            )}

            <ActionButton 
              onClick={onCreateAIWallet} 
              disabled={isCreatingWallet || isCapacityReached}
            >
              {isCapacityReached ? 'Capacity Full' : isCreatingWallet ? (
                <>
                  <LoadingSpinner size={18} />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create AI Wallet
                </>
              )}
            </ActionButton>
          </InfoContainer>
        );

      case 'ai-wallet-ready':
      case 'ai-wallet-funded':
        return (
          <InfoContainer>
            <StatusIcon $type="ready">
              <CheckCircle size={32} />
            </StatusIcon>
            <StatusMessage>
              Your AI-agent wallet is already setup. You can now proceed to create your AI agent
            </StatusMessage>
 
            <ActionButton onClick={onProceed}>
              <ArrowRight size={18} />
              Next
            </ActionButton>
          </InfoContainer>
        );

      default:
        return null;
    }
  };

  return renderContent();
};

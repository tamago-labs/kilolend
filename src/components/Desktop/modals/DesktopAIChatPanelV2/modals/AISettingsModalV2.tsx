import React from 'react';
import styled from 'styled-components';
import { X, RotateCcw, BarChart, Globe } from 'react-feather';
import { CHAIN_CONFIGS } from '../types';
import type { ChainConfig, MessageLimitStatus } from '../types';

interface AISettingsModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  selectedChain: number;
  onChainChange: (chainId: number) => void;
  messageLimitStatus: MessageLimitStatus;
  onClearChatHistory: () => void;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  transition: all 0.2s ease;
`;

const ModalContent = styled.div<{ $isOpen: boolean }>`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  transform: ${props => props.$isOpen ? 'scale(1)' : 'scale(0.95)'};
  opacity: ${props => props.$isOpen ? 1 : 0};
  transition: all 0.2s ease;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
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

const ModalBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChainSelector = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
`;

const ChainOption = styled.option`
  padding: 8px;
`;

const MessageLimitCard = styled.div`
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
`;

const MessageLimitHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const MessageLimitTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const MessageLimitCount = styled.div<{ $remaining: number }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$remaining > 0 ? '#06C755' : '#ef4444'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$percentage >= 100 ? '#ef4444' : '#06C755'};
  transition: width 0.3s ease;
`;

const ResetInfo = styled.div`
  font-size: 12px;
  color: #64748b;
  text-align: center;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  ${({ $variant }) =>
    $variant === 'danger'
      ? `
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;

    &:hover {
      background: #fee2e2;
      border-color: #fca5a5;
    }
  `
      : `
    background: #f8fafc;
    color: #64748b;
    border: 1px solid #e2e8f0;

    &:hover {
      background: #e2e8f0;
      border-color: #cbd5e1;
      color: #1e293b;
    }
  `}
`;

export const AISettingsModalV2: React.FC<AISettingsModalV2Props> = ({
  isOpen,
  onClose,
  selectedChain,
  onChainChange,
  messageLimitStatus,
  onClearChatHistory
}) => {
  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChainChange(Number(e.target.value));
  };

  const getChainIcon = (chainId: number): string => {
    const chain = CHAIN_CONFIGS.find(c => c.id === chainId);
    return chain?.icon || '/images/icon-robot.png';
  };

  const getChainName = (chainId: number): string => {
    const chain = CHAIN_CONFIGS.find(c => c.id === chainId);
    return chain?.name || 'Unknown Chain';
  };

  const usagePercentage = (messageLimitStatus.used / messageLimitStatus.total) * 100;

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>AI Chat Settings</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={18} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* Chain Selection */}
          <Section>
            <SectionTitle>
              <Globe size={16} />
              Blockchain Network
            </SectionTitle>
            <ChainSelector
              value={selectedChain}
              onChange={handleChainChange}
            >
              {CHAIN_CONFIGS.map((chain) => (
                <ChainOption key={chain.id} value={chain.id}>
                  {chain.name} ({chain.symbol})
                </ChainOption>
              ))}
            </ChainSelector>
          </Section>

          {/* Message Limit Status */}
          <Section>
            <SectionTitle>
              <BarChart size={16} />
              Daily Message Limit
            </SectionTitle>
            <MessageLimitCard>
              <MessageLimitHeader>
                <MessageLimitTitle>Messages Used Today</MessageLimitTitle>
                <MessageLimitCount $remaining={messageLimitStatus.remaining}>
                  {messageLimitStatus.used}/{messageLimitStatus.total}
                </MessageLimitCount>
              </MessageLimitHeader>
              <ProgressBar>
                <ProgressFill $percentage={usagePercentage} />
              </ProgressBar>
              <ResetInfo>
                {messageLimitStatus.remaining > 0
                  ? `${messageLimitStatus.remaining} messages remaining`
                  : 'Limit reached for today'}
                <br />
                Resets at {messageLimitStatus.resetTime}
              </ResetInfo>
            </MessageLimitCard>
          </Section>

          {/* Actions */}
          <Section>
            <SectionTitle>Actions</SectionTitle>
            <ActionButton $variant="danger" onClick={onClearChatHistory}>
              <RotateCcw size={16} />
              Clear Chat History
            </ActionButton>
          </Section>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};
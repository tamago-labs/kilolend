'use client';

import React from 'react';
import styled from 'styled-components';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useModalStore } from '@/stores/modalStore';
import { X, ArrowUpCircle, MessageCircle, AlertTriangle } from 'react-feather';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const MinimalBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const DisclaimerTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const MinimalText = styled.p`
  font-size: 15px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
  text-align: center;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  ${({ $variant }) => {
    if ($variant === 'primary') {
      return `
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        
        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
      `;
    } else {
      return `
        background: #f8fafc;
        color: #64748b;
        border: 1px solid #e2e8f0;
        
        &:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
      `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

interface WithdrawModalProps {
  aiWalletAddress: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  aiWalletAddress,
  onClose,
  onSuccess
}) => {
  const { account } = useWalletAccountStore();
  const { closeModal } = useModalStore();

  const handleClose = () => {
    closeModal();
    onClose();
  };

  const handleGoToAIChat = () => {
    // Navigate to AI chat - this would need to be implemented based on your routing
    // For now, we'll close the modal and you can implement the navigation
    handleClose();
    // TODO: Navigate to AI chat interface
    // router.push('/ai-chat') or similar
  };
 
  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <ArrowUpCircle size={20} />
            Withdraw from AI Wallet
          </ModalTitle>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <MinimalBox>
            <DisclaimerTitle>
              <AlertTriangle size={16} />
              How to Withdraw
            </DisclaimerTitle>
            <MinimalText>
              Withdrawing from AI Wallet is done through your AI agent. Go to AI Chat and tell your AI agent: 'Withdraw [amount] [token] to my main wallet'. The AI will process your request and transfer the funds.
            </MinimalText>
          </MinimalBox>

          <ActionButton onClick={handleGoToAIChat} $variant="secondary"> 
            Close
          </ActionButton>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

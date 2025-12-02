'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { aiWalletService } from '@/services/aiWalletService';
import { aiChatServiceV1 } from '@/services/AIChatServiceV1';
import { X } from "react-feather"

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

const AgentInfoSection = styled.div`
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AgentAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

const AgentDetails = styled.div`
  flex: 1;
`;

const AgentName = styled.h4`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
`;

const AgentDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
`;

const Section = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
`;

const RiskBadge = styled.span<{ $risk: 'aggressive' | 'conservative' }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $risk }) => $risk === 'aggressive' ? '#fef2f2' : '#f0fdf4'};
  color: ${({ $risk }) => $risk === 'aggressive' ? '#dc2626' : '#06C755'};
  border: 1px solid ${({ $risk }) => $risk === 'aggressive' ? '#fecaca' : '#bbf7d0'};
`;

const WarningSection = styled.div`
  background: #fffbeb;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
`;

const DangerSection = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
`;

const DangerTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #dc2626;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DangerText = styled.p`
  font-size: 14px;
  color: #991b1b;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const DeleteButton = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 14px 20px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #b91c1c;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DeleteSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const WarningTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #ea580c;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WarningText = styled.p`
  font-size: 14px;
  color: #9a3412;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const ResetButton = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 14px 20px;
  background: #ea580c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #c2410c;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #06C755;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #065f46;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #ea580c;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface AgentPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  badges: string[];
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  riskLevel: 'aggressive' | 'conservative';
  icon: string;
}

interface AgentSettingsModalProps {
  character: AgentPreset;
  model: AIModel;
  selectedSession: number;
  onClose: () => void;
  onDeleteSuccess?: () => void;
  onConversationDeleteSuccess?: () => void;
}

export const AgentSettingsModal: React.FC<AgentSettingsModalProps> = ({
  character,
  model,
  selectedSession,
  onClose,
  onDeleteSuccess,
  onConversationDeleteSuccess
}) => {
  const { account } = useWalletAccountStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDeleteAgent = async () => {
    if (!account) return;

    const confirmed = window.confirm(
      `Are you sure you want to reset ${character.name}? Current settings will be removed but conversation history will be preserved.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setSuccess(null);

    try {
      await aiWalletService.deleteAgent(account);
      setSuccess(`${character.name} has been successfully reset. Your conversation history is preserved and you can create a new agent.`);

      // Close modal after delay
      setTimeout(() => {
        onClose();
        onDeleteSuccess?.();
      }, 2000);

    } catch (error) {
      console.error('Failed to delete agent:', error);
      alert('Failed to delete agent. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!account) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the conversation for Session ${selectedSession}? This will permanently delete all messages in this session and cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeletingConversation(true);
    setSuccess(null);

    try {
      const result = await aiChatServiceV1.deleteMessages(account, selectedSession);
      setSuccess(`Successfully deleted ${result.deleted_count} messages from Session ${selectedSession}.`);

      // Close modal after delay
      setTimeout(() => {
        onClose();
        onConversationDeleteSuccess?.();
      }, 2000);

    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation. Please try again.');
      setIsDeletingConversation(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting && !isDeletingConversation) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            Agent Settings
          </ModalTitle>
          <CloseButton onClick={handleClose} disabled={isDeleting || isDeletingConversation}>
            <X />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {success && (
            <SuccessMessage>
              ✓ {success}
            </SuccessMessage>
          )}

          <AgentInfoSection>
            <AgentAvatar>
              <img
                src={character.image}
                alt={character.name}
                onError={(e) => {
                  e.currentTarget.src = '/images/icon-ai.png'; // fallback image
                }}
              />
            </AgentAvatar>
            <AgentDetails>
              <AgentName>{character.name}</AgentName>
            </AgentDetails>
          </AgentInfoSection>

          <Section>
            <SectionTitle>
              Agent Information
            </SectionTitle>
            <InfoGrid>
              <InfoRow>
                <InfoLabel>Name</InfoLabel>
                <InfoValue>{character.name}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Version</InfoLabel>
                <InfoValue>1.0</InfoValue>
              </InfoRow>
            </InfoGrid>
          </Section>

          <Section>
            <SectionTitle>
              AI Model Information
            </SectionTitle>
            <InfoGrid>
              <InfoRow>
                <InfoLabel>Model</InfoLabel>
                <InfoValue>{model.name}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Risk Level</InfoLabel>
                <InfoValue>
                  <RiskBadge $risk={model.riskLevel}>
                    {model.riskLevel.charAt(0).toUpperCase() + model.riskLevel.slice(1)}
                  </RiskBadge>
                </InfoValue>
              </InfoRow>
            </InfoGrid>
          </Section>
          <DeleteButton
            onClick={handleDeleteConversation}
            disabled={isDeletingConversation || !account}
            $loading={isDeletingConversation}
          >
            {isDeletingConversation ? (
              <>
                <DeleteSpinner />
                Deleting Conversation...
              </>
            ) : (
              <>
                Delete Conversation
              </>
            )}
          </DeleteButton>

          <WarningSection>
            <WarningTitle>
              ⚠️ Reset Agent
            </WarningTitle>
            <WarningText>
              Resetting this agent will remove current settings and configuration, but your conversation history will be preserved. You can create a new agent with a different model and character afterward.
            </WarningText>
            <ResetButton
              onClick={handleDeleteAgent}
              disabled={isDeleting || !account}
              $loading={isDeleting}
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner />
                  Resetting Agent...
                </>
              ) : (
                <>
                  Reset {character.name}
                </>
              )}
            </ResetButton>
          </WarningSection>


        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

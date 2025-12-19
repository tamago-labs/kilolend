import React from 'react';
import styled from 'styled-components';
import type { AgentPreset } from '@/types/aiAgent';
import {
  ReviewContainer,
  ReviewSection,
  ReviewLabel,
  ReviewValue,
  ReviewCharacter,
  ReviewModel,
  CharacterAvatar,
  CharacterAvatarImage,
  ModelIcon,
  ModelIconImage,
  StepTitle,
  StepSubtitle,
  ButtonContainer,
  Button,
  InfoBox
} from './styled'; 

const Container = styled.div`
  display: flex;
  flex-direction: column; 
  padding: 24px;

  @media (max-width: 480px) {
    padding: 20px;
  }

`;

const LoadingSpinner = styled.div<{ size?: number }>`
  width: ${({ size = 16 }) => size}px;
  height: ${({ size = 16 }) => size}px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilityLevel: 'advanced' | 'standard';
  icon: string;
}

interface ReviewStepProps {
  selectedCharacter: AgentPreset;
  selectedModel: AIModel;
  onConfirm: () => void;
  onBack: () => void;
  isCreatingWallet?: boolean;
  creationError?: string | null;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  selectedCharacter,
  selectedModel,
  onConfirm,
  onBack,
  isCreatingWallet = false,
  creationError = null,
}) => {
  return (
    <Container>
      <StepTitle>Review Your AI Agent</StepTitle>
      <StepSubtitle>
        Confirm your selections to create your personalized AI trading agent
      </StepSubtitle>

      <ReviewContainer>
        <ReviewSection>
          <ReviewLabel>Selected Character</ReviewLabel>
          <ReviewValue>
            <ReviewCharacter>
              <CharacterAvatar>
                <CharacterAvatarImage
                  src={selectedCharacter.image}
                  alt={selectedCharacter.name}
                />
              </CharacterAvatar>
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                  {selectedCharacter.name}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {selectedCharacter.description}
                </div>
              </div>
            </ReviewCharacter>
          </ReviewValue>
        </ReviewSection>

        <ReviewSection>
          <ReviewLabel>Selected AI Model</ReviewLabel>
          <ReviewValue>
            <ReviewModel>
              <ModelIcon>
                <ModelIconImage
                  src={selectedModel.icon}
                  alt={selectedModel.name}
                />
              </ModelIcon>
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                  {selectedModel.name}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                  {selectedModel.provider}
                </div>
                <div style={{
                  fontSize: '12px', padding: '4px 8px', borderRadius: '6px', display: 'inline-block',
                  background: selectedModel.capabilityLevel === 'advanced' ? '#dbeafe' : '#f3f4f6',
                  color: selectedModel.capabilityLevel === 'advanced' ? '#1e40af' : '#374151',
                  border: `1px solid ${selectedModel.capabilityLevel === 'advanced' ? '#93c5fd' : '#d1d5db'}`
                }}>
                  {selectedModel.capabilityLevel === 'advanced' ? 'Advanced' : 'Standard'}
                </div>
              </div>
            </ReviewModel>
          </ReviewValue>
        </ReviewSection>
      </ReviewContainer>

      <ButtonContainer>
        <Button $variant="secondary" onClick={onBack} disabled={isCreatingWallet}>
          Back
        </Button>
        <Button
          $variant="primary"
          onClick={onConfirm}
          disabled={isCreatingWallet}
        >
          {isCreatingWallet ? (
            <LoadingContent>
              <LoadingSpinner size={16} />
              Creating AI Agent...
            </LoadingContent>
          ) : (
            'Create AI Agent'
          )}
        </Button>
      </ButtonContainer>

      {creationError && (
        <InfoBox style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
          <strong>Error:</strong> {creationError}
        </InfoBox>
      )}

    </Container>
  );
};

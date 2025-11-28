import React from 'react';
import {
  ModelGrid,
  ModelCard,
  ModelHeader,
  ModelIcon,
  ModelIconImage,
  ModelInfo,
  ModelName,
  ModelProvider,
  ModelDescription,
  RiskBadge,
  StepTitle,
  StepSubtitle,
  ButtonContainer,
  Button,
  InfoBox
} from './styled';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column; 
  padding: 24px;

  @media (max-width: 480px) {
    padding: 20px;
  }

`;

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  riskLevel: 'aggressive' | 'conservative';
  icon: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    description: 'Advanced reasoning with aggressive trading strategies for maximum returns',
    riskLevel: 'aggressive',
    icon: '/images/icon-robot.png'
  },
  {
    id: 'aws-nova-pro',
    name: 'AWS Nova Pro',
    provider: 'Amazon Web Services',
    description: 'Conservative approach focused on capital preservation and steady growth',
    riskLevel: 'conservative',
    icon: '/images/icon-credit-card.png'
  }
];

interface ModelSelectionStepProps {
  selectedModel: AIModel | null;
  onModelSelect: (model: AIModel) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ModelSelectionStep: React.FC<ModelSelectionStepProps> = ({
  selectedModel,
  onModelSelect,
  onNext,
  onBack,
}) => {
  return (
    <Container>
      <StepTitle>Choose AI Model</StepTitle>
      <StepSubtitle>
        Select the AI model that will power your trading decisions
      </StepSubtitle>

      <ModelGrid>
        {AI_MODELS.map((model) => (
          <ModelCard
            key={model.id}
            $selected={selectedModel?.id === model.id}
            onClick={() => onModelSelect(model)}
          >
            <ModelHeader>
              <ModelIcon>
                <ModelIconImage
                  src={model.icon}
                  alt={model.name}
                />
              </ModelIcon>
              <ModelInfo>
                <ModelName>{model.name}</ModelName>
                <ModelProvider>{model.provider}</ModelProvider>
              </ModelInfo>
            </ModelHeader>
            <ModelDescription>{model.description}</ModelDescription>
            <RiskBadge $risk={model.riskLevel}>
              {model.riskLevel === 'aggressive' ? 'Risk Aggressive' : 'Risk Conservative'}
            </RiskBadge>
          </ModelCard>
        ))}
      </ModelGrid>

      <ButtonContainer>
        <Button $variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          $variant="primary"
          onClick={onNext}
          disabled={!selectedModel}
        >
          Next Step
        </Button>
      </ButtonContainer>

      <InfoBox>
        <strong>About AI Models:</strong>
        <ul>
          <li><strong>Risk Aggressive:</strong> Pursues higher returns with advanced strategies</li>
          <li><strong>Risk Conservative:</strong> Prioritizes capital preservation and steady growth</li>
          <li>Both models can execute transactions on your behalf through the backend</li>
        </ul>
      </InfoBox>
    </Container>
  );
};

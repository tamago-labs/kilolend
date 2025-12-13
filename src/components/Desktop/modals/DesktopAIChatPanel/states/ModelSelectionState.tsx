import React from 'react';
import styled from 'styled-components';
import { ModelOption } from '../components/ModelOption';
import type { AIModel, AgentPreset } from '../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
`;

const SelectedAgent = styled.div`
  background: linear-gradient(135deg, rgba(6, 199, 85, 0.05), rgba(5, 146, 18, 0.05));
  border: 1px solid #06C755;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AgentAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const AgentName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #06C755;
`;

const ModelList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
`;

const NavigationContainer = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const NavButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
  
  ${({ $primary }) => $primary ? `
    background: #06C755;
    color: white;
    border-color: #06C755;
    
    &:hover {
      background: #059212;
      border-color: #059212;
    }
    
    &:disabled {
      background: #94a3b8;
      border-color: #94a3b8;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: #64748b;
    border-color: #e2e8f0;
    
    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  `}
`;

interface ModelSelectionStateProps {
  models: AIModel[];
  selectedModel: AIModel | null;
  selectedAgent: AgentPreset;
  onModelSelect: (model: AIModel) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const ModelSelectionState: React.FC<ModelSelectionStateProps> = ({
  models,
  selectedModel,
  selectedAgent,
  onModelSelect,
  onNext,
  onBack,
  isLoading = false
}) => {
  return (
    <Container>
      <Header>
        <Title>Choose AI Model</Title>
        <Subtitle>
          Select the AI model that will power your agent's responses and analysis.
        </Subtitle>
      </Header>
      
      <SelectedAgent>
        <AgentAvatar>{selectedAgent.avatar}</AgentAvatar>
        <AgentName>{selectedAgent.name} selected</AgentName>
      </SelectedAgent>
      
      <ModelList>
        {models.map((model) => (
          <ModelOption
            key={model.id}
            model={model}
            selected={selectedModel?.id === model.id}
            onSelect={() => onModelSelect(model)}
          />
        ))}
      </ModelList>
      
      <NavigationContainer>
        <NavButton onClick={onBack} disabled={isLoading}>
          Back
        </NavButton>
        <NavButton 
          $primary 
          onClick={onNext} 
          disabled={!selectedModel || isLoading}
        >
          {isLoading ? 'Creating Agent...' : 'Create Agent'}
        </NavButton>
      </NavigationContainer>
    </Container>
  );
};

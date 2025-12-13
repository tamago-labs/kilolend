import React from 'react';
import styled from 'styled-components';
import { AgentCard } from '../components/AgentCard';
import type { AgentPreset } from '../types';

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

const AgentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

interface CharacterSelectionStateProps {
  agents: AgentPreset[];
  selectedAgent: AgentPreset | null;
  onAgentSelect: (agent: AgentPreset) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const CharacterSelectionState: React.FC<CharacterSelectionStateProps> = ({
  agents,
  selectedAgent,
  onAgentSelect,
  onNext,
  onBack,
  isLoading = false
}) => {
  return (
    <Container>
      <Header>
        <Title>Choose Your AI Agent</Title>
        <Subtitle>
          Select an AI personality.
        </Subtitle>
      </Header>
      
      <AgentGrid>
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            selected={selectedAgent?.id === agent.id}
            onSelect={() => onAgentSelect(agent)}
          />
        ))}
      </AgentGrid>
      
      <NavigationContainer>
        <NavButton onClick={onBack} disabled={isLoading}>
          Back
        </NavButton>
        <NavButton 
          $primary 
          onClick={onNext} 
          disabled={!selectedAgent || isLoading}
        >
          {isLoading ? 'Processing...' : 'Next'}
        </NavButton>
      </NavigationContainer>
    </Container>
  );
};

import React from 'react';
import styled from 'styled-components';
import type { AgentPreset } from '../types';

const Card = styled.div<{ $selected: boolean }>`
  background: white;
  border: 2px solid ${props => props.$selected ? '#06C755' : '#e2e8f0'};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 140px;

  &:hover {
    border-color: #06C755; 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  ${props => props.$selected && `
    background: #f0fdf4;
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.15);
  `}
`;

const AgentAvatar = styled.div`
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const AgentName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

interface AgentCardProps {
  agent: AgentPreset;
  selected: boolean;
  onSelect: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, selected, onSelect }) => {
  return (
    <Card $selected={selected} onClick={onSelect}>
      <AgentAvatar>
        <img src={agent.image} alt={agent.name} />
      </AgentAvatar>
      <AgentName>{agent.name}</AgentName>
    </Card>
  );
};

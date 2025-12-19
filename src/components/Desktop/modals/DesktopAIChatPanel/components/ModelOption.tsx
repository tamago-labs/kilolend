import React from 'react';
import styled from 'styled-components';
import type { AIModel } from '../types';

const Option = styled.div<{ $selected: boolean }>`
  background: white;
  border: 2px solid ${props => props.$selected ? '#06C755' : '#e2e8f0'};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: 12px;
  
  &:hover {
    border-color: ${props => props.$selected ? '#06C755' : '#cbd5e1'};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  ${props => props.$selected && `
    background: linear-gradient(135deg, rgba(6, 199, 85, 0.05), rgba(5, 146, 18, 0.05));
  `}
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SelectedIndicator = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: #06C755;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
`;

const ModelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ModelIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;

  @media (max-width: 480px) {
    background: transparent;
    border: none;
    width: 40px;
    height: 40px;
  }
`;

const ModelIconImage = styled.img`
  width: 80%;
  height: 80%;
  object-fit: contain;
`;

const ModelInfo = styled.div`
  flex: 1;
`;

const ModelName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
`;

const ModelProvider = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0;
`;

const ModelDescription = styled.p`
  font-size: 13px;
  color: #475569;
  line-height: 1.4;
  margin: 0 0 12px 0;
`;

const CapabilityBadge = styled.span<{ $level: 'advanced' | 'standard' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  
  ${props => props.$level === 'advanced' ? `
    background: rgba(59, 130, 246, 0.1);
    color: #1e40af;
  ` : `
    background: rgba(107, 114, 128, 0.1);
    color: #374151;
  `}
`;

interface ModelOptionProps {
  model: AIModel;
  selected: boolean;
  onSelect: () => void;
}

export const ModelOption: React.FC<ModelOptionProps> = ({ model, selected, onSelect }) => {
  return (
    <Option $selected={selected} onClick={onSelect}>
      {selected && <SelectedIndicator>✓</SelectedIndicator>}
      
      <ModelHeader>
        <ModelIcon>
          <ModelIconImage src={model.icon} alt={model.name} />
        </ModelIcon>
        <ModelInfo>
          <ModelName>{model.name}</ModelName>
          <ModelProvider>{model.provider}</ModelProvider>
        </ModelInfo>
      </ModelHeader>
      
      <ModelDescription>{model.description}</ModelDescription>
      
      <CapabilityBadge $level={model.capabilityLevel}>
        {model.capabilityLevel === 'advanced' ? 'Advanced' : 'Standard'}
      </CapabilityBadge>
    </Option>
  );
};

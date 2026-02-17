"use client";

import styled from 'styled-components';

const ChainSelectorContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ChainLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
`;

const ChainButton = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => $active ? '#06C755' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#1e293b'};
  border: 1px solid ${({ $active }) => $active ? '#06C755' : '#e2e8f0'};
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${({ $active }) => $active ? '#059669' : '#f8fafc'};
  }
`;

const ChainIcon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
`;

export interface Chain {
  id: string;
  name: string;
  chainId: number;
  icon: string;
}

interface ChainSelectorProps {
  selectedChain: string;
  chains: Chain[];
  onChainChange: (chain: string) => void;
}

export const ChainSelector = ({
  selectedChain,
  chains,
  onChainChange,
}: ChainSelectorProps) => {
  return (
    <ChainSelectorContainer>
      <ChainLabel>Chain:</ChainLabel>
      {chains.map((chain) => (
        <ChainButton
          key={chain.id}
          $active={selectedChain === chain.id}
          onClick={() => onChainChange(chain.id)}
        >
          {chain.icon && (
            <ChainIcon 
              src={chain.icon} 
              alt={chain.name}
            />
          )}
          {chain.name}
        </ChainButton>
      ))}
    </ChainSelectorContainer>
  );
};

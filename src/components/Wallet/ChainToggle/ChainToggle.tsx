'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { useChain } from '@/contexts/ChainContext';
 

const ChainToggleContainer = styled.div`
  display: flex;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
  margin-right: 16px;
`;

const ChainOption = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  color: ${({ $active }) => $active ? '#1e293b' : '#64748b'};
  border: 1px solid ${({ $active }) => $active ? '#06C755' : 'transparent'};
  box-shadow: ${({ $active }) => $active ? '0 2px 8px rgba(6, 199, 85, 0.15)' : 'none'};
  position: relative;

  &:hover {
    background: ${({ $active }) => $active ? 'white' : '#f1f5f9'};
    color: #1e293b;
  }
`;

const Tooltip = styled.div<{ $visible?: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  max-width: 300px;
  text-align: center;
  line-height: 1.4;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  visibility: ${({ $visible }) => $visible ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  margin-top: 8px;
  z-index: 1000;

  &::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-bottom-color: #1e293b;
  }
`;

export const ChainToggle = () => {
  const { selectedChain, setSelectedChain } = useChain();
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  return (
    <ChainToggleContainer>
      <ChainOption
        $active={selectedChain === 'kaia'}
        onClick={() => setSelectedChain('kaia')}
        onMouseEnter={() => setTooltipVisible('social')}
        onMouseLeave={() => setTooltipVisible(null)}
      > 
        Use Social Login
        <Tooltip $visible={tooltipVisible === 'social'}>
          Available on KAIA only (KUB coming soon)
        </Tooltip>
      </ChainOption>
      <ChainOption 
        $active={selectedChain === 'kub'}
        onClick={() => setSelectedChain('kub')}
        onMouseEnter={() => setTooltipVisible('web3')}
        onMouseLeave={() => setTooltipVisible(null)}
      >
        Use Web3 Wallet
        <Tooltip $visible={tooltipVisible === 'web3'}>
          Available both KAIA and KUB chains
        </Tooltip> 
      </ChainOption>
    </ChainToggleContainer>
  );
}; 
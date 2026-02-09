'use client';

import styled from 'styled-components';
import { kaia, kubChain } from '@/wagmi_config';
import { useSwitchChain, useChainId } from 'wagmi';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  min-width: 360px;
  max-width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
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

const ChainList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ChainOption = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid ${({ $active }) => $active ? '#06C755' : '#e2e8f0'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $active }) => $active ? '#f0fdf4' : 'white'};
  
  &:hover {
    border-color: #06C755;
    background: #f8fafc;
  }
`;

const ChainIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const ChainInfo = styled.div`
  flex: 1;
`;

const ChainName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const ChainDescription = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const ActiveIndicator = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #06C755;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
`;

const chains = [
  {
    ...kaia,
    icon: '/images/blockchain-icons/kaia-token-icon.png',
    description: 'KAIA Mainnet'
  },
  {
    ...kubChain,
    icon: '/images/blockchain-icons/kub-chain-icon.png',
    description: 'KUB Chain'
  }
];

interface NetworkSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkSwitchModal = ({ isOpen, onClose }: NetworkSwitchModalProps) => {
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  const handleChainSwitch = (targetChainId: number) => {
    if (targetChainId !== chainId) {
      switchChain({ chainId: targetChainId });
    }
    onClose();
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Switch Network</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ChainList>
          {chains.map((chain) => (
            <ChainOption
              key={chain.id}
              $active={chain.id === chainId}
              onClick={() => handleChainSwitch(chain.id)}
            >
              <ChainIcon src={chain.icon} alt={chain.name} />
              <ChainInfo>
                <ChainName>{chain.name}</ChainName>
                <ChainDescription>{chain.description}</ChainDescription>
              </ChainInfo>
              {chain.id === chainId && (
                <ActiveIndicator>✓</ActiveIndicator>
              )}
            </ChainOption>
          ))}
        </ChainList>
      </ModalContent>
    </ModalOverlay>
  );
};
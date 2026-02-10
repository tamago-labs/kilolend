'use client';

import styled from 'styled-components';
import { DesktopBaseModal } from '../../Desktop/modals/shared/DesktopBaseModal';
import { WalletOptions } from '../WalletOptions/WalletOptions';

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DescriptionText = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  text-align: center;
`;

const WalletOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    border-color: #06C755;
    color: #06C755;
  }
`;

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelect?: (connector: any) => void;
}

export const WalletSelectionModal = ({ isOpen, onClose, onWalletSelect }: WalletSelectionModalProps) => {
  return (
    <DesktopBaseModal isOpen={isOpen} onClose={onClose} title="Connect Wallet" width="400px">
      <ModalContainer>
        <DescriptionText>
          Choose your preferred wallet to connect
        </DescriptionText>

        <WalletOptionsContainer>
          <WalletOptions onWalletSelect={onWalletSelect} />
        </WalletOptionsContainer> 

        <CloseButton onClick={onClose}>
          Close
        </CloseButton>
      </ModalContainer>
    </DesktopBaseModal>
  );
};

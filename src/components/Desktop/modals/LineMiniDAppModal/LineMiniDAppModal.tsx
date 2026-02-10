'use client';

import styled from 'styled-components';
import { DesktopBaseModal } from '../shared/DesktopBaseModal';
import { LINE_LIFF_URL } from '@/config/version';
import QRCode from 'react-qr-code';
import { ExternalLink } from 'react-feather';

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const QRSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: #f8fafc;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
`;

const QRContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const QRInstructions = styled.div`
  text-align: center;
`;

const QRTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const QRDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

const ChainNotice = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ChainNoticeIcon = styled.div`
  color: #f59e0b;
  font-size: 20px;
  flex-shrink: 0;
`;

const ChainNoticeText = styled.div`
  font-size: 14px;
  color: #92400e;
  line-height: 1.5;
`;

const ActionSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const PrimaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 32px;
  background: #06C755;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(6, 199, 85, 0.25);

  &:hover {
    background: #05b648;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(6, 199, 85, 0.35);
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    border-color: #06C755;
    color: #06C755;
  }
`;

export interface LineMiniDAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LineMiniDAppModal = ({ isOpen, onClose }: LineMiniDAppModalProps) => {
  const handleOpenLine = () => {
    window.open(LINE_LIFF_URL, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(LINE_LIFF_URL);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <DesktopBaseModal isOpen={isOpen} onClose={onClose} title="LINE Mini DApp">
      <ModalContainer>
       
        <QRSection>
          <QRInstructions>
            <QRTitle>Scan to Open in LINE</QRTitle>
            <QRDescription>
              Use your phone's camera or LINE app to scan this QR code and start your DeFi journey on LINE Mini dapp
            </QRDescription>
          </QRInstructions>
          <QRContainer>
            <QRCode 
              value={LINE_LIFF_URL} 
              size={200}
              level="M"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </QRContainer>
          <ActionSection>
           <SecondaryButton onClick={handleCopyLink}>
            Copy Link to Share
          </SecondaryButton>
          <PrimaryButton
            href={LINE_LIFF_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            <ExternalLink size={20} />
            Open in LINE Now
          </PrimaryButton>
         
        </ActionSection>
        </QRSection>
         <ChainNotice>
          <ChainNoticeIcon>⚠️</ChainNoticeIcon>
          <ChainNoticeText>
            <strong>KAIA Chain Support:</strong> LINE Mini DApp currently works with KAIA chain only.
          </ChainNoticeText>
        </ChainNotice>

        
      </ModalContainer>
    </DesktopBaseModal>
  );
};

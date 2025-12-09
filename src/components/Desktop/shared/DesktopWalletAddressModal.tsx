'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { DesktopBaseModal } from './DesktopBaseModal';
import { Copy, Check, ExternalLink } from 'react-feather';
import QRCode from "react-qr-code";

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
`;

const WalletIcon = styled.div`
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #06C755, #05b648);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 6px 20px rgba(6, 199, 85, 0.3);
  font-size: 32px;
  font-weight: 700;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #64748b;
  text-align: center;
  margin-bottom: 32px;
  line-height: 1.5;
  max-width: 400px;
`;

const NetworkBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #1e293b;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #06C755;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const NetworkIcon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
`;

const QRContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }
`;

const AddressSection = styled.div`
  width: 100%;
  margin-bottom: 32px;
`;

const AddressLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AddressContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e1;
    background: #f1f5f9;
  }
`;

const AddressText = styled.div`
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  color: #1e293b;
  word-break: break-all;
  line-height: 1.4;
`;

const CopyButton = styled.button<{ $copied?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: ${({ $copied }) => ($copied ? '#06C755' : 'white')};
  color: ${({ $copied }) => ($copied ? 'white' : '#64748b')};
  border: 2px solid ${({ $copied }) => ($copied ? '#06C755' : '#e2e8f0')};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${({ $copied }) => ($copied ? '#05b648' : '#f8fafc')};
    border-color: ${({ $copied }) => ($copied ? '#05b648' : '#cbd5e1')};
    transform: translateY(-1px);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 14px 20px;
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const InfoSection = styled.div`
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border: 1px solid #3b82f6;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  width: 100%;
`;

const InfoTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoText = styled.div`
  font-size: 13px;
  color: #1e40af;
  line-height: 1.5;

  ul {
    margin: 8px 0 0 16px;
    padding: 0;
  }

  li {
    margin-bottom: 4px;
  }

  strong {
    font-weight: 600;
  }
`;

interface DesktopWalletAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export const DesktopWalletAddressModal = ({ isOpen, onClose, walletAddress }: DesktopWalletAddressModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleViewOnExplorer = () => { 
    window.open(`https://kaiascan.io/account/${walletAddress}`, '_blank');
  };

  return (
    <DesktopBaseModal isOpen={isOpen} onClose={onClose} title="Wallet Details" width="520px">
      <ModalContainer> 
        
        <Subtitle>
          Use this address to receive KAIA and supported tokens. Share the QR code or copy the address below.
        </Subtitle>

        <NetworkBadge>
          <NetworkIcon src="/images/kaia-token-icon.png" alt="KAIA" />
          KAIA Mainnet
        </NetworkBadge>

        <QRContainer>
          <QRCode 
            value={walletAddress} 
            size={200}
            level="M"
          />
        </QRContainer>

        <AddressSection>
          <AddressLabel>Wallet Address</AddressLabel>
          <AddressContainer>
            <AddressText>{walletAddress}</AddressText>
            <CopyButton onClick={handleCopyAddress} $copied={copied}>
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </CopyButton>
          </AddressContainer>
        </AddressSection>

        <InfoSection>
          <InfoTitle>
            <ExternalLink size={16} />
            Important Information
          </InfoTitle>
          <InfoText>
            <ul>
              <li>Only send <strong>KAIA Mainnet</strong> compatible tokens to this address</li>
              <li>Double-check the address before sending large amounts</li>
              <li>This address is for receiving - sending requires your wallet app</li>
            </ul>
          </InfoText>
        </InfoSection>

        <ActionButtons>
          <ActionButton onClick={handleViewOnExplorer}>
            <ExternalLink size={18} />
            View on Explorer
          </ActionButton>
        </ActionButtons>
      </ModalContainer>
    </DesktopBaseModal>
  );
};

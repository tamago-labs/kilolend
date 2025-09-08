'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { BaseModal } from './BaseModal';
import { Copy, Check, ExternalLink } from 'react-feather';
import QRCode from "react-qr-code";

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  padding-top: 10px;
  max-width: 400px;
  margin: 0 auto;
`;

const WalletIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #06C755, #05b648);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const QRContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AddressSection = styled.div`
  width: 100%;
  margin-bottom: 24px;
`;

const AddressLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AddressContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  gap: 12px;
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
  width: 40px;
  height: 40px;
  background: ${({ $copied }) => ($copied ? '#06C755' : 'white')};
  color: ${({ $copied }) => ($copied ? 'white' : '#64748b')};
  border: 1px solid ${({ $copied }) => ($copied ? '#06C755' : '#e2e8f0')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${({ $copied }) => ($copied ? '#05b648' : '#f1f5f9')};
    border-color: ${({ $copied }) => ($copied ? '#05b648' : '#cbd5e1')};
  }
`;

const WarningSection = styled.div`
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  width: 100%;
`;

const WarningTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const WarningText = styled.div`
  font-size: 13px;
  color: #92400e;
  line-height: 1.5;

  ul {
    margin: 8px 0 0 16px;
    padding: 0;
  }

  li {
    margin-bottom: 4px;
  }
`;

const InfoSection = styled.div`
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border: 1px solid #3b82f6;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  width: 100%;
`;

const InfoTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
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
    transform: translateY(-1px);
  }
`;

const NetworkBadge = styled.div`
  background: linear-gradient(135deg, #06C755, #05b648);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

interface WalletAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export const WalletAddressModal = ({ isOpen, onClose, walletAddress }: WalletAddressModalProps) => {
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

  const formatAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleViewOnExplorer = () => { 
    window.open(`https://www.kaiascan.io/account/${walletAddress}`, '_blank');
  };

 

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Your Wallet Address">
      <ModalContainer> 
 
        <Subtitle>
          Use this address to receive KAIA and supported tokens. Share the QR code or copy the address below.
        </Subtitle>

        <NetworkBadge>
          <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }}></div>
          KAIA Mainnet
        </NetworkBadge>

        <QRContainer>
          <QRCode 
            value={walletAddress} 
            size={180}
            level="M"
            // includeMargin={false}
          />
        </QRContainer>

        <AddressSection>
          <AddressLabel>Wallet Address</AddressLabel>
          <AddressContainer>
            <AddressText>{walletAddress}</AddressText>
            <CopyButton onClick={handleCopyAddress} $copied={copied}>
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </CopyButton>
          </AddressContainer>
        </AddressSection> 
        {/* <WarningSection>
          <WarningTitle>
            ⚠️ Important Security Notes
          </WarningTitle>
          <WarningText>
            <ul>
              <li>Only send <strong>KAIA network</strong> compatible tokens to this address</li>
              <li>Double-check the address before sending large amounts</li> 
              <li>This address is only for receiving - sending requires your wallet app</li>
            </ul>
          </WarningText>
        </WarningSection> */}

        <ActionButtons>
          <ActionButton onClick={handleViewOnExplorer}>
            <ExternalLink size={16} />
            View on Explorer
          </ActionButton> 
        </ActionButtons>
      </ModalContainer>
    </BaseModal>
  );
};

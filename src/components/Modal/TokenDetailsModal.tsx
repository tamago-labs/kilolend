'use client';

import styled from 'styled-components';
import { X, TrendingUp, TrendingDown, ExternalLink, Copy } from 'react-feather';
import { FAUCET_TOKENS, FaucetTokenSymbol } from '@/utils/tokenConfig';
import { liff } from "@/utils/liff";
import { KAIA_SCAN_URL } from "@/utils/ethersConfig"


const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #64748b;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const ModalBody = styled.div`
  padding: 0 24px 24px 24px;
`;

const TokenHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
`;

const TokenIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TokenIconImage = styled.img`
  width: 75%;
  height: 75%;
  object-fit: contain;
`;

const TokenInfo = styled.div`
  flex: 1;
`;

const TokenName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const TokenSymbol = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const PriceSection = styled.div`
  margin-bottom: 24px;
`;

const CurrentPrice = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const PriceChange = styled.div<{ $positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  font-weight: 600;
  color: ${({ $positive }) => $positive ? '#06C755' : '#ef4444'};
`;

const DetailsGrid = styled.div`
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
`;

const DetailLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const DetailValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  text-align: right;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 24px;
`;

const ActionButton = styled.button<{ $primary?: boolean; $faucet?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;

  ${({ $primary, $faucet }) => {
    if ($faucet) {
      return `
        background: linear-gradient(135deg, #0ea5e9, #0284c7);
        color: white;
        border-color: transparent;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }
      `;
    } else if ($primary) {
      return `
        background: linear-gradient(135deg, #00C300, #00A000);
        color: white;
        border-color: transparent;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 195, 0, 0.3);
        }
      `;
    }
    return `
      background: white;
      color: #64748b;
      border-color: #e2e8f0;
      
      &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
    `;
  }}
`;

const AddressSection = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
`;

const AddressLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
`;

const AddressValue = styled.div`
  font-family: monospace;
  font-size: 13px;
  color: #1e293b;
  word-break: break-all;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #64748b;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

interface TokenDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFaucet?: () => void;
  tokenData: any
}

export const TokenDetailsModal = ({ isOpen, onClose, onOpenFaucet, tokenData }: TokenDetailsModalProps) => {
  if (!isOpen) return null;

  const { symbol, balance, price } = tokenData;
  
  const handleCopyAddress = async () => {
    if (balance?.address) {
      try {
        await navigator.clipboard.writeText(balance.address);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const handleViewOnExplorer = () => {
    if (balance?.address) {
      const explorerUrl = `${KAIA_SCAN_URL}/token/${balance.address}`;
      if (liff.isInClient()) {
        liff.openWindow({
          url: explorerUrl,
          external: true,
        });
      } else { 
        window.open(explorerUrl, '_blank');
      }
      
    }
  };

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  const usdValue = price && balance ? parseFloat(balance.balance) * price.price : 0;
  const changeIsPositive = price ? price.change24h >= 0 : true;
  const isTestnetToken = FAUCET_TOKENS.includes(symbol as FaucetTokenSymbol);



  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Token Details</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <TokenHeader>
            <TokenIcon>
              <TokenIconImage 
                src={balance?.icon} 
                alt={symbol}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  if (img.parentElement) {
                    img.parentElement.innerHTML = `<b>${symbol.charAt(0)}</b>`;
                  }
                }}
              />
            </TokenIcon>
            <TokenInfo>
              <TokenName>{balance?.name || symbol}</TokenName>
              <TokenSymbol>{symbol}</TokenSymbol>
            </TokenInfo>
          </TokenHeader>

          {price && (
            <PriceSection>
              <CurrentPrice>${price.price.toFixed(6)}</CurrentPrice>
              <PriceChange $positive={changeIsPositive}>
                {changeIsPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {changeIsPositive ? '+' : ''}{price.change24h.toFixed(2)}% (24h)
              </PriceChange>
            </PriceSection>
          )}

          <DetailsGrid>
            {balance && (
              <DetailItem>
                <DetailLabel>Your Balance</DetailLabel>
                <DetailValue>{parseFloat(balance.formattedBalance).toFixed(4)} {symbol}</DetailValue>
              </DetailItem>
            )}

            {usdValue > 0 && (
              <DetailItem>
                <DetailLabel>USD Value</DetailLabel>
                <DetailValue>${usdValue.toFixed(2)}</DetailValue>
              </DetailItem>
            )}

            {price && (
              <>
                <DetailItem>
                  <DetailLabel>Market Cap</DetailLabel>
                  <DetailValue>${formatLargeNumber(price.market_cap || 0)}</DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>24h Volume</DetailLabel>
                  <DetailValue>${formatLargeNumber(price.volume_24h || 0)}</DetailValue>
                </DetailItem>

                {price.lastUpdated && (
                  <DetailItem>
                    <DetailLabel>Last Updated</DetailLabel>
                    <DetailValue>
                      {new Date(price.lastUpdated).toLocaleString()}
                    </DetailValue>
                  </DetailItem>
                )}
              </>
            )}
          </DetailsGrid>

          {balance?.address && balance.address !== '0x0000000000000000000000000000000000000000' && (
            <AddressSection>
              <AddressLabel>Contract Address</AddressLabel>
              <AddressValue>
                <span>{balance.address}</span>
                <div>
                  <CopyButton onClick={handleCopyAddress} title="Copy address">
                    <Copy size={14} />
                  </CopyButton>
                </div>
              </AddressValue>
            </AddressSection>
          )}
   
          <ActionButtons> 
            
            <ActionButton onClick={handleViewOnExplorer}>
              <ExternalLink size={16} />
              View on Explorer
            </ActionButton>
             
          </ActionButtons>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};
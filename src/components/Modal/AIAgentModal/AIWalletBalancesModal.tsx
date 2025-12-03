'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';
import { aiWalletService, AIWalletStatus } from '@/services/aiWalletService';
import { useAITokenBalances } from '@/hooks/useAITokenBalances';
import { RefreshCw, ArrowUpCircle, Plus, CreditCard, AlertCircle, Info, ArrowDownCircle, X } from 'react-feather';
import { PRICE_API_CONFIG, KAIA_MAINNET_TOKENS } from '@/utils/tokenConfig';

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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
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


const BottomCloseButton = styled.button`
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 12px 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #f1f5f9;
    border-color: #cbd5e1;
    color: #1e293b;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;


const ModalBody = styled.div`
   
`;

const StatusSection = styled.div`
  background: linear-gradient(135deg, #fef3c7, #fef9e7);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusIcon = styled.div`
  color: #f59e0b;
  flex-shrink: 0;
`;

const StatusContent = styled.div`
  flex: 1;
`;

const StatusTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 4px;
`;

const StatusText = styled.div`
  font-size: 13px;
  color: #78350f;
  line-height: 1.4;
`;

const CreateWalletSection = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const CreateWalletIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #00C300, #00A000);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
`;

const CreateWalletTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const CreateWalletDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 20px;
  max-width: 280px;
  margin-left: auto;
  margin-right: auto;
`;

const CreateWalletButton = styled.button<{ $loading?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #00C300, #00A000);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 auto;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 195, 0, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TokensSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;  
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const RefreshButton = styled.button<{ $loading?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  svg {
    animation: ${({ $loading }) => $loading ? 'spin 1s linear infinite' : 'none'};
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TokenRow = styled.div<{ $hasBalance?: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px;
  background: ${({ $hasBalance }) => $hasBalance ? '#f8fafc' : '#fafbfc'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${({ $hasBalance }) => $hasBalance ? 'transparent' : '#f1f5f9'};
  opacity: ${({ $hasBalance }) => $hasBalance ? 1 : 0.7};

  &:hover {
    background: #f1f5f9;
    border-color: #e2e8f0;
    transform: translateY(-1px);
    opacity: 1;
  }
`;

const TokenIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TokenIconImage = styled.img`
  width: 75%;
  height: 75%;
  object-fit: contain;
`;

const TokenInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TokenName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
  margin-bottom: 2px;
`;

const TokenPrice = styled.div<{ $positive?: boolean }>`
  font-size: 13px;
  color: ${({ $positive }) => $positive ? '#06C755' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TokenBalance = styled.div`
  text-align: right;
`;

const TokenBalanceAmount = styled.div<{ $hasBalance?: boolean }>`
  font-weight: 600;
  color: ${({ $hasBalance }) => $hasBalance ? '#1e293b' : '#94a3b8'};
  font-size: 16px;
  margin-bottom: 2px;
`;

const TokenBalanceValue = styled.div<{ $hasBalance?: boolean }>`
  font-size: 13px;
  color: ${({ $hasBalance }) => $hasBalance ? '#64748b' : '#cbd5e1'};
`;

const ZeroBalanceText = styled.span`
  color: #94a3b8;
  font-style: italic;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #dc2626;
  font-size: 14px;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #64748b;
`;

const WalletActionsSection = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const WalletSubtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
  line-height: 1.4;
  text-align: center;
`;

const InfoAlertSection = styled.div`
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InfoAlertIcon = styled.div`
  color: #3b82f6;
  flex-shrink: 0;
`;

const InfoAlertContent = styled.div`
  flex: 1;
`;

const InfoAlertText = styled.div`
  font-size: 14px;
  color: #1e40af;
  line-height: 1.4;
  font-weight: 500;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const ActionButton = styled.button<{ $variant?: 'deposit' | 'withdraw' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
  background: white;
  color: #1e293b;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

interface AIWalletBalancesModalProps {
  onClose: () => void;
}

export const AIWalletBalancesModal: React.FC<AIWalletBalancesModalProps> = ({ onClose }) => {
  const { account } = useWalletAccountStore();
  const [aiWalletData, setAiWalletData] = useState<AIWalletStatus | null>(null);

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the AI wallet balances hook
  const { balances: aiWalletBalances, isLoading: balancesLoading, refreshBalances } = useAITokenBalances(
    aiWalletData?.aiWalletAddress || null
  );

  // Get prices for tokens
  const apiTokens = PRICE_API_CONFIG.supportedTokens;
  const { prices, getFormattedChange, getFormattedPrice, isLoading: pricesLoading } = usePriceUpdates({
    symbols: ["MBX", ...apiTokens]
  });

  // Fetch AI wallet status
  const fetchAIWalletStatus = async () => {
    if (!account) return;

    setLoading(true);

    try {
      const status = await aiWalletService.getAIWalletStatus(account);
      setAiWalletData(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI wallet status');
    } finally {
      setLoading(false);
    }
  };


  // Fetch data on component mount and when account changes
  useEffect(() => {
    fetchAIWalletStatus();
  }, [account]);

  const handleRefresh = () => {
    fetchAIWalletStatus();
    refreshBalances();
  };

  const handleClose = () => {
    onClose();
  };

  if (!account) {
    return (
      <ModalOverlay onClick={handleClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>AI Wallet Balances</ModalTitle>
            <CloseButton onClick={handleClose}>
              <X />
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <EmptyState>
              <div>Please connect your wallet to view AI wallet balances</div>
            </EmptyState>
            <BottomCloseButton onClick={handleClose}>
              Close
            </BottomCloseButton>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  if (isLoading) {
    return (
      <ModalOverlay onClick={handleClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>AI Wallet Balances</ModalTitle>
            <CloseButton onClick={handleClose}>
              <X />
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <LoadingState>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '12px' }} />
              Loading AI wallet data...
            </LoadingState>
            <BottomCloseButton onClick={handleClose}>
              Close
            </BottomCloseButton>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  if (error) {
    return (
      <ModalOverlay onClick={handleClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>AI Wallet Balances</ModalTitle>
            <CloseButton onClick={handleClose}>
              <X />
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
            <RefreshButton onClick={handleRefresh}>
              <RefreshCw size={16} />
              Retry
            </RefreshButton>
            <BottomCloseButton onClick={handleClose}>
              Close
            </BottomCloseButton>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }


  // Show AI wallet UI if wallet exists
  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>AI Wallet Balances</ModalTitle>
          <CloseButton onClick={handleClose}>
            <X />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <TokensSection>
            <InfoAlertSection>
              <InfoAlertIcon>
                <Info size={16} />
              </InfoAlertIcon>
              <InfoAlertContent>
                <InfoAlertText>
                  Your AI wallet is separate from your connected wallet. To fund it, visit your Profile Page
                </InfoAlertText>
              </InfoAlertContent>
            </InfoAlertSection>

            {aiWalletBalances.length === 0 ? (
              <EmptyState>
                <div>No tokens in AI wallet</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  Deposit tokens from your main wallet to get started
                </div>
              </EmptyState>
            ) : (
              <TokenList>
                {aiWalletBalances.map((token: any) => {
                  const priceKey = token.symbol === 'MBX' ? 'MBX' : token.symbol;
                  const priceData = prices[priceKey];
                  const change = getFormattedChange(priceKey);
                  const currentPrice = getFormattedPrice(priceKey);
                  const hasBalance = parseFloat(token.balance) > 0;
                  const usdValue = priceData && hasBalance ? parseFloat(token.balance) * priceData.price : 0;

                  return (
                    <TokenRow
                      key={token.symbol}
                      $hasBalance={hasBalance}
                    >
                      <TokenIcon>
                        <TokenIconImage
                          src={token.icon}
                          alt={token.symbol}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            if (img.parentElement) {
                              img.parentElement.innerHTML = `<b>${token.symbol.charAt(0)}</b>`;
                            }
                          }}
                        />
                      </TokenIcon>

                      <TokenInfo>
                        <TokenName>{token.name}</TokenName>
                        {priceData ? (
                          <TokenPrice $positive={change.isPositive}>
                            {currentPrice}
                            <span>{change.text}</span>
                          </TokenPrice>
                        ) : (
                          <TokenPrice $positive={true}>
                            {pricesLoading ? 'Loading...' : 'Price unavailable'}
                          </TokenPrice>
                        )}
                      </TokenInfo>

                      <TokenBalance>
                        <TokenBalanceAmount $hasBalance={hasBalance}>
                          {hasBalance ?
                            `${parseFloat(token.formattedBalance || token.balance).toFixed(4)} ${token.symbol}` :
                            <ZeroBalanceText>0 {token.symbol}</ZeroBalanceText>
                          }
                        </TokenBalanceAmount>
                        <TokenBalanceValue $hasBalance={hasBalance}>
                          {hasBalance ? `$${usdValue.toFixed(2)}` : <ZeroBalanceText>$0.00</ZeroBalanceText>}
                        </TokenBalanceValue>
                      </TokenBalance>
                    </TokenRow>
                  );
                })}
              </TokenList>
            )}
          </TokensSection>
          <div style={{paddingLeft:"20px", paddingRight: "20px"}}>
             <BottomCloseButton onClick={handleClose}>
            Close
          </BottomCloseButton>
          </div>
         
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

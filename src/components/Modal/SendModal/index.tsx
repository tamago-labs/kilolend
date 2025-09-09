'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { BaseModal } from '../BaseModal';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useSendTransaction } from '@/hooks/useSendTransaction';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';
import { KAIA_TESTNET_TOKENS, KAIA_SCAN_URL } from '@/utils/tokenConfig';
import { liff } from '@/utils/liff';
import {  Camera, Send, AlertCircle, CheckCircle, ExternalLink } from 'react-feather';

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 500px;
`;

const SectionContainer = styled.div`
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
`;

const SectionLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
`;

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const BalanceText = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const TokenSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const TokenIcon = styled.div`
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TokenIconImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const TokenInfo = styled.div`
  flex: 1;
`;

const TokenSelect = styled.select`
  width: 100%;
  font-size: 18px;
  font-weight: 600;
  background: transparent;
  border: none;
  outline: none;
  color: #1e293b;
  cursor: pointer;
`;

const TokenName = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 4px 0 0 0;
`;

const AmountInputContainer = styled.div`
  display: flex;
  align-items: center; 
`;

const AmountInput = styled.input`
width: 100%;
  flex: 1;
  font-size: 32px;
  font-weight: 700;
  background: transparent;
  border: none;
  outline: none;
  color: #1e293b;
  
  &::placeholder {
    color: #cbd5e1;
  }
`;

const MaxButton = styled.button`
  padding: 10px 16px;
  background: #06c755;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #05b34a;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const USDValue = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 12px 0 0 0;
`;

const AddressInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AddressInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: #1e293b;
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const QRButton = styled.button`
  width: 48px;
  height: 48px;
  background: #06c755;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #05b34a;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #06c755, #05b34a);
  color: white;
  padding: 20px;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(6, 199, 85, 0.3);
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  margin-top: 12px;
`;

const ConnectWalletPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin: 20px 0;
`;
 

const ConnectTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const ConnectDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  max-width: 350px;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  font-size: 16px;
  color: #64748b;
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  background: #f0fdf4;
  border-radius: 16px;
  border: 1px solid #22c55e;
  margin: 20px 0;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const SuccessTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const SuccessDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 24px;
  max-width: 300px;
`;

const TransactionDetails = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const DetailValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const ExplorerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: #06c755;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;

  &:hover {
    background: #05b34a;
    transform: translateY(-1px);
  }
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendModal = ({ isOpen, onClose }: SendModalProps) => {
  const { balances } = useTokenBalances();
  const { sendTokens, isLoading, error, resetError } = useSendTransaction();
  const { account } = useWalletAccountStore();
  
  // Get prices for supported tokens
  const { prices } = usePriceUpdates({
    symbols: ['KAIA', 'USDT', 'MBX', 'BORA', 'SIX']
  });

  const [selectedToken, setSelectedToken] = useState('KAIA');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(''); 
  const [isSuccess, setIsSuccess] = useState(false);

  // Get available tokens with balances > 0 - only show supported send tokens
  const supportedSendTokens = ['KAIA', 'USDT', 'MBX', 'BORA', 'SIX'];
  const availableTokens = balances.filter(token => 
    supportedSendTokens.includes(token.symbol) && parseFloat(token.balance) > 0
  );

  // Get selected token info
  const selectedTokenInfo = balances.find(token => token.symbol === selectedToken);
  const tokenConfig = selectedToken === 'KAIA' ? null : KAIA_TESTNET_TOKENS[selectedToken as keyof typeof KAIA_TESTNET_TOKENS];

  useEffect(() => {
    if (availableTokens.length > 0 && !selectedTokenInfo) {
      setSelectedToken(availableTokens[0].symbol);
    }
  }, [availableTokens, selectedTokenInfo]);

  // Calculate USD value for current amount
  const calculateUSDValue = () => {
    if (!amount || !selectedTokenInfo) return '0.00';
    
    // Handle MBX -> MARBLEX mapping for price lookup (same as ProfilePage)
    const priceKey = selectedToken === 'MBX' ? 'MARBLEX' : selectedToken;
    const price = prices[priceKey];
    
    if (price && parseFloat(amount) > 0) {
      const usdValue = parseFloat(amount) * price.price;
      return usdValue.toFixed(2);
    }
    
    return '0.00';
  };

  const handleMaxClick = () => {
    if (selectedTokenInfo) {
      setAmount(selectedTokenInfo.balance);
    }
  };

  const handleQRScan = async () => {
    if (liff.isInClient()) {
      try {
        const result = await liff.scanCodeV2();
        if (result.value) {
          setRecipient(result.value);
        }
      } catch (error) {
        console.log('QR scan error:', error);
      }
    } else {
      // Error is handled by the hook but still show user feedback
      console.log('QR scanner only available in LINE app');
    }
  };

  const validateInputs = () => {
    resetError();

    if (!amount || parseFloat(amount) <= 0) {
      return { isValid: false, error: 'Please enter a valid amount' };
    }

    if (!selectedTokenInfo || parseFloat(amount) > parseFloat(selectedTokenInfo.balance)) {
      return { isValid: false, error: 'Insufficient balance' };
    }

    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
      return { isValid: false, error: 'Please enter a valid wallet address' };
    }

    return { isValid: true, error: null };
  };

  const handleSend = async () => {
    const validation = validateInputs();
    if (!validation.isValid) return;

    try {
      const result = await sendTokens({
        tokenSymbol: selectedToken,
        amount,
        recipient,
        isNative: selectedToken === 'KAIA'
      });
       
      setIsSuccess(true);
    } catch (error) {
      // Error is handled by the hook
      console.error('Send transaction failed:', error);
    }
  };

  const handleOpenExplorer = () => {
    if (!account) return;
    
    const accountUrl = `${KAIA_SCAN_URL}/address/${account}?tabId=txList&page=1`;

    if (liff.isInClient()) {
      liff.openWindow({
        url: accountUrl,
        external: true,
      });
    } else { 
      window.open(accountUrl, "_blank"); 
    }
  };

  const handleCloseModal = () => {
    // Reset all state when closing
    setAmount('');
    setRecipient(''); 
    setIsSuccess(false);
    resetError();
    onClose();
  };

  const isQRAvailable = liff.isInClient();
  const canSend = amount && recipient && selectedTokenInfo && !isLoading && account;
 

  // Show no tokens available if no supported tokens with balance
  if (availableTokens.length === 0) {
    return (
      <BaseModal isOpen={isOpen} onClose={handleCloseModal} title="Send Tokens">
        <ModalContainer>
          <ConnectWalletPrompt> 
            <ConnectTitle>No Tokens Available</ConnectTitle>
            <ConnectDescription>
              You don't have any tokens with sufficient balance to send. Get some tokens first!
            </ConnectDescription>
          </ConnectWalletPrompt>
        </ModalContainer>
      </BaseModal>
    );
  }

  // Show success screen after transaction
  if (isSuccess) {
    return (
      <BaseModal isOpen={isOpen} onClose={handleCloseModal} title="Transaction Sent">
        <ModalContainer>
          <SuccessContainer>
            <SuccessIcon>
              <CheckCircle size={32} color="white" />
            </SuccessIcon>
            <SuccessTitle>Transaction Successful!</SuccessTitle>
            <SuccessDescription>
              Your {amount} {selectedToken} has been sent to {recipient.slice(0, 6)}...{recipient.slice(-4)}
            </SuccessDescription>
            
            <TransactionDetails>
              <DetailRow>
                <DetailLabel>Amount</DetailLabel>
                <DetailValue>{amount} {selectedToken}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>USD Value</DetailLabel>
                <DetailValue>${calculateUSDValue()}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>To Address</DetailLabel>
                <DetailValue>{recipient.slice(0, 8)}...{recipient.slice(-6)}</DetailValue>
              </DetailRow> 
            </TransactionDetails>
            
            <ExplorerButton onClick={handleOpenExplorer}>
              <ExternalLink size={20} />
              View on Block Explorer
            </ExplorerButton>
            
            <CloseButton onClick={handleCloseModal}>
              Close
            </CloseButton>
          </SuccessContainer>
        </ModalContainer>
      </BaseModal>
    );
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleCloseModal} title="Send Tokens">
      <ModalContainer>
        {/* Token Selection */}
        <SectionContainer>
          <BalanceInfo>
            <SectionLabel>You're sending</SectionLabel>
            <BalanceText>
              Balance: {selectedTokenInfo?.formattedBalance || '0'} {selectedToken}
            </BalanceText>
          </BalanceInfo>
          
          <TokenSelector>
            <TokenIcon>
              {selectedTokenInfo?.iconType === 'image' ? (
                <TokenIconImage
                  src={selectedTokenInfo.icon}
                  alt={selectedToken}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    if (img.parentElement) {
                      img.parentElement.innerHTML = `<b>${selectedToken.charAt(0)}</b>`;
                    }
                  }}
                />
              ) : (
                <span style={{ fontSize: '20px' }}>{selectedTokenInfo?.icon || ' '}</span>
              )}
            </TokenIcon>
            
            <TokenInfo>
              <TokenSelect
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
              >
                {availableTokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </TokenSelect>
              <TokenName>{selectedTokenInfo?.name || ''}</TokenName>
            </TokenInfo>
          </TokenSelector>
        </SectionContainer>

        {/* Amount Input */}
        <SectionContainer>
          <SectionLabel>Amount</SectionLabel>
          <AmountInputContainer>
            <AmountInput
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="any"
            />
            <MaxButton onClick={handleMaxClick}>MAX</MaxButton>
          </AmountInputContainer>
          <USDValue>≈ ${calculateUSDValue()} USD</USDValue>
        </SectionContainer>

        {/* Recipient Address */}
        <SectionContainer>
          <SectionLabel>Send to</SectionLabel>
          <AddressInputContainer>
            <AddressInput
              type="text"
              placeholder="Enter wallet address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <QRButton
              onClick={handleQRScan}
              disabled={!isQRAvailable}
              title={isQRAvailable ? 'Scan QR Code' : 'QR scanner only available in LINE app'}
            >
              <Camera size={24} color="white" />
            </QRButton>
          </AddressInputContainer>
        </SectionContainer>

        {error && (
          <ErrorMessage>
            <AlertCircle size={16} />
            {error}
          </ErrorMessage>
        )}

        {/* Send Button */}
        <SendButton
          onClick={handleSend}
          disabled={!canSend}
        >
          {isLoading ? (
            'Sending...'
          ) : (
            <>
              <Send size={20} />
              Send Tokens
            </>
          )}
        </SendButton>

        {isLoading && <LoadingOverlay>Processing transaction...</LoadingOverlay>}
      </ModalContainer>
    </BaseModal>
  );
};

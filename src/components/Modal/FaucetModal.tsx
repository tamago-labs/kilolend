'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { ethers } from 'ethers';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { KAIA_TESTNET_TOKENS, FAUCET_TOKENS, FAUCET_CONFIG, FaucetTokenSymbol, ERC20_ABI } from '@/utils/tokenConfig';
import { parseTokenAmount, getTransactionErrorMessage } from '@/utils/ethersConfig';
import { X, CheckCircle, AlertCircle } from 'react-feather';

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
  max-width: 500px;
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

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

const Description = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const TokenGrid = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
`;

const TokenCard = styled.div<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: ${({ $disabled }) => $disabled ? '#f8fafc' : 'white'};
  border: 1px solid ${({ $disabled }) => $disabled ? '#e2e8f0' : '#e2e8f0'};
  border-radius: 12px;
  transition: all 0.2s;
  opacity: ${({ $disabled }) => $disabled ? 0.6 : 1};

  &:hover {
    border-color: ${({ $disabled }) => $disabled ? '#e2e8f0' : '#06C755'};
    background: ${({ $disabled }) => $disabled ? '#f8fafc' : '#f8fffe'};
  }
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TokenIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TokenIconImage = styled.img`
  width: 75%;
  height: 75%;
  object-fit: contain;
`;

const TokenDetails = styled.div``;

const TokenName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
  margin-bottom: 2px;
`;

const TokenAmount = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const FaucetButton = styled.button<{ $disabled?: boolean; $loading?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  border: 1px solid;
  min-width: 80px;
  justify-content: center;

  ${({ $disabled, $loading }) => {
    if ($disabled || $loading) {
      return `
        background: #f1f5f9;
        color: #94a3b8;
        border-color: #e2e8f0;
      `;
    }
    return `
      background: linear-gradient(135deg, #00C300, #00A000);
      color: white;
      border-color: transparent;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 195, 0, 0.3);
      }
    `;
  }}
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #dcfce7;
  border: 1px solid #16a34a;
  border-radius: 8px;
  margin-bottom: 16px;
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
`;

const MessageText = styled.span`
  font-size: 14px;
`;

const InfoMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #dbeafe;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  margin-bottom: 16px;
`;

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FaucetState {
  isLoading: boolean;
  success: string | null;
  error: string | null;
}

export const FaucetModal = ({ isOpen, onClose }: FaucetModalProps) => {
  const { account } = useWalletAccountStore();
  const { sendTransaction } = useKaiaWalletSdk();
  
  const [faucetState, setFaucetState] = useState<FaucetState>({
    isLoading: false,
    success: null,
    error: null
  });

  const handleFaucetClaim = async (tokenSymbol: FaucetTokenSymbol) => {
    if (!account) {
      setFaucetState(prev => ({ ...prev, error: 'Please connect your wallet first' }));
      return;
    }

    const tokenConfig = KAIA_TESTNET_TOKENS[tokenSymbol];
    const amount = FAUCET_CONFIG.amounts[tokenSymbol];

    setFaucetState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      success: null 
    }));

    try {
      // Parse amount to smallest unit based on token decimals
      const amountBigInt = parseTokenAmount(amount, tokenConfig.decimals);
      
      // Create contract interface for encoding
      const iface = new ethers.Interface(ERC20_ABI);
      const data = iface.encodeFunctionData('mint', [account, amountBigInt.toString()]);

      // Prepare transaction
      const transaction = {
        from: account,
        to: tokenConfig.address,
        value: '0x0', // No ETH value for token minting
        gas: '0x186A0', // 100000 gas limit
        data: data
      };

      // Send transaction through wallet
      await sendTransaction([transaction]);

      setFaucetState(prev => ({ 
        ...prev, 
        success: `Successfully claimed ${amount} ${tokenSymbol}!`,
        isLoading: false
      }));

      // Clear success message after 5 seconds
      setTimeout(() => {
        setFaucetState(prev => ({ ...prev, success: null }));
      }, 5000);

    } catch (error: any) {
      console.error('Faucet claim error:', error);
      const errorMessage = getTransactionErrorMessage(error);
      setFaucetState(prev => ({ 
        ...prev, 
        error: `Failed to claim ${tokenSymbol}: ${errorMessage}`,
        isLoading: false
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderContent> 
            <ModalTitle>Token Faucet</ModalTitle>
          </HeaderContent>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <Description>
            Get free testnet tokens for testing KiloLend. Claim as many times as you need for testing purposes.
          </Description>

          {faucetState.success && (
            <SuccessMessage>
              <CheckCircle size={16} color="#16a34a" />
              <MessageText style={{ color: '#16a34a' }}>{faucetState.success}</MessageText>
            </SuccessMessage>
          )}

          {faucetState.error && (
            <ErrorMessage>
              <AlertCircle size={16} color="#ef4444" />
              <MessageText style={{ color: '#ef4444' }}>{faucetState.error}</MessageText>
            </ErrorMessage>
          )}

          {!account && (
            <InfoMessage>
              <AlertCircle size={16} color="#3b82f6" />
              <MessageText style={{ color: '#1e40af' }}>Please connect your wallet to use the faucet</MessageText>
            </InfoMessage>
          )}

          <TokenGrid>
            {FAUCET_TOKENS.map((tokenSymbol) => {
              const tokenConfig = KAIA_TESTNET_TOKENS[tokenSymbol];
              const amount = FAUCET_CONFIG.amounts[tokenSymbol];
              const disabled = !account || faucetState.isLoading;

              return (
                <TokenCard key={tokenSymbol} $disabled={disabled}>
                  <TokenInfo>
                    <TokenIcon>
                      <TokenIconImage 
                        src={tokenConfig.icon} 
                        alt={tokenSymbol}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          if (img.parentElement) {
                            img.parentElement.innerHTML = `<b>${tokenSymbol.charAt(0)}</b>`;
                          }
                        }}
                      />
                    </TokenIcon>
                    <TokenDetails>
                      <TokenName>{tokenConfig.name}</TokenName>
                      <TokenAmount>
                        Claim {amount} {tokenSymbol}
                      </TokenAmount>
                    </TokenDetails>
                  </TokenInfo>
                  
                  <FaucetButton
                    $disabled={disabled}
                    $loading={faucetState.isLoading}
                    onClick={() => handleFaucetClaim(tokenSymbol)}
                  >
                    {faucetState.isLoading ? (
                      <>
                        <div style={{ 
                          width: '12px', 
                          height: '12px', 
                          border: '2px solid #e2e8f0',
                          borderTop: '2px solid #06C755',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Claiming
                      </>
                    ) : (
                      <> 
                        Claim
                      </>
                    )}
                  </FaucetButton>
                </TokenCard>
              );
            })}
          </TokenGrid>
        </ModalBody>

        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </ModalContent>
    </ModalOverlay>
  );
};
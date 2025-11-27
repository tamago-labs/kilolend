'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useModalStore } from '@/stores/modalStore';
import { aiWalletService } from '@/services/aiWalletService';
import { X, ArrowUpCircle, AlertCircle, CheckCircle } from 'react-feather';

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

const ModalBody = styled.div`
  padding: 24px;
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const SectionLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const TokenSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const AmountInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
`;

const BalanceAmount = styled.span`
  font-weight: 600;
  color: #1e293b;
`;

const MaxButton = styled.button`
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

const SummarySection = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
    padding-top: 8px;
    border-top: 1px solid #e2e8f0;
    font-weight: 600;
  }
`;

const SummaryLabel = styled.span`
  color: #64748b;
  font-size: 14px;
`;

const SummaryValue = styled.span`
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary'; $loading?: boolean }>`
  width: 100%;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${({ $variant, $loading }) => {
    if ($variant === 'primary') {
      return `
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        
        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
      `;
    } else {
      return `
        background: #f8fafc;
        color: #64748b;
        border: 1px solid #e2e8f0;
        
        &:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
      `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
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

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #00C300;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #065f46;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
`;

interface WithdrawModalProps {
  aiWalletAddress: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ 
  aiWalletAddress, 
  onClose, 
  onSuccess 
}) => {
  const { account } = useWalletAccountStore();
  const { closeModal } = useModalStore();

  const [aiWalletBalances, setAiWalletBalances] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch AI wallet balances on mount
  useEffect(() => {
    const fetchBalances = async () => {
      setIsLoadingBalances(true);
      try {
        const balances = await aiWalletService.getAIWalletBalances(aiWalletAddress);
        setAiWalletBalances(balances);
      } catch (err) {
        setError('Failed to fetch AI wallet balances');
      } finally {
        setIsLoadingBalances(false);
      }
    };

    fetchBalances();
  }, [aiWalletAddress]);

  // Filter tokens with balances
  const availableTokens = aiWalletBalances.filter(token => 
    parseFloat(token.balance) > 0
  );

  // Set default token when available tokens change
  useEffect(() => {
    if (availableTokens.length > 0 && !selectedToken) {
      setSelectedToken(availableTokens[0].symbol);
    }
  }, [availableTokens, selectedToken]);

  const selectedTokenBalance = aiWalletBalances.find(token => token.symbol === selectedToken);
  const maxAmount = selectedTokenBalance ? parseFloat(selectedTokenBalance.balance) : 0;

  const handleMaxClick = () => {
    if (selectedTokenBalance) {
      setAmount(selectedTokenBalance.balance);
    }
  };

  const validateAmount = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return 'Please enter a valid amount';
    }
    if (parseFloat(amount) > maxAmount) {
      return 'Insufficient balance';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateAmount();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!account || !selectedToken) {
      setError('Missing required information');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const txHash = await aiWalletService.transferFromAIWallet(
        aiWalletAddress,
        account,
        selectedToken,
        amount
      );

      setSuccess(`Successfully withdrew ${amount} ${selectedToken} to main wallet`);
      
      // Reset form
      setAmount('');
      
      // Refresh balances
      const balances = await aiWalletService.getAIWalletBalances(aiWalletAddress);
      setAiWalletBalances(balances);
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    closeModal();
    onClose();
  };

  if (!account) {
    return (
      <ModalOverlay onClick={handleClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalBody>
            <ErrorMessage>
              <AlertCircle size={16} />
              Please connect your wallet to make a withdrawal
            </ErrorMessage>
            <ActionButton onClick={handleClose}>Close</ActionButton>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  if (isLoadingBalances) {
    return (
      <ModalOverlay onClick={handleClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalBody>
            <EmptyState>Loading AI wallet balances...</EmptyState>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  if (availableTokens.length === 0) {
    return (
      <ModalOverlay onClick={handleClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              <ArrowUpCircle size={20} />
              Withdraw from AI Wallet
            </ModalTitle>
            <CloseButton onClick={handleClose}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <EmptyState>
              <div>No tokens available to withdraw</div>
              <div style={{ fontSize: '12px', marginTop: '8px' }}>
                Deposit tokens to your AI wallet first
              </div>
            </EmptyState>
            <ActionButton onClick={handleClose}>Close</ActionButton>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <ArrowUpCircle size={20} />
            Withdraw from AI Wallet
          </ModalTitle>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}

          {success && (
            <SuccessMessage>
              <CheckCircle size={16} />
              {success}
            </SuccessMessage>
          )}

          <form onSubmit={handleSubmit}>
            <FormSection>
              <SectionLabel>Select Token</SectionLabel>
              <TokenSelect
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                disabled={isLoading || isLoadingBalances}
              >
                <option value="">Choose a token...</option>
                {availableTokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.name} ({token.symbol})
                  </option>
                ))}
              </TokenSelect>
            </FormSection>

            <FormSection>
              <SectionLabel>Amount</SectionLabel>
              <AmountInput
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="any"
                min="0"
                max={maxAmount}
                disabled={isLoading || !selectedToken}
              />
              <BalanceInfo>
                <span>Available: <BalanceAmount>{selectedTokenBalance?.formattedBalance || '0'} {selectedToken}</BalanceAmount></span>
                <MaxButton 
                  type="button" 
                  onClick={handleMaxClick}
                  disabled={isLoading || !selectedToken}
                >
                  MAX
                </MaxButton>
              </BalanceInfo>
            </FormSection>

            {selectedToken && amount && parseFloat(amount) > 0 && (
              <SummarySection>
                <SummaryRow>
                  <SummaryLabel>Token</SummaryLabel>
                  <SummaryValue>{selectedToken}</SummaryValue>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>Amount</SummaryLabel>
                  <SummaryValue>{parseFloat(amount).toFixed(6)} {selectedToken}</SummaryValue>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>To</SummaryLabel>
                  <SummaryValue>{aiWalletService.formatAddress(account)}</SummaryValue>
                </SummaryRow>
              </SummarySection>
            )}

            <ActionButton
              type="submit"
              $variant="primary"
              $loading={isLoading}
              disabled={isLoading || !selectedToken || !amount || validateAmount() !== null}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Withdrawing...
                </>
              ) : (
                'Withdraw to Main Wallet'
              )}
            </ActionButton>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useMarketContract } from '@/hooks/useMarketContract';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';

const Overlay = styled.div`
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

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  padding: 24px 24px 0;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const ModalSubtitle = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const MaxButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #dc2626;
  }
`;

const BalanceInfo = styled.div`
  background: #fef2f2;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #fecaca;
`;

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const BalanceLabel = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const BalanceValue = styled.span<{ $danger?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$danger ? '#dc2626' : '#1e293b'};
`;

const WalletBalance = styled.div`
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const TransactionDetails = styled.div`
  background: #f1f5f9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const DetailValue = styled.span<{ $positive?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$positive ? '#00C300' : '#1e293b'};
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  border: 1px solid #fecaca;
`;

const WarningMessage = styled.div`
  background: #fffbeb;
  color: #d97706;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  border: 1px solid #fed7aa;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;

    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  `}
`;

interface RepayModalProps {
  position: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RepayModal: React.FC<RepayModalProps> = ({ 
  position, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const { account } = useWalletAccountStore();
  const { repay } = useMarketContract();
  const { markets } = useContractMarketStore();
  const { balances, refreshBalances } = useTokenBalances();
  
  const market = markets.find(m => m.id === position.marketId);
  const tokenBalance = balances[position.marketId];
  const maxRepay = parseFloat(position.amount || '0');
  const availableBalance = parseFloat(tokenBalance?.balance || '0');

  useEffect(() => {
    if (isOpen && account) {
      refreshBalances();
    }
  }, [isOpen, account, refreshBalances]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError('');
    
    const numValue = parseFloat(value);
    if (numValue > maxRepay) {
      setError(`Maximum repay amount is ${maxRepay.toFixed(4)} ${market?.symbol}`);
    } else if (numValue > availableBalance) {
      setError(`Insufficient balance. Available: ${availableBalance.toFixed(4)} ${market?.symbol}`);
    }
  };

  const handleMaxClick = () => {
    const maxAmount = Math.min(maxRepay, availableBalance);
    setAmount(maxAmount.toString());
    setError('');
  };

  const handleRepay = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > maxRepay) {
      setError('Amount exceeds borrowed balance');
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      setError('Insufficient wallet balance');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const result = await repay(position.marketId, amount);
      
      if (result.status === 'confirmed') {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Transaction failed');
      }
    } catch (err: any) {
      setError(err.message || 'Repayment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateInterestSaved = () => {
    const monthlyAPR = (position.apy || 0) / 12;
    return (parseFloat(amount || '0') * monthlyAPR) / 100;
  };

  const isPartialRepay = parseFloat(amount || '0') < maxRepay;

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Repay {market?.symbol}</ModalTitle>
          <ModalSubtitle>
            Repay your borrowed {market?.symbol} tokens
          </ModalSubtitle>
        </ModalHeader>

        <ModalContent>
          <BalanceInfo>
            <BalanceRow>
              <BalanceLabel>Total Borrowed:</BalanceLabel>
              <BalanceValue $danger>
                {maxRepay.toFixed(4)} {market?.symbol}
              </BalanceValue>
            </BalanceRow>
            <BalanceRow>
              <BalanceLabel>Current APR:</BalanceLabel>
              <BalanceValue $danger>{(position.apy || 0).toFixed(2)}%</BalanceValue>
            </BalanceRow>
            <BalanceRow>
              <BalanceLabel>USD Value:</BalanceLabel>
              <BalanceValue>
                ${(maxRepay * (market?.price || 0)).toFixed(2)}
              </BalanceValue>
            </BalanceRow>
          </BalanceInfo>

          <WalletBalance>
            <BalanceRow>
              <BalanceLabel>Wallet Balance:</BalanceLabel>
              <BalanceValue>
                {tokenBalance?.isLoading ? 'Loading...' : 
                 `${availableBalance.toFixed(4)} ${market?.symbol}`}
              </BalanceValue>
            </BalanceRow>
          </WalletBalance>

          {availableBalance < maxRepay && (
            <WarningMessage>
              ⚠️ Insufficient balance for full repayment. You can make a partial repayment.
            </WarningMessage>
          )}

          <FormGroup>
            <Label>
              Repay Amount ({market?.symbol})
              <MaxButton onClick={handleMaxClick}>
                MAX ({Math.min(maxRepay, availableBalance).toFixed(4)})
              </MaxButton>
            </Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              min="0"
              max={Math.min(maxRepay, availableBalance)}
              step="0.000001"
            />
          </FormGroup>

          {amount && parseFloat(amount) > 0 && !error && (
            <TransactionDetails>
              <DetailRow>
                <DetailLabel>Repay Amount:</DetailLabel>
                <DetailValue>
                  {parseFloat(amount).toFixed(4)} {market?.symbol}
                </DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>USD Value:</DetailLabel>
                <DetailValue>
                  ${(parseFloat(amount) * (market?.price || 0)).toFixed(2)}
                </DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Monthly Interest Saved:</DetailLabel>
                <DetailValue $positive>
                  ${calculateInterestSaved().toFixed(4)}
                </DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Remaining Debt:</DetailLabel>
                <DetailValue>
                  {(maxRepay - parseFloat(amount)).toFixed(4)} {market?.symbol}
                </DetailValue>
              </DetailRow>
              {isPartialRepay && (
                <DetailRow>
                  <DetailLabel>Repayment Type:</DetailLabel>
                  <DetailValue>Partial Repayment</DetailValue>
                </DetailRow>
              )}
            </TransactionDetails>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonRow>
            <Button $variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              $variant="primary"
              onClick={handleRepay}
              disabled={
                !amount || 
                parseFloat(amount) <= 0 || 
                !!error || 
                isProcessing ||
                tokenBalance?.isLoading
              }
            >
              {isProcessing ? 'Processing...' : 
               tokenBalance?.isLoading ? 'Loading...' :
               isPartialRepay ? 'Partial Repay' : 'Full Repay'}
            </Button>
          </ButtonRow>
        </ModalContent>
      </Modal>
    </Overlay>
  );
};
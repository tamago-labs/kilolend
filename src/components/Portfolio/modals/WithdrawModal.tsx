'use client';

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useMarketContract } from '@/hooks/useMarketContract';
import { useContractUserStore } from '@/stores/contractUserStore';
import { useContractMarketStore } from '@/stores/contractMarketStore';

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
    border-color: #00C300;
    box-shadow: 0 0 0 3px rgba(0, 195, 0, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const MaxButton = styled.button`
  background: none;
  border: none;
  color: #00C300;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #00A000;
  }
`;

const BalanceInfo = styled.div`
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
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

const BalanceValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
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

const DetailValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
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
    background: linear-gradient(135deg, #00C300, #00A000);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 195, 0, 0.3);
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

interface WithdrawModalProps {
  position: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ 
  position, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const { withdraw } = useMarketContract();
  const { markets } = useContractMarketStore();
  
  const market = markets.find(m => m.id === position.marketId);
  const maxWithdraw = parseFloat(position.amount || '0');

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError('');
    
    const numValue = parseFloat(value);
    if (numValue > maxWithdraw) {
      setError(`Maximum withdraw amount is ${maxWithdraw.toFixed(4)} ${market?.symbol}`);
    }
  };

  const handleMaxClick = () => {
    setAmount(maxWithdraw.toString());
    setError('');
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > maxWithdraw) {
      setError('Amount exceeds available balance');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const result = await withdraw(position.marketId, amount);
      
      if (result.status === 'confirmed') {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Transaction failed');
      }
    } catch (err: any) {
      setError(err.message || 'Withdrawal failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateEarningsLost = () => {
    const monthlyAPY = (position.apy || 0) / 12;
    return (parseFloat(amount || '0') * monthlyAPY) / 100;
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Withdraw {market?.symbol}</ModalTitle>
          <ModalSubtitle>
            Withdraw your supplied {market?.symbol} tokens
          </ModalSubtitle>
        </ModalHeader>

        <ModalContent>
          <BalanceInfo>
            <BalanceRow>
              <BalanceLabel>Supplied Balance:</BalanceLabel>
              <BalanceValue>
                {maxWithdraw.toFixed(4)} {market?.symbol}
              </BalanceValue>
            </BalanceRow>
            <BalanceRow>
              <BalanceLabel>Current APY:</BalanceLabel>
              <BalanceValue>{(position.apy || 0).toFixed(2)}%</BalanceValue>
            </BalanceRow>
            <BalanceRow>
              <BalanceLabel>USD Value:</BalanceLabel>
              <BalanceValue>
                ${(maxWithdraw * (market?.price || 0)).toFixed(2)}
              </BalanceValue>
            </BalanceRow>
          </BalanceInfo>

          <FormGroup>
            <Label>
              Withdraw Amount ({market?.symbol})
              <MaxButton onClick={handleMaxClick}>MAX</MaxButton>
            </Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              min="0"
              max={maxWithdraw}
              step="0.000001"
            />
          </FormGroup>

          {amount && parseFloat(amount) > 0 && !error && (
            <TransactionDetails>
              <DetailRow>
                <DetailLabel>Withdraw Amount:</DetailLabel>
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
                <DetailLabel>Monthly Earnings Lost:</DetailLabel>
                <DetailValue>
                  ${calculateEarningsLost().toFixed(4)}
                </DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Remaining Balance:</DetailLabel>
                <DetailValue>
                  {(maxWithdraw - parseFloat(amount)).toFixed(4)} {market?.symbol}
                </DetailValue>
              </DetailRow>
            </TransactionDetails>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonRow>
            <Button $variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              $variant="primary"
              onClick={handleWithdraw}
              disabled={!amount || parseFloat(amount) <= 0 || !!error || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Withdraw'}
            </Button>
          </ButtonRow>
        </ModalContent>
      </Modal>
    </Overlay>
  );
};
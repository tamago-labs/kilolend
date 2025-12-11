"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DesktopBaseModal } from '../shared/DesktopBaseModal';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract } from '@/hooks/v1/useMarketContract';
import { useTokenApproval } from '@/hooks/v1/useTokenApproval';
import { useUserPositions } from '@/hooks/v1/useUserPositions';
import { useBorrowingPower } from '@/hooks/v1/useBorrowingPower';
import { formatUSD } from '@/utils/formatters';

const ModalContent = styled.div` 
  max-width: 520px;
  width: 100%;
`;

const ModalSubtitle = styled.p`
  font-size: 16px;
  color: #64748b;
  text-align: center;
  margin-bottom: 32px;
`;

const MarketSelector = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  color: #1e293b;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
`;

const AmountInput = styled.div`
  margin-bottom: 24px;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 80px 16px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  background: white;
  color: #1e293b;

  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
`;

const MaxButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #e2e8f0;
    color: #475569;
  }
`;

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 14px;
  color: #64748b;
`;

const PreviewSection = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const PreviewRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
  }
`;

const PreviewLabel = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const PreviewValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const SuccessBox = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const SuccessText = styled.div`
  font-size: 14px;
  color: #166534;
  line-height: 1.5;
`;

const WarningBox = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const WarningText = styled.div`
  font-size: 14px;
  color: #92400e;
  line-height: 1.5;
`;

const ActionButton = styled.button<{ $primary?: boolean; $disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  background: ${({ $primary, $disabled }) => 
    $disabled ? '#e2e8f0' : $primary ? '#06C755' : 'white'};
  color: ${({ $primary, $disabled }) => 
    $disabled ? '#94a3b8' : $primary ? 'white' : '#06C755'};
  border: 1px solid ${({ $disabled }) => $disabled ? '#e2e8f0' : '#06C755'};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s;
  margin-bottom: 12px;

  &:hover {
    background: ${({ $primary, $disabled }) => 
      $disabled ? '#e2e8f0' : $primary ? '#059669' : '#06C755'};
    color: ${({ $disabled }) => $disabled ? '#94a3b8' : 'white'};
  }
`;

const CancelButton = styled.button`
  width: 100%;
  padding: 16px;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f8fafc;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #06C755;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

type TransactionStep = 'preview' | 'confirmation' | 'success';

interface DesktopRepayModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedMarket?: any;
}

export const DesktopRepayModal = ({ isOpen, onClose, preSelectedMarket }: DesktopRepayModalProps) => {
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<TransactionStep>('preview');
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [needsApproval, setNeedsApproval] = useState(false);

  const { account } = useWalletAccountStore();
  const { markets } = useContractMarketStore();
  const { repay } = useMarketContract();
  const { checkAllowance, approveToken } = useTokenApproval();
  const { positions } = useUserPositions();
  const { calculateBorrowingPower } = useBorrowingPower();
  const [borrowingPowerData, setBorrowingPowerData] = useState<any>(null);

  useEffect(() => {
    if (preSelectedMarket) {
      setSelectedMarket(preSelectedMarket);
    } else if (markets.length > 0) {
      // Filter to only show markets where user has borrowed tokens
      const borrowedMarkets = markets.filter(market => {
        const position = positions[market.id];
        return position && parseFloat(position.borrowBalance || '0') > 0;
      });
      setSelectedMarket(borrowedMarkets[0] || markets[0]);
    }
  }, [preSelectedMarket, markets, positions]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('preview');
      setIsProcessing(false);
      setError(null);
      setTransactionResult(null);
      setNeedsApproval(false);
      setAmount('');
    }
  }, [isOpen]);

  const selectedMarketPosition = selectedMarket ? positions[selectedMarket.id] : null;
  const selectedMarketDebt = selectedMarketPosition?.borrowBalance || '0';
  const amountNum = parseFloat(amount || '0');
  const amountUSD = selectedMarket ? amountNum * selectedMarket.price : 0;
  const remainingDebt = parseFloat(selectedMarketDebt) - amountNum;
  const remainingUSD = selectedMarket ? remainingDebt * selectedMarket.price : 0;
  const isFullRepayment = amountNum >= parseFloat(selectedMarketDebt) * 0.99; // Allow for small rounding differences

  // Calculate health factor impact
  useEffect(() => {
    const calculateImpact = async () => {
      if (!account || !selectedMarket || !amount) return;
      
      try {
        const currentBorrowingPower = await calculateBorrowingPower(account);
        setBorrowingPowerData(currentBorrowingPower);
      } catch (error) {
        console.error('Error calculating borrowing power:', error);
      }
    };

    calculateImpact();
  }, [account, selectedMarket, amount]);

  const currentHealthFactor = borrowingPowerData?.healthFactor ? parseFloat(borrowingPowerData.healthFactor) : 999;
  const totalCollateralValue = borrowingPowerData?.totalCollateralValue ? parseFloat(borrowingPowerData.totalCollateralValue) : 0;
  const totalBorrowValue = borrowingPowerData?.totalBorrowValue ? parseFloat(borrowingPowerData.totalBorrowValue) : 0;
  
  // Calculate new health factor after repayment
  const newTotalBorrowValue = totalBorrowValue - amountUSD;
  const newHealthFactor = newTotalBorrowValue > 0 ? totalCollateralValue / newTotalBorrowValue : 999;
  const healthFactorChange = newHealthFactor - currentHealthFactor;
  
  // Calculate interest savings
  const dailyInterestRate = selectedMarket ? (selectedMarket.borrowAPR / 100) / 365 : 0;
  const dailyInterestSavings = amountUSD * dailyInterestRate;
  const monthlyInterestSavings = dailyInterestSavings * 30;
  const yearlyInterestSavings = dailyInterestSavings * 365;

  const handleMax = () => {
    setAmount(selectedMarketDebt);
  };

  const handleRepay = async () => {
    if (!selectedMarket || !account || !amount) return;

    setCurrentStep('confirmation');
    setIsProcessing(true);
    setError(null);

    try {
      // Check if token approval is needed (for ERC20 tokens)
      if (selectedMarket?.tokenAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        const approvalStatus = await checkAllowance(selectedMarket.id, amount);
        if (!approvalStatus.hasEnoughAllowance) {
          setNeedsApproval(true);
          await approveToken(selectedMarket.id, amount);
          setNeedsApproval(false);
        }
      }

      // Execute repay
      const result = await repay(selectedMarket.id, amount);
      
      // Set transaction result and move to success
      setTransactionResult(result);
      setCurrentStep('success');
      setIsProcessing(false);

    } catch (error: any) {
      console.error('Repay error:', error);
      setError(error.message || 'Repayment failed');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (currentStep === 'success') {
      onClose();
    } else {
      onClose();
    }
  };

  const isValid = selectedMarket && amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(selectedMarketDebt);

  // Filter markets to only show those where user has borrowed tokens
  const availableMarkets = markets.filter(market => {
    const position = positions[market.id];
    return position && parseFloat(position.borrowBalance || '0') > 0;
  });

  const renderPreview = () => (
    <>
      {!preSelectedMarket && (
        <MarketSelector>
          <Label>Select Asset</Label>
          <Select
            value={selectedMarket?.id || ''}
            onChange={(e) => {
              const market = markets.find(m => m.id === e.target.value);
              setSelectedMarket(market);
              setAmount('');
            }}
          >
            <option value="">Choose an asset</option>
            {availableMarkets.map(market => (
              <option key={market.id} value={market.id}>
                {market.symbol} - {market.borrowAPR.toFixed(2)}% APR
              </option>
            ))}
          </Select>
        </MarketSelector>
      )}

      <AmountInput>
        <Label>Amount</Label>
        <InputContainer>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          <MaxButton onClick={handleMax}>MAX</MaxButton>
        </InputContainer>
        <BalanceInfo>
          <span>Current Debt: {parseFloat(selectedMarketDebt).toFixed(4)} {selectedMarket?.symbol}</span>
          <span>${(parseFloat(selectedMarketDebt) * (selectedMarket?.price || 0)).toFixed(2)}</span>
        </BalanceInfo>
      </AmountInput>

      {amount && selectedMarket && (
        <>
          <PreviewSection>
            <PreviewRow>
              <PreviewLabel>Asset</PreviewLabel>
              <PreviewValue>{selectedMarket.symbol}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Repay Amount</PreviewLabel>
              <PreviewValue>{amount} {selectedMarket.symbol}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>USD Value</PreviewLabel>
              <PreviewValue>${amountUSD.toFixed(2)}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Current Debt</PreviewLabel>
              <PreviewValue>{parseFloat(selectedMarketDebt).toFixed(4)} {selectedMarket.symbol}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Remaining Debt</PreviewLabel>
              <PreviewValue>{Math.max(0, remainingDebt).toFixed(4)} {selectedMarket.symbol}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Remaining USD Value</PreviewLabel>
              <PreviewValue>${Math.max(0, remainingUSD).toFixed(2)}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Borrow APR</PreviewLabel>
              <PreviewValue>{selectedMarket.borrowAPR.toFixed(2)}%</PreviewValue>
            </PreviewRow>
            {totalBorrowValue > 0 && (
              <>
                <PreviewRow>
                  <PreviewLabel>Current Health Factor</PreviewLabel>
                  <PreviewValue>{currentHealthFactor.toFixed(2)}</PreviewValue>
                </PreviewRow>
                <PreviewRow>
                  <PreviewLabel>New Health Factor</PreviewLabel>
                  <PreviewValue style={{ color: healthFactorChange > 0 ? '#06C755' : newHealthFactor < 1.5 ? '#ef4444' : '#1e293b' }}>
                    {newHealthFactor.toFixed(2)} {healthFactorChange > 0 ? `(+${healthFactorChange.toFixed(2)})` : ''}
                  </PreviewValue>
                </PreviewRow>
              </>
            )}
            {amountUSD > 0 && (
              <>
                <PreviewRow>
                  <PreviewLabel>Daily Interest Savings</PreviewLabel>
                  <PreviewValue>${dailyInterestSavings.toFixed(4)}</PreviewValue>
                </PreviewRow>
                <PreviewRow>
                  <PreviewLabel>Monthly Interest Savings</PreviewLabel>
                  <PreviewValue>${monthlyInterestSavings.toFixed(2)}</PreviewValue>
                </PreviewRow>
              </>
            )}
          </PreviewSection>

          {isFullRepayment && (
            <SuccessBox>
              <SuccessText>
                ✅ Full repayment! You will completely clear your debt for {selectedMarket.symbol}. This will improve your health factor and borrowing capacity.
              </SuccessText>
            </SuccessBox>
          )}

          {!isFullRepayment && remainingDebt > 0 && (
            <WarningBox>
              <WarningText>
                ⚠️ Partial repayment. You will still have {remainingDebt.toFixed(4)} {selectedMarket.symbol} remaining debt. Consider full repayment to maximize your borrowing capacity.
              </WarningText>
            </WarningBox>
          )}
        </>
      )}

      {needsApproval && (
        <WarningBox>
          <WarningText>
            ⚠️ You need to approve {selectedMarket?.symbol} spending before repaying. This will require a separate transaction.
          </WarningText>
        </WarningBox>
      )}

      {error && (
        <WarningBox>
          <WarningText>❌ {error}</WarningText>
        </WarningBox>
      )}

      <ActionButton 
        $primary 
        $disabled={!isValid || isProcessing}
        onClick={handleRepay}
      >
        {isProcessing && <LoadingSpinner />}
        {isProcessing ? 'Processing...' : isFullRepayment ? 'Repay Full Amount' : 'Repay'}
      </ActionButton>

      <CancelButton onClick={handleClose} disabled={isProcessing}>
        Cancel
      </CancelButton>
    </>
  );

  const renderConfirmation = () => (
    <>
      <PreviewSection>
        <PreviewRow>
          <PreviewLabel>Transaction</PreviewLabel>
          <PreviewValue>Repaying {amount} {selectedMarket?.symbol}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Status</PreviewLabel>
          <PreviewValue>
            {isProcessing ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LoadingSpinner />
                {needsApproval ? 'Approving...' : 'Processing...'}
              </div>
            ) : error ? (
              <span style={{ color: '#ef4444' }}>Failed</span>
            ) : transactionResult ? (
              <span style={{ color: '#06C755' }}>Complete</span>
            ) : (
              <span style={{ color: '#64748b' }}>Ready</span>
            )}
          </PreviewValue>
        </PreviewRow>
      </PreviewSection>

      {error && (
        <WarningBox>
          <WarningText>❌ {error}</WarningText>
        </WarningBox>
      )}

      {!isProcessing && !transactionResult && !error && (
        <ActionButton onClick={() => setCurrentStep('preview')}>
          Back to Preview
        </ActionButton>
      )}

      {error && (
        <ActionButton onClick={() => setCurrentStep('preview')}>
          Try Again
        </ActionButton>
      )}
    </>
  );

  const renderSuccess = () => (
    <>
      <PreviewSection>
        <PreviewRow>
          <PreviewLabel>✅ Repayment Successful!</PreviewLabel>
          <PreviewValue>{amount} {selectedMarket?.symbol}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>USD Value</PreviewLabel>
          <PreviewValue>${amountUSD.toFixed(2)}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Status</PreviewLabel>
          <PreviewValue style={{ color: '#06C755' }}>Confirmed</PreviewValue>
        </PreviewRow>
      </PreviewSection>

      <ActionButton $primary onClick={handleClose}>
        Close
      </ActionButton>
    </>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 'preview':
        return renderPreview();
      case 'confirmation':
        return renderConfirmation();
      case 'success':
        return renderSuccess();
      default:
        return renderPreview();
    }
  };

  return (
    <DesktopBaseModal isOpen={isOpen} onClose={handleClose} title="Repay Assets">
      <ModalContent> 
        {renderContent()}
      </ModalContent>
    </DesktopBaseModal>
  );
};

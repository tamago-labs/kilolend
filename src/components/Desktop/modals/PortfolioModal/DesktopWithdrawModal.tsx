"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DesktopBaseModal } from '../shared/DesktopBaseModal';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract } from '@/hooks/v1/useMarketContract';
import { useUserPositions } from '@/hooks/v1/useUserPositions';
import { useBorrowingPower } from '@/hooks/v1/useBorrowingPower';
import { useEventTracking } from '@/hooks/useEventTracking';
import { formatUSD } from '@/utils/formatters';
import { ExternalLink, Check } from 'react-feather';

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
  margin-top: 24px;
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

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;
  color: white;
`;

const SuccessMessage = styled.div`
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const SuccessSubtext = styled.div`
  text-align: center;
  font-size: 16px;
  color: #64748b;
  margin-bottom: 32px;
  line-height: 1.5;
`;

const TransactionDetails = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  text-align: left;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: #166534;
`;

const DetailValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #166534;
`;

const ClickableTransactionHash = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #059669;
    text-decoration: underline;
  }
`;

type TransactionStep = 'preview' | 'confirmation' | 'success';

interface DesktopWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedMarket?: any;
}

export const DesktopWithdrawModal = ({ isOpen, onClose, preSelectedMarket }: DesktopWithdrawModalProps) => {
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<TransactionStep>('preview');
  const [transactionResult, setTransactionResult] = useState<any>(null);

  const { account } = useWalletAccountStore();
  const { markets } = useContractMarketStore();
  const { withdraw } = useMarketContract();
  const { positions } = useUserPositions();
  const { calculateBorrowingPower } = useBorrowingPower();
  const {
    isTracking,
    trackedEvent,
    error: trackingError,
    hasTimedOut,
    startTracking,
    stopTracking,
    reset: resetTracking
  } = useEventTracking(account);

  useEffect(() => {
    if (preSelectedMarket) {
      setSelectedMarket(preSelectedMarket);
    } else if (markets.length > 0) {
      // Filter to only show markets where user has supplied tokens
      const suppliedMarkets = markets.filter(market => {
        const position = positions[market.id];
        return position && parseFloat(position.supplyBalance || '0') > 0;
      });
      setSelectedMarket(suppliedMarkets[0] || markets[0]);
    }
  }, [preSelectedMarket, markets, positions]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('preview');
      setIsProcessing(false);
      setError(null);
      setTransactionResult(null);
      setAmount('');
      resetTracking();
    }
  }, [isOpen]);

  // Handle event tracking results
  useEffect(() => {
    if (trackedEvent && trackedEvent.type === 'redeem') {
      console.log('Withdraw transaction confirmed via event tracking:', trackedEvent);

      // Create transaction result from tracked event
      const result = {
        hash: trackedEvent.transactionHash,
        status: 'confirmed'
      };

      setTransactionResult(result);
      setIsProcessing(false);
      setCurrentStep('success'); // Move to success step
    }
  }, [trackedEvent]);

  // Handle tracking errors
  useEffect(() => {
    if (trackingError) {
      console.error('Event tracking error:', trackingError);
      setError(trackingError);
      setIsProcessing(false);
    }
  }, [trackingError]);

  // Handle timeout
  useEffect(() => {
    if (hasTimedOut) {
      console.log('Transaction tracking timed out');
      setError('Transaction tracking timed out. Please check your wallet and try again.');
      setIsProcessing(false);
    }
  }, [hasTimedOut]);

  const [borrowingPowerData, setBorrowingPowerData] = useState<any>(null);

  const selectedMarketPosition = selectedMarket ? positions[selectedMarket.id] : null;
  const selectedMarketBalance = selectedMarketPosition?.supplyBalance || selectedMarketPosition?.suppliedBalance || '0';
  const amountNum = parseFloat(amount || '0');
  const amountUSD = selectedMarket ? amountNum * selectedMarket.price : 0;
  const remainingBalance = parseFloat(selectedMarketBalance) - amountNum;
  const remainingUSD = selectedMarket ? remainingBalance * selectedMarket.price : 0;

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
  
  // Calculate new health factor after withdrawal
  const newTotalCollateralValue = totalCollateralValue - amountUSD;
  const newHealthFactor = totalBorrowValue > 0 ? newTotalCollateralValue / totalBorrowValue : 999;
  const healthFactorChange = newHealthFactor - currentHealthFactor;

  const handleMax = () => {
    setAmount(selectedMarketBalance);
  };

  const handleWithdraw = async () => {
    if (!selectedMarket || !account || !amount) return;

    setCurrentStep('confirmation');
    setIsProcessing(true);
    setError(null);

    try {
      // Execute withdraw
      await withdraw(selectedMarket.id, amount);
      
      // Start event tracking after transaction is sent
      console.log(`Withdraw transaction sent, starting event tracking for ${selectedMarket.id}`);
      startTracking(selectedMarket.id, 'redeem');

      // Don't set success yet - wait for event tracking
      return;

    } catch (error: any) {
      console.error('Withdraw error:', error);
      setError(error.message || 'Withdraw failed');
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

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isValid = selectedMarket && amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(selectedMarketBalance);

  // Filter markets to only show those where user has supplied tokens
  const availableMarkets = markets.filter(market => {
    const position = positions[market.id];
    return position && parseFloat(position.suppliedBalance || '0') > 0;
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
                {market.symbol} - {market.supplyAPY.toFixed(2)}% APY
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
          <span>Supplied: {parseFloat(selectedMarketBalance).toFixed(4)} {selectedMarket?.symbol}</span>
          <span>${(parseFloat(selectedMarketBalance) * (selectedMarket?.price || 0)).toFixed(2)}</span>
        </BalanceInfo>
      </AmountInput>

      {amount && selectedMarket && (
        <PreviewSection>
          <PreviewRow>
            <PreviewLabel>Asset</PreviewLabel>
            <PreviewValue>{selectedMarket.symbol}</PreviewValue>
          </PreviewRow>
          <PreviewRow>
            <PreviewLabel>Withdraw Amount</PreviewLabel>
            <PreviewValue>{amount} {selectedMarket.symbol}</PreviewValue>
          </PreviewRow>
          <PreviewRow>
            <PreviewLabel>USD Value</PreviewLabel>
            <PreviewValue>${amountUSD.toFixed(2)}</PreviewValue>
          </PreviewRow>
          <PreviewRow>
            <PreviewLabel>Remaining Supply</PreviewLabel>
            <PreviewValue>{remainingBalance.toFixed(4)} {selectedMarket.symbol}</PreviewValue>
          </PreviewRow>
          <PreviewRow>
            <PreviewLabel>Remaining USD Value</PreviewLabel>
            <PreviewValue>${remainingUSD.toFixed(2)}</PreviewValue>
          </PreviewRow>
          <PreviewRow>
            <PreviewLabel>Supply APY</PreviewLabel>
            <PreviewValue>{selectedMarket.supplyAPY.toFixed(2)}%</PreviewValue>
          </PreviewRow>
          {totalBorrowValue > 0 && (
            <>
              <PreviewRow>
                <PreviewLabel>Current Health Factor</PreviewLabel>
                <PreviewValue>{currentHealthFactor.toFixed(2)}</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>New Health Factor</PreviewLabel>
                <PreviewValue style={{ color: newHealthFactor < 1.5 ? '#ef4444' : healthFactorChange < 0 ? '#f59e0b' : '#06C755' }}>
                  {newHealthFactor.toFixed(2)} {healthFactorChange < 0 ? `(${healthFactorChange.toFixed(2)})` : ''}
                </PreviewValue>
              </PreviewRow>
            </>
          )}
        </PreviewSection>
      )}

      {remainingBalance < parseFloat(selectedMarketBalance) * 0.2 && amount && (
        <WarningBox>
          <WarningText>
            ⚠️ Withdrawing this amount will significantly reduce your supplied balance. This may affect your borrowing capacity and health factor if you have active loans.
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
        onClick={handleWithdraw}
      >
        {isProcessing && <LoadingSpinner />}
        {isProcessing ? 'Processing...' : 'Withdraw'}
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
          <PreviewValue>Withdrawing {amount} {selectedMarket?.symbol}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Status</PreviewLabel>
          <PreviewValue>
            {isTracking ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LoadingSpinner />
                In Progress...
              </div>
            ) : error ? (
              <span style={{ color: '#ef4444' }}>Failed</span>
            ) : trackedEvent ? (
              <span style={{ color: '#06C755' }}>Complete</span>
            ) : (
              <span style={{ color: '#64748b' }}>Processing...</span>
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
      <SuccessIcon>
        <Check size={40} />
      </SuccessIcon>
      <SuccessMessage>Withdrawal Successful!</SuccessMessage>
      <SuccessSubtext>
        You have successfully withdrawn {amount} {selectedMarket?.symbol}
      </SuccessSubtext>

      <TransactionDetails>
        <DetailRow>
          <DetailLabel>Withdrawal Amount</DetailLabel>
          <DetailValue>{amount} {selectedMarket?.symbol}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>USD Value</DetailLabel>
          <DetailValue>${amountUSD.toFixed(2)}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Supply APY</DetailLabel>
          <DetailValue>{selectedMarket?.supplyAPY.toFixed(2)}%</DetailValue>
        </DetailRow>
        {transactionResult?.hash && (
          <DetailRow>
            <DetailLabel>Transaction</DetailLabel>
            <ClickableTransactionHash onClick={() => handleExternalLink(`https://www.kaiascan.io/tx/${transactionResult.hash}`)}>
              <DetailValue>{`${transactionResult.hash.slice(0, 6)}...${transactionResult.hash.slice(-4)}`}</DetailValue>
              <ExternalLink size={12} />
            </ClickableTransactionHash>
          </DetailRow>
        )}
      </TransactionDetails>

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
    <DesktopBaseModal isOpen={isOpen} onClose={handleClose} title="Withdraw Assets">
      <ModalContent> 
        {renderContent()}
      </ModalContent>
    </DesktopBaseModal>
  );
};

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DesktopBaseModal } from '../shared/DesktopBaseModal';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract } from '@/hooks/v2/useMarketContract';
import { useTokenApproval } from '@/hooks/v1/useTokenApproval';
import { useBorrowingPowerV2 } from '@/hooks/v2/useBorrowingPower';
import { useEventTracking } from '@/hooks/useEventTracking';
import { formatUSD } from '@/utils/formatters';
import { ExternalLink, Check } from 'react-feather';
import {
  ModalContent,
  ModalSubtitle,
  MarketSelector,
  Label,
  Select,
  AmountInput,
  InputContainer,
  Input,
  MaxButton,
  BalanceInfo,
  PreviewSection,
  PreviewRow,
  PreviewLabel,
  PreviewValue,
  SuccessBox,
  SuccessText,
  WarningBox,
  WarningText,
  ActionButton,
  CancelButton,
  LoadingSpinner,
  SuccessIcon,
  SuccessMessage,
  SuccessSubtext,
  TransactionDetails,
  DetailRow,
  DetailLabel,
  DetailValue,
  ClickableTransactionHash
} from './DesktopRepayModal.styles';

type TransactionStep = 'preview' | 'confirmation' | 'success';

interface DesktopRepayModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedMarket?: any;
}

export const DesktopRepayModal = ({ isOpen, onClose, preSelectedMarket }: DesktopRepayModalProps) => {
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [position, setPosition] = useState()
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<TransactionStep>('preview');
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [needsApproval, setNeedsApproval] = useState(false);

  const { account } = useWalletAccountStore();
  const { markets } = useContractMarketStore();
  const { repay, getUserPosition } = useMarketContract();
  const { checkAllowance, approveToken } = useTokenApproval();

  const { calculateBorrowingPower } = useBorrowingPowerV2();
  const {
    isTracking,
    trackedEvent,
    error: trackingError,
    hasTimedOut,
    startTracking,
    stopTracking,
    reset: resetTracking
  } = useEventTracking(account);
  const [borrowingPowerData, setBorrowingPowerData] = useState<any>(null);

  useEffect(() => {
    preSelectedMarket && loadPosition(preSelectedMarket);
  }, [preSelectedMarket]);

  const loadPosition = useCallback(async (selectedMarket: any) => {
    setSelectedMarket(selectedMarket)
    const position = await getUserPosition(selectedMarket.id as any, account);
    setPosition(position)

  }, [account])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('preview');
      setIsProcessing(false);
      setError(null);
      setTransactionResult(null);
      setNeedsApproval(false);
      setAmount('');
      resetTracking();
    }
  }, [isOpen]);

  // Handle event tracking results
  useEffect(() => {
    if (trackedEvent && trackedEvent.type === 'repay') {
      console.log('Repay transaction confirmed via event tracking:', trackedEvent);

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

  const selectedMarketPosition = position || null;
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
      await repay(selectedMarket.id, amount);

      // Start event tracking after transaction is sent
      console.log(`Repay transaction sent, starting event tracking for ${selectedMarket.id}`);

      const m: any = selectedMarket;
      let marketId = m.id.split("kaia-")[1]
      if (marketId === "stkaia") {
        marketId = "staked-kaia"
      }

      startTracking(marketId, 'repay');

      // Don't set success yet - wait for event tracking
      return;

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

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isValid = selectedMarket && amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(selectedMarketDebt);

  const renderPreview = () => (
    <>
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

      {((error && !isTracking)) && (
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
      <SuccessMessage>Repayment Successful!</SuccessMessage>
      <SuccessSubtext>
        You have successfully repaid {amount} {selectedMarket?.symbol}
      </SuccessSubtext>

      <TransactionDetails>
        <DetailRow>
          <DetailLabel>Repayment Amount</DetailLabel>
          <DetailValue>{amount} {selectedMarket?.symbol}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>USD Value</DetailLabel>
          <DetailValue>${amountUSD.toFixed(2)}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Borrow APR</DetailLabel>
          <DetailValue>{selectedMarket?.borrowAPR.toFixed(2)}%</DetailValue>
        </DetailRow>
        {amountUSD > 0 && (
          <DetailRow>
            <DetailLabel>Estimated Yearly Interest Savings</DetailLabel>
            <DetailValue>${(dailyInterestSavings * 365).toFixed(2)}</DetailValue>
          </DetailRow>
        )}
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
    <DesktopBaseModal isOpen={isOpen} onClose={handleClose} title="Repay Assets">
      <ModalContent>
        {renderContent()}
      </ModalContent>
    </DesktopBaseModal>
  );
};

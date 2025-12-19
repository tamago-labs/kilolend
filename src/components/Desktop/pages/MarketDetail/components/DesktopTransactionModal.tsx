"use client";

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/Modal/BaseModal';
import { MarketData } from '@/contexts/MarketContext';
import { formatUSD, formatPercent } from '@/utils/formatters';
import { useMarketContract, TransactionResult } from '@/hooks/v1/useMarketContract';
import { useTokenApproval } from '@/hooks/v1/useTokenApproval';
import { useComptrollerContract } from '@/hooks/v1/useComptrollerContract';
import { useEventTracking } from '@/hooks/useEventTracking';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useMarketTokenBalances } from '@/hooks/v1/useMarketTokenBalances';
import { useUserPositions } from '@/hooks/v1/useUserPositions';
import { MARKET_CONFIG_V1 } from '@/utils/contractConfig';
import { ExternalLink, Check } from 'react-feather';

const ModalContent = styled.div`
  padding: 32px;
  max-width: 480px;
  width: 100%;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
  text-align: center;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
`;

const Step = styled.div<{ $active?: boolean; $completed?: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ $active, $completed }) =>
    $completed ? '#06C755' : $active ? '#06C755' : '#94a3b8'};
  font-weight: 600;
  font-size: 14px;
`;

const StepNumber = styled.div<{ $active?: boolean; $completed?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $active, $completed }) =>
    $completed ? '#06C755' : $active ? '#06C755' : '#e2e8f0'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-weight: 700;
`;

const StepConnector = styled.div<{ $completed?: boolean }>`
  width: 40px;
  height: 2px;
  background: ${({ $completed }) => $completed ? '#06C755' : '#e2e8f0'};
  margin: 0 8px;
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

const PreviewValue = styled.div<{ $danger?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $danger }) => $danger ? '#dc2626' : '#1e293b'};
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

const RiskSection = styled.div<{ $level: 'low' | 'medium' | 'high' | 'critical' }>`
  background: ${({ $level }) =>
    $level === 'critical' ? '#7f1d1d' :
      $level === 'high' ? '#fef2f2' :
        $level === 'medium' ? '#fef3c7' : '#f0fdf4'};
  border: 1px solid ${({ $level }) =>
    $level === 'critical' ? '#991b1b' :
      $level === 'high' ? '#ef4444' :
        $level === 'medium' ? '#f59e0b' : '#22c55e'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const RiskTitle = styled.div<{ $level: 'low' | 'medium' | 'high' | 'critical' }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $level }) =>
    $level === 'critical' ? '#fef2f2' :
      $level === 'high' ? '#dc2626' :
        $level === 'medium' ? '#92400e' : '#166534'};
  margin-bottom: 8px;
`;

const RiskText = styled.p<{ $level: 'low' | 'medium' | 'high' | 'critical' }>`
  margin: 0;
  font-size: 14px;
  color: ${({ $level }) =>
    $level === 'critical' ? '#fef2f2' :
      $level === 'high' ? '#dc2626' :
        $level === 'medium' ? '#92400e' : '#166534'};
  line-height: 1.4;
`;

const HealthFactorBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  margin: 8px 0;
  overflow: hidden;
`;

const HealthFactorFill = styled.div<{ $percentage: number; $level: 'low' | 'medium' | 'high' | 'critical' }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: ${({ $level }) =>
    $level === 'critical' ? '#991b1b' :
      $level === 'high' ? '#ef4444' :
        $level === 'medium' ? '#f59e0b' : '#22c55e'};
  transition: all 0.3s ease;
`;

const CollateralSection = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const CollateralTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #075985;
`;

const CollateralInfo = styled.p`
  margin: 0;
  font-size: 13px;
  color: #0369a1;
  line-height: 1.4;
`;

interface DesktopTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'supply' | 'borrow';
  amount: string;
  market: MarketData;
  marketConfig: any;
  displaySymbol: string;
  borrowingPowerData: any;
  maxBorrowData: any;
}

type TransactionStep = 'preview' | 'confirmation' | 'success';

export const DesktopTransactionModal = ({
  isOpen,
  onClose,
  type,
  amount,
  market,
  marketConfig,
  displaySymbol,
  borrowingPowerData,
  maxBorrowData,
}: DesktopTransactionModalProps) => {
  const [currentStep, setCurrentStep] = useState<TransactionStep>('preview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [needsMarketEntry, setNeedsMarketEntry] = useState(false);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);

  const { account } = useWalletAccountStore();
  const { supply, borrow } = useMarketContract();
  const { checkAllowance, approveToken } = useTokenApproval();
  const { enterMarkets, exitMarket, isMarketEntered } = useComptrollerContract();
  const { refreshBalances } = useMarketTokenBalances();
  const { refreshPositions } = useUserPositions();
  const {
    isTracking,
    trackedEvent,
    error: trackingError,
    hasTimedOut,
    startTracking,
    stopTracking,
    reset: resetTracking
  } = useEventTracking(account);

  const marketId = marketConfig?.id;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('preview');
      setIsProcessing(false);
      setError(null);
      setTransactionResult(null);
      resetTracking();
      checkRequirements();
    }
  }, [isOpen, type, marketId]);

  // Handle event tracking results
  useEffect(() => {
    if (trackedEvent && ((type === 'supply' && trackedEvent.type === 'mint') || (type === 'borrow' && trackedEvent.type === 'borrow'))) {
      console.log(`${type} transaction confirmed via event tracking:`, trackedEvent);

      // Create transaction result from tracked event
      const result: TransactionResult = {
        hash: trackedEvent.transactionHash,
        status: 'confirmed'
      };

      setTransactionResult(result);
      setIsProcessing(false);
      setCurrentStep('success'); // Move to success step

      // Refresh data after successful transaction
      setTimeout(() => {
        refreshBalances();
        refreshPositions();
      }, 2000);
    }
  }, [trackedEvent, type]);

  // Handle tracking errors
  useEffect(() => {
    if (trackingError) {
      console.error('Event tracking error:', trackingError);

      // Ignore specific blockchain header errors
      let errorMessage = '';
      if (typeof trackingError === 'string') {
        errorMessage = trackingError;
      } else if (trackingError && typeof trackingError === 'object' && 'message' in trackingError) {
        errorMessage = String((trackingError as any).message);
      } else {
        errorMessage = String(trackingError);
      }

      if (errorMessage.includes('could not coalesce error')) {
        // Don't set error state for coalesce errors 
      }

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

  const checkRequirements = async () => {
    if (!marketId || !account) return;

    try {
      // Check if token approval is needed (for ERC20 tokens)
      if (type === 'supply' && marketConfig?.tokenAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        const approvalStatus = await checkAllowance(marketId, amount);
        setNeedsApproval(!approvalStatus.hasEnoughAllowance);
      }

      // Check if market entry is needed (for supply collateral)
      if (type === 'supply' && marketConfig?.marketAddress) {
        const isEntered = await isMarketEntered(account, marketConfig.marketAddress);
        setNeedsMarketEntry(!isEntered);
      }
    } catch (error) {
      console.error('Error checking requirements:', error);
    }
  };

  const handlePreviewAction = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      setCurrentStep('confirmation');

      // Handle approvals and market entry if needed
      if (type === 'supply') {
        if (needsApproval && marketConfig?.tokenAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
          await approveToken(marketId, amount);
        }

        if (needsMarketEntry) {
          await enterMarkets([marketConfig.marketAddress]);
        }
      }

      // Execute the main transaction
      const result = type === 'supply'
        ? await supply(marketId, amount)
        : await borrow(marketId, amount);

      // Start event tracking after transaction is sent
      console.log(`${type} transaction sent, starting event tracking for ${marketId}`);
      startTracking(marketId, type === 'supply' ? 'mint' : 'borrow');

      // Don't set success yet - wait for event tracking
      return;

    } catch (error: any) {
      console.error('Transaction error:', error);
      setError(error.message || 'Transaction failed');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (currentStep === 'success') {
      // Reset amount in parent component
      onClose();
    } else {
      onClose();
    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'preview', label: 'Preview' },
      { key: 'confirmation', label: 'Confirm' },
      { key: 'success', label: 'Complete' }
    ];

    return (
      <StepIndicator>
        {steps.map((step, index) => (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            <Step $active={currentStep === step.key} $completed={currentStep === 'success'}>
              <StepNumber $active={currentStep === step.key} $completed={currentStep === 'success'}>
                {currentStep === 'success' ? '✓' : index + 1}
              </StepNumber>
              {step.label}
            </Step>
            {index < steps.length - 1 && (
              <StepConnector $completed={currentStep === 'success'} />
            )}
          </div>
        ))}
      </StepIndicator>
    );
  };

  const renderPreview = () => {
    const amountNum = parseFloat(amount || '0');
    const amountUSD = amountNum * market.price;

    if (type === 'supply') {
      // Supply preview with comprehensive information
      const expectedCTokens = amountNum * 50; // Fallback calculation
      const yearlyEarnings = amountUSD * (market.supplyAPY / 100);

      return (
        <>
          <PreviewSection>
            <PreviewRow>
              <PreviewLabel>Asset</PreviewLabel>
              <PreviewValue>{displaySymbol}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Amount</PreviewLabel>
              <PreviewValue>{amount} {displaySymbol}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>USD Value</PreviewLabel>
              <PreviewValue>${amountUSD.toFixed(2)}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Supply APY</PreviewLabel>
              <PreviewValue>{formatPercent(market.supplyAPY)}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Expected Yearly Earnings</PreviewLabel>
              <PreviewValue>${yearlyEarnings.toFixed(2)}</PreviewValue>
            </PreviewRow>
            {/*<PreviewRow>
              <PreviewLabel>You will receive</PreviewLabel>
              <PreviewValue>{expectedCTokens.toFixed(2)} c{displaySymbol}</PreviewValue>
            </PreviewRow>*/}
          </PreviewSection>

          {needsApproval && (
            <WarningBox>
              <WarningText>
                ⚠️ You need to approve {displaySymbol} spending before supplying. This will require a separate transaction.
              </WarningText>
            </WarningBox>
          )}

          {needsMarketEntry && (
            <WarningBox>
              <WarningText>
                ⚠️ This asset will be enabled as collateral, allowing you to borrow against it. You can disable this later if needed.
              </WarningText>
            </WarningBox>
          )}

          <ActionButton
            $primary
            $disabled={isProcessing}
            onClick={handlePreviewAction}
          >
            {isProcessing && <LoadingSpinner />}
            {isProcessing ? 'Processing...' : 'Confirm Supply'}
          </ActionButton>

          <CancelButton onClick={handleClose} disabled={isProcessing}>
            Cancel
          </CancelButton>
        </>
      );
    } else {
      // Borrow preview with comprehensive information
      const totalCollateralValue = parseFloat(borrowingPowerData?.totalCollateralValue || '0');
      const totalBorrowValue = parseFloat(borrowingPowerData?.totalBorrowValue || '0');
      const currentHealthFactor = parseFloat(borrowingPowerData?.healthFactor || '999');

      const newTotalBorrowValueUSD = totalBorrowValue + amountUSD;
      const newHealthFactor = newTotalBorrowValueUSD > 0 ?
        totalCollateralValue / newTotalBorrowValueUSD : 999;

      const utilizationBefore = totalCollateralValue > 0 ?
        (totalBorrowValue / totalCollateralValue) * 100 : 0;
      const utilizationAfter = totalCollateralValue > 0 ?
        (newTotalBorrowValueUSD / totalCollateralValue) * 100 : 0;

      const yearlyInterest = amountNum * (market.borrowAPY / 100);

      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (newHealthFactor < 1.2 || utilizationAfter > 80) riskLevel = 'critical';
      else if (newHealthFactor < 1.3 || utilizationAfter > 70) riskLevel = 'high';
      else if (newHealthFactor < 1.5 || utilizationAfter > 60) riskLevel = 'medium';

      return (
        <>
          <PreviewSection>
            <PreviewRow>
              <PreviewLabel>Borrow Amount</PreviewLabel>
              <PreviewValue>{amountNum.toFixed(4)} {displaySymbol}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>USD Value</PreviewLabel>
              <PreviewValue>${amountUSD.toFixed(2)}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Borrow APR</PreviewLabel>
              <PreviewValue>{formatPercent(market.borrowAPY)}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Yearly Interest</PreviewLabel>
              <PreviewValue>${yearlyInterest.toFixed(2)}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Current Total Debt</PreviewLabel>
              <PreviewValue>${totalBorrowValue.toFixed(2)}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>New Total Debt</PreviewLabel>
              <PreviewValue>${newTotalBorrowValueUSD.toFixed(2)}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Total Collateral Value</PreviewLabel>
              <PreviewValue>${totalCollateralValue.toFixed(2)}</PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Utilization</PreviewLabel>
              <PreviewValue $danger={utilizationAfter > 80}>
                {utilizationBefore.toFixed(1)}% → {utilizationAfter.toFixed(1)}%
              </PreviewValue>
            </PreviewRow>
            <PreviewRow>
              <PreviewLabel>Health Factor</PreviewLabel>
              <PreviewValue $danger={newHealthFactor < 1.2}>
                {currentHealthFactor.toFixed(2)} → {newHealthFactor.toFixed(2)}
              </PreviewValue>
            </PreviewRow>
          </PreviewSection>

          {/* Health Factor Visualization */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: '#64748b' }}>
              <span>New Health Factor</span>
              <span>{newHealthFactor > 10 ? '10+' : newHealthFactor.toFixed(2)}</span>
            </div>
            <HealthFactorBar>
              <HealthFactorFill
                $percentage={Math.min((newHealthFactor / 3) * 100, 100)}
                $level={riskLevel}
              />
            </HealthFactorBar>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              {`Safe: > 1.5 • Warning: 1.3-1.5 • Danger: 1.2-1.3 • Critical: < 1.2`}
            </div>
          </div>

          <RiskSection $level={riskLevel}>
            <RiskTitle $level={riskLevel}>
              {riskLevel === 'critical' ? '🚨 CRITICAL RISK' :
                riskLevel === 'high' ? '⚠️ High Risk' :
                  riskLevel === 'medium' ? '⚡ Medium Risk' :
                    '✅ Low Risk'}
            </RiskTitle>
            <RiskText $level={riskLevel}>
              {riskLevel === 'critical' &&
                `Your health factor will be ${newHealthFactor.toFixed(2)}, which is critically low. Your position is at immediate risk of liquidation! Borrow this amount only if you can add collateral immediately.`
              }
              {riskLevel === 'high' &&
                `Your health factor will be ${newHealthFactor.toFixed(2)}, which is dangerously low. Your position will be at high risk of liquidation. Consider borrowing less or supplying more collateral.`
              }
              {riskLevel === 'medium' &&
                `Your health factor will be ${newHealthFactor.toFixed(2)}, which indicates moderate risk. Monitor your position closely and be prepared to repay or add collateral if needed.`
              }
              {riskLevel === 'low' &&
                `Your health factor will be ${newHealthFactor.toFixed(2)}, which is relatively safe. You have good collateral coverage for this borrow amount.`
              }
            </RiskText>
          </RiskSection>

          <ActionButton
            $primary
            $disabled={isProcessing}
            onClick={handlePreviewAction}
          >
            {isProcessing && <LoadingSpinner />}
            {isProcessing ? 'Processing...' : 'Confirm Borrow'}
          </ActionButton>

          <CancelButton onClick={handleClose} disabled={isProcessing}>
            Cancel
          </CancelButton>
        </>
      );
    }
  };

  const renderConfirmation = () => (
    <>
      <PreviewSection>
        <PreviewRow>
          <PreviewLabel>Transaction</PreviewLabel>
          <PreviewValue>{type === 'supply' ? 'Supplying' : 'Borrowing'} {amount} {displaySymbol}</PreviewValue>
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

      {(error && isTracking) && (
        <WarningBox>
          <WarningText>
            ❌ {error}
          </WarningText>
        </WarningBox>
      )}

      {!isTracking && !trackedEvent && !error && (
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

  const renderSuccess = () => {
    const amountNum = parseFloat(amount || '0');
    const amountUSD = amountNum * market.price;

    return (
      <>
        <SuccessIcon>
          <Check size={40} />
        </SuccessIcon>
        <SuccessMessage>{type === 'supply' ? 'Supply Successful!' : 'Borrow Successful!'}</SuccessMessage>
        <SuccessSubtext>
          You have successfully {type === 'supply' ? 'supplied' : 'borrowed'} {amount} {displaySymbol}
          {type === 'supply' && `. You're now earning ${market.supplyAPY.toFixed(2)}% APY!`}
        </SuccessSubtext>

        <TransactionDetails>
          <DetailRow>
            <DetailLabel>{type === 'supply' ? 'Amount Supplied' : 'Borrowed Amount'}</DetailLabel>
            <DetailValue>{amount} {displaySymbol}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>USD Value</DetailLabel>
            <DetailValue>${amountUSD.toFixed(2)}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>{type === 'supply' ? 'Supply APY' : 'Borrow APR'}</DetailLabel>
            <DetailValue>{formatPercent(type === 'supply' ? market.supplyAPY : market.borrowAPY)}</DetailValue>
          </DetailRow>
          {type === 'borrow' && (
            <DetailRow>
              <DetailLabel>Estimated Yearly Interest</DetailLabel>
              <DetailValue>{(amountNum * (market.borrowAPY / 100)).toFixed(4)} {displaySymbol}</DetailValue>
            </DetailRow>
          )}
          <DetailRow>
            <DetailLabel>Status</DetailLabel>
            <DetailValue>Confirmed</DetailValue>
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
  };

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
    <BaseModal isOpen={isOpen} onClose={handleClose} title={`${type === 'supply' ? 'Supply' : 'Borrow'} ${displaySymbol}`}>
      <ModalContent>
        {renderStepIndicator()}

        {renderContent()}
      </ModalContent>
    </BaseModal>
  );
};

'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { ChevronRight } from 'react-feather';
import { useMarketContract, TransactionResult } from '@/hooks/useMarketContract';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useBorrowingPower } from '@/hooks/useBorrowingPower';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const StepProgress = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  padding: 0 20px;
`;

const StepDot = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active, $completed }) => 
    $completed ? '#06C755' : $active ? '#06C755' : '#e2e8f0'};
  margin: 0 4px;
  transition: all 0.3s ease;
`;

const StepContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const AssetCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const AssetHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const AssetIcon = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const AssetInfo = styled.div`
  flex: 1;
`;

const AssetName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

const AssetDetails = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const AmountSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
`;

const AmountInput = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  background: white;
  margin-bottom: 12px;
  
  &:focus {
    outline: none;
    border-color: #06C755;
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const QuickAmountButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const QuickAmountButton = styled.button<{ $selected?: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ $selected }) => $selected ? `
    background: #06C755;
    color: white;
    border: 2px solid #06C755;
  ` : `
    background: white;
    color: #64748b;
    border: 2px solid #e2e8f0;
    
    &:hover {
      border-color: #06C755;
      color: #06C755;
    }
  `}
`;

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const BalanceLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const BalanceValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const TransactionPreview = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const PreviewRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #e2e8f0;
  }
`;

const PreviewLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const PreviewValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const WarningCard = styled.div`
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #dc2626;
  font-size: 14px;
`;

const NavigationContainer = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  margin-top: auto;
`;

const NavButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
  
  ${({ $primary }) => $primary ? `
    background: #06C755;
    color: white;
    border-color: #06C755;
    
    &:hover {
      background: #059212;
      border-color: #059212;
      transform: translateY(-1px);
    }
    
    &:disabled {
      background: #94a3b8;
      border-color: #94a3b8;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: white;
    color: #64748b;
    border-color: #e2e8f0;
    
    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  `}
`;

const SuccessContent = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #06C755, #059212);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 40px;
  color: white;
`;

const SuccessTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const SuccessMessage = styled.p`
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #dc2626;
  font-size: 14px;
`;

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  market?: any;
  currentSupply?: string;
  maxWithdraw?: string;
}

export const WithdrawModal = ({ 
  isOpen, 
  onClose, 
  market,
  currentSupply = '0',
  maxWithdraw = '0'
}: WithdrawModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const [withdrawData, setWithdrawData] = useState<any>(null);

  const { account } = useWalletAccountStore();
  const { withdraw } = useMarketContract();
  const { calculateBorrowingPower } = useBorrowingPower();

  const totalSteps = 3;
  const maxWithdrawAmount = parseFloat(maxWithdraw);

  // Calculate withdraw data when amount changes
  useEffect(() => {
    const calculateWithdrawData = async () => {
      if (!amount || !market || !account) return;

      try {
        const borrowingPower = await calculateBorrowingPower(account);
        const withdrawAmount = parseFloat(amount);
        const withdrawValue = withdrawAmount * market.price;
        
        // Calculate if withdrawal affects borrowing power
        const currentCollateral = parseFloat(borrowingPower.totalCollateralValue);
        const currentBorrow = parseFloat(borrowingPower.totalBorrowValue);
        const newCollateralValue = currentCollateral - withdrawValue;
        const newHealthFactor = currentBorrow > 0 ? newCollateralValue / currentBorrow : 999;

        setWithdrawData({
          withdrawAmount,
          withdrawValue,
          newHealthFactor,
          remainingSupply: maxWithdrawAmount - withdrawAmount,
          canWithdraw: newHealthFactor > 1.1 // Safe threshold
        });
      } catch (error) {
        console.error('Error calculating withdraw data:', error);
      }
    };

    calculateWithdrawData();
  }, [amount, market, account, maxWithdrawAmount]);

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = (maxWithdrawAmount * percentage / 100).toString();
    setAmount(quickAmount);
    setSelectedQuickAmount(percentage);
  };

  const handleMaxAmount = () => {
    setAmount(maxWithdrawAmount.toString());
    setSelectedQuickAmount(100);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: 
        return amount && 
               parseFloat(amount) > 0 && 
               parseFloat(amount) <= maxWithdrawAmount &&
               withdrawData?.canWithdraw;
      case 2: 
        return true;
      default: 
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = async () => {
    if (!market || !amount || !account) return;

    setIsTransacting(true);
    
    try {
      console.log(`Starting withdraw transaction for ${amount} ${market.symbol}`);
      const result = await withdraw(market.id, amount);
      setTransactionResult(result);
      
      if (result.status === 'confirmed') {
        console.log(`Withdraw successful: ${amount} ${market.symbol} withdrawn`);
        setCurrentStep(3);
      } else {
        throw new Error(result.error || 'Withdraw transaction failed');
      }
    } catch (error) {
      console.error('Withdraw process failed:', error);
      setTransactionResult({
        hash: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Transaction failed. Please try again.'
      });
    } finally {
      setIsTransacting(false);
    }
  };

  const renderStepContent = () => {
    if (!market) return null;

    switch (currentStep) {
      case 1:
        return (
          <>
            <AssetCard>
              <AssetHeader>
                <AssetIcon src={market.icon} alt={market.symbol} />
                <AssetInfo>
                  <AssetName>Withdraw {market.symbol}</AssetName>
                  <AssetDetails>Current Supply APY: {market.supplyAPY.toFixed(2)}%</AssetDetails>
                </AssetInfo>
              </AssetHeader>
            </AssetCard>

            <AmountSection>
              <SectionTitle>Withdraw Amount</SectionTitle>
              <AmountInput
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSelectedQuickAmount(null);
                }}
                max={maxWithdrawAmount}
                step="0.000001"
              />
              
              <QuickAmountButtons>
                {[25, 50, 75].map(percentage => (
                  <QuickAmountButton
                    key={percentage}
                    $selected={selectedQuickAmount === percentage}
                    onClick={() => handleQuickAmount(percentage)}
                  >
                    {percentage}%
                  </QuickAmountButton>
                ))}
                <QuickAmountButton
                  $selected={selectedQuickAmount === 100}
                  onClick={handleMaxAmount}
                >
                  MAX
                </QuickAmountButton>
              </QuickAmountButtons>

              <BalanceInfo>
                <BalanceLabel>Available to Withdraw:</BalanceLabel>
                <BalanceValue>{maxWithdrawAmount.toFixed(6)} {market.symbol}</BalanceValue>
              </BalanceInfo>

              <BalanceInfo>
                <BalanceLabel>Total Supplied:</BalanceLabel>
                <BalanceValue>{parseFloat(currentSupply).toFixed(6)} {market.symbol}</BalanceValue>
              </BalanceInfo>
            </AmountSection>

            {withdrawData && !withdrawData.canWithdraw && (
              <WarningCard>
                This withdrawal would reduce your health factor below safe levels. 
                Consider repaying some debt first.
              </WarningCard>
            )}
          </>
        );

      case 2:
        return withdrawData ? (
          <>
            <AssetCard>
              <AssetHeader>
                <AssetIcon src={market.icon} alt={market.symbol} />
                <AssetInfo>
                  <AssetName>Confirm Withdrawal</AssetName>
                  <AssetDetails>Review your transaction details</AssetDetails>
                </AssetInfo>
              </AssetHeader>
            </AssetCard>

            <TransactionPreview>
              <PreviewRow>
                <PreviewLabel>Withdraw Amount:</PreviewLabel>
                <PreviewValue>{withdrawData.withdrawAmount.toFixed(6)} {market.symbol}</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>USD Value:</PreviewLabel>
                <PreviewValue>${withdrawData.withdrawValue.toFixed(2)}</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>Remaining Supply:</PreviewLabel>
                <PreviewValue>{withdrawData.remainingSupply.toFixed(6)} {market.symbol}</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>New Health Factor:</PreviewLabel>
                <PreviewValue>{withdrawData.newHealthFactor.toFixed(2)}</PreviewValue>
              </PreviewRow>
            </TransactionPreview>

            {withdrawData.newHealthFactor < 2 && withdrawData.newHealthFactor > 1.1 && (
              <WarningCard>
                Your health factor will be {withdrawData.newHealthFactor.toFixed(2)} after this withdrawal. 
                Monitor your position closely.
              </WarningCard>
            )}
          </>
        ) : null;

      case 3:
        return (
          <SuccessContent>
            <SuccessIcon>✓</SuccessIcon>
            <SuccessTitle>Withdrawal Successful!</SuccessTitle>
            <SuccessMessage>
              You have successfully withdrawn {amount} {market.symbol} from your supply position.
            </SuccessMessage>
            {transactionResult?.hash && (
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                Transaction Hash: {transactionResult.hash}
              </div>
            )}
          </SuccessContent>
        );

      default:
        return null;
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setAmount('');
      setSelectedQuickAmount(null);
      setIsTransacting(false);
      setTransactionResult(null);
      setWithdrawData(null);
    }
  }, [isOpen]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Withdraw Assets"
    >
      <Container>
        <StepProgress>
          {Array.from({ length: totalSteps }, (_, i) => (
            <StepDot
              key={i}
              $active={i + 1 === currentStep}
              $completed={i + 1 < currentStep}
            />
          ))}
        </StepProgress>

        <StepContent>
          {transactionResult?.status === 'failed' && transactionResult.error && (
            <ErrorMessage>
              {transactionResult.error}
            </ErrorMessage>
          )}
          
          {renderStepContent()}
        </StepContent>

        {currentStep < 3 && (
          <NavigationContainer>
            {currentStep > 1 && (
              <NavButton onClick={handleBack} disabled={isTransacting}>
                Back
              </NavButton>
            )}
            <NavButton
              $primary
              disabled={!canProceed() || isTransacting}
              onClick={currentStep === 2 ? handleConfirm : handleNext}
            >
              {isTransacting ? (
                'Processing Withdrawal...'
              ) : (
                <>
                  {currentStep === 2 ? 'Confirm Withdrawal' : 'Next'}
                  {currentStep < 2 && <ChevronRight size={16} style={{ marginLeft: '4px' }} />}
                </>
              )}
            </NavButton>
          </NavigationContainer>
        )}
      </Container>
    </BaseModal>
  );
};
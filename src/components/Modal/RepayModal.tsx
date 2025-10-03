'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { ChevronRight } from 'react-feather';
import { useMarketContract, TransactionResult } from '@/hooks/useMarketContract';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useMarketTokenBalances } from '@/hooks/useMarketTokenBalances';
import { useTokenApproval } from '@/hooks/useTokenApproval';
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
  background: #fef2f2;
  border: 1px solid #ef4444;
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
    border-color: #ef4444;
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
    background: #ef4444;
    color: white;
    border: 2px solid #ef4444;
  ` : `
    background: white;
    color: #64748b;
    border: 2px solid #e2e8f0;
    
    &:hover {
      border-color: #ef4444;
      color: #ef4444;
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

const InfoCard = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #0369a1;
  font-size: 14px;
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

const ApprovalMessage = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #0369a1;
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
    background: #ef4444;
    color: white;
    border-color: #ef4444;
    
    &:hover {
      background: #dc2626;
      border-color: #dc2626;
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

interface RepayModalProps {
  isOpen: boolean;
  onClose: () => void;
  market?: any;
  currentDebt?: string;
  totalDebt?: string;
}

export const RepayModal = ({ 
  isOpen, 
  onClose, 
  market,
  currentDebt = '0',
  totalDebt = '0'
}: RepayModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [isTransacting, setIsTransacting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const [repayData, setRepayData] = useState<any>(null);

  const { account } = useWalletAccountStore();
  const { repay } = useMarketContract();
  const { balances } = useMarketTokenBalances();
  const { checkAllowance, ensureApproval } = useTokenApproval();
  const { calculateBorrowingPower } = useBorrowingPower();

  const totalSteps = 3;
  const maxDebtAmount = parseFloat(totalDebt);
  const walletBalance = market ? parseFloat(balances[market.id]?.formattedBalance || '0') : 0;
  const maxRepayAmount = Math.min(maxDebtAmount, walletBalance);

  // Check if approval is needed when amount changes
  useEffect(() => {
    const checkApprovalNeeded = async () => {
      if (market && amount && parseFloat(amount) > 0) {
        try {
          const { hasEnoughAllowance } = await checkAllowance(market.id, amount);
          setNeedsApproval(!hasEnoughAllowance);
        } catch (error) {
          console.error('Error checking allowance:', error);
          setNeedsApproval(false);
        }
      } else {
        setNeedsApproval(false);
      }
    };

    checkApprovalNeeded();
  }, [market, amount]);

  // Calculate repay data when amount changes
  useEffect(() => {
    const calculateRepayData = async () => {
      if (!amount || !market || !account) return;

      try {
        const borrowingPower = await calculateBorrowingPower(account);
        const repayAmount = parseFloat(amount);
        const repayValue = repayAmount * market.price;
        
        // Calculate new borrowing position
        const currentBorrow = parseFloat(borrowingPower.totalBorrowValue);
        const currentCollateral = parseFloat(borrowingPower.totalCollateralValue);
        const newBorrowValue = currentBorrow - repayValue;
        const newHealthFactor = newBorrowValue > 0 ? currentCollateral / newBorrowValue : 999;
        const newBorrowingPower = currentCollateral - newBorrowValue;

        setRepayData({
          repayAmount,
          repayValue,
          remainingDebt: maxDebtAmount - repayAmount,
          newHealthFactor,
          newBorrowingPower,
          interestSaved: (repayValue * market.borrowAPR / 100) // Annual interest saved
        });
      } catch (error) {
        console.error('Error calculating repay data:', error);
      }
    };

    calculateRepayData();
  }, [amount, market, account, maxDebtAmount]);

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = (maxRepayAmount * percentage / 100).toString();
    setAmount(quickAmount);
    setSelectedQuickAmount(percentage);
  };

  const handleMaxAmount = () => {
    setAmount(maxRepayAmount.toString());
    setSelectedQuickAmount(100);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: 
        return amount && 
               parseFloat(amount) > 0 && 
               parseFloat(amount) <= maxRepayAmount;
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
      // Step 1: Handle approval if needed
      if (needsApproval) {
        setIsApproving(true);
        console.log(`Token approval needed for ${market.symbol}`);
        
        const approvalResult = await ensureApproval(market.id, amount);
        
        if (!approvalResult.success) {
          throw new Error(approvalResult.error || 'Token approval failed');
        }
        
        console.log(`Token approval successful for ${market.symbol}`);
        setIsApproving(false);
        setNeedsApproval(false);
      }
      
      // Step 2: Execute repay transaction
      console.log(`Starting repay transaction for ${amount} ${market.symbol}`);
      const result = await repay(market.id, amount);
      setTransactionResult(result);
      
      if (result.status === 'confirmed') {
        console.log(`Repay successful: ${amount} ${market.symbol} repaid`);
        setCurrentStep(3);
      } else {
        throw new Error(result.error || 'Repay transaction failed');
      }
    } catch (error) {
      console.error('Repay process failed:', error);
      setTransactionResult({
        hash: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Transaction failed. Please try again.'
      });
    } finally {
      setIsTransacting(false);
      setIsApproving(false);
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
                  <AssetName>Repay {market.symbol}</AssetName>
                  <AssetDetails>Current Borrow APR: {market.borrowAPR.toFixed(2)}%</AssetDetails>
                </AssetInfo>
              </AssetHeader>
            </AssetCard>

            <AmountSection>
              <SectionTitle>Repayment Amount</SectionTitle>
              <AmountInput
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSelectedQuickAmount(null);
                }}
                max={maxRepayAmount}
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
                <BalanceLabel>Wallet Balance:</BalanceLabel>
                <BalanceValue>{walletBalance.toFixed(6)} {market.symbol}</BalanceValue>
              </BalanceInfo>

              <BalanceInfo>
                <BalanceLabel>Total Debt:</BalanceLabel>
                <BalanceValue>{maxDebtAmount.toFixed(6)} {market.symbol}</BalanceValue>
              </BalanceInfo>

              <BalanceInfo>
                <BalanceLabel>Max Repayment:</BalanceLabel>
                <BalanceValue>{maxRepayAmount.toFixed(6)} {market.symbol}</BalanceValue>
              </BalanceInfo>
            </AmountSection>

            {walletBalance < maxDebtAmount && (
              <InfoCard>
                Your wallet balance is insufficient to repay the full debt. 
                You can make a partial repayment to improve your health factor.
              </InfoCard>
            )}
          </>
        );

      case 2:
        return repayData ? (
          <>
            <AssetCard>
              <AssetHeader>
                <AssetIcon src={market.icon} alt={market.symbol} />
                <AssetInfo>
                  <AssetName>Confirm Repayment</AssetName>
                  <AssetDetails>Review your transaction details</AssetDetails>
                </AssetInfo>
              </AssetHeader>
            </AssetCard>

            <TransactionPreview>
              <PreviewRow>
                <PreviewLabel>Repay Amount:</PreviewLabel>
                <PreviewValue>{repayData.repayAmount.toFixed(6)} {market.symbol}</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>USD Value:</PreviewLabel>
                <PreviewValue>${repayData.repayValue.toFixed(2)}</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>Remaining Debt:</PreviewLabel>
                <PreviewValue>{repayData.remainingDebt.toFixed(6)} {market.symbol}</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>New Health Factor:</PreviewLabel>
                <PreviewValue>{repayData.newHealthFactor.toFixed(2)}</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>Annual Interest Saved:</PreviewLabel>
                <PreviewValue>${repayData.interestSaved.toFixed(2)}</PreviewValue>
              </PreviewRow>
            </TransactionPreview>

            {needsApproval && (
              <ApprovalMessage>
                You need to approve {market.symbol} spending before repaying. This will require a separate transaction.
              </ApprovalMessage>
            )}

            {repayData.remainingDebt > 0 && (
              <InfoCard>
                After this repayment, you will still owe {repayData.remainingDebt.toFixed(6)} {market.symbol}. 
                Your health factor will improve to {repayData.newHealthFactor.toFixed(2)}.
              </InfoCard>
            )}
          </>
        ) : null;

      case 3:
        return (
          <SuccessContent>
            <SuccessIcon>✓</SuccessIcon>
            <SuccessTitle>Repayment Successful!</SuccessTitle>
            <SuccessMessage>
              You have successfully repaid {amount} {market.symbol} of your debt.
              {repayData?.remainingDebt === 0 && " Your debt has been fully paid off!"}
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
      setIsApproving(false);
      setNeedsApproval(false);
      setTransactionResult(null);
      setRepayData(null);
    }
  }, [isOpen]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Repay Debt"
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
                isApproving ? 'Approving Token...' : 'Processing Repayment...'
              ) : (
                <>
                  {currentStep === 2 ? 
                    (needsApproval ? 'Approve & Repay' : 'Confirm Repayment') : 
                    'Next'
                  }
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
'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { ChevronRight } from 'react-feather';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract, MarketInfo, TransactionResult } from '@/hooks/useMarketContract';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useMarketTokenBalances } from '@/hooks/useMarketTokenBalances';
import { useMarketData } from '@/hooks/useMarketData';
import { useTokenApproval } from '@/hooks/useTokenApproval';
import { 
  SupplyAssetSelection,
  SupplyAmountInput,
  SupplyTransactionPreview,
  SupplySuccess
} from './Steps';

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

interface SupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupplyModal = ({ isOpen, onClose }: SupplyModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [isTransacting, setIsTransacting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);

  const { markets } = useContractMarketStore();
  const { account } = useWalletAccountStore();
  const { supply } = useMarketContract();
  const { balances: tokenBalances, isLoading: balancesLoading } = useMarketTokenBalances();
  const { isLoading: marketDataLoading } = useMarketData();
  const { checkAllowance, ensureApproval } = useTokenApproval();

  const totalSteps = 4;

  // Convert token balances to the format expected by components
  const userBalances = Object.keys(tokenBalances).reduce((acc, marketId) => {
    const balance = tokenBalances[marketId];
    acc[balance.symbol] = balance.formattedBalance;
    return acc;
  }, {} as Record<string, string>);

  // Check if approval is needed when amount changes
  useEffect(() => {
    const checkApprovalNeeded = async () => {
      if (selectedAsset && amount && parseFloat(amount) > 0) {
        try {
          const { hasEnoughAllowance } = await checkAllowance(selectedAsset.id, amount);
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
  }, [selectedAsset, amount, checkAllowance]);

  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
    setAmount('');
    setSelectedQuickAmount(null);
    setNeedsApproval(false);
  };

  const handleQuickAmount = (percentage: number) => {
    if (selectedAsset) {
      const balance = parseFloat(userBalances[selectedAsset.symbol] || '0');
      const quickAmount = (balance * percentage / 100).toString();
      setAmount(quickAmount);
      setSelectedQuickAmount(percentage);
    }
  };

  const handleMaxAmount = () => {
    if (selectedAsset) {
      const balance = userBalances[selectedAsset.symbol] || '0';
      setAmount(balance);
      setSelectedQuickAmount(100);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedAsset !== null;
      case 2: return amount && parseFloat(amount) > 0;
      case 3: return true;
      default: return false;
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
    if (!selectedAsset || !amount || !account) return;

    setIsTransacting(true);
    
    try {
      // Step 1: Handle approval if needed
      if (needsApproval) {
        setIsApproving(true);
        console.log(`Token approval needed for ${selectedAsset.symbol}`);
        
        const approvalResult = await ensureApproval(selectedAsset.id, amount);
        
        if (!approvalResult.success) {
          throw new Error(approvalResult.error || 'Token approval failed');
        }
        
        console.log(`Token approval successful for ${selectedAsset.symbol}`);
        setIsApproving(false);
        setNeedsApproval(false);
      }
      
      // Step 2: Execute supply transaction
      console.log(`Starting supply transaction for ${amount} ${selectedAsset.symbol}`);
      const result = await supply(selectedAsset.id, amount);
      setTransactionResult(result);
      
      if (result.status === 'confirmed') {
        console.log(`Supply successful: ${amount} ${selectedAsset.symbol} supplied`);
        setCurrentStep(4);
      } else {
        throw new Error(result.error || 'Supply transaction failed');
      }
    } catch (error) {
      console.error('Supply process failed:', error);
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
    switch (currentStep) {
      case 1:
        return (
          <SupplyAssetSelection
            markets={markets}
            selectedAsset={selectedAsset}
            userBalances={userBalances}
            onAssetSelect={handleAssetSelect}
            isLoading={balancesLoading}
          />
        );

      case 2:
        return selectedAsset ? (
          <SupplyAmountInput
            selectedAsset={selectedAsset}
            amount={amount}
            selectedQuickAmount={selectedQuickAmount}
            userBalance={userBalances[selectedAsset.symbol] || '0.00'}
            onAmountChange={(value) => {
              setAmount(value);
              setSelectedQuickAmount(null);
            }}
            onQuickAmountSelect={handleQuickAmount}
            onMaxClick={handleMaxAmount}
          />
        ) : null;

      case 3:
        return selectedAsset ? (
          <SupplyTransactionPreview
            selectedAsset={selectedAsset}
            amount={amount}
            isLoading={isTransacting}
            needsApproval={needsApproval}
          />
        ) : null;

      case 4:
        return selectedAsset ? (
          <SupplySuccess
            transactionHash={transactionResult?.hash}
            amount={amount}
            asset={selectedAsset.symbol}
            expectedAPY={selectedAsset.supplyAPY}
          />
        ) : null;

      default:
        return null;
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedAsset(null);
      setAmount('');
      setSelectedQuickAmount(null);
      setIsTransacting(false);
      setIsApproving(false);
      setNeedsApproval(false);
      setTransactionResult(null);
    }
  }, [isOpen]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Supply Assets"
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

          {needsApproval && currentStep === 3 && (
            <ApprovalMessage>
              You need to approve {selectedAsset?.symbol} spending before supplying. This will require a separate transaction.
            </ApprovalMessage>
          )}
          
          {renderStepContent()}
        </StepContent>

        {currentStep < 4 && (
          <NavigationContainer>
            {currentStep > 1 && (
              <NavButton onClick={handleBack} disabled={isTransacting}>
                Back
              </NavButton>
            )}
            <NavButton
              $primary
              disabled={!canProceed() || isTransacting}
              onClick={currentStep === 3 ? handleConfirm : handleNext}
            >
              {isTransacting ? (
                isApproving ? 'Approving Token...' : 'Confirming Supply...'
              ) : (
                <>
                  {currentStep === 3 ? 
                    (needsApproval ? 'Approve & Supply' : 'Confirm Supply') : 
                    'Next'
                  }
                  {currentStep < 3 && <ChevronRight size={16} style={{ marginLeft: '4px' }} />}
                </>
              )}
            </NavButton>
          </NavigationContainer>
        )}
      </Container>
    </BaseModal>
  );
};

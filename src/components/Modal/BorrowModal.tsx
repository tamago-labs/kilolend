'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { ChevronRight } from 'react-feather';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract, TransactionResult } from '@/hooks/useMarketContract';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useMarketTokenBalances } from '@/hooks/useMarketTokenBalances';
import { useMarketDataWithPrices } from '@/hooks/useMarketDataWithPrices';
import { useBorrowingPower } from '@/hooks/useBorrowingPower';
import {
  BorrowAssetSelection,
  BorrowAmountInput,
  BorrowTransactionPreview,
  BorrowSuccess,
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

  ${({ $primary }) =>
    $primary
      ? `
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
  `
      : `
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

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
  font-size: 14px;
`;

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BorrowModal = ({ isOpen, onClose }: BorrowModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(
    null
  );
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult | null>(null);
  const [borrowingPowerData, setBorrowingPowerData] = useState<any>(null);
  const [maxBorrowData, setMaxBorrowData] = useState<any>(null);
  const [isLoadingBorrowData, setIsLoadingBorrowData] = useState(false);

  const { markets } = useContractMarketStore();
  const { account } = useWalletAccountStore();
  const { borrow } = useMarketContract();
  const { balances: tokenBalances, isLoading: balancesLoading } =
    useMarketTokenBalances();
  const { isLoading: marketDataLoading } = useMarketDataWithPrices();
  const { calculateBorrowingPower, calculateMaxBorrowAmount } =
    useBorrowingPower();

  const totalSteps = 4;

  // Convert token balances to include borrow balances
  const userBalances = Object.keys(tokenBalances).reduce((acc, marketId) => {
    const balance = tokenBalances[marketId];
    acc[balance.symbol] = balance.formattedBalance;
    acc[`${balance.symbol}_borrowed`] = '0.00'; // mock borrowed balance
    return acc;
  }, {} as Record<string, string>);

  // Load borrowing power data when modal opens or account changes
  useEffect(() => {
    const loadBorrowingData = async () => {
      if (!account || !isOpen) return;

      setIsLoadingBorrowData(true);
      try {
        const borrowingPower = await calculateBorrowingPower(account);
        setBorrowingPowerData(borrowingPower);
      } catch (error) {
        console.error('Error loading borrowing data:', error);
      } finally {
        setIsLoadingBorrowData(false);
      }
    };
    loadBorrowingData();
  }, [account, isOpen, calculateBorrowingPower]);

  // Load max borrow data when asset is selected
  useEffect(() => {
    const loadMaxBorrowData = async () => {
      if (!selectedAsset || !account) return;

      try {
        const maxBorrow = await calculateMaxBorrowAmount(
          selectedAsset.id,
          account
        );
        setMaxBorrowData(maxBorrow);
      } catch (error) {
        console.error('Error loading max borrow data:', error);
      }
    };
    loadMaxBorrowData();
  }, [selectedAsset, account, calculateMaxBorrowAmount]);

  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
    setAmount('');
    setSelectedQuickAmount(null);
  };

  const handleQuickAmount = (percentage: number) => {
    if (selectedAsset && maxBorrowData) {
      const maxAmount = parseFloat(maxBorrowData.maxBorrowAmount || '0');
      const quickAmount = ((maxAmount * percentage) / 100).toString();
      setAmount(quickAmount);
      setSelectedQuickAmount(percentage);
    }
  };

  const handleMaxAmount = () => {
    if (selectedAsset && maxBorrowData) {
      setAmount(maxBorrowData.maxBorrowAmount || '0');
      setSelectedQuickAmount(100);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          selectedAsset !== null &&
          borrowingPowerData &&
          parseFloat(borrowingPowerData.borrowingPowerRemaining) > 0
        );
      case 2:
        return (
          amount &&
          parseFloat(amount) > 0 &&
          maxBorrowData &&
          parseFloat(amount) <= parseFloat(maxBorrowData.maxBorrowAmount)
        );
      case 3:
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
    if (!selectedAsset || !amount || !account) return;
    setIsTransacting(true);

    try {
      console.log(
        `Starting borrow transaction for ${amount} ${selectedAsset.symbol}`
      );
      const result = await borrow(selectedAsset.id, amount);
      setTransactionResult(result);

      if (result.status === 'confirmed') {
        console.log(
          `Borrow successful: ${amount} ${selectedAsset.symbol} borrowed`
        );
        setCurrentStep(4);
      } else {
        throw new Error(result.error || 'Borrow transaction failed');
      }
    } catch (error) {
      console.error('Borrow process failed:', error);
      setTransactionResult({
        hash: '',
        status: 'failed',
        error:
          error instanceof Error
            ? error.message
            : 'Transaction failed. Please try again.',
      });
    } finally {
      setIsTransacting(false);
    }
  };

  const renderStepContent = () => {
    if (isLoadingBorrowData) {
      return <LoadingMessage>Loading borrowing power data...</LoadingMessage>;
    }
    switch (currentStep) {
      case 1:
        return (
          <BorrowAssetSelection
            markets={markets}
            selectedAsset={selectedAsset}
            userBalances={userBalances}
            borrowingPower={borrowingPowerData?.borrowingPowerRemaining || '0'}
            onAssetSelect={handleAssetSelect}
            isLoading={balancesLoading}
          />
        );
      case 2:
        return selectedAsset && maxBorrowData ? (
          <BorrowAmountInput
            selectedAsset={selectedAsset}
            amount={amount}
            selectedQuickAmount={selectedQuickAmount}
            borrowingPower={borrowingPowerData?.borrowingPowerRemaining || '0'}
            maxBorrowAmount={maxBorrowData.maxBorrowAmount || '0'}
            currentDebt={maxBorrowData.currentDebt || '0'}
            availableLiquidity={maxBorrowData.availableLiquidity}
            isLiquidityLimited={maxBorrowData.isLiquidityLimited}
            maxFromCollateral={maxBorrowData.maxFromCollateral}
            onAmountChange={(value) => {
              setAmount(value);
              setSelectedQuickAmount(null);
            }}
            onQuickAmountSelect={handleQuickAmount}
            onMaxClick={handleMaxAmount}
          />
        ) : null;
      case 3:
        return selectedAsset && maxBorrowData ? (
          <BorrowTransactionPreview
            selectedAsset={selectedAsset}
            amount={amount}
            currentDebt={maxBorrowData.currentDebt || '0'}
            borrowingPower={borrowingPowerData?.totalCollateralValue || '0'}
            isLoading={isTransacting}
          />
        ) : null;
      case 4:
        return selectedAsset ? (
          <BorrowSuccess
            transactionHash={transactionResult?.hash}
            amount={amount}
            asset={selectedAsset.symbol}
            borrowAPR={selectedAsset.borrowAPR}
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
      setTransactionResult(null);
      setBorrowingPowerData(null);
      setMaxBorrowData(null);
    }
  }, [isOpen]);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Borrow Assets">
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
          {transactionResult?.status === 'failed' &&
            transactionResult.error && (
              <ErrorMessage>{transactionResult.error}</ErrorMessage>
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
                'Processing Borrow...'
              ) : (
                <>
                  {currentStep === 3 ? 'Confirm Borrow' : 'Next'}
                  {currentStep < 3 && (
                    <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                  )}
                </>
              )}
            </NavButton>
          </NavigationContainer>
        )}
      </Container>
    </BaseModal>
  );
};

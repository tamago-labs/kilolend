'use client';
 
import { useState, useEffect } from 'react';
import { BaseModal } from '../BaseModal';
import { ChevronRight } from 'react-feather';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract, TransactionResult } from '@/hooks/useMarketContract';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useMarketTokenBalances } from '@/hooks/useMarketTokenBalances';
import { useUserPositions } from '@/hooks/useUserPositions';
import { useBorrowingPower } from '@/hooks/useBorrowingPower';
import {
  BorrowAssetSelection,
  BorrowAmountInput,
  BorrowTransactionPreview,
  BorrowSuccess,
} from '../Steps';
import { 
  Container,
  StepProgress,
  StepDot,
  StepContent,
  NavigationContainer,
  NavButton,
  ErrorMessage,
  LoadingMessage
} from "./styled"

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
  const { balances: tokenBalances, isLoading: balancesLoading, refreshBalances } = useMarketTokenBalances(); 
  const { positions: userPositions, getFormattedBalances, refreshPositions } = useUserPositions();
  const { calculateBorrowingPower, calculateMaxBorrowAmount } = useBorrowingPower();

  const totalSteps = 4;

  // Get formatted balances including both supply and borrow
  const formattedBalances = getFormattedBalances();
  
  // Convert to the format expected by components (including underlying token balances and borrow balances)
  const userBalances = Object.keys(tokenBalances).reduce((acc, marketId) => {
    const balance = tokenBalances[marketId];
    const symbol = balance.symbol;
    
    // Add underlying token balance
    acc[symbol] = balance.formattedBalance;
    
    // Add borrow balance
    if (formattedBalances[symbol]) {
      acc[`${symbol}_borrowed`] = formattedBalances[symbol].borrow;
      acc[`${symbol}_supplied`] = formattedBalances[symbol].supply;
    }
    
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
  }, [account, isOpen]);

  // Load max borrow data when asset is selected
  useEffect(() => {
    const loadMaxBorrowData = async () => {
      if (!selectedAsset || !account) return;

      try {
        console.log('Loading max borrow data for:', selectedAsset.id);
        const maxBorrow = await calculateMaxBorrowAmount(
          selectedAsset.id,
          account
        );
        console.log('Max borrow data loaded:', maxBorrow);
        setMaxBorrowData(maxBorrow);
      } catch (error) {
        console.error('Error loading max borrow data:', error);
      }
    };
    loadMaxBorrowData();
  }, [selectedAsset, account]);

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

        setTimeout(() => {
          refreshBalances(); // Refresh token balances
          refreshPositions(); // Refresh user positions (including borrow balances)
        }, 2000); // Wait 2 seconds for blockchain to update

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
            enteredMarkets={borrowingPowerData?.enteredMarkets || []}
            enteredMarketIds={borrowingPowerData?.enteredMarketIds || []}
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
            isUserInMarket={maxBorrowData.isUserInMarket}
            onAmountChange={(value) => {
              setAmount(value);
              setSelectedQuickAmount(null);
            }}
            onQuickAmountSelect={handleQuickAmount}
            onMaxClick={handleMaxAmount}
          />
        ) : null;
      case 3:
        return selectedAsset && maxBorrowData && borrowingPowerData ? (
          <BorrowTransactionPreview
            selectedAsset={selectedAsset}
            amount={amount}
            currentDebt={maxBorrowData.currentDebt || '0'}
            borrowingPowerData={borrowingPowerData}
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
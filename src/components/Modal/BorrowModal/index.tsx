'use client';
 
import { useState, useEffect } from 'react';
import { BaseModal } from '../BaseModal';
import { ChevronRight } from 'react-feather';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract, TransactionResult } from '@/hooks/v1/useMarketContract';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useMarketTokenBalances } from '@/hooks/v1/useMarketTokenBalances';
import { useUserPositions } from '@/hooks/v1/useUserPositions';
import { useBorrowingPower } from '@/hooks/v1/useBorrowingPower';
import { useEventTracking } from '@/hooks/useEventTracking';
import {
  BorrowAssetSelection,
  BorrowAmountInput,
  BorrowTransactionPreview,
  BorrowTransactionConfirmation,
  BorrowSuccess,
} from '../Steps';
import { truncateToSafeDecimals, validateAmountAgainstBalance, getSafeMaxAmount } from "@/utils/tokenUtils"
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
  const [validationError, setValidationError] = useState<string | null>(null);

  const { markets } = useContractMarketStore();
  const { account } = useWalletAccountStore();
  const { borrow } = useMarketContract();
  const { balances: tokenBalances, isLoading: balancesLoading, refreshBalances } = useMarketTokenBalances(); 
  const { positions: userPositions, getFormattedBalances, refreshPositions } = useUserPositions();
  const { calculateBorrowingPower, calculateMaxBorrowAmount } = useBorrowingPower();
  const { 
    isTracking, 
    trackedEvent, 
    error: trackingError, 
    hasTimedOut, 
    startTracking, 
    stopTracking, 
    reset: resetTracking 
  } = useEventTracking(account);

  const totalSteps = 5;

  // Get formatted balances including both supply and borrow
  const formattedBalances = getFormattedBalances();
  
  // Convert to the format expected by components 
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
      const decimals = selectedAsset.decimals || 18;
      
      // Use safe decimal truncation to prevent precision errors
      const safeAmount = truncateToSafeDecimals(quickAmount, decimals);
      
      setAmount(safeAmount);
      setSelectedQuickAmount(percentage);
      setValidationError(null);
    }
  };

  const handleMaxAmount = () => {
    if (selectedAsset && maxBorrowData) {
      const maxAmount = maxBorrowData.maxBorrowAmount || '0';
      const decimals = selectedAsset.decimals || 18;
      
      // Use safe maximum amount calculation
      const safeAmount = getSafeMaxAmount(maxAmount, selectedAsset.id);
      
      setAmount(safeAmount);
      setSelectedQuickAmount(100);
      setValidationError(null);
    }
  };

  // Validate amount against max borrow amount
  useEffect(() => {
    if (selectedAsset && amount && parseFloat(amount) > 0 && maxBorrowData) {
      const maxAmount = maxBorrowData.maxBorrowAmount || '0';
      const validation = validateAmountAgainstBalance(amount, maxAmount, selectedAsset.id);
      
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid amount');
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  }, [amount, selectedAsset, maxBorrowData]);

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
          parseFloat(amount) <= parseFloat(maxBorrowData.maxBorrowAmount) &&
          !validationError
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

      // LINE SDK doesn't return transaction hash, so we start event tracking
      console.log(`Borrow transaction sent, starting event tracking for ${selectedAsset.id}`);
      
      // Start tracking for the borrow event and move to confirmation step
      startTracking(selectedAsset.id, 'borrow');
      setCurrentStep(4); // Move to confirmation step
      
      // Don't set transaction result yet - wait for event tracking
      return; // Exit early, event tracking will handle the rest

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
          <BorrowTransactionConfirmation
            asset={selectedAsset.symbol}
            amount={amount}
          />
        ) : null;
      case 5:
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

  // Handle event tracking results
  useEffect(() => {
    if (trackedEvent && trackedEvent.type === 'borrow') {
      console.log('Borrow transaction confirmed via event tracking:', trackedEvent);
      
      // Create transaction result from tracked event
      const result: TransactionResult = {
        hash: trackedEvent.transactionHash,
        status: 'confirmed'
      };

      setTransactionResult(result);
      setIsTransacting(false);
      setCurrentStep(5); // Move to success step

      // Refresh data after successful transaction
      setTimeout(() => {
        refreshBalances();
        refreshPositions();
      }, 2000);
    }
  }, [trackedEvent]);

  // Handle tracking errors
  useEffect(() => {
    if (trackingError) {
      console.error('Event tracking error:', trackingError);
      setTransactionResult({
        hash: '',
        status: 'failed',
        error: trackingError
      });
      setIsTransacting(false);
    }
  }, [trackingError]);

  // Handle timeout
  useEffect(() => {
    if (hasTimedOut) {
      console.log('Transaction tracking timed out');
      setTransactionResult({
        hash: '',
        status: 'failed',
        error: 'Transaction tracking timed out. Please check your wallet and try again.'
      });
      setIsTransacting(false);
    }
  }, [hasTimedOut]);

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
      setValidationError(null);
      resetTracking(); // Reset event tracking
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
          {validationError && (
            <ErrorMessage>{validationError}</ErrorMessage>
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
                'Transaction is being confirmed...'
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

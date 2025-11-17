'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '../BaseModal';
import { ChevronRight } from 'react-feather';
import { useMarketTokenBalances } from '@/hooks/v1/useMarketTokenBalances';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract, TransactionResult } from '@/hooks/v1/useMarketContract';
import { useComptrollerContract } from '@/hooks/v1/useComptrollerContract';
import { useUserPositions } from '@/hooks/v1/useUserPositions'; 
import { useTokenApproval } from '@/hooks/v1/useTokenApproval';
import { useEventTracking } from '@/hooks/useEventTracking';
import {
  SupplyAssetSelection,
  SupplyAmountInput,
  SupplyTransactionPreview,
  SupplyTransactionConfirmation,
  SupplySuccess
} from '../Steps';
import {
  Container,
  StepProgress,
  StepDot,
  StepContent,
  NavigationContainer,
  NavButton,
  ErrorMessage,
  ApprovalMessage, 
} from "./styled"

import { truncateToSafeDecimals, validateAmountAgainstBalance, isAmountExceedingBalance, getSafeMaxAmount } from "@/utils/tokenUtils"

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
  const [isEnteringMarket, setIsEnteringMarket] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [enableAsCollateral, setEnableAsCollateral] = useState(true);
  const [isMarketAlreadyEntered, setIsMarketAlreadyEntered] = useState(false);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const [exchangeRate, setExchangeRate] = useState<string | undefined>(undefined);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { markets } = useContractMarketStore();
  const { account } = useWalletAccountStore();
  const { supply, getMarketInfo } = useMarketContract();
  const { enterMarkets, isMarketEntered } = useComptrollerContract();
  const { balances: tokenBalances, isLoading: balancesLoading, refreshBalances } = useMarketTokenBalances();
  const { refreshPositions } = useUserPositions();
  const { checkAllowance, ensureApproval } = useTokenApproval();
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

  // Convert token balances to the format expected by components
  const userBalances = Object.keys(tokenBalances).reduce((acc, marketId) => {
    const balance = tokenBalances[marketId];
    acc[balance.symbol] = balance.formattedBalance;
    return acc;
  }, {} as Record<string, string>);

  // Get full precision balance for validation
  const getFullPrecisionBalance = (symbol: string): string => {
    const balance = Object.values(tokenBalances).find(b => b.symbol === symbol);
    return balance?.fullPrecisionBalance || '0';
  };

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
  }, [selectedAsset, amount]);

  // Check if market is already entered and fetch exchange rate when asset is selected
  useEffect(() => {
    const checkMarketStatus = async () => {
      if (selectedAsset && account) {
        try {
          const marketAddress = selectedAsset.marketAddress;
          if (marketAddress) {
            const isEntered = await isMarketEntered(account, marketAddress);

            console.log("isEntered:", isEntered)

            setIsMarketAlreadyEntered(isEntered);

            // If market is already entered, don't need to enable collateral
            if (isEntered) {
              setEnableAsCollateral(false);
            } else {
              setEnableAsCollateral(true);
            }
          }
        } catch (error) {
          console.error('Error checking market status:', error);
          setIsMarketAlreadyEntered(false);
        }
      }
    };

    const fetchExchangeRate = async () => {
      if (selectedAsset) {
        try {
          const marketInfo = await getMarketInfo(selectedAsset.id);
          if (marketInfo) {
            setExchangeRate(marketInfo.exchangeRate);
          }
        } catch (error) {
          console.error('Error fetching exchange rate:', error);
          setExchangeRate(undefined);
        }
      }
    };

    checkMarketStatus();
    fetchExchangeRate();
  }, [selectedAsset, account]);

  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
    setAmount('');
    setSelectedQuickAmount(null);
    setNeedsApproval(false);
  };

  const handleQuickAmount = (percentage: number) => {
    if (selectedAsset) {
      const fullBalance = getFullPrecisionBalance(selectedAsset.symbol);
      const quickAmount = (parseFloat(fullBalance) * percentage / 100);
      const decimals = selectedAsset.decimals || 18;

      // Use safe decimal truncation to prevent precision errors
      const safeAmount = truncateToSafeDecimals(quickAmount.toString(), decimals);

      setAmount(safeAmount);
      setSelectedQuickAmount(percentage);
      setValidationError(null);
    }
  };

  const handleMaxAmount = () => {
    if (selectedAsset) {
      const fullBalance = getFullPrecisionBalance(selectedAsset.symbol);
      const decimals = selectedAsset.decimals || 18;

      // Use safe maximum amount calculation
      const safeBalance = getSafeMaxAmount(fullBalance, selectedAsset.id);

      setAmount(safeBalance);
      setSelectedQuickAmount(100);
      setValidationError(null);
    }
  };

  // Validate amount against balance
  useEffect(() => {
    if (selectedAsset && amount && parseFloat(amount) > 0) {
      const fullBalance = getFullPrecisionBalance(selectedAsset.symbol);
      const validation = validateAmountAgainstBalance(amount, fullBalance, selectedAsset.id);

      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid amount');
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  }, [amount, selectedAsset]);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedAsset !== null;
      case 2: return amount && parseFloat(amount) > 0 && !validationError;
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
 
      // Step 2: Enter market if user enabled collateral and market not already entered
      if (enableAsCollateral && !isMarketAlreadyEntered && selectedAsset.marketAddress) {

        setIsEnteringMarket(true);
        console.log(`Entering market for ${selectedAsset.symbol} to enable as collateral`);

        const enterResult = await enterMarkets([selectedAsset.marketAddress]);

        if (enterResult.status === 'confirmed') {
          console.log(`Market entry successful for ${selectedAsset.symbol}`);
        } else {
          console.warn(`Market entry failed for ${selectedAsset.symbol}:`, enterResult.error);
          // Don't fail the entire transaction for market entry failure
        }

        setIsEnteringMarket(false);
      }

      // Step 3: Execute supply transaction
      console.log(`Starting supply transaction for ${amount} ${selectedAsset.symbol}`);
      const supplyResult = await supply(selectedAsset.id, amount);

      // LINE SDK doesn't return transaction hash, so we start event tracking
      console.log(`Supply transaction sent, starting event tracking for ${selectedAsset.id}`);
      
      // Start tracking for the mint event and move to confirmation step
      startTracking(selectedAsset.id, 'mint');
      setCurrentStep(4); // Move to confirmation step
      
      // Don't set transaction result yet - wait for event tracking
      return; // Exit early, event tracking will handle the rest

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
      setIsEnteringMarket(false);
    }
  };

  const getTransactionStatusText = () => {
    if (isApproving) return 'Approving Token...';
    if (isEnteringMarket) return 'Enabling as Collateral...';
    if (isTransacting && isTracking) return 'Transaction is being confirmed...';
    if (isTransacting) return 'Confirming Supply...';
    return '';
  };

  const getConfirmButtonText = () => {
    if (isTransacting) return getTransactionStatusText();

    if (needsApproval && enableAsCollateral && !isMarketAlreadyEntered) {
      return 'Approve, Supply & Enable Collateral';
    } else if (needsApproval) {
      return 'Approve & Supply';
    } else if (enableAsCollateral && !isMarketAlreadyEntered) {
      return 'Supply & Enable Collateral';
    } else {
      return 'Confirm Supply';
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
            enableAsCollateral={enableAsCollateral}
            isMarketAlreadyEntered={isMarketAlreadyEntered}
            onCollateralToggle={setEnableAsCollateral}
            exchangeRate={exchangeRate}
          />
        ) : null;

      case 4:
        return selectedAsset ? (
          <SupplyTransactionConfirmation
            asset={selectedAsset.symbol}
            amount={amount}
          />
        ) : null;

      case 5:
        return selectedAsset ? (
          <SupplySuccess
            transactionHash={transactionResult?.hash}
            amount={amount}
            asset={selectedAsset.symbol}
            expectedAPY={selectedAsset.supplyAPY}
            collateralEnabled={enableAsCollateral && !isMarketAlreadyEntered}
          />
        ) : null;

      default:
        return null;
    }
  };

  // Handle event tracking results
  useEffect(() => {
    if (trackedEvent && trackedEvent.type === 'mint') {
      console.log('Supply transaction confirmed via event tracking:', trackedEvent);
      
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
      // setSelectedAsset(null);
      setAmount('');
      setSelectedQuickAmount(null);
      setIsTransacting(false);
      setIsApproving(false);
      setIsEnteringMarket(false);
      setNeedsApproval(false);
      setEnableAsCollateral(true);
      setIsMarketAlreadyEntered(false);
      setTransactionResult(null);
      setValidationError(null);
      resetTracking(); // Reset event tracking
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

          {validationError && (
            <ErrorMessage>
              {validationError}
            </ErrorMessage>
          )}

          {needsApproval && currentStep === 3 && (
            <ApprovalMessage>
              You need to approve {selectedAsset?.symbol} spending before supplying. This will require a separate transaction.
            </ApprovalMessage>
          )}

          {enableAsCollateral && !isMarketAlreadyEntered && currentStep === 3 && (
            <ApprovalMessage>
              This asset will be enabled as collateral, allowing you to borrow against it. You can disable this later if needed.
            </ApprovalMessage>
          )}

          { currentStep === 1 && (
            <ApprovalMessage>
            If you have positions on KiloLend hackathon version, please visit our Migrate Page to help transfer your assets to v1
          </ApprovalMessage>
          ) }
 
          <br />

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
              {currentStep === 3 ? (
                getConfirmButtonText()
              ) : (
                <>
                  Next
                  <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                </>
              )}
            </NavButton>
          </NavigationContainer>
        )}
      </Container>
    </BaseModal>
  );
};

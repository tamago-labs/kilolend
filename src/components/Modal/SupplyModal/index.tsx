'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '../BaseModal';
import { ChevronRight } from 'react-feather';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract, MarketInfo, TransactionResult } from '@/hooks/useMarketContract';
import { useComptrollerContract } from '@/hooks/useComptrollerContract';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useMarketTokenBalances } from '@/hooks/useMarketTokenBalances';
import { useUserPositions } from '@/hooks/useUserPositions';
import { useMarketDataWithPrices } from '@/hooks/useMarketDataWithPrices';
import { useTokenApproval } from '@/hooks/useTokenApproval';
import {
  SupplyAssetSelection,
  SupplyAmountInput,
  SupplyTransactionPreview,
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
  ApprovalMessage
} from "./styled"
import { truncateToSafeDecimals } from "@/utils/tokenUtils"

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

  const { markets } = useContractMarketStore();
  const { account } = useWalletAccountStore();
  const { supply } = useMarketContract();
  const { enterMarkets, isMarketEntered } = useComptrollerContract();
  const { balances: tokenBalances, isLoading: balancesLoading, refreshBalances } = useMarketTokenBalances();
  const { refreshPositions } = useUserPositions();
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
  }, [selectedAsset, amount]);

  // Check if market is already entered when asset is selected
  useEffect(() => {
    const checkMarketStatus = async () => {
      if (selectedAsset && account) {
        try {
          const marketAddress = selectedAsset.marketAddress;
          if (marketAddress) {
            const isEntered = await isMarketEntered(account, marketAddress);
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

    checkMarketStatus();
  }, [selectedAsset, account]);

  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
    setAmount('');
    setSelectedQuickAmount(null);
    setNeedsApproval(false);
  };

  const handleQuickAmount = (percentage: number) => {
    if (selectedAsset) {
      const balance = parseFloat(userBalances[selectedAsset.symbol] || '0');
      const quickAmount = (balance * percentage / 100);
      const decimals = selectedAsset.decimals || 18;
      
      // Use safe decimal truncation to prevent precision errors
      const safeAmount = truncateToSafeDecimals(quickAmount.toString(), decimals);
      
      setAmount(safeAmount);
      setSelectedQuickAmount(percentage);
    }
  };

  const handleMaxAmount = () => {
    if (selectedAsset) {
      const balance = userBalances[selectedAsset.symbol] || '0';
      const decimals = selectedAsset.decimals || 18;
      
      // Use safe decimal truncation to prevent precision errors
      const safeBalance = truncateToSafeDecimals(balance, decimals);

      setAmount(safeBalance);
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
      const supplyResult = await supply(selectedAsset.id, amount);

      if (supplyResult.status !== 'confirmed') {
        throw new Error(supplyResult.error || 'Supply transaction failed');
      }

      console.log(`Supply successful: ${amount} ${selectedAsset.symbol} supplied`);

      // Step 3: Enter market if user enabled collateral and market not already entered
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

      // Step 4: Refresh all data after successful transaction
      setTimeout(() => {
        refreshBalances(); // Refresh token balances
        refreshPositions(); // Refresh user positions
      }, 2000); // Wait 2 seconds for blockchain to update

      setTransactionResult(supplyResult);
      setCurrentStep(4);

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
          />
        ) : null;

      case 4:
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

          {enableAsCollateral && !isMarketAlreadyEntered && currentStep === 3 && (
            <ApprovalMessage>
              This asset will be enabled as collateral, allowing you to borrow against it. You can disable this later if needed.
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
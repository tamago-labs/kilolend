import React, { useState, useCallback } from 'react';
import {
  ModalTitle,
  ChatDescription,
  FormGroup,
  Input,
  Label,
  ModalForm,
  ModalButtons,
  ModalButton,
  BalanceSection,
  BalanceHeader,
  BalanceTitle,
  BalanceRefresh,
  BalanceInfo,
  BalanceAmount,
  BalanceUSD,
  WalletConnectPrompt,
  ConnectText,
  ConnectButton,
  ValidationMessage,
  MaxButton,
  TransactionDetails,
  DetailRow,
  DetailLabel,
  DetailValue,
  NetworkFee
} from '../styles';
import { useTokenContract } from '@/hooks/useTokenContract';
import { useMarketContract } from '@/hooks/useMarketContract';
import { MARKET_CONFIG } from '@/utils/contractConfig';

interface CollateralDepositModalProps {
  collateralType: 'wkaia' | 'stkaia';
  marketId: string;
  account: string | null;
  collateralTokenBalance: any;
  refreshBalances: () => void;
  closeModal: () => void;
  onSuccess: () => void;
}

export const CollateralDepositModal: React.FC<CollateralDepositModalProps> = ({
  collateralType,
  marketId,
  account,
  collateralTokenBalance,
  refreshBalances,
  closeModal,
  onSuccess
}) => {
  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);

  const { approve, getAllowance } = useTokenContract();
  const { depositCollateral } = useMarketContract();

  // Get token and market addresses
  const tokenAddress = collateralType === 'wkaia'
    ? MARKET_CONFIG.wkaia.tokenAddress
    : MARKET_CONFIG.stkaia.tokenAddress;
  const marketAddress = MARKET_CONFIG[marketId as keyof typeof MARKET_CONFIG].marketAddress;

  const checkAllowance = useCallback(async () => {
    if (!account || !amount || parseFloat(amount) <= 0) {
      setNeedsApproval(false);
      return;
    }

    setIsCheckingAllowance(true);
    try {
      const currentAllowance = await getAllowance(tokenAddress, account, marketAddress!);
      const requiredAmount = parseFloat(amount);
      const allowanceAmount = parseFloat(currentAllowance || '0');

      setNeedsApproval(allowanceAmount < requiredAmount);
    } catch (error) {
      console.error('Error checking allowance:', error);
      setNeedsApproval(true); // Assume approval needed on error
    } finally {
      setIsCheckingAllowance(false);
    }
  }, [account, amount, tokenAddress, marketAddress, getAllowance]);

  const validateAmount = (inputAmount: string) => {
    setValidationError('');

    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setValidationError('Amount must be greater than 0');
      return false;
    }

    if (collateralTokenBalance?.balance) {
      const numBalance = parseFloat(collateralTokenBalance.balance);
      const numAmount = parseFloat(inputAmount);

      if (numAmount > numBalance) {
        setValidationError('Insufficient balance');
        return false;
      }
    }

    return true;
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    validateAmount(value);

    // Check allowance after a short delay
    const timeoutId = setTimeout(() => {
      if (value && parseFloat(value) > 0) {
        checkAllowance();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleMaxClick = () => {
    if (collateralTokenBalance?.balance) {
      const balance = parseFloat(collateralTokenBalance.balance);
      const maxAmount = balance * 0.95; // Leave 5% for gas

      const maxAmountStr = maxAmount.toFixed(6);
      setAmount(maxAmountStr);
      validateAmount(maxAmountStr);
      checkAllowance();
    }
  };

  const handleApprove = async () => {
    if (!account || !amount) return;

    setIsProcessing(true);
    try {
      // Approve a bit more than needed to avoid future approvals
      const approvalAmount = (parseFloat(amount) * 1.1).toString();

      const result = await approve(tokenAddress, marketAddress!, approvalAmount, 18);

      if (result.status === 'failed') {
        setValidationError(result.error || 'Approval failed');
        return;
      }

      // Wait a moment then check allowance
      setTimeout(() => {
        checkAllowance();
      }, 2000);

    } catch (error: any) {
      setValidationError(error.message || 'Approval failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeposit = async () => {
    if (!account || !amount || !validateAmount(amount)) return;

    setIsProcessing(true);
    try {
      const result = await depositCollateral(marketId as any, collateralType, amount);

      if (result.status === 'failed') {
        setValidationError(result.error || 'Deposit failed');
        return;
      }

      // Success
      onSuccess();
      closeModal();

    } catch (error: any) {
      setValidationError(error.message || 'Deposit failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <ModalTitle>
        Deposit Collateral
      </ModalTitle>

      <ChatDescription>
        Deposit collateral assets to enable borrowing in this market.
        {/* {collateralType === 'wkaia' ? ' LTV: 60%' : ' LTV: 65% + Staking rewards'} */}
      </ChatDescription>

      {!account && (
        <WalletConnectPrompt>
          <ConnectText>Connect your wallet to continue</ConnectText>
          <ConnectButton onClick={() => alert('Wallet connection handled by app')}>
            Connect Wallet
          </ConnectButton>
        </WalletConnectPrompt>
      )}

      {account && collateralTokenBalance && (
        <BalanceSection>
          <BalanceHeader>
            <BalanceTitle>Available {collateralType.toUpperCase()}</BalanceTitle>
            <BalanceRefresh onClick={refreshBalances}>
              🔄 Refresh
            </BalanceRefresh>
          </BalanceHeader>
          <BalanceInfo>
            <div>
              <BalanceAmount>
                {collateralTokenBalance.isLoading ? 'Loading...' : collateralTokenBalance.formattedBalance} {collateralType.toUpperCase()}
              </BalanceAmount>
              <br />
              <BalanceUSD>
                ≈ ${((parseFloat(collateralTokenBalance.balance || '0')) * (collateralType === 'wkaia' ? 0.11 : 0.12)).toFixed(2)} USD
              </BalanceUSD>
            </div>
          </BalanceInfo>
        </BalanceSection>
      )}

      <ModalForm>
        <FormGroup>
          <Label>
            Amount ({collateralType.toUpperCase()})
            {collateralTokenBalance && (
              <MaxButton onClick={handleMaxClick}>MAX</MaxButton>
            )}
          </Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            min="0"
            step="0.000001"
            disabled={!account}
          />
          {validationError && (
            <ValidationMessage $error>
              {validationError}
            </ValidationMessage>
          )}
          {isCheckingAllowance && (
            <ValidationMessage>
              Checking allowance...
            </ValidationMessage>
          )}
          {needsApproval && !isCheckingAllowance && (
            <ValidationMessage>
              Approval required to deposit {collateralType.toUpperCase()}
            </ValidationMessage>
          )}
        </FormGroup>

        {amount && parseFloat(amount) > 0 && !validationError && (
          <TransactionDetails>
            <DetailRow>
              <DetailLabel>Collateral Type:</DetailLabel>
              <DetailValue>{collateralType.toUpperCase()}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>LTV Ratio:</DetailLabel>
              <DetailValue>{collateralType === 'wkaia' ? '60%' : '65%'}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>USD Value:</DetailLabel>
              <DetailValue>${((parseFloat(amount) || 0) * (collateralType === 'wkaia' ? 0.11 : 0.12)).toFixed(2)}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Borrowing Power Added:</DetailLabel>
              <DetailValue>${((parseFloat(amount) || 0) * (collateralType === 'wkaia' ? 0.11 : 0.12) * 0.6).toFixed(2)}</DetailValue>
            </DetailRow>
          </TransactionDetails>
        )}
      </ModalForm>

      <ModalButtons>
        <ModalButton $variant="secondary" onClick={closeModal}>
          Cancel
        </ModalButton>
        {needsApproval && !isCheckingAllowance ? (
          <ModalButton
            $variant="primary"
            onClick={handleApprove}
            disabled={!account || !amount || parseFloat(amount) <= 0 || !!validationError || isProcessing}
          >
            {isProcessing ? 'Approving...' : `Approve ${collateralType.toUpperCase()}`}
          </ModalButton>
        ) : (
          <ModalButton
            $variant="primary"
            onClick={handleDeposit}
            disabled={!account || !amount || parseFloat(amount) <= 0 || !!validationError || isProcessing || needsApproval}
          >
            {!account ? 'Connect Wallet' :
              isProcessing ? 'Depositing...' :
                'Deposit Collateral'}
          </ModalButton>
        )}
      </ModalButtons>
    </>
  );
};

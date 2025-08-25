import React from 'react';
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
import { MarketInfo } from '../MarketInfo';
import { getInputStep } from '@/utils/tokenUtils';

interface SupplyBorrowModalProps {
  type: 'supply' | 'borrow';
  currentMarket: any;
  data: any;
  account: string | null;
  currentTokenBalance: any;
  refreshBalances: () => void;
  amount: string;
  handleAmountChange: (value: string) => void;
  handleMaxClick: () => void;
  validationError: string;
  currentRate: number;
  calculateMonthlyReturn: () => number;
  calculateTransactionFee: () => number;
  isProcessing: boolean;
  closeModal: () => void;
  handleQuickActionSubmit: () => void;
}

export const SupplyBorrowModal: React.FC<SupplyBorrowModalProps> = ({
  type,
  currentMarket,
  data,
  account,
  currentTokenBalance,
  refreshBalances,
  amount,
  handleAmountChange,
  handleMaxClick,
  validationError,
  currentRate,
  calculateMonthlyReturn,
  calculateTransactionFee,
  isProcessing,
  closeModal,
  handleQuickActionSubmit
}) => {
  if (!currentMarket || !data) return null;

  return (
    <>
      <ModalTitle>
        {type === 'supply' ? 'Supply' : 'Borrow'} {currentMarket.symbol}
      </ModalTitle>

      <MarketInfo marketId={data.marketId!} actionType={data.action!} />

      {!account && (
        <WalletConnectPrompt>
          <ConnectText>Connect your wallet to continue</ConnectText>
          <ConnectButton onClick={() => alert('Wallet connection handled by app')}>
            Connect Wallet
          </ConnectButton>
        </WalletConnectPrompt>
      )}

      {account && currentTokenBalance && (
        <BalanceSection>
          <BalanceHeader>
            <BalanceTitle>Available Balance</BalanceTitle>
            {/* <BalanceRefresh onClick={refreshBalances}>
              🔄 Refresh
            </BalanceRefresh> */}
          </BalanceHeader>
          <BalanceInfo>
            <div>
              <BalanceAmount>
                {currentTokenBalance.isLoading ? 'Loading...' : currentTokenBalance.formattedBalance} {currentMarket.symbol}
              </BalanceAmount>
              <br />
              <BalanceUSD>
                ≈ ${((parseFloat(currentTokenBalance.balance || '0')) * currentMarket.price).toFixed(2)} USD
              </BalanceUSD>
            </div>
          </BalanceInfo>
        </BalanceSection>
      )}

      <ModalForm>
        <FormGroup>
          <Label>
            Amount ({currentMarket.symbol})
            {type === 'supply' && currentTokenBalance && (
              <MaxButton onClick={handleMaxClick}>MAX</MaxButton>
            )}
          </Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            min="0"
            step={currentMarket ? getInputStep(currentMarket.id as any) : "0.000001"}
            disabled={!account}
          />
          {validationError && (
            <ValidationMessage $error>
              {validationError}
            </ValidationMessage>
          )}
        </FormGroup>

        {amount && parseFloat(amount) > 0 && !validationError && (
          <TransactionDetails>
            <DetailRow>
              <DetailLabel>{type === 'supply' ? 'APY' : 'APR'}:</DetailLabel>
              <DetailValue>{currentRate.toFixed(2)}%</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Est. Monthly {type === 'supply' ? 'Earnings' : 'Cost'}:</DetailLabel>
              <DetailValue>${calculateMonthlyReturn().toFixed(4)}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>USD Value:</DetailLabel>
              <DetailValue>${((parseFloat(amount) || 0) * currentMarket.price).toFixed(2)}</DetailValue>
            </DetailRow>
             
          </TransactionDetails>
        )}
      </ModalForm>

      <ModalButtons>
        <ModalButton $variant="secondary" onClick={closeModal}>
          Cancel
        </ModalButton>
        <ModalButton
          $variant="primary"
          onClick={handleQuickActionSubmit}
          disabled={!account || !amount || parseFloat(amount) <= 0 || !!validationError || currentTokenBalance?.isLoading || isProcessing}
        >
          {!account ? 'Connect Wallet' : 
           currentTokenBalance?.isLoading ? 'Loading...' :
           isProcessing ? 'Processing...' :
           type === 'supply' ? 'Supply' : 'Borrow'}
        </ModalButton>
      </ModalButtons>
    </>
  );
};

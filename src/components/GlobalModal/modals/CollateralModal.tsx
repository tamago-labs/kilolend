import React from 'react';
import styled from 'styled-components';
import {
  ModalTitle,
  ChatDescription,
  FormGroup,
  Label,
  Input,
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

const CollateralGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const CollateralOption = styled.button<{ $selected?: boolean }>`
  padding: 16px;
  border-radius: 12px;
  border: 2px solid ${props => props.$selected ? '#00C300' : '#e2e8f0'};
  background: ${props => props.$selected ? '#f0fdf4' : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    border-color: #00C300;
    background: #f0fdf4;
  }
`;

const CollateralName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const CollateralAPY = styled.div`
  font-size: 12px;
  color: #00C300;
  font-weight: 600;
`;

interface CollateralModalProps {
  type: 'deposit-collateral' | 'withdraw-collateral';
  account: string | null;
  selectedCollateralType: 'wkaia' | 'stkaia';
  setSelectedCollateralType: (type: 'wkaia' | 'stkaia') => void;
  collateralTokenBalance: any;
  refreshBalances: () => void;
  amount: string;
  handleAmountChange: (value: string) => void;
  handleMaxClick: () => void;
  validationError: string;
  calculateTransactionFee: () => number;
  isProcessing: boolean;
  closeModal: () => void;
  handleCollateralSubmit: () => void;
}

export const CollateralModal: React.FC<CollateralModalProps> = ({
  type,
  account,
  selectedCollateralType,
  setSelectedCollateralType,
  collateralTokenBalance,
  refreshBalances,
  amount,
  handleAmountChange,
  handleMaxClick,
  validationError,
  calculateTransactionFee,
  isProcessing,
  closeModal,
  handleCollateralSubmit
}) => {
  const isDeposit = type === 'deposit-collateral';

  return (
    <>
      <ModalTitle>
        {isDeposit ? '🏦 Deposit' : '💸 Withdraw'} Collateral
      </ModalTitle>

      <ChatDescription>
        {isDeposit 
          ? 'Deposit collateral to enable borrowing. Higher collateral = more borrowing power.'
          : 'Withdraw collateral. Ensure your health factor stays above 1.5.'
        }
      </ChatDescription>

      <FormGroup>
        <Label>Select Collateral Type</Label>
        <CollateralGrid>
          <CollateralOption 
            $selected={selectedCollateralType === 'wkaia'}
            onClick={() => setSelectedCollateralType('wkaia')}
          >
            <CollateralName>wKAIA</CollateralName>
            <CollateralAPY>60% LTV</CollateralAPY>
          </CollateralOption>
          <CollateralOption 
            $selected={selectedCollateralType === 'stkaia'}
            onClick={() => setSelectedCollateralType('stkaia')}
          >
            <CollateralName>stKAIA</CollateralName>
            <CollateralAPY>65% LTV + Staking</CollateralAPY>
          </CollateralOption>
        </CollateralGrid>
      </FormGroup>

      {!account && (
        <WalletConnectPrompt>
          <ConnectText>Connect your wallet to continue</ConnectText>
          <ConnectButton onClick={() => alert('Use connect button on the top')}>
            Connect Wallet
          </ConnectButton>
        </WalletConnectPrompt>
      )}

      {account && collateralTokenBalance && (
        <BalanceSection>
          <BalanceHeader>
            <BalanceTitle>Available {selectedCollateralType.toUpperCase()}</BalanceTitle>
            <BalanceRefresh onClick={refreshBalances}>
              🔄 Refresh
            </BalanceRefresh>
          </BalanceHeader>
          <BalanceInfo>
            <div>
              <BalanceAmount>
                {collateralTokenBalance.isLoading ? 'Loading...' : collateralTokenBalance.formattedBalance} {selectedCollateralType.toUpperCase()}
              </BalanceAmount>
              <br />
              <BalanceUSD>
                ≈ ${((parseFloat(collateralTokenBalance.balance || '0')) * (selectedCollateralType === 'wkaia' ? 0.11 : 0.12)).toFixed(2)} USD
              </BalanceUSD>
            </div>
          </BalanceInfo>
        </BalanceSection>
      )}

      <ModalForm>
        <FormGroup>
          <Label>
            Amount ({selectedCollateralType.toUpperCase()})
            {isDeposit && collateralTokenBalance && (
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
        </FormGroup>

        {amount && parseFloat(amount) > 0 && !validationError && (
          <TransactionDetails>
            <DetailRow>
              <DetailLabel>Collateral Type:</DetailLabel>
              <DetailValue>{selectedCollateralType.toUpperCase()}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>LTV Ratio:</DetailLabel>
              <DetailValue>{selectedCollateralType === 'wkaia' ? '60%' : '65%'}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>USD Value:</DetailLabel>
              <DetailValue>${((parseFloat(amount) || 0) * (selectedCollateralType === 'wkaia' ? 0.11 : 0.12)).toFixed(2)}</DetailValue>
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
          onClick={handleCollateralSubmit}
          disabled={!account || !amount || parseFloat(amount) <= 0 || !!validationError || collateralTokenBalance?.isLoading || isProcessing}
        >
          {!account ? 'Connect Wallet' : 
           collateralTokenBalance?.isLoading ? 'Loading...' :
           isProcessing ? 'Processing...' :
           isDeposit ? 'Deposit Collateral' : 'Withdraw Collateral'}
        </ModalButton>
      </ModalButtons>
    </>
  );
};

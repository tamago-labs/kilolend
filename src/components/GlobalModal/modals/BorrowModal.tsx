import React, { useState } from 'react';
import styled from 'styled-components';
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

const TabContainer = styled.div`
  display: flex;
  background: #f8fafc;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$active ? `
    background: white;
    color: #1e293b;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  ` : `
    background: transparent;
    color: #64748b;
    
    &:hover {
      color: #1e293b;
    }
  `}
`;

const CollateralSection = styled.div`
  background: #f0fdf4;
  border: 1px solid #00C300;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const CollateralHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CollateralTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: #00C300;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: #f0fdf4;
  }
`;

const CollateralGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const CollateralCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
`;

const CollateralName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const CollateralAmount = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
`;

const CollateralValue = styled.div`
  font-size: 12px;
  color: #00C300;
  font-weight: 600;
`;

const CollateralActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const CollateralButton = styled.button<{ $variant?: 'deposit' | 'withdraw' }>`
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  
  ${props => props.$variant === 'deposit' ? `
    background: #00C300;
    color: white;
    
    &:hover {
      background: #00A000;
    }
  ` : `
    background: #f3f4f6;
    color: #64748b;
    
    &:hover {
      background: #e2e8f0;
    }
  `}
`;

const BorrowingPowerCard = styled.div`
  background: #eff6ff;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
`;

const BorrowingPowerLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
`;

const BorrowingPowerValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
`;

interface BorrowModalProps {
  currentMarket: any;
  data: any;
  account: string | null;
  currentTokenBalance: any;
  refreshBalances: () => void;
  amount: string;
  handleAmountChange: (value: string) => void;
  validationError: string;
  currentRate: number;
  calculateMonthlyReturn: () => number;
  calculateTransactionFee: () => number;
  isProcessing: boolean;
  closeModal: () => void;
  handleQuickActionSubmit: () => void;
  // Collateral props
  userCollateral: { wkaia: number; stkaia: number; total: number };
  onDepositCollateral: (type: 'wkaia' | 'stkaia') => void;
  onWithdrawCollateral: (type: 'wkaia' | 'stkaia') => void;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  currentMarket,
  data,
  account,
  currentTokenBalance,
  refreshBalances,
  amount,
  handleAmountChange,
  validationError,
  currentRate,
  calculateMonthlyReturn,
  calculateTransactionFee,
  isProcessing,
  closeModal,
  handleQuickActionSubmit,
  userCollateral,
  onDepositCollateral,
  onWithdrawCollateral
}) => {
  const [activeTab, setActiveTab] = useState<'borrow' | 'collateral'>('borrow');

  if (!currentMarket || !data) return null;

  // Calculate available borrowing power
  const maxLTV = 0.6; // Conservative 60% LTV
  const availableToBorrow = userCollateral.total * maxLTV;
  const currentlyBorrowed = 0; // TODO: Get from user positions
  const remainingBorrowPower = Math.max(0, availableToBorrow - currentlyBorrowed);

  // Check if user can borrow the entered amount
  const canBorrowAmount = amount ? parseFloat(amount) * currentMarket.price <= remainingBorrowPower : true;

  const renderBorrowTab = () => (
    <>
      <MarketInfo marketId={data.marketId!} actionType="borrow" />

      {!account && (
        <WalletConnectPrompt>
          <ConnectText>Connect your wallet to continue</ConnectText>
          <ConnectButton onClick={() => alert('Wallet connection handled by app')}>
            Connect Wallet
          </ConnectButton>
        </WalletConnectPrompt>
      )}

      {/* Borrowing Power Display */}
      {account && (
        <BorrowingPowerCard>
          <BorrowingPowerLabel>Available Borrowing Power</BorrowingPowerLabel>
          <BorrowingPowerValue>${remainingBorrowPower.toFixed(2)}</BorrowingPowerValue>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Based on ${userCollateral.total.toFixed(2)} collateral at 60% LTV
          </div>
        </BorrowingPowerCard>
      )}

      <ModalForm>
        <FormGroup>
          <Label>Amount to Borrow ({currentMarket.symbol})</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            min="0"
            step={getInputStep(currentMarket.id as any)}
            disabled={!account}
          />
          {validationError && (
            <ValidationMessage $error>
              {validationError}
            </ValidationMessage>
          )}
          {amount && !canBorrowAmount && (
            <ValidationMessage $error>
              Amount exceeds borrowing power. Add more collateral or reduce amount.
            </ValidationMessage>
          )}
        </FormGroup>

        {amount && parseFloat(amount) > 0 && !validationError && canBorrowAmount && (
          <TransactionDetails>
            <DetailRow>
              <DetailLabel>Borrow APR:</DetailLabel>
              <DetailValue>{currentRate.toFixed(2)}%</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Est. Monthly Cost:</DetailLabel>
              <DetailValue>${calculateMonthlyReturn().toFixed(4)}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>USD Value:</DetailLabel>
              <DetailValue>${((parseFloat(amount) || 0) * currentMarket.price).toFixed(2)}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Remaining Borrow Power:</DetailLabel>
              <DetailValue>${(remainingBorrowPower - (parseFloat(amount) * currentMarket.price)).toFixed(2)}</DetailValue>
            </DetailRow>
             
          </TransactionDetails>
        )}
      </ModalForm>
    </>
  );

  const renderCollateralTab = () => (
    <>
      <ChatDescription>
        Manage your collateral to increase borrowing power. Higher collateral = more borrowing capacity.
      </ChatDescription>

      <CollateralSection>
        <CollateralHeader>
          <CollateralTitle>Your Collateral</CollateralTitle>
          <RefreshButton onClick={refreshBalances}>
            🔄 Refresh
          </RefreshButton>
        </CollateralHeader>
        
        <CollateralGrid>
          <CollateralCard>
            <CollateralName>wKAIA</CollateralName>
            <CollateralAmount>{userCollateral.wkaia.toFixed(4)} wKAIA</CollateralAmount>
            <CollateralValue>${(userCollateral.wkaia * 0.11).toFixed(2)} (60% LTV)</CollateralValue>
            <CollateralActions style={{ marginTop: '8px' }}>
              <CollateralButton $variant="deposit" onClick={() => onDepositCollateral('wkaia')}>
                Deposit
              </CollateralButton>
              <CollateralButton $variant="withdraw" onClick={() => onWithdrawCollateral('wkaia')}>
                Withdraw
              </CollateralButton>
            </CollateralActions>
          </CollateralCard>
          
          <CollateralCard>
            <CollateralName>stKAIA</CollateralName>
            <CollateralAmount>{userCollateral.stkaia.toFixed(4)} stKAIA</CollateralAmount>
            <CollateralValue>${(userCollateral.stkaia * 0.12).toFixed(2)} (65% LTV)</CollateralValue>
            <CollateralActions style={{ marginTop: '8px' }}>
              <CollateralButton $variant="deposit" onClick={() => onDepositCollateral('stkaia')}>
                Deposit
              </CollateralButton>
              <CollateralButton $variant="withdraw" onClick={() => onWithdrawCollateral('stkaia')}>
                Withdraw
              </CollateralButton>
            </CollateralActions>
          </CollateralCard>
        </CollateralGrid>

        <BorrowingPowerCard>
          <BorrowingPowerLabel>Total Borrowing Power</BorrowingPowerLabel>
          <BorrowingPowerValue>${availableToBorrow.toFixed(2)}</BorrowingPowerValue>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Based on ${userCollateral.total.toFixed(2)} total collateral value
          </div>
        </BorrowingPowerCard>
      </CollateralSection>
    </>
  );

  return (
    <>
      <ModalTitle>
        Borrow {currentMarket.symbol}
      </ModalTitle>

      <TabContainer>
        <Tab 
          $active={activeTab === 'borrow'} 
          onClick={() => setActiveTab('borrow')}
        >
          Borrow
        </Tab>
        <Tab 
          $active={activeTab === 'collateral'} 
          onClick={() => setActiveTab('collateral')}
        >
          Manage Collateral
        </Tab>
      </TabContainer>

      {activeTab === 'borrow' ? renderBorrowTab() : renderCollateralTab()}

      <ModalButtons>
        <ModalButton $variant="secondary" onClick={closeModal}>
          Cancel
        </ModalButton>
        {activeTab === 'borrow' ? (
          <ModalButton
            $variant="primary"
            onClick={handleQuickActionSubmit}
            disabled={!account || !amount || parseFloat(amount) <= 0 || !!validationError || !canBorrowAmount || isProcessing}
          >
            {!account ? 'Connect Wallet' : 
             remainingBorrowPower === 0 ? 'Add Collateral First' :
             isProcessing ? 'Processing...' :
             'Borrow'}
          </ModalButton>
        ) : (
          <ModalButton
            $variant="primary"
            onClick={() => setActiveTab('borrow')}
          >
            Back to Borrow
          </ModalButton>
        )}
      </ModalButtons>
    </>
  );
};

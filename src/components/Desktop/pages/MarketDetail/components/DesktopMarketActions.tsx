"use client";

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { MarketData } from '@/contexts/MarketContext';
import { formatUSD, formatPercent, isValidAmount, parseUserAmount } from '@/utils/formatters';

const ActionsContainer = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 16px;
  background: ${({ $active }) => $active ? '#06C755' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#64748b'};
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${({ $active }) => $active ? '#059669' : '#f8fafc'};
  }
`;

const ActionContent = styled.div`
  padding: 32px;
`;

const InputSection = styled.div`
  margin-bottom: 24px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const InputContainer = styled.div`
  position: relative;
`;

const AmountInput = styled.input`
  width: 100%;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  background: white;

  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
`;

const MaxButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #06C755;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #059669;
  }
`;

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 14px;
  color: #64748b;
`;

const APYInfo = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const APYLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

const APYValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #06C755;
`;

const ActionButton = styled.button<{ $primary?: boolean; $disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  background: ${({ $primary, $disabled }) => 
    $disabled ? '#e2e8f0' : $primary ? '#06C755' : 'white'};
  color: ${({ $primary, $disabled }) => 
    $disabled ? '#94a3b8' : $primary ? 'white' : '#06C755'};
  border: 1px solid ${({ $disabled }) => $disabled ? '#e2e8f0' : '#06C755'};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s;

  &:hover {
    background: ${({ $primary, $disabled }) => 
      $disabled ? '#e2e8f0' : $primary ? '#059669' : '#06C755'};
    color: ${({ $disabled }) => $disabled ? '#94a3b8' : 'white'};
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
`;

interface DesktopMarketActionsProps {
  market: MarketData;
  displaySymbol: string;
  activeTab: 'supply' | 'borrow';
  onTabChange: (tab: 'supply' | 'borrow') => void;
  priceData: any;
}

export const DesktopMarketActions = ({
  market,
  displaySymbol,
  activeTab,
  onTabChange,
  priceData,
}: DesktopMarketActionsProps) => {
  const [amount, setAmount] = useState('');
  const [transactionState, setTransactionState] = useState({
    isProcessing: false,
    error: null as string | null,
    success: false
  });

  const resetTransactionState = () => {
    setTransactionState({
      isProcessing: false,
      error: null,
      success: false
    });
  };

  const supply = async (market: MarketData, amount: string) => {
    setTransactionState({ isProcessing: true, error: null, success: false });
    try {
      // Simulate supply transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTransactionState({ isProcessing: false, error: null, success: true });
    } catch (error) {
      setTransactionState({ isProcessing: false, error: 'Supply failed', success: false });
    }
  };

  const borrow = async (market: MarketData, amount: string) => {
    setTransactionState({ isProcessing: true, error: null, success: false });
    try {
      // Simulate borrow transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTransactionState({ isProcessing: false, error: null, success: true });
    } catch (error) {
      setTransactionState({ isProcessing: false, error: 'Borrow failed', success: false });
    }
  };

  useEffect(() => {
    if (transactionState.success) {
      setAmount('');
      alert(`${activeTab === 'supply' ? 'Supply' : 'Borrow'} successful!`);
      resetTransactionState();
    }
  }, [transactionState.success, activeTab]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (transactionState.error) {
      resetTransactionState();
    }
  };

  const handleMax = () => {
    // For demo purposes, set a max amount
    const maxAmount = activeTab === 'supply' ? '10000' : '5000';
    setAmount(maxAmount);
  };

  const handleAction = async () => {
    const validation = { isValid: isValidAmount(amount) };
    if (!validation.isValid) {
      setTransactionState({ isProcessing: false, error: 'Please enter a valid amount', success: false });
      return;
    }

    if (activeTab === 'supply') {
      await supply(market, amount);
    } else {
      await borrow(market, amount);
    }
  };

  return (
    <ActionsContainer>
      <TabContainer>
        <TabButton 
          $active={activeTab === 'supply'}
          onClick={() => onTabChange('supply')}
        >
          Supply
        </TabButton>
        <TabButton 
          $active={activeTab === 'borrow'}
          onClick={() => onTabChange('borrow')}
        >
          Borrow
        </TabButton>
      </TabContainer>

      <ActionContent>
        <InputSection>
          <InputLabel>Amount</InputLabel>
          <InputContainer>
            <AmountInput
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
            />
            <MaxButton onClick={handleMax}>MAX</MaxButton>
          </InputContainer>
          <BalanceInfo>
            <span>Wallet Balance: {formatUSD(10000)}</span>
            <span>{displaySymbol}</span>
          </BalanceInfo>
        </InputSection>

        <APYInfo>
          <APYLabel>
            {activeTab === 'supply' ? 'Supply APY' : 'Borrow APR'}
          </APYLabel>
          <APYValue>
            {formatPercent(activeTab === 'supply' ? market.supplyAPY : market.borrowAPY)}
          </APYValue>
        </APYInfo>

        {transactionState.error && <ErrorMessage>{transactionState.error}</ErrorMessage>}

        <ActionButton 
          $primary 
          $disabled={!amount || transactionState.isProcessing}
          onClick={handleAction}
        >
          {transactionState.isProcessing ? 'Processing...' : `${activeTab === 'supply' ? 'Supply' : 'Borrow'} ${displaySymbol}`}
        </ActionButton>
      </ActionContent>
    </ActionsContainer>
  );
};

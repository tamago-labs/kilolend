"use client";

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { MarketData } from '@/contexts/MarketContext';
import { formatUSD, formatPercent, isValidAmount, parseUserAmount } from '@/utils/formatters';
import { useMarketTokenBalances } from '@/hooks/v1/useMarketTokenBalances';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useBorrowingPower } from '@/hooks/v1/useBorrowingPower';
import { DesktopTransactionModal } from './DesktopTransactionModal';
import { validateAmountAgainstBalance, getSafeMaxAmount } from '@/utils/tokenUtils';

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
  font-size: 14px;
  color: #64748b;
`;

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
`;

const BalanceColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const { account } = useWalletAccountStore();
  const { markets: contractMarkets } = useContractMarketStore();
  const { balances: tokenBalances, isLoading: balancesLoading } = useMarketTokenBalances();
  const { calculateBorrowingPower, calculateMaxBorrowAmount } = useBorrowingPower();
  const [borrowingPowerData, setBorrowingPowerData] = useState<any>(null);
  const [maxBorrowData, setMaxBorrowData] = useState<any>(null);

  // Get the market configuration for the current asset
  const marketConfig = contractMarkets.find(m => m.symbol === displaySymbol);
  const marketId: any = marketConfig?.id;

  // Get user balance for the current asset
  const userBalance = marketId ? tokenBalances[marketId]?.formattedBalance || '0.00' : '0.00';
  const fullPrecisionBalance = marketId ? tokenBalances[marketId]?.fullPrecisionBalance || '0' : '0';

  // Load borrowing power data when account changes
  useEffect(() => {
    const loadBorrowingData = async () => {
      if (!account || !marketId) return;

      try {
        const borrowingPower = await calculateBorrowingPower(account);
        setBorrowingPowerData(borrowingPower);
      } catch (error) {
        console.error('Error loading borrowing data:', error);
      }
    };
    loadBorrowingData();
  }, [account, marketId]);

  // Load max borrow data when asset is selected for borrow tab
  useEffect(() => {
    const loadMaxBorrowData = async () => {
      if (!marketId || !account || activeTab !== 'borrow') return;

      try {
        const maxBorrow = await calculateMaxBorrowAmount(marketId as any, account);
        setMaxBorrowData(maxBorrow);
      } catch (error) {
        console.error('Error loading max borrow data:', error);
      }
    };
    loadMaxBorrowData();
  }, [marketId, account, activeTab]);

  // Validate amount against balance or borrow limit
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) {
      setValidationError(null);
      return;
    }

    if (activeTab === 'supply') {
      // Validate against wallet balance
      const validation = validateAmountAgainstBalance(amount, fullPrecisionBalance, marketId || 'kaia');
      if (!validation.isValid) {
        setValidationError(validation.error || 'Insufficient balance');
      } else {
        setValidationError(null);
      }
    } else if (activeTab === 'borrow' && maxBorrowData) {
      // Validate against max borrow amount
      const maxAmount = maxBorrowData.maxBorrowAmount || '0';
      const validation = validateAmountAgainstBalance(amount, maxAmount, marketId || 'kaia');
      if (!validation.isValid) {
        setValidationError(validation.error || 'Amount exceeds borrow limit');
      } else {
        setValidationError(null);
      }
    }
  }, [amount, activeTab, fullPrecisionBalance, maxBorrowData, marketId]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setValidationError(null);
  };

  const handleMax = () => {
    if (activeTab === 'supply') {
      // Use safe maximum amount calculation for supply
      const safeAmount = getSafeMaxAmount(fullPrecisionBalance, marketId || 'kaia');
      setAmount(safeAmount);
    } else if (activeTab === 'borrow' && maxBorrowData) {
      // Use max borrow amount for borrow
      const maxAmount = maxBorrowData.maxBorrowAmount || '0';
      const safeAmount = getSafeMaxAmount(maxAmount, marketId || 'kaia');
      setAmount(safeAmount);
    }
  };

  const handleAction = () => {
    if (!amount || parseFloat(amount) <= 0 || validationError) {
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Reset amount when switching tabs
  const handleTabChange = (tab: 'supply' | 'borrow') => {
    setAmount('');
    setValidationError(null);
    onTabChange(tab);
  };

  return (
    <ActionsContainer>
      <TabContainer>
        <TabButton 
          $active={activeTab === 'supply'}
          onClick={() => handleTabChange('supply')}
        >
          Supply
        </TabButton>
        <TabButton 
          $active={activeTab === 'borrow'}
          onClick={() => handleTabChange('borrow')}
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
          {activeTab === 'supply' ? (
            <BalanceRow>
              <BalanceColumn>
                <BalanceInfo>
                  <span>Wallet Balance: {userBalance}</span>
                  <span>{displaySymbol}</span>
                </BalanceInfo>
              </BalanceColumn>
              {/* <BalanceColumn>
                <BalanceInfo>
                  <span>Currently Supplied: {market.supplyBalance || '0.00'}</span>
                  <span>{displaySymbol}</span>
                </BalanceInfo>
              </BalanceColumn> */}
            </BalanceRow>
          ) : (
            <BalanceRow>
              <BalanceColumn>
                <BalanceInfo>
                  <span>Available to Borrow: {maxBorrowData?.maxBorrowAmount || '0.00'}</span>
                  <span>{displaySymbol}</span>
                </BalanceInfo>
              </BalanceColumn>
              {/* <BalanceColumn>
                <BalanceInfo>
                  <span>Total Borrowing Power: {formatUSD(parseFloat(borrowingPowerData?.totalBorrowValue || '0'))}</span>
                  <span>USD</span>
                </BalanceInfo>
              </BalanceColumn> */}
            </BalanceRow>
          )}
        </InputSection>

        <APYInfo>
          <APYLabel>
            {activeTab === 'supply' ? 'Supply APY' : 'Borrow APR'}
          </APYLabel>
          <APYValue>
            {formatPercent(activeTab === 'supply' ? market.supplyAPY : market.borrowAPY)}
          </APYValue>
        </APYInfo>

        {validationError && <ErrorMessage>{validationError}</ErrorMessage>}

        <ActionButton 
          $primary 
          $disabled={!amount || !!validationError || !account}
          onClick={handleAction}
        >
          {!account ? 'Wallet Not Connected' : `Preview ${activeTab === 'supply' ? 'Supply' : 'Borrow'}`}
        </ActionButton>
      </ActionContent>

      {isModalOpen && (
        <DesktopTransactionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          type={activeTab}
          amount={amount}
          market={market}
          displaySymbol={displaySymbol}
          borrowingPowerData={borrowingPowerData}
          maxBorrowData={maxBorrowData}
        />
      )}
    </ActionsContainer>
  );
};

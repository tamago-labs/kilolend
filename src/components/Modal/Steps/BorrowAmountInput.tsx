'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { ContractMarket } from '@/stores/contractMarketStore';

const Container = styled.div`
  padding: 20px 0;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const AssetHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
`;

const AssetIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e2e8f0;
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
  margin-right: 12px;
`;

const AssetIconImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const AssetInfo = styled.div`
  flex: 1;
`;

const AssetName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const AssetAPR = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const InputSection = styled.div`
  margin-bottom: 24px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const InputContainer = styled.div`
  position: relative;
`;

const AmountInput = styled.input`
  width: 100%;
  padding: 16px 80px 16px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #06C755;
  }

  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
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
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #059212;
  }
`;

const QuickAmountsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const QuickAmountButton = styled.button<{ $selected: boolean }>`
  flex: 1;
  padding: 12px;
  border: 2px solid ${({ $selected }) => $selected ? '#06C755' : '#e5e7eb'};
  background: ${({ $selected }) => $selected ? '#f0fdf4' : 'white'};
  color: ${({ $selected }) => $selected ? '#059212' : '#64748b'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #06C755;
    background: #f0fdf4;
    color: #059212;
  }
`;

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 16px 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 14px;
`;

const BalanceLabel = styled.span`
  color: #64748b;
`;

const BalanceValue = styled.span`
  font-weight: 600;
  color: #1e293b;
`;

const WarningSection = styled.div<{ $type?: 'warning' | 'info' }>`
  background: ${({ $type }) => $type === 'info' ? '#f0f9ff' : '#fef3c7'};
  border: 1px solid ${({ $type }) => $type === 'info' ? '#0ea5e9' : '#f59e0b'};
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
`;

const WarningText = styled.p<{ $type?: 'warning' | 'info' }>`
  margin: 0;
  font-size: 14px;
  color: ${({ $type }) => $type === 'info' ? '#0369a1' : '#92400e'};
  line-height: 1.4;
`;

const ErrorText = styled.div`
  color: #dc2626;
  font-size: 14px;
  margin-top: 8px;
`;

interface BorrowAmountInputProps {
  selectedAsset: ContractMarket;
  amount: string;
  selectedQuickAmount: number | null;
  borrowingPower: string;
  maxBorrowAmount: string;
  currentDebt: string;
  availableLiquidity?: string;
  isLiquidityLimited?: boolean;
  maxFromCollateral?: string;
  isUserInMarket?: boolean;
  onAmountChange: (amount: string) => void;
  onQuickAmountSelect: (percentage: number) => void;
  onMaxClick: () => void;
}

export const BorrowAmountInput = ({
  selectedAsset,
  amount,
  selectedQuickAmount,
  borrowingPower,
  maxBorrowAmount,
  currentDebt,
  availableLiquidity,
  isLiquidityLimited,
  maxFromCollateral,
  isUserInMarket,
  onAmountChange,
  onQuickAmountSelect,
  onMaxClick
}: BorrowAmountInputProps) => {
  const [inputError, setInputError] = useState('');

  const handleAmountChange = (value: string) => {
    // Basic validation
    const numericValue = parseFloat(value);
    const maxBorrow = parseFloat(maxBorrowAmount);
    
    if (value && (isNaN(numericValue) || numericValue <= 0)) {
      setInputError('Please enter a valid amount');
    } else if (numericValue > maxBorrow) {
      setInputError(`Amount exceeds maximum borrowable: ${maxBorrow.toFixed(4)} ${selectedAsset.symbol}`);
    } else {
      setInputError('');
    }
    
    onAmountChange(value);
  };

  const borrowingPowerNum = parseFloat(borrowingPower);
  const maxBorrowNum = parseFloat(maxBorrowAmount);
  const currentDebtNum = parseFloat(currentDebt);
  const amountNum = parseFloat(amount || '0');

  // Calculate new utilization after borrow
  const newTotalDebtUSD = (currentDebtNum + amountNum) * selectedAsset.price;
  const totalCollateralValueEstimate = borrowingPowerNum / 0.8; // Rough estimate assuming 80% LTV
  const utilizationAfterBorrow = totalCollateralValueEstimate > 0 ? (newTotalDebtUSD / totalCollateralValueEstimate) * 100 : 0;

  const quickAmounts = [25, 50, 75];

  return (
    <Container>
      <Title>Enter Borrow Amount</Title>
      
      <AssetHeader>
        <AssetIcon>
          <AssetIconImage 
            src={selectedAsset.icon} 
            alt={selectedAsset.symbol}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.innerHTML = selectedAsset.symbol.charAt(0);
              }
            }}
          />
        </AssetIcon>
        <AssetInfo>
          <AssetName>{selectedAsset.symbol}</AssetName>
          <AssetAPR>Borrow APR: {selectedAsset.borrowAPR.toFixed(2)}%</AssetAPR>
        </AssetInfo>
      </AssetHeader> 
      {/* Show collateral status if relevant */}
      {/* {isUserInMarket !== undefined && (
        <WarningSection $type="info">
          <WarningText $type="info">
            <strong>Collateral Status:</strong> {isUserInMarket ? 
              'You have sufficient collateral enabled to borrow this asset.' : 
              'You may need to supply and enable collateral to increase your borrowing power.'
            }
          </WarningText>
        </WarningSection>
      )} */} 
      <InputSection>
        <InputLabel>Amount to Borrow</InputLabel>
        <InputContainer>
          <AmountInput
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            min="0"
            step="any"
          />
          <MaxButton onClick={onMaxClick}>MAX</MaxButton>
        </InputContainer>
        
        {inputError && <ErrorText>{inputError}</ErrorText>}
        
        <QuickAmountsContainer>
          {quickAmounts.map((percentage) => (
            <QuickAmountButton
              key={percentage}
              $selected={selectedQuickAmount === percentage}
              onClick={() => onQuickAmountSelect(percentage)}
            >
              {percentage}%
            </QuickAmountButton>
          ))}
        </QuickAmountsContainer>
      </InputSection>

      {isLiquidityLimited && maxFromCollateral && (
        <BalanceInfo style={{ background: '#fef3c7', border: '1px solid #f59e0b' }}>
          <BalanceLabel>⚠️ Limited by Liquidity</BalanceLabel>
          <BalanceValue>Max from collateral: {parseFloat(maxFromCollateral).toFixed(4)} {selectedAsset.symbol}</BalanceValue>
        </BalanceInfo>
      )}

      <BalanceInfo>
        <BalanceLabel>Available to Borrow:</BalanceLabel>
        <BalanceValue>{maxBorrowNum.toFixed(4)} {selectedAsset.symbol}</BalanceValue>
      </BalanceInfo>

      <BalanceInfo>
        <BalanceLabel>Remaining Borrowing Power:</BalanceLabel>
        <BalanceValue>${borrowingPowerNum.toFixed(2)}</BalanceValue>
      </BalanceInfo>

      {availableLiquidity && (
        <BalanceInfo>
          <BalanceLabel>Market Liquidity:</BalanceLabel>
          <BalanceValue>{parseFloat(availableLiquidity).toFixed(4)} {selectedAsset.symbol}</BalanceValue>
        </BalanceInfo>
      )}

      

      <BalanceInfo>
        <BalanceLabel>Current Debt:</BalanceLabel>
        <BalanceValue>{currentDebtNum.toFixed(4)} {selectedAsset.symbol}</BalanceValue>
      </BalanceInfo>

      {/* {amountNum > 0 && (
        <BalanceInfo>
          <BalanceLabel>Borrowing Power Used:</BalanceLabel>
          <BalanceValue>
            {utilizationAfterBorrow.toFixed(1)}%
            {utilizationAfterBorrow > 80 && <span style={{ color: '#dc2626', marginLeft: '8px' }}>⚠️ High Risk</span>}
          </BalanceValue>
        </BalanceInfo>
      )}

      {(utilizationAfterBorrow > 80 || isLiquidityLimited) && (
        <WarningSection>
          <WarningText>
            You will borrow {amountNum.toFixed(4)} {selectedAsset.symbol} at {selectedAsset.borrowAPR.toFixed(2)}% APR. 
            Make sure you can repay this amount plus interest to avoid liquidation.
            {utilizationAfterBorrow > 80 && ' Your position will be at high risk of liquidation.'}
            {isLiquidityLimited && ' This borrow amount is limited by available market liquidity.'}
          </WarningText>
        </WarningSection>
      )} */}
    </Container>
  );
};
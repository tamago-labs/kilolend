'use client';

import styled from 'styled-components';
import { ContractMarket } from '@/stores/contractMarketStore';

const OverviewTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const AmountSection = styled.div`
  margin-bottom: 24px;
`;

const AmountLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const AmountInputContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const AmountInput = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  background: white;
  color: #1e293b;
  
  &:focus {
    outline: none;
    border-color: #06C755;
  }
  
  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }
`;

const MaxButton = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: #06C755;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #059212;
  }
`;

const USDValue = styled.div`
  font-size: 14px;
  color: #64748b;
  text-align: center;
  margin-bottom: 16px;
`;

const QuickAmounts = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const QuickAmountButton = styled.button<{ $selected: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${({ $selected }) => $selected ? '#06C755' : '#e2e8f0'};
  background: ${({ $selected }) => $selected ? '#06C755' : 'white'};
  color: ${({ $selected }) => $selected ? 'white' : '#64748b'};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #06C755;
  }
`;

const DetailsCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const StatValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

interface SupplyAmountInputProps {
  selectedAsset: ContractMarket;
  amount: string;
  selectedQuickAmount: number | null;
  userBalance: string;
  onAmountChange: (amount: string) => void;
  onQuickAmountSelect: (percentage: number) => void;
  onMaxClick: () => void;
}

export const SupplyAmountInput = ({
  selectedAsset,
  amount,
  selectedQuickAmount,
  userBalance,
  onAmountChange,
  onQuickAmountSelect,
  onMaxClick
}: SupplyAmountInputProps) => {
  const usdValue = amount && selectedAsset ? parseFloat(amount) * selectedAsset.price : 0;

  return (
    <div>
      <OverviewTitle>Enter Supply Amount</OverviewTitle>
      <AmountSection>
        <AmountLabel>Amount to Supply</AmountLabel>
        <AmountInputContainer>
          <AmountInput
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
          />
          <MaxButton onClick={onMaxClick}>MAX</MaxButton>
        </AmountInputContainer>
        {usdValue > 0 && (
          <USDValue>≈ ${usdValue.toFixed(2)} USD</USDValue>
        )}
        <QuickAmounts>
          {[25, 50, 75, 100].map((percentage) => (
            <QuickAmountButton
              key={percentage}
              $selected={selectedQuickAmount === percentage}
              onClick={() => onQuickAmountSelect(percentage)}
            >
              {percentage}%
            </QuickAmountButton>
          ))}
        </QuickAmounts>
      </AmountSection>

      <DetailsCard>
        <StatRow>
          <StatLabel>Supply APY</StatLabel>
          <StatValue>{selectedAsset.supplyAPY.toFixed(2)}%</StatValue>
        </StatRow>
        <StatRow>
          <StatLabel>Available Balance</StatLabel>
          <StatValue>{userBalance} {selectedAsset.symbol}</StatValue>
        </StatRow> 
        <StatRow>
          <StatLabel>{selectedAsset.symbol} Price</StatLabel>
          <StatValue>${selectedAsset.price.toFixed(4)}</StatValue>
        </StatRow>
      </DetailsCard>
    </div>
  );
};

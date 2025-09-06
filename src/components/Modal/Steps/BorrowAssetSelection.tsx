'use client';

import styled from 'styled-components';
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

const AssetCard = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid ${({ $selected }) => $selected ? '#06C755' : '#e2e8f0'};
  background: ${({ $selected }) => $selected ? '#f0fdf4' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 12px;

  &:hover {
    border-color: ${({ $selected }) => $selected ? '#16a34a' : '#cbd5e1'};
    transform: translateY(-1px);
  }
`;

const AssetIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
`;

const AssetIconImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const AssetInfo = styled.div`
  flex: 1;
  margin-left: 16px;
`;

const AssetName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const AssetDetails = styled.div`
  display: flex;
  gap: 16px;
  color: #64748b;
  font-size: 14px;
`;

const AssetBalance = styled.div`
  text-align: right;
`;

const BalanceLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
`;

const BalanceValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
  font-size: 14px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
`;

const EmptyStateTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const EmptyStateText = styled.div`
  font-size: 14px;
  line-height: 1.4;
`;

interface BorrowAssetSelectionProps {
  markets: ContractMarket[];
  selectedAsset: ContractMarket | null;
  userBalances: Record<string, string>;
  borrowingPower: string;
  onAssetSelect: (asset: ContractMarket) => void;
  isLoading?: boolean;
}

export const BorrowAssetSelection = ({
  markets,
  selectedAsset,
  userBalances,
  borrowingPower,
  onAssetSelect,
  isLoading = false
}: BorrowAssetSelectionProps) => {
  // Filter out collateral-only markets for borrowing
  const borrowableMarkets = markets.filter(market => !market.isCollateralOnly && market.isActive);

  if (isLoading) {
    return (
      <LoadingState>
        Loading available assets...
      </LoadingState>
    );
  }

  if (borrowableMarkets.length === 0) {
    return (
      <EmptyState>
        <EmptyStateTitle>No Assets Available</EmptyStateTitle>
        <EmptyStateText>
          No borrowable assets are currently available. Please check back later.
        </EmptyStateText>
      </EmptyState>
    );
  }

  const borrowingPowerNum = parseFloat(borrowingPower || '0');
  const hasBorrowingPower = borrowingPowerNum > 0;

  return (
    <Container>
      <Title>Select Asset to Borrow</Title>
      
      {!hasBorrowingPower && (
        <EmptyState>
          <EmptyStateTitle>No Borrowing Power</EmptyStateTitle>
          <EmptyStateText>
            You need to supply collateral first to borrow assets. Go to the Supply tab to deposit assets that can be used as collateral.
          </EmptyStateText>
        </EmptyState>
      )}

      {hasBorrowingPower && (
        <>
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
            <div style={{ fontSize: '14px', color: '#0369a1' }}>
              Available Borrowing Power: <strong>${borrowingPowerNum.toFixed(2)}</strong>
            </div>
          </div>

          {borrowableMarkets.map((market) => (
            <AssetCard
              key={market.id}
              $selected={selectedAsset?.id === market.id}
              onClick={() => onAssetSelect(market)}
            >
              <AssetIcon>
                <AssetIconImage 
                  src={market.icon} 
                  alt={market.symbol}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = market.symbol.charAt(0);
                    }
                  }}
                />
              </AssetIcon>
              <AssetInfo>
                <AssetName>{market.symbol}</AssetName>
                <AssetDetails>
                  <span>APR: {market.borrowAPR.toFixed(2)}%</span>
                  <span>Liquidity: ${market.totalSupply}</span>
                </AssetDetails>
              </AssetInfo>
              <AssetBalance>
                <BalanceLabel>Your Debt</BalanceLabel>
                <BalanceValue>
                  {userBalances[`${market.symbol}_borrowed`] || '0.00'} {market.symbol}
                </BalanceValue>
              </AssetBalance>
            </AssetCard>
          ))}
        </>
      )}
    </Container>
  );
};

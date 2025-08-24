'use client';

import styled from 'styled-components';
import { useMarketStore } from '@/stores/marketStore';
import { useUserStore } from '@/stores/userStore';

const MarketInfoCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
`;

const MarketHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const MarketIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
`;

const MarketTitleInfo = styled.div`
  flex: 1;
`;

const MarketTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
`;

const MarketSubtitle = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 8px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const StatValue = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
`;

const UtilizationBar = styled.div`
  margin-top: 8px;
`;

const UtilizationLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
  color: #64748b;
`;

const UtilizationTrack = styled.div`
  width: 100%;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
`;

const UtilizationFill = styled.div<{ $width: number }>`
  width: ${props => props.$width}%;
  height: 100%;
  background: linear-gradient(90deg, #00C300, #00A000);
  border-radius: 3px;
  transition: width 0.3s ease;
`;

interface MarketInfoProps {
  marketId: string;
  actionType: 'supply' | 'borrow';
}

export const MarketInfo = ({ marketId, actionType }: MarketInfoProps) => {
  const { getMarketById } = useMarketStore();
  const { positions } = useUserStore();

  const market = getMarketById(marketId);
  if (!market) return null;

  const formatTVL = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getUserPosition = () => {
    return positions.find(p => p.marketId === marketId && p.type === actionType);
  };

  const userPosition = getUserPosition();

  return (
    <MarketInfoCard>
      <MarketHeader>
        <MarketIcon>{market.icon}</MarketIcon>
        <MarketTitleInfo>
          <MarketTitle>{market.name}</MarketTitle>
          <MarketSubtitle>{market.description}</MarketSubtitle>
        </MarketTitleInfo>
      </MarketHeader>

      <StatsGrid>
        <StatItem>
          <StatValue>{market.supplyAPY.toFixed(2)}%</StatValue>
          <StatLabel>Supply APY</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{market.borrowAPR.toFixed(2)}%</StatValue>
          <StatLabel>Borrow APR</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{formatTVL(market.totalSupply)}</StatValue>
          <StatLabel>Total Supply</StatLabel>
        </StatItem>
      </StatsGrid>

      <UtilizationBar>
        <UtilizationLabel>
          <span>Utilization Rate</span>
          <span>{market.utilization.toFixed(1)}%</span>
        </UtilizationLabel>
        <UtilizationTrack>
          <UtilizationFill $width={market.utilization} />
        </UtilizationTrack>
      </UtilizationBar>

      {userPosition && (
        <div style={{ marginTop: '12px', padding: '8px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
            Your existing {actionType} position:
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
            {userPosition.amount.toFixed(4)} {market.symbol} (${userPosition.usdValue.toFixed(2)})
          </div>
        </div>
      )}
    </MarketInfoCard>
  );
};

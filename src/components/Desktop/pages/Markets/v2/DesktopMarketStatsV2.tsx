"use client";

import styled from 'styled-components';
import { useContractMarketStore } from '@/stores/contractMarketStore';

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
`;

const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: 12px;
  color: ${({ $positive }) => $positive ? '#06C755' : '#ef4444'};
  margin-top: 4px;
  font-weight: 500;
`;

const StatMeta = styled.div`
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
`;

interface DesktopMarketStatsV2Props {
  className?: string;
}

export const DesktopMarketStatsV2 = ({ className }: DesktopMarketStatsV2Props) => {
  const { markets } = useContractMarketStore();

  // Calculate stats from the contractMarketStore
  const totalSupply = markets.reduce((sum, market) => sum + market.totalSupply, 0);
  const totalBorrow = markets.reduce((sum, market) => sum + market.totalBorrow, 0);
  const totalLiquidity = markets.reduce((sum, market) => sum + (market.totalSupply - market.totalBorrow), 0);
  const bestSupplyAPY = markets.reduce((best, market) => market.supplyAPY > best ? market.supplyAPY : best, 0);

  // Get unique chains
  const uniqueChains = Array.from(new Set(markets.map(m => m.chainName)));

  // Format currency values
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <StatsSection className={className}>
      <StatCard>
        <StatLabel>Total Supply</StatLabel>
        <StatValue>{formatCurrency(totalSupply)}</StatValue>
        <StatChange $positive>
          Across {markets.length} markets
        </StatChange>
        <StatMeta>
          {uniqueChains.length} chains: {uniqueChains.join(', ')}
        </StatMeta>
      </StatCard>

      <StatCard>
        <StatLabel>Total Borrow</StatLabel>
        <StatValue>{formatCurrency(totalBorrow)}</StatValue>
        <StatChange $positive={totalBorrow > 0}>
          {totalBorrow > 0 ? 'Active borrowing' : 'No borrowing activity'}
        </StatChange>
      </StatCard>

      <StatCard>
        <StatLabel>Total Liquidity</StatLabel>
        <StatValue>{formatCurrency(totalLiquidity)}</StatValue>
        <StatChange $positive={totalLiquidity > 0}>
          Available for lending
        </StatChange>
      </StatCard>

      <StatCard>
        <StatLabel>Best Supply APY</StatLabel>
        <StatValue>{formatPercentage(bestSupplyAPY)}</StatValue>
        <StatChange $positive={bestSupplyAPY > 0}>
          Highest yield available
        </StatChange>
      </StatCard>
    </StatsSection>
  );
};
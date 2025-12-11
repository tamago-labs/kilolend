"use client";

import styled from 'styled-components';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover { 
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $positive }) => $positive ? '#06C755' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HealthIndicator = styled.div<{ $level: 'safe' | 'warning' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $level }) => 
    $level === 'safe' ? '#f0fdf4' :
    $level === 'warning' ? '#fef3c7' :
    '#fef2f2'
  };
  color: ${({ $level }) => 
    $level === 'safe' ? '#166534' :
    $level === 'warning' ? '#92400e' :
    '#991b1b'
  };
`;

const LoadingCard = styled.div`
  background: #f8fafc;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const LoadingText = styled.div`
  color: #64748b;
  font-size: 14px;
  text-align: center;
`;

const LoadingSkeleton = styled.div`
  height: 28px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

interface DesktopPortfolioStatsProps {
  portfolioStats: {
    totalSupplyValue: number;
    totalBorrowValue: number;
    netPortfolioValue: number;
    healthFactor: number;
  };
  borrowingPowerData?: any;
  isLoading?: boolean;
}

export const DesktopPortfolioStats = ({ 
  portfolioStats, 
  borrowingPowerData,
  isLoading = false 
}: DesktopPortfolioStatsProps) => {
  const getHealthLevel = (healthFactor: number): 'safe' | 'warning' | 'danger' => {
    if (healthFactor >= 1.5) return 'safe';
    if (healthFactor >= 1.2) return 'warning';
    return 'danger';
  };

  const getHealthText = (healthFactor: number): string => {
    if (healthFactor >= 1.5) return 'Safe';
    if (healthFactor >= 1.2) return 'Warning';
    return 'Danger';
  };

  const healthLevel = getHealthLevel(portfolioStats.healthFactor);
  const healthText = getHealthText(portfolioStats.healthFactor);

  return (
    <StatsGrid>
      <StatCard>
        <StatLabel>Net Worth</StatLabel>
        <StatValue>${portfolioStats.netPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatValue>
        <StatChange $positive={portfolioStats.netPortfolioValue >= 0}>
          Portfolio Value
        </StatChange>
      </StatCard>

      <StatCard>
        <StatLabel>Total Supply</StatLabel>
        <StatValue>${portfolioStats.totalSupplyValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatValue>
        <StatChange $positive={true}>
          Earning Interest
        </StatChange>
      </StatCard>

      <StatCard>
        <StatLabel>Total Borrow</StatLabel>
        <StatValue>${portfolioStats.totalBorrowValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatValue>
        <StatChange $positive={portfolioStats.totalBorrowValue === 0} style={{ color: portfolioStats.totalBorrowValue > 0 ? '#f59e0b' : undefined }}>
          {portfolioStats.totalBorrowValue === 0 ? 'No Debt' : 'Active Debt'}
        </StatChange>
      </StatCard>

      <StatCard>
        <StatLabel>Health Factor</StatLabel>
        <StatValue>{portfolioStats.healthFactor.toFixed(2)}</StatValue>
        <HealthIndicator $level={healthLevel}>
          {healthText}
        </HealthIndicator>
      </StatCard>
    </StatsGrid>
  );
};

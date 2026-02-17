import React from 'react';
import {
  StatsGrid,
  StatCard,
  StatLabel,
  StatValue,
  StatChange,
  DebtBadge,
  HealthIndicator,
  SkeletonStatCard,
  SkeletonStatLabel,
  SkeletonStatValue,
  SkeletonStatChange
} from '../DesktopPortfolioV2Page.styles';

interface PortfolioStatsProps {
  walletBalanceValue: number;
  totalSupplyValue: number;
  totalBorrowValue: number;
  healthFactor: number;
  isLoading: boolean;
}

export const PortfolioStats: React.FC<PortfolioStatsProps> = ({
  walletBalanceValue,
  totalSupplyValue,
  totalBorrowValue,
  healthFactor,
  isLoading
}) => {
  const hasDebt = totalBorrowValue > 0;

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

  const healthLevel = getHealthLevel(healthFactor);
  const healthText = getHealthText(healthFactor);

  if (isLoading) {
    return (
      <StatsGrid>
        <SkeletonStatCard>
          <SkeletonStatLabel />
          <SkeletonStatValue />
          <SkeletonStatChange />
        </SkeletonStatCard>
        <SkeletonStatCard>
          <SkeletonStatLabel />
          <SkeletonStatValue />
          <SkeletonStatChange />
        </SkeletonStatCard>
        <SkeletonStatCard>
          <SkeletonStatLabel />
          <SkeletonStatValue />
          <SkeletonStatChange />
        </SkeletonStatCard>
        <SkeletonStatCard>
          <SkeletonStatLabel />
          <SkeletonStatValue />
          <SkeletonStatChange />
        </SkeletonStatCard>
      </StatsGrid>
    );
  }

  return (
    <StatsGrid>
      <StatCard>
        <StatLabel>Available Balance</StatLabel>
        <StatValue>${walletBalanceValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatValue>
        <StatChange $positive={true}>
          Wallet Tokens
        </StatChange>
      </StatCard>

      <StatCard>
        <StatLabel>Total Supply</StatLabel>
        <StatValue>${totalSupplyValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatValue>
        <StatChange $positive={true}>
          Earning Interest
        </StatChange>
      </StatCard>

      <StatCard>
        <StatLabel>Total Borrow</StatLabel>
        <StatValue>${totalBorrowValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatValue>
        <DebtBadge $hasDebt={hasDebt}>
          {hasDebt ? 'Active Debt' : 'No Debt'}
        </DebtBadge>
      </StatCard>

      <StatCard>
        <StatLabel>Health Factor</StatLabel>
        <StatValue>{healthFactor.toFixed(2)}</StatValue>
        <HealthIndicator $level={healthLevel}>
          {healthText}
        </HealthIndicator>
      </StatCard>
    </StatsGrid>
  );
};
'use client';

import React from 'react';
import styled from 'styled-components';

const RiskCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px; 
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
`;

const MetricSection = styled.div`
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const MetricLabel = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const MetricValue = styled.span<{ $color?: string }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $color }) => $color || '#1e293b'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: ${({ $color }) => $color};
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3)
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-20px); }
    100% { transform: translateX(100px); }
  }
`;

const HealthFactorDisplay = styled.div<{ $healthy: boolean }>`
  background: ${({ $healthy }) => $healthy ?
    'linear-gradient(135deg, #f0fdf4, #dcfce7)' :
    'linear-gradient(135deg, #fef2f2, #fee2e2)'
  };
  border: 1px solid ${({ $healthy }) => $healthy ? '#00C300' : '#ef4444'};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  margin-bottom: 16px;
`;

const HealthFactorValue = styled.div<{ $healthy: boolean }>`
font-size: 16px;
font-weight: 600;
  color: ${({ $healthy }) => $healthy ? '#059212' : '#dc2626'};  
`;

const HealthFactorLabel = styled.div<{ $healthy: boolean }>`
  font-size: 12px;
  color: ${({ $healthy }) => $healthy ? '#166534' : '#991b1b'};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BorrowingPowerSection = styled.div`  
  margin-bottom: 16px;
`;

const BorrowingPowerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const BorrowingPowerTitle = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const BorrowingPowerValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const RiskWarning = styled.div`
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
`;

const WarningText = styled.div`
  font-size: 12px;
  color: #dc2626;
  font-weight: 500;
  line-height: 1.4;
`;

const LoadingSkeleton = styled.div`
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
  height: 20px;

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

interface PortfolioRiskCardProps {
  portfolioStats: {
    totalSupplyValue: number;
    totalBorrowValue: number;
    netPortfolioValue: number;
    healthFactor: number;
  };
  borrowingPowerData?: {
    totalCollateralValue: string;
    totalBorrowValue: string;
    borrowingPowerUsed: string;
    borrowingPowerRemaining: string;
    healthFactor: string;
    liquidationThreshold: string;
  };
  isLoading?: boolean;
}

export const PortfolioRiskCard = ({
  portfolioStats,
  borrowingPowerData,
  isLoading = false
}: PortfolioRiskCardProps) => {
  const isHealthy = portfolioStats.healthFactor > 1.5;
  const isAtRisk = portfolioStats.healthFactor <= 1.2 && portfolioStats.healthFactor > 0;

  const borrowingPowerUsed = borrowingPowerData ?
    parseFloat(borrowingPowerData.borrowingPowerUsed) :
    portfolioStats.totalSupplyValue > 0 ?
      (portfolioStats.totalBorrowValue / portfolioStats.totalSupplyValue) * 100 :
      0;

  const borrowingPowerRemaining = borrowingPowerData ?
    parseFloat(borrowingPowerData.borrowingPowerRemaining) :
    Math.max(0, portfolioStats.totalSupplyValue * 0.8 - portfolioStats.totalBorrowValue);

  const liquidationRisk = borrowingPowerUsed;
  const liquidationColor =
    liquidationRisk > 80 ? '#dc2626' :
      liquidationRisk > 60 ? '#f59e0b' :
        '#059212';

  if (isLoading) {
    return (
      <RiskCard>
        <CardTitle>Risk Overview</CardTitle>
        <LoadingSkeleton style={{ marginBottom: '16px' }} />
        <LoadingSkeleton style={{ marginBottom: '16px' }} />
        <LoadingSkeleton />
      </RiskCard>
    );
  }

  return (
    <RiskCard>

      {/* Health Factor */}
      {/* <HealthFactorDisplay $healthy={isHealthy}>
        <HealthFactorValue $healthy={isHealthy}>
          {portfolioStats.healthFactor > 999 ? '∞' : portfolioStats.healthFactor.toFixed(2)}
        </HealthFactorValue>
        <HealthFactorLabel $healthy={isHealthy}>
          {isHealthy ? 'Healthy' : 'At Risk'}
        </HealthFactorLabel>
      </HealthFactorDisplay> */}

      {/* Borrowing Power */}
      <BorrowingPowerSection>
        <BorrowingPowerHeader>
          <BorrowingPowerTitle>Borrowing Power Used</BorrowingPowerTitle>
          <BorrowingPowerValue>{borrowingPowerUsed.toFixed(1)}%</BorrowingPowerValue>
        </BorrowingPowerHeader>
        <ProgressBar>
          <ProgressFill
            $percentage={borrowingPowerUsed}
            $color={liquidationColor}
          />
        </ProgressBar>
      </BorrowingPowerSection>

      {/* Metrics */}
      <MetricSection>
        <MetricHeader>
          <MetricLabel>Available to Borrow</MetricLabel>
          <MetricValue $color="#059212">
            ${borrowingPowerRemaining.toFixed(2)}
          </MetricValue>
        </MetricHeader>
      </MetricSection>

      <MetricSection>
        <MetricHeader>
          <MetricLabel>Collateral Value</MetricLabel>
          <MetricValue>
            ${borrowingPowerData ?
              parseFloat(borrowingPowerData.totalCollateralValue).toFixed(2) :
              (portfolioStats.totalSupplyValue * 0.8).toFixed(2)
            }
          </MetricValue>
        </MetricHeader>
      </MetricSection>

      <MetricSection>
        <MetricHeader>
          <MetricLabel>Health Factor</MetricLabel>
          {/* <MetricValue $color="#f59e0b">
            {borrowingPowerData?.liquidationThreshold || '80'}%
          </MetricValue> */}
          <HealthFactorValue $healthy={isHealthy}>
            {portfolioStats.healthFactor > 999 ? '∞' : portfolioStats.healthFactor.toFixed(2)}
          </HealthFactorValue>
        </MetricHeader>
      </MetricSection>

      {/* <MetricSection>
        <MetricHeader>
          <MetricLabel>Liquidation Threshold</MetricLabel>
          <MetricValue $color="#f59e0b">
            {borrowingPowerData?.liquidationThreshold || '80'}%
          </MetricValue>
        </MetricHeader>
      </MetricSection> */}

      {/* Risk Warnings */}
      {isAtRisk && (
        <RiskWarning>
          <WarningText>
            ⚠️ Your health factor is critical. Consider repaying debt or adding more collateral to avoid liquidation.
          </WarningText>
        </RiskWarning>
      )}

      {borrowingPowerUsed > 80 && (
        <RiskWarning>
          <WarningText>
            High borrowing utilization. You're approaching liquidation risk.
          </WarningText>
        </RiskWarning>
      )}
    </RiskCard>
  );
};
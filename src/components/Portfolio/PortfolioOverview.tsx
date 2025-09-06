'use client';

import React from 'react';
import styled from 'styled-components';
import { PortfolioStatsSlider } from './PortfolioStatsSlider';
import { PortfolioRiskCard } from './PortfolioRiskCard';

const OverviewContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const RightSection = styled.div`
  width: 320px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

interface PortfolioOverviewProps {
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

export const PortfolioOverview = ({ 
  portfolioStats, 
  borrowingPowerData,
  isLoading = false 
}: PortfolioOverviewProps) => {
  return (
    <OverviewContainer>
      <LeftSection>
        <PortfolioStatsSlider 
          portfolioStats={portfolioStats}
          isLoading={isLoading}
        />
      </LeftSection>
      <RightSection>
        <PortfolioRiskCard 
          portfolioStats={portfolioStats}
          borrowingPowerData={borrowingPowerData}
          isLoading={isLoading}
        />
      </RightSection>
    </OverviewContainer>
  );
};
"use client";

import styled from 'styled-components';
import { useState } from 'react';
import { formatUSD } from '@/utils/formatters';

const ChartContainer = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const ChartHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChartHeaderTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const TimeRangeButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const TimeButton = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  background: ${({ $active }) => $active ? '#06C755' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#64748b'};
  border: 1px solid ${({ $active }) => $active ? '#06C755' : '#e2e8f0'};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${({ $active }) => $active ? '#059669' : '#f8fafc'};
  }
`;

const ChartContent = styled.div`
  padding: 24px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const ChartPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #64748b;
`;

const ChartIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const ChartText = styled.div`
  text-align: center;
`;

const ChartTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ChartSubtitle = styled.div`
  font-size: 14px;
  color: #94a3b8;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 0 24px 24px;
`;

const StatCard = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
`;

const StatValue = styled.div<{ $positive?: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${({ $positive }) => {
    if ($positive === true) return '#06C755'; // Green for positive
    if ($positive === false) return '#ef4444'; // Red for negative
    return '#1e293b'; // Default color for neutral/undefined
  }};
`;

interface DesktopMarketChartProps {
  marketId: string;
  displaySymbol: string;
  market: any;
  priceData: any;
} 

export const DesktopMarketChart = ({
  marketId,
  displaySymbol,
  market,
  priceData,
}: DesktopMarketChartProps) => {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0;
    return {
      text: `${isPositive ? '+' : ''}${value.toFixed(2)}%`,
      isPositive,
    };
  };

  // Use real data from market and priceData
  const currentPrice = priceData?.price || 0;
  const priceChange = priceData?.change24h || 0;
  const volume24h = priceData?.volume_24h || 0;

  const priceChangeFormatted = formatPercentage(priceChange);

  // Helper function to format currency with N/A fallback
  const formatCurrencyWithNA = (value: number) => {
    if (value === 0 || !value) return 'N/A';
    return formatUSD(value);
  };

  // Helper function to format volume with N/A fallback
  const formatVolumeWithNA = (value: number) => {
    if (value === 0 || !value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }; 

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartHeaderTitle>{displaySymbol} Price Chart</ChartHeaderTitle>
        <TimeRangeButtons>
          {(['1D', '1W', '1M', '1Y'] as const).map((range) => (
            <TimeButton
              key={range}
              $active={timeRange === range}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </TimeButton>
          ))}
        </TimeRangeButtons>
      </ChartHeader>

      <ChartContent>
        <ChartPlaceholder>
          <ChartIcon>📈</ChartIcon>
          <ChartText>
            <ChartTitle>Price Chart</ChartTitle>
            <ChartSubtitle>
              Price chart is not available yet
            </ChartSubtitle>
          </ChartText>
        </ChartPlaceholder>
      </ChartContent>

      <StatsGrid>
        <StatCard>
          <StatLabel>Current Price</StatLabel>
          <StatValue>{formatCurrencyWithNA(currentPrice)}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>24h Change</StatLabel>
          <StatValue $positive={priceChangeFormatted.isPositive}>
            {priceChangeFormatted.text}
          </StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>24h Volume</StatLabel>
          <StatValue>
            {formatVolumeWithNA(volume24h)}
          </StatValue>
        </StatCard>
      </StatsGrid> 
    </ChartContainer>
  );
};

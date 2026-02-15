"use client";

import styled from 'styled-components';
import { ContractMarket } from '@/stores/contractMarketStore';
import { formatUSD, formatPercent } from '@/utils/formatters';

const InfoContainer = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const InfoHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const InfoTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const InfoContent = styled.div`
  padding: 24px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const InfoValue = styled.div<{ $highlight?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $highlight }) => $highlight ? '#06C755' : '#1e293b'};
  text-align: right;
`;

const ChainBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
`;

interface MarketInfoV2Props {
  market: ContractMarket;
}

export const MarketInfoV2 = ({ market }: MarketInfoV2Props) => {
  // Use current price from market
  const currentPrice = market.price || 0;
  const priceChange = market.priceChange24h || 0;
  
  const totalSupply = market.totalSupply * currentPrice;
  const totalBorrow = market.totalBorrow * currentPrice;
  
  // Calculate liquidity: total supply - total borrow
  const liquidity = totalSupply - totalBorrow;
  
  // Utilization rate is already calculated in the market
  const utilizationRate = market.utilization;

  // Format price change with color
  const formatPriceChange = (value: number) => {
    const isPositive = value >= 0;
    return {
      text: `${isPositive ? '+' : ''}${value.toFixed(2)}%`,
      isPositive,
    };
  };

  const priceChangeFormatted = formatPriceChange(priceChange);

  return (
    <InfoContainer>
      <InfoHeader>
        <InfoTitle>Market Information</InfoTitle>
      </InfoHeader>
      
      <InfoContent>
        <InfoRow>
          <InfoLabel>Chain</InfoLabel>
          <InfoValue>{market.chainName}</InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>Total Supply</InfoLabel>
          <InfoValue>{formatUSD(totalSupply)}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Total Borrow</InfoLabel>
          <InfoValue>{formatUSD(totalBorrow)}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Available Liquidity</InfoLabel>
          <InfoValue $highlight>{formatUSD(liquidity)}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Utilization Rate</InfoLabel>
          <InfoValue>{formatPercent(utilizationRate)}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Supply APY</InfoLabel>
          <InfoValue $highlight>{formatPercent(market.supplyAPY)}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Borrow APR</InfoLabel>
          <InfoValue>{formatPercent(market.borrowAPR)}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Current Price</InfoLabel>
          <InfoValue>{formatUSD(currentPrice)}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>24h Change</InfoLabel>
          <InfoValue style={{ 
            color: priceChangeFormatted.isPositive ? '#06C755' : '#ef4444' 
          }}>
            {priceChangeFormatted.text}
          </InfoValue>
        </InfoRow>

        {market.isCollateralOnly && (
          <ChainBadge>
            <span>Collateral Only</span>
          </ChainBadge>
        )}
      </InfoContent>
    </InfoContainer>
  );
};
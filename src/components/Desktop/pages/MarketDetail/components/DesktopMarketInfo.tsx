"use client";

import styled from 'styled-components';
import { MarketData } from '@/contexts/MarketContext';
import { useContractMarketStore } from '@/stores/contractMarketStore';
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

const CollateralFactor = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
`;

const CollateralLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
`;

const CollateralValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

interface DesktopMarketInfoProps {
  market: MarketData;
  displaySymbol: string;
  priceData: any;
}

export const DesktopMarketInfo = ({
  market,
  displaySymbol,
  priceData,
}: DesktopMarketInfoProps) => {
  // Use priceData for current price, fallback to 0 if not available
  const currentPrice = priceData?.price || 0;
  const priceChange = priceData?.change24h || 0;
  
  const totalSupply = parseFloat(market.totalSupply || '0') * currentPrice;
  const totalBorrow = parseFloat(market.totalBorrow || '0') * currentPrice;
  
  // Calculate liquidity: total supply - total borrow
  const liquidity = totalSupply - totalBorrow;
  
  // Calculate utilization rate: (total borrow / total supply) * 100
  const utilizationRate = totalSupply > 0 ? (totalBorrow / totalSupply) * 100 : 0;

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
          <InfoValue>{formatPercent(market.borrowAPY)}</InfoValue>
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

        {market.collateralFactor > 0 && (
          <CollateralFactor>
            <CollateralLabel>Collateral Factor</CollateralLabel>
            <CollateralValue>
              You can borrow up to {formatPercent(market.collateralFactor)} of your {displaySymbol} collateral value
            </CollateralValue>
          </CollateralFactor>
        )}
      </InfoContent>
    </InfoContainer>
  );
};

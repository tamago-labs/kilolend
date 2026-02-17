"use client"

import styled from 'styled-components';
import { ChainBadge } from './ChainBadge';

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
`;

const AssetIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const AssetIconImage = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
`;

const AssetDetails = styled.div`
  flex: 1;
`;

const AssetNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const AssetName = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const AssetSymbol = styled.div`
  font-size: 18px;
  color: #64748b;
  margin-bottom: 12px;
`;

const AssetPrice = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
`;

const PriceChange = styled.div<{ $positive?: boolean }>`
  font-size: 14px;
  color: ${({ $positive }) => $positive ? '#06C755' : '#ef4444'};
  margin-top: 4px;
`;

const ChainInfo = styled.div`
  margin-bottom: 12px;
`;

interface MarketHeaderV2Props {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  chainName: string;
  chainId: number;
  chainIconUrl: string;
  tokenIconUrl: string;
}

export const MarketHeaderV2 = ({
  symbol,
  name,
  price,
  priceChange24h,
  chainName,
  chainId,
  chainIconUrl,
  tokenIconUrl,
}: MarketHeaderV2Props) => {
  const isPositiveChange = priceChange24h >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <HeaderContainer>
      <AssetIcon>
        <AssetIconImage
          src={tokenIconUrl}
          alt={symbol}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.innerHTML = symbol.charAt(0);
              target.parentElement.style.fontSize = '24px';
              target.parentElement.style.fontWeight = 'bold';
              target.parentElement.style.color = '#64748b';
            }
          }}
        />
      </AssetIcon>
      <AssetDetails>
        <AssetNameRow>
          <AssetName>{name}</AssetName>
          <ChainBadge chainName={chainName} chainId={chainId} iconUrl={chainIconUrl} />
        </AssetNameRow>
        <AssetSymbol>{symbol}</AssetSymbol>
        <AssetPrice>{formatCurrency(price)}</AssetPrice>
        <PriceChange $positive={isPositiveChange}>
          {isPositiveChange ? '+' : ''}{formatPercentage(priceChange24h)} (24h)
        </PriceChange>
      </AssetDetails>
    </HeaderContainer>
  );
};
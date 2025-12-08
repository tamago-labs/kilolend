"use client";

import styled from 'styled-components';
import { useMarketContext } from '@/contexts/MarketContext';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import {  ArrowRight } from 'react-feather';
import { useRouter } from 'next/navigation';

// Market APY Card Styles
const APYCardWrapper = styled.div`
  background: white;
  color: #1e293b;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const CardTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const SupportText = styled.p`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
`;

const CTAButton = styled.button`
  background: #06C755;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  opacity: 0;
  transform: translateX(10px);
  pointer-events: none;

  ${APYCardWrapper}:hover & {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
  }

  &:hover {
    background: #059669;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f1f5f9;
    color: #06C755;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const APYList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
`;

const APYItem = styled.div<{ $isHigh?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  transition: all 0.2s;
  cursor: pointer;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 12px 0;
  }
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TokenIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`;

const FallbackIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #06C755, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }
`;

const TokenName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TokenSymbol = styled.span`
  font-weight: 600;
  font-size: 18px;
  color: #1e293b;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const TokenFullName = styled.span`
  font-size: 12px;
  color: #64748b;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const APYValue = styled.div<{ $isHigh?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const APYPercentage = styled.span<{ $isHigh?: boolean }>`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const APYLabel = styled.span`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const LoadingSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SkeletonItem = styled.div`
  height: 60px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 12px;

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

// Token name mapping
const TOKEN_NAMES: Record<string, string> = {
  'USDT': 'Tether Official',
  'USDC': 'USD Coin',
  'KAIA': 'KAIA Native',
  'SIX': 'Six Protocol',
  'WBTC': 'Wrapped Bitcoin',
  'WETH': 'Wrapped Ethereum',
  'KDAI': 'KaiDAI',
  'KUSDT': 'KaiUSDT',
  'KUSDC': 'KaiUSDC',
  'MBX': 'MARBLEX',
  'stKAIA': 'Lair Staked KAIA'
};

export const MarketAPYCard = () => {
  const { state, actions } = useMarketContext();
  const { markets: storeMarkets } = useContractMarketStore();
  const router = useRouter();

  // Get top markets by APY from context
  const topMarkets = actions.getTopMarketsByAPY(5);
  const isHighAPY = (apy: number) => apy >= 5.0;

  const handleNavigateToMarkets = () => {
    router.push('/markets');
  };

  // Helper function to get token icon from store
  const getTokenIcon = (symbol: string) => {
    const market = storeMarkets.find(m => m.symbol.toUpperCase() === symbol.toUpperCase());
    return market?.icon;
  };

  // Helper function to render token icon with fallback
  const renderTokenIcon = (symbol: string) => {
    const iconUrl = getTokenIcon(symbol);

    if (iconUrl) {
      return <TokenIcon src={iconUrl} alt={symbol} onError={(e) => {
        // Fallback to default icon if image fails to load
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextElementSibling?.classList.remove('hidden');
      }} />;
    }

    return <FallbackIcon>{symbol.slice(0, 2)}</FallbackIcon>;
  };

  if (state.isLoading && Object.keys(state.markets).length === 0) {
    return (
      <APYCardWrapper>
        <CardHeader>
          <CardTitle>
            Supply with Best Rates
          </CardTitle>
        </CardHeader>
        <LoadingSkeleton>
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonItem key={i} />
          ))}
        </LoadingSkeleton>
      </APYCardWrapper>
    );
  }

  if (state.error) {
    return (
      <APYCardWrapper>
        <CardHeader>
          <CardTitle>
            Supply with Best Rates
          </CardTitle>
        </CardHeader>
        <ErrorMessage>
          <ErrorIcon>⚠️</ErrorIcon>
          <div>Failed to load market data</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Please try again later
          </div>
        </ErrorMessage>
      </APYCardWrapper>
    );
  }

  return (
    <APYCardWrapper>
      <CardHeader>
        <CardTitleContainer>
          <CardTitle>
            Supply with Best Rates
          </CardTitle>
          <SupportText>Earn Competitive APY on Your Assets</SupportText>
        </CardTitleContainer>
        <CTAButton onClick={handleNavigateToMarkets}>
          View Markets
          <ArrowRight size={16} />
        </CTAButton>
      </CardHeader>

      <APYList>
        {topMarkets.map(({ symbol, data }) => {
          const displaySymbol = actions.getDisplaySymbol(symbol);
          return (
            <APYItem
              key={symbol}
              $isHigh={isHighAPY(data.supplyAPY)}
            >
              <TokenInfo>
                {renderTokenIcon(displaySymbol)}
                <TokenName>
                  <TokenSymbol>{displaySymbol}</TokenSymbol>
                  <TokenFullName>{TOKEN_NAMES[displaySymbol] || displaySymbol}</TokenFullName>
                </TokenName>
              </TokenInfo>

              <APYPercentage $isHigh={isHighAPY(data.supplyAPY)}>
                {data.supplyAPY.toFixed(2)}%
              </APYPercentage>
            </APYItem>
          );
        })}
      </APYList>
    </APYCardWrapper>
  );
};

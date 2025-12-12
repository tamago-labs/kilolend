"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMarketContext } from '@/contexts/MarketContext';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { DesktopMarketActions } from './components/DesktopMarketActions';
import { DesktopMarketChart } from './components/DesktopMarketChart';
import { DesktopMarketInfo } from './components/DesktopMarketInfo'; 
import { ArrowLeft } from "react-feather"

const MarketDetailContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
  padding: 8px 0;
  transition: color 0.3s;

  &:hover {
    color: #06C755;
  }
`;

const MarketHeader = styled.div`
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

const AssetName = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const AssetSymbol = styled.div`
  font-size: 18px;
  color: #64748b;
  margin-bottom: 16px;
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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const LoadingMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #64748b;
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #ef4444;
  font-size: 16px;
`;

export const DesktopMarketDetail = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, actions } = useMarketContext();
  const { markets: contractMarkets } = useContractMarketStore();
  const [mounted, setMounted] = useState(false);
  
  // Parse the action parameter from URL and set initial tab
  const initialAction = searchParams.get('action') as 'supply' | 'borrow' | null;
  const [activeTab, setActiveTab] = useState<'supply' | 'borrow'>(
    initialAction === 'supply' || initialAction === 'borrow' ? initialAction : 'supply'
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const marketId = params?.market_id as string;
  
  if (!marketId) {
    return <ErrorMessage>Market ID not found</ErrorMessage>;
  }

  // Find the market data
  const market = state.markets[marketId.toUpperCase()];
  const priceData = state.prices[marketId.toUpperCase()];

  if (!market) {
    return <ErrorMessage>Market not found</ErrorMessage>;
  }

  if (state.isLoading && !market) {
    return <LoadingMessage>Loading market data...</LoadingMessage>;
  }

  if (state.error) {
    return <ErrorMessage>Error loading market data: {state.error}</ErrorMessage>;
  }

  const displaySymbol = actions.getDisplaySymbol(marketId.toUpperCase());
  const priceChange = priceData?.change24h || 0;
  const isPositiveChange = priceChange >= 0;

  const handleBack = () => {
    router.push('/markets');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <MarketDetailContainer>
      <MainContent>
        <BackButton onClick={handleBack}>
          <ArrowLeft size={14}/> Back to Markets
        </BackButton>

        <MarketHeader>
          <AssetIcon>
            <AssetIconImage 
              src={contractMarkets.find(m => m.symbol === displaySymbol)?.icon || `/images/icon-${displaySymbol.toLowerCase()}.png`}
              alt={displaySymbol}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML = displaySymbol.charAt(0);
                  target.parentElement.style.fontSize = '24px';
                  target.parentElement.style.fontWeight = 'bold';
                  target.parentElement.style.color = '#64748b';
                }
              }}
            />
          </AssetIcon>
          <AssetDetails>
            <AssetName>{getTokenName(displaySymbol)}</AssetName>
            <AssetSymbol>{displaySymbol}</AssetSymbol>
            <AssetPrice>{formatCurrency(priceData?.price || 0)}</AssetPrice>
            <PriceChange $positive={isPositiveChange}>
              {isPositiveChange ? '+' : ''}{formatPercentage(priceChange)} (24h)
            </PriceChange>
          </AssetDetails>
        </MarketHeader>

        <ContentGrid>
          <LeftColumn>
            <DesktopMarketActions
              market={market}
              displaySymbol={displaySymbol}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              priceData={priceData}
            />
            <DesktopMarketInfo
              market={market}
              displaySymbol={displaySymbol}
              priceData={priceData}
            />
          </LeftColumn>
          
          <RightColumn>
            <DesktopMarketChart
              marketId={marketId}
              displaySymbol={displaySymbol}
              market={market}
              priceData={priceData}
            /> 
          </RightColumn>
        </ContentGrid>
      </MainContent>
    </MarketDetailContainer>
  );
};

// Helper function to get token name
function getTokenName(symbol: string): string {
  const nameMap: Record<string, string> = {
    'USDT': 'Tether USD',
    'KAIA': 'KAIA Token',
    'SIX': 'SIX Token',
    'BORA': 'BORA Token',
    'MBX': 'MBX Token',
    'stKAIA': 'Staked KAIA',
  };
  return nameMap[symbol] || symbol;
}

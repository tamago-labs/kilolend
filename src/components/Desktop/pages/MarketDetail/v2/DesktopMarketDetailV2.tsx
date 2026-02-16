"use client";

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { MarketHeaderV2 } from './components/MarketHeaderV2';
import { MarketActionsV2 } from './components/MarketActionsV2';
import { MarketInfoV2 } from './components/MarketInfoV2';
import { MarketChartV2 } from './components/MarketChartV2';
import { ArrowLeft } from "react-feather";

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

const LoadingState = styled.div`
  text-align: center;
  padding: 80px 24px;
  color: #64748b;
  font-size: 16px;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #06C755;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const LoadingSubtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 32px;
`;

const ErrorMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #ef4444;
  font-size: 16px;
`;

// Chain configuration
const CHAIN_CONFIGS: Record<string, { chainId: number; chainName: string; iconUrl: string }> = {
  KAIA: {
    chainId: 8217,
    chainName: 'KAIA',
    iconUrl: '/images/blockchain-icons/kaia-token-icon.png',
  },
  KUB: {
    chainId: 96,
    chainName: 'KUB',
    iconUrl: '/images/blockchain-icons/kub-chain-icon.png',
  },
  ETHERLINK: {
    chainId: 42793,
    chainName: 'Etherlink',
    iconUrl: '/images/blockchain-icons/etherlink-icon.png',
  },
};

// Token name mapping
const TOKEN_NAMES: Record<string, string> = {
  'USDT': 'Tether USD',
  'KAIA': 'KAIA Token',
  'SIX': 'SIX Token',
  'BORA': 'BORA Token',
  'MBX': 'MBX Token',
  'STKAIA': 'Staked KAIA',
  'WUSDT': 'Wrapped USDT',
};

interface DesktopMarketDetailV2Props {
  chain: string;
  token: string;
}

export const DesktopMarketDetailV2 = ({ chain, token }: DesktopMarketDetailV2Props) => {

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { markets: contractMarkets, isLoading } = useContractMarketStore();
  const [mounted, setMounted] = useState(false);

  // Parse the action parameter from URL and set initial tab
  const initialAction = searchParams.get('action') as 'supply' | 'borrow' | null;
  const [activeTab, setActiveTab] = useState<'supply' | 'borrow'>(
    initialAction === 'supply' || initialAction === 'borrow' ? initialAction : 'supply'
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <MarketDetailContainer>
        <MainContent>
          <LoadingState>
            <LoadingSpinner />
            <LoadingTitle>Loading Market Data</LoadingTitle>
            <LoadingSubtitle>Please wait while we fetch the latest market information...</LoadingSubtitle>
          </LoadingState>
        </MainContent>
      </MarketDetailContainer>
    );
  }

  // Get chain configuration
  const chainKey = chain.toUpperCase();
  const chainConfig = CHAIN_CONFIGS[chainKey];

  if (!chainConfig) {
    return (
      <MarketDetailContainer>
        <MainContent>
          <BackButton onClick={() => router.push('/markets')}>
            <ArrowLeft size={14} /> Back to Markets
          </BackButton>
          <ErrorMessage>Chain not found: {chain}</ErrorMessage>
        </MainContent>
      </MarketDetailContainer>
    );
  }

  // Show loading indicator while markets are loading
  if (isLoading && contractMarkets.length === 0) {
    return (
      <MarketDetailContainer>
        <MainContent>
          <LoadingState>
            <LoadingSpinner />
            <LoadingTitle>Loading Market Data</LoadingTitle>
            <LoadingSubtitle>Fetching market data for {token} on {chainConfig.chainName}...</LoadingSubtitle>
          </LoadingState>
        </MainContent>
      </MarketDetailContainer>
    );
  }

  // Find market by chainId AND token symbol
  const market = contractMarkets.find(m =>
    m.chainId === chainConfig.chainId &&
    m.symbol.toUpperCase() === token.toUpperCase()
  );

  if (!market) {
    return (
      <MarketDetailContainer>
        <MainContent>
          <BackButton onClick={() => router.push('/markets')}>
            <ArrowLeft size={14} /> Back to Markets
          </BackButton>
          <ErrorMessage>
            Market not found for {token} on {chainConfig.chainName}
          </ErrorMessage>
        </MainContent>
      </MarketDetailContainer>
    );
  }

  const displaySymbol = market.symbol;
  const tokenName = TOKEN_NAMES[displaySymbol.toUpperCase()] || displaySymbol;
  const tokenIconUrl = market.icon || `/images/icon-${displaySymbol.toLowerCase()}.png`;

  const handleBack = () => {
    router.push('/markets');
  };

  const handleTabChange = (tab: 'supply' | 'borrow') => {
    setActiveTab(tab);
  };

  return (
    <MarketDetailContainer>
      <MainContent>
        <BackButton onClick={handleBack}>
          <ArrowLeft size={14} /> Back to Markets
        </BackButton>

        <MarketHeaderV2
          symbol={displaySymbol}
          name={tokenName}
          price={market.price}
          priceChange24h={market.priceChange24h}
          chainName={market.chainName}
          chainId={market.chainId}
          chainIconUrl={chainConfig.iconUrl}
          tokenIconUrl={tokenIconUrl}
        />

        <ContentGrid>
          <LeftColumn>
            <MarketActionsV2
              market={market}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
            <MarketInfoV2
              market={market}
            />
          </LeftColumn>

          <RightColumn>
            <MarketChartV2
              market={market}
            />
          </RightColumn>
        </ContentGrid>
      </MainContent>
    </MarketDetailContainer>
  );
};
"use client";

import styled from 'styled-components';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { ArrowRight } from 'react-feather';

// AI Leverage Card Styles
const AILeverageCardWrapper = styled.div`
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

  ${AILeverageCardWrapper}:hover & {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
  }

  &:hover { 
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const LeverageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
`;

const LeverageItem = styled.div`
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
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
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

const BoostPercentage = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #8b5cf6;
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 768px) {
    font-size: 18px;
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

// Token name mapping
const TOKEN_NAMES: Record<string, string> = {
  'KAIA': 'Klaytn',
  'stKAIA': 'Lair Staked KAIA',
  'BORA': 'BORA Protocol',
  'SIX': 'Six Protocol',
  'MBX': 'MARBLEX'
};

// AI leverage boost data (estimated)
const LEVERAGE_BOOSTS: Record<string, number> = {
  'KAIA': 180,
  'stKAIA': 200,
  'BORA': 130,
  'SIX': 140,
  'MBX': 150
};

export const AILeverageCard = () => {
  const { markets: storeMarkets } = useContractMarketStore();
  // const { openModal } = useModalStore();

  // Get tokens available for leverage (non-stablecoins)
  const leverageTokens = ['KAIA', 'stKAIA', 'BORA', 'SIX', 'MBX'];

  const handleSetupAI = () => {
    // openModal('ai-agent-not-available');
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

  return (
    <AILeverageCardWrapper>
      <CardHeader>
        <CardTitleContainer>
          <CardTitle> 
            Let AI Supercharge Returns
          </CardTitle>
          <SupportText>
            Use AI To Boost APY Across KAIA DeFi
          </SupportText>
        </CardTitleContainer>
        <CTAButton onClick={handleSetupAI}>
          Setup AI
          <ArrowRight size={16} />
        </CTAButton>
      </CardHeader>
      
      <LeverageList>
        {leverageTokens.map(symbol => {
          const boostPercentage = LEVERAGE_BOOSTS[symbol] || 0;
          return (
            <LeverageItem key={symbol}>
              <TokenInfo>
                {renderTokenIcon(symbol)}
                <TokenName>
                  <TokenSymbol>{symbol}</TokenSymbol>
                  <TokenFullName>{TOKEN_NAMES[symbol] || symbol}</TokenFullName>
                </TokenName>
              </TokenInfo>
              
              <BoostPercentage>
                Up to {boostPercentage}% boost
              </BoostPercentage>
            </LeverageItem>
          );
        })}
      </LeverageList>
    </AILeverageCardWrapper>
  );
};

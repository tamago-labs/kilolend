'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Info } from 'react-feather';
import { ContractMarket } from '@/stores/contractMarketStore';
import { EnhancedMarketCard } from './Enhanced/EnhancedMarketCard';
import { MarketNavigation } from './Enhanced/MarketNavigation';

const Container = styled.div`
  width: 100%;
`;

const OverviewTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
  text-align: center;
`;

const CardSection = styled.div`
  margin-bottom: 24px; 
  display: flex;
  align-items: center;
  position: relative;
`;

const SelectButton = styled.button<{ $selected: boolean }>`
  width: 100%;
  padding: 16px 24px;
  border-radius: 12px;
  border: 2px solid ${props => props.$selected ? '#06C755' : '#e2e8f0'};
  background: ${props => props.$selected ? '#f0fdf4' : 'white'};
  color: ${props => props.$selected ? '#166534' : '#374151'};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;

  &:hover {
    border-color: ${props => props.$selected ? '#00A000' : '#cbd5e1'};
    background: ${props => props.$selected ? '#dcfce7' : '#f8fafc'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #64748b;
  min-height: 300px;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 300px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #06C755;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const InfoSection = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  border-left: 4px solid #06C755;
`;

const InfoTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const InfoText = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
`;

const MarketStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

interface SupplyAssetSelectionProps {
  markets: ContractMarket[];
  selectedAsset: ContractMarket | null;
  userBalances: Record<string, string>;
  onAssetSelect: (asset: ContractMarket) => void;
  isLoading?: boolean;
}

export const SupplyAssetSelection = ({ 
  markets, 
  selectedAsset, 
  userBalances,
  onAssetSelect,
  isLoading = false 
}: SupplyAssetSelectionProps) => {
  
  const [currentMarketIndex, setCurrentMarketIndex] = useState(0);

  // Update current market index when selectedAsset changes
  // useEffect(() => {
  //   if (selectedAsset) {
  //     const index = markets.findIndex(m => m.id === selectedAsset.id);
  //     if (index >= 0) {
  //       setCurrentMarketIndex(index);
  //     }
  //   }
  // }, [selectedAsset, markets]);

  useEffect(() => { 
    if (markets.length > 0 && markets[currentMarketIndex]) { 
      onAssetSelect(markets[currentMarketIndex])
    }
  },[markets, currentMarketIndex])
 
  const handlePrevious = () => {
    if (currentMarketIndex > 0) {
      setCurrentMarketIndex(currentMarketIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentMarketIndex < markets.length - 1) {
      setCurrentMarketIndex(currentMarketIndex + 1);
    }
  };

  const handleNavigate = (index: number) => {
    setCurrentMarketIndex(index);
  };

  const handleSelectCurrent = () => {
    if (currentMarket && !isLoading) {
      onAssetSelect(currentMarket);
    }
  };

  const currentMarket = markets[currentMarketIndex];
  const isCurrentSelected = selectedAsset?.id === currentMarket?.id;

  // Calculate summary stats
  const totalMarkets = markets.length; 

  if (isLoading) {
    return (
      <Container>
        <OverviewTitle>Select Asset to Supply</OverviewTitle>
        <LoadingState>
          <LoadingSpinner />
          <div style={{ color: '#64748b', fontSize: '14px' }}>
            Loading market data...
          </div>
        </LoadingState>
      </Container>
    );
  }

  if (!markets.length) {
    return (
      <Container>
        <OverviewTitle>Select Asset to Supply</OverviewTitle>
        <EmptyState>
          <EmptyIcon>📊</EmptyIcon>
          <div style={{ marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
            No Markets Available
          </div>
          <div style={{ fontSize: '14px' }}>
            No lending markets are currently available. Please try again later.
          </div>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <OverviewTitle>Select Asset to Supply</OverviewTitle>
  
      <CardSection>
        {currentMarket && (
          <div style={{ width: '100%' }}>
            <EnhancedMarketCard
              market={currentMarket}
              userBalance={userBalances[currentMarket.symbol] || '0'}
              isLoading={isLoading}
            /> 
          </div>
        )}
      </CardSection>

      <MarketNavigation
        markets={markets}
        currentIndex={currentMarketIndex}
        userBalances={userBalances}
        onNavigate={handleNavigate}
        onPrevious={handlePrevious}
        onNext={handleNext}
      /> 
    </Container>
  );
};
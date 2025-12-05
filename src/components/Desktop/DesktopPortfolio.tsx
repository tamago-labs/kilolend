"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { DesktopHeader } from './DesktopHeader';

const PortfolioContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
`;

const PortfolioHeader = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $positive }) => $positive ? '#06C755' : '#ef4444'};
`;

const PortfolioSection = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  padding: 20px 32px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
`;

const ViewAllButton = styled.button`
  color: #06C755;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #059669;
  }
`;

const AssetList = styled.div`
  padding: 16px 0;
`;

const AssetItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AssetIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
`;

const AssetDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AssetName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const AssetSymbol = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const AssetStats = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
`;

const AssetValue = styled.div`
  text-align: right;
`;

const ValueLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
`;

const ValueAmount = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

const APYValue = styled.div`
  text-align: right;
`;

const APYLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
`;

const APYAmount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #06C755;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #64748b;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyStateText = styled.div`
  font-size: 16px;
  margin-bottom: 24px;
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(6, 199, 85, 0.3);
  }
`;

const mockSuppliedAssets = [
  {
    name: 'Tether USD',
    symbol: 'USDT',
    balance: '10,000.00',
    value: '$10,000.00',
    apy: '5.2%'
  },
  {
    name: 'KAIA Token',
    symbol: 'KAIA',
    balance: '5,000.00',
    value: '$8,500.00',
    apy: '6.8%'
  }
];

const mockBorrowedAssets = [
  {
    name: 'SIX Token',
    symbol: 'SIX',
    balance: '2,000.00',
    value: '$1,600.00',
    apy: '10.5%'
  }
];

export const DesktopPortfolio = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalSupplyValue = 18500;
  const totalBorrowValue = 1600;
  const netWorth = totalSupplyValue - totalBorrowValue;
  const healthFactor = 250;

  return (
    <PortfolioContainer> 
      
      <MainContent>
        <PortfolioHeader>
          <PageTitle>Portfolio</PageTitle>
          <PageSubtitle>Track your lending and borrowing positions</PageSubtitle>
        </PortfolioHeader>

        <StatsGrid>
          <StatCard>
            <StatLabel>Net Worth</StatLabel>
            <StatValue>${netWorth.toLocaleString()}</StatValue>
            <StatChange $positive>+12.5% this month</StatChange>
          </StatCard>
          <StatCard>
            <StatLabel>Total Supply</StatLabel>
            <StatValue>${totalSupplyValue.toLocaleString()}</StatValue>
            <StatChange $positive>+8.2% this month</StatChange>
          </StatCard>
          <StatCard>
            <StatLabel>Total Borrow</StatLabel>
            <StatValue>${totalBorrowValue.toLocaleString()}</StatValue>
            <StatChange $positive>-2.1% this month</StatChange>
          </StatCard>
          <StatCard>
            <StatLabel>Health Factor</StatLabel>
            <StatValue>{healthFactor}%</StatValue>
            <StatChange $positive>Safe</StatChange>
          </StatCard>
        </StatsGrid>

        <PortfolioSection>
          <SectionHeader>
            <SectionTitle>Supplied Assets</SectionTitle>
            <ViewAllButton>View All →</ViewAllButton>
          </SectionHeader>
          <AssetList>
            {mockSuppliedAssets.length > 0 ? (
              mockSuppliedAssets.map((asset, index) => (
                <AssetItem key={index}>
                  <AssetInfo>
                    <AssetIcon>{asset.symbol}</AssetIcon>
                    <AssetDetails>
                      <AssetName>{asset.name}</AssetName>
                      <AssetSymbol>{asset.symbol}</AssetSymbol>
                    </AssetDetails>
                  </AssetInfo>
                  <AssetStats>
                    <AssetValue>
                      <ValueLabel>Balance</ValueLabel>
                      <ValueAmount>{asset.balance}</ValueAmount>
                    </AssetValue>
                    <AssetValue>
                      <ValueLabel>Value</ValueLabel>
                      <ValueAmount>{asset.value}</ValueAmount>
                    </AssetValue>
                    <APYValue>
                      <APYLabel>Supply APY</APYLabel>
                      <APYAmount>{asset.apy}</APYAmount>
                    </APYValue>
                  </AssetStats>
                </AssetItem>
              ))
            ) : (
              <EmptyState>
                <EmptyStateIcon>💰</EmptyStateIcon>
                <EmptyStateText>No supplied assets yet</EmptyStateText>
                <StartButton>Start Supplying</StartButton>
              </EmptyState>
            )}
          </AssetList>
        </PortfolioSection>

        <PortfolioSection>
          <SectionHeader>
            <SectionTitle>Borrowed Assets</SectionTitle>
            <ViewAllButton>View All →</ViewAllButton>
          </SectionHeader>
          <AssetList>
            {mockBorrowedAssets.length > 0 ? (
              mockBorrowedAssets.map((asset, index) => (
                <AssetItem key={index}>
                  <AssetInfo>
                    <AssetIcon>{asset.symbol}</AssetIcon>
                    <AssetDetails>
                      <AssetName>{asset.name}</AssetName>
                      <AssetSymbol>{asset.symbol}</AssetSymbol>
                    </AssetDetails>
                  </AssetInfo>
                  <AssetStats>
                    <AssetValue>
                      <ValueLabel>Balance</ValueLabel>
                      <ValueAmount>{asset.balance}</ValueAmount>
                    </AssetValue>
                    <AssetValue>
                      <ValueLabel>Value</ValueLabel>
                      <ValueAmount>{asset.value}</ValueAmount>
                    </AssetValue>
                    <APYValue>
                      <APYLabel>Borrow APR</APYLabel>
                      <APYAmount>{asset.apy}</APYAmount>
                    </APYValue>
                  </AssetStats>
                </AssetItem>
              ))
            ) : (
              <EmptyState>
                <EmptyStateIcon>🏦</EmptyStateIcon>
                <EmptyStateText>No borrowed assets yet</EmptyStateText>
                <StartButton>Start Borrowing</StartButton>
              </EmptyState>
            )}
          </AssetList>
        </PortfolioSection>
      </MainContent>
    </PortfolioContainer>
  );
};

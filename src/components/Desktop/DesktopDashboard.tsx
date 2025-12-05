"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { DesktopHeader } from './DesktopHeader';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
`;

const DashboardHeader = styled.div`
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
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
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
  color: ${({ $positive }) => $positive ? '#10b981' : '#ef4444'};
`;

const ActionSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
`;

const ActionCard = styled.div<{ $gradient?: boolean }>`
  background: ${({ $gradient }) => $gradient 
    ? 'linear-gradient(135deg, #06C755 0%, #059669 100%)' 
    : 'white'};
  color: ${({ $gradient }) => $gradient ? 'white' : '#1e293b'};
  padding: 32px;
  border-radius: 16px;
  border: ${({ $gradient }) => $gradient ? 'none' : '1px solid #e2e8f0'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }
`;

const ActionTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const ActionDescription = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
  opacity: 0.9;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  background: ${({ $primary }) => $primary ? 'white' : 'rgba(255, 255, 255, 0.2)'};
  color: ${({ $primary }) => $primary ? '#06C755' : 'white'};
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${({ $primary }) => $primary ? '#f8fafc' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const PortfolioSection = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
`;

const ViewAllButton = styled.button`
  background: none;
  border: 1px solid #06C755;
  color: #06C755;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #06C755;
    color: white;
  }
`;

const AssetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AssetItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    background: #e2e8f0;
  }
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AssetIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
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

const AssetType = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const AssetValue = styled.div`
  text-align: right;
`;

const AssetAmount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const AssetAPY = styled.div`
  font-size: 14px;
  color: #10b981;
  font-weight: 500;
`;

export const DesktopDashboard = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DashboardContainer> 
      
      <MainContent>
        <DashboardHeader>
          <PageTitle>Dashboard</PageTitle>
          <PageSubtitle>Overview of your lending portfolio and market performance</PageSubtitle>
        </DashboardHeader>

        <StatsGrid>
          <StatCard>
            <StatLabel>Net APY</StatLabel>
            <StatValue>6.8%</StatValue>
            <StatChange $positive>+0.3% today</StatChange>
          </StatCard>
          
          <StatCard>
            <StatLabel>Total Supply</StatLabel>
            <StatValue>$12,450</StatValue>
            <StatChange $positive>+$250 today</StatChange>
          </StatCard>
          
          <StatCard>
            <StatLabel>Total Borrow</StatLabel>
            <StatValue>$8,200</StatValue>
            <StatChange $positive>+$120 today</StatChange>
          </StatCard>
          
          <StatCard>
            <StatLabel>Health Factor</StatLabel>
            <StatValue>2.45</StatValue>
            <StatChange $positive>Safe</StatChange>
          </StatCard>
        </StatsGrid>

        <ActionSection>
          <ActionCard $gradient onClick={() => console.log('Supply clicked')}>
            <ActionTitle>Supply Assets</ActionTitle>
            <ActionDescription>
              Earn interest by supplying assets to the lending pool. Current best rates up to 8.1% APY.
            </ActionDescription>
            <ActionButton $primary>Start Supplying</ActionButton>
          </ActionCard>
          
          <ActionCard onClick={() => console.log('Borrow clicked')}>
            <ActionTitle>Borrow Assets</ActionTitle>
            <ActionDescription>
              Borrow against your collateral at competitive rates. Current borrow rates from 3.2% APR.
            </ActionDescription>
            <ActionButton>Start Borrowing</ActionButton>
          </ActionCard>
        </ActionSection>

        <PortfolioSection>
          <SectionHeader>
            <SectionTitle>Your Positions</SectionTitle>
            <ViewAllButton onClick={() => console.log('View all clicked')}>
              View All
            </ViewAllButton>
          </SectionHeader>
          
          <AssetList>
            <AssetItem>
              <AssetInfo>
                <AssetIcon>USDT</AssetIcon>
                <AssetDetails>
                  <AssetName>USDT</AssetName>
                  <AssetType>Supplied</AssetType>
                </AssetDetails>
              </AssetInfo>
              <AssetValue>
                <AssetAmount>$8,000</AssetAmount>
                <AssetAPY>5.2% APY</AssetAPY>
              </AssetValue>
            </AssetItem>
            
            <AssetItem>
              <AssetInfo>
                <AssetIcon>KAIA</AssetIcon>
                <AssetDetails>
                  <AssetName>KAIA</AssetName>
                  <AssetType>Supplied</AssetType>
                </AssetDetails>
              </AssetInfo>
              <AssetValue>
                <AssetAmount>$4,450</AssetAmount>
                <AssetAPY>6.8% APY</AssetAPY>
              </AssetValue>
            </AssetItem>
            
            <AssetItem>
              <AssetInfo>
                <AssetIcon>SIX</AssetIcon>
                <AssetDetails>
                  <AssetName>SIX</AssetName>
                  <AssetType>Borrowed</AssetType>
                </AssetDetails>
              </AssetInfo>
              <AssetValue>
                <AssetAmount>$8,200</AssetAmount>
                <AssetAPY>4.1% APR</AssetAPY>
              </AssetValue>
            </AssetItem>
          </AssetList>
        </PortfolioSection>
      </MainContent>
    </DashboardContainer>
  );
};

'use client';

import styled from 'styled-components';
import { useUserStore } from '@/stores/userStore';
import { useMarketStore } from '@/stores/marketStore';

const PageContainer = styled.div`
  flex: 1;
  padding: 20px 16px;
  padding-bottom: 80px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const PositionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PositionCard = styled.div<{ type: 'supply' | 'borrow' }>`
  background: ${props => props.type === 'supply' ? '#f0fdf4' : '#fef2f2'};
  border: 1px solid ${props => props.type === 'supply' ? '#00C300' : '#ef4444'};
  border-radius: 12px;
  padding: 16px;
`;

const PositionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const PositionInfo = styled.div`
  flex: 1;
`;

const PositionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const PositionAmount = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const PositionAPY = styled.div<{ type: 'supply' | 'borrow' }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.type === 'supply' ? '#00C300' : '#ef4444'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #00C300, #00A000);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 195, 0, 0.3);
  }
`;

export const PortfolioPage = () => {
  const { 
    positions, 
    totalSupplied, 
    totalBorrowed, 
    netAPY, 
    healthFactor 
  } = useUserStore();
  
  const { markets } = useMarketStore();

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const getMarketInfo = (marketId: string) => {
    return markets.find(m => m.id === marketId);
  };

  const handleStartLending = () => {
    alert('Navigate to Home > AI Deal Finder to start lending!');
  };

  return (
    <PageContainer>
      <PageTitle>Portfolio</PageTitle>
      <PageSubtitle>
        Track your lending and borrowing positions
      </PageSubtitle>

      {/* Portfolio Stats */}
      <StatsGrid>
        <StatCard>
          <StatValue>{formatValue(totalSupplied)}</StatValue>
          <StatLabel>Total Supplied</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{formatValue(totalBorrowed)}</StatValue>
          <StatLabel>Total Borrowed</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{netAPY.toFixed(2)}%</StatValue>
          <StatLabel>Net APY</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{healthFactor > 999 ? '∞' : healthFactor.toFixed(2)}</StatValue>
          <StatLabel>Health Factor</StatLabel>
        </StatCard>
      </StatsGrid>

      {positions.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="14" x="2" y="3" rx="2"/>
              <line x1="8" x2="16" y1="21" y2="21"/>
              <line x1="12" x2="12" y1="17" y2="21"/>
            </svg>
          </EmptyIcon>
          <h3 style={{ marginBottom: '8px', color: '#1e293b' }}>No positions yet</h3>
          <p style={{ marginBottom: '16px' }}>Start lending or borrowing to see your positions here</p>
          <ActionButton onClick={handleStartLending}>
            Start Lending
          </ActionButton>
        </EmptyState>
      ) : (
        <>
          {/* Supply Positions */}
          {positions.filter(p => p.type === 'supply').length > 0 && (
            <Card>
              <CardTitle>💰 Supply Positions</CardTitle>
              <PositionsList>
                {positions
                  .filter(p => p.type === 'supply')
                  .map(position => {
                    const market = getMarketInfo(position.marketId);
                    return (
                      <PositionCard key={position.id} type="supply">
                        <PositionHeader>
                          <PositionInfo>
                            <PositionTitle>
                              {market?.icon} {market?.symbol || position.marketId.toUpperCase()}
                            </PositionTitle>
                            <PositionAmount>
                              {position.amount.toFixed(2)} ({formatValue(position.usdValue)})
                            </PositionAmount>
                          </PositionInfo>
                          <PositionAPY type="supply">
                            {position.apy.toFixed(2)}% APY
                          </PositionAPY>
                        </PositionHeader>
                      </PositionCard>
                    );
                  })}
              </PositionsList>
            </Card>
          )}

          {/* Borrow Positions */}
          {positions.filter(p => p.type === 'borrow').length > 0 && (
            <Card>
              <CardTitle>📈 Borrow Positions</CardTitle>
              <PositionsList>
                {positions
                  .filter(p => p.type === 'borrow')
                  .map(position => {
                    const market = getMarketInfo(position.marketId);
                    return (
                      <PositionCard key={position.id} type="borrow">
                        <PositionHeader>
                          <PositionInfo>
                            <PositionTitle>
                              {market?.icon} {market?.symbol || position.marketId.toUpperCase()}
                            </PositionTitle>
                            <PositionAmount>
                              {position.amount.toFixed(2)} ({formatValue(position.usdValue)})
                            </PositionAmount>
                          </PositionInfo>
                          <PositionAPY type="borrow">
                            {position.apy.toFixed(2)}% APR
                          </PositionAPY>
                        </PositionHeader>
                      </PositionCard>
                    );
                  })}
              </PositionsList>
            </Card>
          )}
        </>
      )}
    </PageContainer>
  );
};

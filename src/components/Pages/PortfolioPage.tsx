'use client';

import styled from 'styled-components';
import { useContractUserStore } from '@/stores/contractUserStore';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useContractUserData } from '@/hooks/useContractUserData';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useModalStore } from '@/stores/modalStore';
import TokenIcon from '../Wallet/TokenIcon';
 
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

const PositionCard = styled.div<{ $type: 'supply' | 'borrow' | 'collateral' }>`
  background: ${props => 
    props.$type === 'supply' ? '#f0fdf4' : 
    props.$type === 'borrow' ? '#fef2f2' : 
    '#fff7ed'
  };
  border: 1px solid ${props => 
    props.$type === 'supply' ? '#00C300' : 
    props.$type === 'borrow' ? '#ef4444' : 
    '#f59e0b'
  };
  border-radius: 12px;
  padding: 16px;
`;

const PositionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const PositionInfo = styled.div`
  flex: 1;
`;

const PositionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PositionAmount = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

const PositionDetails = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

const PositionAPY = styled.div<{ $type: 'supply' | 'borrow' | 'collateral' }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => 
    props.$type === 'supply' ? '#00C300' : 
    props.$type === 'borrow' ? '#ef4444' : 
    '#f59e0b'
  };
  text-align: right;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #00C300, #00A000);
    color: white;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 195, 0, 0.3);
    }
  ` : `
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  `}
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

const StartButton = styled.button`
  background: linear-gradient(135deg, #00C300, #00A000);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 195, 0, 0.3);
  }
`;

const HealthFactorBadge = styled.div<{ $healthy: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.$healthy ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.$healthy ? '#166534' : '#991b1b'};
  margin-top: 8px;
`;

const LoadingCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: #64748b;
`;

export const PortfolioPage = () => {
  const { account } = useWalletAccountStore();
  const { openModal } = useModalStore();
   
  const { 
    positions, 
    totalSupplied, 
    totalBorrowed, 
    totalCollateralValue, 
    healthFactor,
    isLoading 
  } = useContractUserStore();
 
  
  const { markets } = useContractMarketStore();
  
  // Initialize contract user data fetching
  useContractUserData();

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMarketInfo = (marketId: string) => {
    return markets.find(m => m.id === marketId);
  };

  const handleStartLending = () => {
    openModal('ai-chat', { userQuery: 'Help me start my first lending position with low risk' });
  };

  const handleManagePosition = (positionId: string, type: 'withdraw' | 'repay' | 'supply-more') => {
    // For Phase 3 implementation
    alert(`${type} functionality coming in Phase 3!\nPosition ID: ${positionId}`);
  };
 
  const isHealthy = healthFactor > 1.5;

  // Filter positions by type
  const supplyPositions = positions.filter(p => p.type === 'supply' && !['wkaia', 'stkaia'].includes(p.marketId));
  const borrowPositions = positions.filter(p => p.type === 'borrow');
  const collateralPositions = positions.filter(p => ['wkaia', 'stkaia'].includes(p.marketId) && 
    (parseFloat(p.wkaiaCollateral || '0') > 0 || parseFloat(p.stkaiaCollateral || '0') > 0));

  if (!account) {
    return (
      <PageContainer>
        <PageTitle>Portfolio</PageTitle>
        <PageSubtitle>
          Connect your wallet to view your lending positions
        </PageSubtitle>
        
        <EmptyState>
          <EmptyIcon>💼</EmptyIcon>
          <h3 style={{ marginBottom: '8px', color: '#1e293b' }}>Connect Wallet</h3>
          <p style={{ marginBottom: '16px' }}>Connect your wallet to view your DeFi positions</p>
        </EmptyState>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageTitle>Portfolio</PageTitle>
        <PageSubtitle>
          Loading your positions from the blockchain...
        </PageSubtitle>
        
        <LoadingCard>
          🔄 Fetching your positions from smart contracts...
        </LoadingCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Portfolio</PageTitle>
      <PageSubtitle>
        Track your lending, borrowing, and collateral positions
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
          <StatValue>{formatValue(totalCollateralValue)}</StatValue>
          <StatLabel>Collateral Value</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{healthFactor > 999 ? '∞' : healthFactor.toFixed(2)}</StatValue>
          <StatLabel>Health Factor</StatLabel>
          <HealthFactorBadge $healthy={isHealthy}>
            {isHealthy ? 'Healthy' : 'At Risk'}
          </HealthFactorBadge>
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
          <StartButton onClick={handleStartLending}>
            Start Lending Now
          </StartButton>
        </EmptyState>
      ) : (
        <>
          {/* Supply Positions */}
          {supplyPositions.length > 0 && (
            <Card>
              <CardTitle>Supply Positions</CardTitle>
              <PositionsList>
                {supplyPositions.map(position => {
                  const market = getMarketInfo(position.marketId);
                  return (
                    <PositionCard key={position.id} $type="supply">
                      <PositionHeader>
                        <PositionInfo>
                          <PositionTitle>
                            <TokenIcon 
                              icon={market?.icon || '💰'} 
                              iconType={market?.iconType || 'emoji'}
                              alt={market?.name || position.marketId}
                              size={20}
                            />
                            {market?.symbol || position.marketId.toUpperCase()}
                          </PositionTitle>
                          <PositionAmount>
                            {parseFloat(position.amount).toFixed(4)} {market?.symbol} ({formatValue(position.usdValue)})
                          </PositionAmount>
                          <PositionDetails>
                            Started: {formatTime(position.timestamp || Date.now())}
                          </PositionDetails>
                        </PositionInfo>
                        <PositionAPY $type="supply">
                          {position.apy.toFixed(2)}% APY
                        </PositionAPY>
                      </PositionHeader>
                      <ActionButtons>
                        <ActionButton $variant="primary" onClick={() => handleManagePosition(position.id, 'supply-more')}>
                          Supply More
                        </ActionButton>
                        <ActionButton $variant="secondary" onClick={() => handleManagePosition(position.id, 'withdraw')}>
                          Withdraw
                        </ActionButton>
                      </ActionButtons>
                    </PositionCard>
                  );
                })}
              </PositionsList>
            </Card>
          )}
 

          {/* Borrow Positions */}
          {borrowPositions.length > 0 && (
            <Card>
              <CardTitle>Borrow Positions</CardTitle>
              <PositionsList>
                {borrowPositions.map(position => {
                  const market = getMarketInfo(position.marketId);
                  return (
                    <PositionCard key={position.id} $type="borrow">
                      <PositionHeader>
                        <PositionInfo>
                          <PositionTitle>
                            <TokenIcon 
                              icon={market?.icon || '📈'} 
                              iconType={market?.iconType || 'emoji'}
                              alt={market?.name || position.marketId}
                              size={20}
                            />
                            {market?.symbol || position.marketId.toUpperCase()}
                          </PositionTitle>
                          <PositionAmount>
                            {parseFloat(position.amount).toFixed(4)} {market?.symbol} ({formatValue(position.usdValue)})
                          </PositionAmount>
                          <PositionDetails>
                            Started: {formatTime(position.timestamp || Date.now())} | Health: {isHealthy ? 'Safe' : 'At Risk'}
                          </PositionDetails>
                        </PositionInfo>
                        <PositionAPY $type="borrow">
                          {position.apy.toFixed(2)}% APR
                        </PositionAPY>
                      </PositionHeader>
                      <ActionButtons>
                        <ActionButton $variant="primary" onClick={() => handleManagePosition(position.id, 'repay')}>
                          Repay
                        </ActionButton>
                        <ActionButton $variant="secondary" onClick={() => handleManagePosition(position.id, 'repay')}>
                          Partial Repay
                        </ActionButton>
                      </ActionButtons>
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
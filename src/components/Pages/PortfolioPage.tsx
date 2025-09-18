
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract } from '@/hooks/useMarketContract';
import { useMarketTokenBalances } from '@/hooks/useMarketTokenBalances';
import { useBorrowingPower } from '@/hooks/useBorrowingPower';
import { useModalStore } from '@/stores/modalStore';
import { PortfolioOverview } from '../Portfolio/PortfolioOverview';

const PageContainer = styled.div`
  flex: 1;
  padding: 20px 16px;
  padding-bottom: 80px;
  background: #f8fafc;
  min-height: 100vh;

  @media (max-width: 480px) {
    padding: 16px 12px;
    padding-bottom: 80px;
  }

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

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props =>
    props.$variant === 'primary' ? `
      background: linear-gradient(135deg, #00C300, #00A000);
      color: white;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 195, 0, 0.3);
      }
    ` : props.$variant === 'danger' ? `
      background: #ef4444;
      color: white;
      
      &:hover {
        background: #dc2626;
        transform: translateY(-1px);
      }
    ` : `
      background: white;
      color: #64748b;
      border: 1px solid #e2e8f0;
      
      &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
    `
  }
`;

const TabsContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const TabsHeader = styled.div`
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  color: ${({ $active }) => $active ? '#1e293b' : '#64748b'};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  ${({ $active }) => $active && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: #06c755;
    }
  `}

  &:hover {
    background: ${({ $active }) => $active ? 'white' : '#f1f5f9'};
  }

  @media (max-width: 480px) {
    padding: 14px 16px;
    font-size: 15px;
  }
`;

const TabContent = styled.div`
  padding: 24px;

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const TabTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 16px;
  }
`;

const PositionCount = styled.span`
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
`;

const EmptyTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  line-height: 1.5;
  max-width: 280px;
  margin: 0 auto;
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
  font-size: 24px;
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

const LoadingCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: #64748b;
`;

const TokenIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

interface Position {
  marketId: string;
  symbol: string;
  type: 'supply' | 'borrow';
  amount: string;
  usdValue: number;
  apy: number;
  icon: string;
}

export const PortfolioPage = () => {

  const [positions, setPositions] = useState<Position[]>([]);
  const [activeTab, setActiveTab] = useState<'supply' | 'borrow'>('supply');

  const [portfolioStats, setPortfolioStats] = useState({
    totalSupplyValue: 0,
    totalBorrowValue: 0,
    netPortfolioValue: 0,
    healthFactor: 999
  });
  const [borrowingPowerData, setBorrowingPowerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { account } = useWalletAccountStore();
  const { markets } = useContractMarketStore();
  const { getUserPosition } = useMarketContract(); 
  const { calculateBorrowingPower } = useBorrowingPower();
  const { openModal } = useModalStore();

  // Fetch user positions and borrowing power
  const fetchPositions = useCallback(async () => {
    if (!account || !markets.length) {
      setPositions([]);
      setBorrowingPowerData(null);
      return;
    }

    setIsLoading(true);

    try {
      const userPositions: Position[] = [];

      // Get borrowing power data
      const borrowingPower = await calculateBorrowingPower(account);
      setBorrowingPowerData(borrowingPower);

      for (const market of markets) {
        if (!market.isActive || !market.marketAddress) continue;

        const m: any = market
        const position = await getUserPosition(m.id, account);
        if (!position) continue;

        const supplyBalance = parseFloat(position.supplyBalance || '0');
        const borrowBalance = parseFloat(position.borrowBalance || '0');

        // Add supply position if user has supplied
        if (supplyBalance > 0) {
          userPositions.push({
            marketId: market.id,
            symbol: market.symbol,
            type: 'supply',
            amount: position.supplyBalance,
            usdValue: supplyBalance * market.price,
            apy: market.supplyAPY,
            icon: market.icon
          });
        }

        // Add borrow position if user has borrowed
        if (borrowBalance > 0) {
          userPositions.push({
            marketId: market.id,
            symbol: market.symbol,
            type: 'borrow',
            amount: position.borrowBalance,
            usdValue: borrowBalance * market.price,
            apy: market.borrowAPR,
            icon: market.icon
          });
        }
      }

      setPositions(userPositions);

      // Calculate portfolio stats
      const totalSupplyValue = userPositions
        .filter(p => p.type === 'supply')
        .reduce((sum, p) => sum + p.usdValue, 0);

      const totalBorrowValue = userPositions
        .filter(p => p.type === 'borrow')
        .reduce((sum, p) => sum + p.usdValue, 0);

      setPortfolioStats({
        totalSupplyValue,
        totalBorrowValue,
        netPortfolioValue: totalSupplyValue - totalBorrowValue,
        healthFactor: parseFloat(borrowingPower.healthFactor)
      });

    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account, markets, getUserPosition, calculateBorrowingPower]);

  // Fetch positions when account or markets change
  useEffect(() => {
    fetchPositions();
  }, [account]);

  const handleAction = (action: string, position: Position) => {
    const market = markets.find(m => m.id === position.marketId);
    if (!market) return;

    switch (action) {
      case 'withdraw':
        openModal('withdraw', {
          market,
          currentSupply: position.amount,
          maxWithdraw: position.amount
        });
        break;
      case 'supply-more':
        openModal('supply', { preSelectedMarket: market });
        break;
      case 'repay':
        openModal('repay', {
          market,
          currentDebt: position.amount,
          totalDebt: position.amount
        });
        break;
      case 'borrow-more':
        openModal('borrow', { preSelectedMarket: market });
        break;
    }
  };

  const renderPosition = (position: Position) => (
    <PositionCard key={`${position.marketId}-${position.type}`} $type={position.type}>
      <PositionHeader>
        <PositionInfo>
          <PositionTitle>
            <TokenIcon src={position.icon} alt={position.symbol} />
            {position.symbol} {position.type === 'supply' ? 'Supply' : 'Borrow'}
          </PositionTitle>
          <PositionAmount>
            {parseFloat(position.amount).toFixed(4)} {position.symbol}
          </PositionAmount>
          <PositionDetails>
            ${position.usdValue.toFixed(2)} USD
          </PositionDetails>
        </PositionInfo>
        <PositionAPY $type={position.type}>
          {position.apy.toFixed(2)}%
        </PositionAPY>
      </PositionHeader>

      <ActionButtons>
        {position.type === 'supply' ? (
          <>
            <ActionButton onClick={() => handleAction('withdraw', position)}>
              Withdraw
            </ActionButton>
            <ActionButton
              $variant="primary"
              onClick={() => handleAction('supply-more', position)}
            >
              Supply More
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton
              $variant="danger"
              onClick={() => handleAction('repay', position)}
            >
              Repay
            </ActionButton>
            <ActionButton onClick={() => handleAction('borrow-more', position)}>
              Borrow More
            </ActionButton>
          </>
        )}
      </ActionButtons>
    </PositionCard>
  );

  if (!account) {
    return (
      <PageContainer>
        <PageTitle>Portfolio</PageTitle>
        <PageSubtitle>
          Connect your wallet to view your lending positions
        </PageSubtitle>
        <EmptyState>
          <EmptyIcon>👤</EmptyIcon>
          <h3 style={{ marginBottom: '8px', color: '#1e293b' }}>Wallet Not Connected</h3>
          <p>Please connect your wallet to access this section</p>
        </EmptyState>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageTitle>Portfolio</PageTitle>
        <PageSubtitle>
          Your lending and borrowing positions
        </PageSubtitle>
        <LoadingCard>
          Loading your portfolio...
        </LoadingCard>
      </PageContainer>
    );
  }

  const supplyPositions = positions.filter(p => p.type === 'supply');
  const borrowPositions = positions.filter(p => p.type === 'borrow');
  const hasPositions = positions.length > 0;

  return (
    <PageContainer>
      <PageTitle>Portfolio</PageTitle>
      <PageSubtitle>
        Your lending and borrowing positions
      </PageSubtitle>

      {
        hasPositions ? (
          <>
            <PortfolioOverview
              portfolioStats={portfolioStats}
              borrowingPowerData={borrowingPowerData}
              isLoading={isLoading}
            />

            {/* Tabbed Positions */}
            <TabsContainer>
              <TabsHeader>
                <Tab
                  $active={activeTab === 'supply'}
                  onClick={() => setActiveTab('supply')}
                >
                  Supply Positions
                  {supplyPositions.length > 0 && (
                    <PositionCount>{supplyPositions.length}</PositionCount>
                  )}
                </Tab>
                <Tab
                  $active={activeTab === 'borrow'}
                  onClick={() => setActiveTab('borrow')}
                >
                  Borrow Positions
                  {borrowPositions.length > 0 && (
                    <PositionCount>{borrowPositions.length}</PositionCount>
                  )}
                </Tab>
              </TabsHeader>

              <TabContent>
                {activeTab === 'supply' && (
                  <>
                    {supplyPositions.length > 0 ? (
                      <>
                        {/* <TabTitle>
                          Your Supply Positions
                          <PositionCount>{supplyPositions.length}</PositionCount>
                        </TabTitle> */}
                        <PositionsList>
                          {supplyPositions.map(renderPosition)}
                        </PositionsList>
                      </>
                    ) : (
                      <EmptyState> 
                        <EmptyTitle>No Supply Positions</EmptyTitle>
                        <EmptyDescription>
                          You haven't supplied any assets yet. Start earning interest by supplying tokens to the protocol.
                        </EmptyDescription>
                      </EmptyState>
                    )}
                  </>
                )}

                {activeTab === 'borrow' && (
                  <>
                    {borrowPositions.length > 0 ? (
                      <>
                        {/* <TabTitle>
                          Your Borrow Positions
                          <PositionCount>{borrowPositions.length}</PositionCount>
                        </TabTitle> */}
                        <PositionsList>
                          {borrowPositions.map(renderPosition)}
                        </PositionsList>
                      </>
                    ) : (
                      <EmptyState> 
                        <EmptyTitle>No Borrow Positions</EmptyTitle>
                        <EmptyDescription>
                          You haven't borrowed any assets yet. Use your supplied assets as collateral to borrow tokens.
                        </EmptyDescription>
                      </EmptyState>
                    )}
                  </>
                )}
              </TabContent>
            </TabsContainer>
          </>
        ) : (
          <EmptyState>
            <EmptyIcon>📊</EmptyIcon>
            <div style={{ marginBottom: '16px' }}>No positions found</div>
            <div style={{ fontSize: '14px', marginBottom: '24px' }}>
              Start by supplying assets to earn interest or borrowing against your collateral
            </div>
            <StartButton onClick={() => openModal('supply')}>
              Start Lending
            </StartButton>
          </EmptyState>
        )
      }
    </PageContainer >
  );
};
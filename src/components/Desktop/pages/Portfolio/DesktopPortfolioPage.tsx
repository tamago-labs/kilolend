"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract } from '@/hooks/v1/useMarketContract'; 
import { useBorrowingPower } from '@/hooks/v1/useBorrowingPower';
import { useModalStore } from '@/stores/modalStore';

// Import desktop components
import { DesktopPortfolioHeader } from './components/DesktopPortfolioHeader';
import { DesktopPortfolioStats } from './components/DesktopPortfolioStats';
import { DesktopPortfolioTabs } from './components/DesktopPortfolioTabs';
import { DesktopPortfolioTable } from './components/DesktopPortfolioTable';
import { DesktopEmptyState } from './components/DesktopEmptyState';

// Import desktop modals
import { DesktopWithdrawModal, DesktopRepayModal } from '@/components/Desktop/modals';

const PortfolioContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
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

const PortfolioStatsSkeleton = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCardSkeleton = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
`;

const StatSkeletonLine = styled.div<{ $width?: string; $height?: string }>`
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '16px'};
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

interface Position {
  marketId: string;
  symbol: string;
  type: 'supply' | 'borrow';
  amount: string;
  usdValue: number;
  apy: number;
  icon: string;
  market: any;
}

export const DesktopPortfolio = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [borrowingPowerData, setBorrowingPowerData] = useState<any>(null);

  const [portfolioStats, setPortfolioStats] = useState({
    totalSupplyValue: 0,
    totalBorrowValue: 0,
    netPortfolioValue: 0,
    healthFactor: 999
  });

  // Tab and sorting states
  const [activeTab, setActiveTab] = useState('supply');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('value-desc');

  // Modal states
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [repayModalOpen, setRepayModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const { account } = useWalletAccountStore();
  const { markets } = useContractMarketStore();
  const { getUserPosition } = useMarketContract(); 
  const { calculateBorrowingPower } = useBorrowingPower(); 

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

        const position = await getUserPosition(market.id as any, account);
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
            icon: market.icon,
            market
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
            icon: market.icon,
            market
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
  }, [account, markets]);

  // Fetch positions when account or markets change
  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const handleAction = (action: string, position: Position) => {
    setSelectedPosition(position);

    switch (action) {
      case 'withdraw':
        setWithdrawModalOpen(true);
        break;
      case 'repay':
        setRepayModalOpen(true);
        break;
    }
  };

  const handleCloseModal = () => {
    setWithdrawModalOpen(false);
    setRepayModalOpen(false);
    setSelectedPosition(null);
    
    // Refresh data after modal closes
    setTimeout(() => {
      fetchPositions();
    }, 1000);
  };

  // Filter and sort positions based on active tab and search
  const getFilteredAndSortedPositions = useCallback(() => {
    let filteredPositions = positions.filter(p => p.type === activeTab);
    
    // Apply search filter
    if (searchTerm) {
      filteredPositions = filteredPositions.filter(p => 
        p.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.market?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filteredPositions.sort((a, b) => {
      switch (sortBy) {
        case 'value-desc':
          return b.usdValue - a.usdValue;
        case 'value-asc':
          return a.usdValue - b.usdValue;
        case 'apy-desc':
          return b.apy - a.apy;
        case 'apy-asc':
          return a.apy - b.apy;
        case 'balance-desc':
          return parseFloat(b.amount) - parseFloat(a.amount);
        case 'balance-asc':
          return parseFloat(a.amount) - parseFloat(b.amount);
        case 'name-asc':
          return a.symbol.localeCompare(b.symbol);
        case 'name-desc':
          return b.symbol.localeCompare(a.symbol);
        default:
          return b.usdValue - a.usdValue;
      }
    });

    return filteredPositions;
  }, [positions, activeTab, searchTerm, sortBy]);

  // Loading state component
  const renderLoadingState = () => (
    <LoadingState>
      <LoadingSpinner />
      <LoadingTitle>Loading Your Portfolio</LoadingTitle>
      <LoadingSubtitle>Fetching your positions and calculating borrowing power...</LoadingSubtitle>
      
      <PortfolioStatsSkeleton>
        <StatCardSkeleton>
          <StatSkeletonLine $width="60%" $height="12px" />
          <StatSkeletonLine $width="40%" $height="24px" />
          <StatSkeletonLine $width="80%" $height="14px" />
        </StatCardSkeleton>
        <StatCardSkeleton>
          <StatSkeletonLine $width="60%" $height="12px" />
          <StatSkeletonLine $width="40%" $height="24px" />
          <StatSkeletonLine $width="80%" $height="14px" />
        </StatCardSkeleton>
        <StatCardSkeleton>
          <StatSkeletonLine $width="60%" $height="12px" />
          <StatSkeletonLine $width="40%" $height="24px" />
          <StatSkeletonLine $width="80%" $height="14px" />
        </StatCardSkeleton>
        <StatCardSkeleton>
          <StatSkeletonLine $width="60%" $height="12px" />
          <StatSkeletonLine $width="40%" $height="24px" />
          <StatSkeletonLine $width="80%" $height="14px" />
        </StatCardSkeleton>
      </PortfolioStatsSkeleton>
    </LoadingState>
  );

  const filteredPositions = getFilteredAndSortedPositions();
  const hasPositions = positions.length > 0;
  const isConnected = !!account;

  return (
    <PortfolioContainer>
      <MainContent>
        <DesktopPortfolioHeader 
          account={account}
          isLoading={isLoading}
        />

        {/* Show loading state when account is connected and data is loading */}
        {(account && isLoading && borrowingPowerData === null) ? (
          renderLoadingState()
        ) : (
          <>
            {/* Show portfolio stats when account is connected and not loading */}
            {account && (
              <DesktopPortfolioStats 
                portfolioStats={portfolioStats}
                borrowingPowerData={borrowingPowerData}
                isLoading={isLoading}
              />
            )}

            {/* Show portfolio content when user has positions */}
            {hasPositions ? (
              <>
                <DesktopPortfolioTabs
                  activeTab={activeTab}
                  searchTerm={searchTerm}
                  sortBy={sortBy}
                  onTabChange={setActiveTab}
                  onSearchChange={setSearchTerm}
                  onSortChange={setSortBy}
                />
                
                <DesktopPortfolioTable
                  positions={filteredPositions}
                  onAction={handleAction}
                  type={activeTab as 'supply' | 'borrow'}
                />
              </>
            ) : (
              /* Show empty state when user has no positions */
              <DesktopEmptyState isConnected={isConnected} />
            )}
          </>
        )}
      </MainContent>

      {/* Desktop Modals - Only show when visible state is true */}
      {withdrawModalOpen && (
        <DesktopWithdrawModal
          isOpen={withdrawModalOpen}
          onClose={handleCloseModal}
          preSelectedMarket={selectedPosition?.market}
        />
      )}

      {repayModalOpen && (
        <DesktopRepayModal
          isOpen={repayModalOpen}
          onClose={handleCloseModal}
          preSelectedMarket={selectedPosition?.market}
        />
      )}
    </PortfolioContainer>
  );
};

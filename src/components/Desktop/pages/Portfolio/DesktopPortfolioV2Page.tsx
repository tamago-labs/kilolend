"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract } from '@/hooks/v2/useMarketContract';
import { useChainId } from "wagmi"
import { useBorrowingPowerV2 } from '@/hooks/v2/useBorrowingPower';
import { useTokenBalancesV2 } from '@/hooks/useTokenBalancesV2';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';

// Import desktop components from Portfolio
import { DesktopPortfolioHeader } from './components/DesktopPortfolioHeader';
import { DesktopPortfolioTabs } from './components/DesktopPortfolioTabs';
import { DesktopPortfolioTable } from './components/DesktopPortfolioTable';
import { DesktopEmptyState } from './components/DesktopEmptyState';
import { PortfolioStats } from './components/PortfolioStats';
import { DesktopWithdrawModal, DesktopRepayModal } from '@/components/Desktop/modals';

// Import components from Balances
import { MainWalletSection } from '../Balances/components/MainWalletSection';
import { AgentWalletsBanner } from './components/AgentWalletsBanner';

import { useInterval } from 'usehooks-ts'

// Import styled components
import {
  PortfolioContainer,
  MainContent,
  LoadingState,
  LoadingSpinner,
  LoadingTitle,
  LoadingSubtitle,
  SideTabContainer,
  SideTabNavigation,
  SideTabButton,
  SideTabContent,
  ContentTitle,
  ContentSubtitle,
} from './DesktopPortfolioV2Page.styles';
import { useAuth } from '@/contexts/ChainContext';
import { DesktopWithdrawModalWeb3 } from '../../modals/PortfolioModal/DesktopWithdrawModalWeb3';
import { DesktopRepayModalWeb3 } from '../../modals/PortfolioModal/DesktopRepayModalWeb3';
import { useMultiChainMarketData } from '@/hooks/v2/useMultiChainMarketData';

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

export const DesktopPortfolioV2 = () => {

  const { selectedAuthMethod } = useAuth()

  const [delay, setDelay] = useState<number>(1000)
  const chainId = useChainId();

  // Wallet and market states
  const { account } = useWalletAccountStore();
  const { markets } = useContractMarketStore();
  const multichainData = useMultiChainMarketData()

  const { balances, refetch } = useTokenBalancesV2();
  const { prices } = usePriceUpdates({
    symbols: ["KAIA", "USDT", "STAKED_KAIA", "MARBLEX", "BORA", "SIX", "XTZ", "KUB"]
  });

  // Portfolio positions state
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [borrowingPowerData, setBorrowingPowerData] = useState<any>(null);

  const [portfolioStats, setPortfolioStats] = useState({
    totalSupplyValue: 0,
    totalBorrowValue: 0,
    netPortfolioValue: 0,
    healthFactor: 999
  });

  // Side tab state - Lending Positions is default
  const [activeSideTab, setActiveSideTab] = useState<'lending' | 'wallet'>('lending');

  // Tab and sorting states (for lending positions)
  const [activeTab, setActiveTab] = useState('supply');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('value-desc');

  // Modal states
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [repayModalOpen, setRepayModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  // Hooks
  const { getUserPosition } = useMarketContract();
  const { calculateBorrowingPower, isLoading: isBorrowingPowerLoading } = useBorrowingPowerV2();

  // Calculate wallet balance value
  const calculateWalletBalanceValue = useCallback(() => {
    return balances.reduce((total: number, token: any) => {
      const priceKey = token.symbol === 'MBX' ? 'MARBLEX' : token.symbol;
      const price = prices[priceKey];
      const balance = parseFloat(token.balance || '0');
      return total + (price ? balance * price.price : 0);
    }, 0);
  }, [balances, prices]);

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

      // Filter markets by current chain ID
      const currentChainMarkets = markets.filter(market => market.chainId === chainId);
      console.log(`Fetching positions for chain ${chainId}, found ${currentChainMarkets.length} markets`);

      // Get borrowing power data
      const borrowingPower = await calculateBorrowingPower(account);

      setBorrowingPowerData(borrowingPower);

      for (const market of currentChainMarkets) {
        if (!market.isActive) continue;

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
  }, [account, markets, chainId, getUserPosition, calculateBorrowingPower]);


  useEffect(() => {
    if (account && chainId) {
      setDelay(1000)
    }
  }, [account, chainId])

  useInterval(
    () => {
      if (account && !isLoading && !multichainData.isLoading) {
        fetchPositions()
        setDelay(60000)
      }
    },
    delay,
  )

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
      refetch();
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
      <LoadingSubtitle>Fetching your balances, positions and calculating portfolio value...</LoadingSubtitle>
    </LoadingState>
  );

  // Combined loading state for portfolio stats
  const isDataLoading = isLoading || isBorrowingPowerLoading;

  // Enhanced stats calculation
  const walletBalanceValue = calculateWalletBalanceValue();
  const totalNetWorth = walletBalanceValue + portfolioStats.netPortfolioValue;
  const hasPositions = positions.length > 0;
  const hasBalances = balances.length > 0;
  const isConnected = !!account;
  const filteredPositions = getFilteredAndSortedPositions();

  return (
    <PortfolioContainer>
      <MainContent>
        <DesktopPortfolioHeader
          account={account}
          isLoading={isDataLoading}
        />

        {/* Show loading state when account is connected and data is loading */}
        {(account && isLoading && borrowingPowerData === null) ? (
          renderLoadingState()
        ) : (
          <>
            {/* Portfolio Stats */}
            {account && (
              <PortfolioStats
                walletBalanceValue={walletBalanceValue}
                totalSupplyValue={portfolioStats.totalSupplyValue}
                totalBorrowValue={portfolioStats.totalBorrowValue}
                healthFactor={portfolioStats.healthFactor}
                isLoading={isDataLoading}
              />
            )}

            {/* Side Tab Navigation */}
            <SideTabContainer>
              <SideTabNavigation>
                <SideTabButton
                  $active={activeSideTab === 'lending'}
                  onClick={() => setActiveSideTab('lending')}
                >
                  Lending Positions
                </SideTabButton>
                <SideTabButton
                  $active={activeSideTab === 'wallet'}
                  onClick={() => setActiveSideTab('wallet')}
                >
                  Wallet Balances
                </SideTabButton>
              </SideTabNavigation>

              <SideTabContent>
                {activeSideTab === 'lending' ? (
                  <>
                    <ContentTitle>
                      Lending Positions
                    </ContentTitle>
                    <ContentSubtitle>
                      Manage your lending activities and track your earnings.
                    </ContentSubtitle>

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
                      <DesktopEmptyState isConnected={isConnected} />
                    )}
                  </>
                ) : (
                  <>
                    <ContentTitle>
                      Wallet Balances
                    </ContentTitle>
                    <ContentSubtitle>
                      Your available token balances that can be used for lending or borrowing.
                    </ContentSubtitle>

                    {hasBalances ? (
                      <MainWalletSection
                        balances={balances}
                        prices={prices}
                      />
                    ) : (
                      <DesktopEmptyState isConnected={isConnected} />
                    )}
                  </>
                )}
              </SideTabContent>
            </SideTabContainer>
          </>
        )}

        {/* Show AI-Agent Wallets Banner for connected users */}
        {account && <AgentWalletsBanner />}

      </MainContent>

      {/* Desktop Modals - Only show when visible state is true */}
      {(withdrawModalOpen && selectedAuthMethod === "line_sdk") && (
        <DesktopWithdrawModal
          isOpen={withdrawModalOpen}
          onClose={handleCloseModal}
          preSelectedMarket={selectedPosition?.market}
        />
      )}

      {(withdrawModalOpen && selectedAuthMethod === "web3_wallet") && (
        <DesktopWithdrawModalWeb3
          isOpen={withdrawModalOpen}
          onClose={handleCloseModal}
          preSelectedMarket={selectedPosition?.market}
        />
      )}

      {(repayModalOpen && selectedAuthMethod === "line_sdk") && (
        <DesktopRepayModal
          isOpen={repayModalOpen}
          onClose={handleCloseModal}
          preSelectedMarket={selectedPosition?.market}
        />
      )}

      {(repayModalOpen && selectedAuthMethod === "web3_wallet") && (
        <DesktopRepayModalWeb3
          isOpen={repayModalOpen}
          onClose={handleCloseModal}
          preSelectedMarket={selectedPosition?.market}
        />
      )}

    </PortfolioContainer>
  );
};
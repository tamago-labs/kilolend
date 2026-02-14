"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { DesktopMarketStatsV2 } from './DesktopMarketStatsV2';
import { DesktopMarketFiltersV2 } from './DesktopMarketFiltersV2';
import { DesktopMarketTableV2 } from './DesktopMarketTableV2';
import { KiloPointsBanner } from '@/components/Desktop/pages/Markets/components/KiloPointsBanner';
import { CHAIN_CONFIGS } from '@/utils/chainConfig';
import { Chain } from './ChainSelector';

const MarketsContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
`;

const MarketsHeader = styled.div`
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

export const DesktopMarketsV2 = () => {
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('supply-apy-desc');
  const [selectedChain, setSelectedChain] = useState('all');

  // Define available chains from config
  const chains: Chain[] = [
    { 
      id: 'all', 
      name: 'All Chains', 
      chainId: 0, 
      icon: '/images/blockchain-icons/all-chains.png'
    },
    ...Object.values(CHAIN_CONFIGS).map(config => ({
      id: config.chainId.toString(),
      name: config.chainName,
      chainId: config.chainId,
      icon: config.icon
    }))
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <MarketsContainer>
      <MainContent>
        <MarketsHeader>
          <PageTitle>Multi-Chain Lending Markets</PageTitle>
          <PageSubtitle>Browse and compare lending rates across KAIA, KUB, and Etherlink</PageSubtitle>
        </MarketsHeader>

        <DesktopMarketStatsV2 />

        <DesktopMarketFiltersV2
          activeFilter={activeFilter}
          searchTerm={searchTerm}
          sortBy={sortBy}
          selectedChain={selectedChain}
          chains={chains}
          onFilterChange={setActiveFilter}
          onSearchChange={setSearchTerm}
          onSortChange={setSortBy}
          onChainChange={setSelectedChain}
        />

        <DesktopMarketTableV2
          searchTerm={searchTerm}
          activeFilter={activeFilter}
          sortBy={sortBy}
          selectedChain={selectedChain}
        />

        <KiloPointsBanner />
      </MainContent>
    </MarketsContainer>
  );
};

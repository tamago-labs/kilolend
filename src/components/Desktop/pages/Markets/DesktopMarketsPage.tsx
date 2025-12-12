"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { DesktopMarketStats } from '@/components/Desktop/pages/Markets/components/DesktopMarketStats';
import { DesktopMarketFilters } from '@/components/Desktop/pages/Markets/components/DesktopMarketFilters';
import { DesktopMarketTable } from '@/components/Desktop/pages/Markets/components/DesktopMarketTable';

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

export const DesktopMarkets = () => {

  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('supply-apy-desc');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <MarketsContainer> 
      <MainContent>
        <MarketsHeader>
          <PageTitle>Markets</PageTitle>
          <PageSubtitle>Browse and compare lending rates across all supported assets</PageSubtitle>
        </MarketsHeader>

        <DesktopMarketStats />

        <DesktopMarketFilters
          activeFilter={activeFilter}
          searchTerm={searchTerm}
          sortBy={sortBy}
          onFilterChange={setActiveFilter}
          onSearchChange={setSearchTerm}
          onSortChange={setSortBy}
        />

        <DesktopMarketTable
          searchTerm={searchTerm}
          activeFilter={activeFilter}
          sortBy={sortBy}
        />
      </MainContent>
    </MarketsContainer>
  );
};

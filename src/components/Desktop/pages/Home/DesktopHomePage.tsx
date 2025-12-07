"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { ActionSection } from './components/ActionSection';
import { PortfolioSection } from './components/PortfolioSection';

const HomeContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
`;

export const DesktopHome = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    // Open LINE mini dapp or redirect
    window.open('https://liff.line.me/2007932254-AVnKMMp9', '_blank');
  };

  const handleTryDesktop = () => {
    // Navigate to markets or supply section
    console.log('Navigate to desktop version');
  };

  const handleSupplyClick = () => {
    console.log('Supply clicked');
  };

  const handleBorrowClick = () => {
    console.log('Borrow clicked');
  };

  const handleViewAllClick = () => {
    console.log('View all clicked');
  };

  const assets = [
    {
      symbol: 'USDT',
      name: 'USDT',
      type: 'Supplied' as const,
      amount: '$8,000',
      apy: '5.2% APY'
    },
    {
      symbol: 'KAIA',
      name: 'KAIA',
      type: 'Supplied' as const,
      amount: '$4,450',
      apy: '6.8% APY'
    },
    {
      symbol: 'SIX',
      name: 'SIX',
      type: 'Borrowed' as const,
      amount: '$8,200',
      apy: '4.1% APR'
    }
  ];

  if (!mounted) return null;

  return (
    <HomeContainer> 
      <MainContent>
        <HeroSection 
          onGetStarted={handleGetStarted}
          onTryDesktop={handleTryDesktop}
        />

        <ActionSection 
          onSupplyClick={handleSupplyClick}
          onBorrowClick={handleBorrowClick}
        />

        <PortfolioSection 
          assets={assets}
          onViewAllClick={handleViewAllClick}
        />
      </MainContent>
    </HomeContainer>
  );
};

"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { MarketSection } from './components/MarketSection';
import { AISection } from './components/AISection';
import { UserTypesSection } from './components/UserTypesSection';
import { FAQSection } from './components/FAQSection'; 
import { useRouter } from 'next/navigation';

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

  const router = useRouter()

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    // Open LINE mini dapp or redirect
    window.open('https://liff.line.me/2007932254-AVnKMMp9', '_blank');
  };

  const handleTryDesktop = () => {
    router.push("/markets")
  };
 

  if (!mounted) return null;

  return (
    <HomeContainer>
      <MainContent>
        <HeroSection
          onGetStarted={handleGetStarted}
          onTryDesktop={handleTryDesktop}
        />

        <MarketSection
          onGetStarted={handleGetStarted}
        />

        <AISection/>

        <UserTypesSection/>

        <FAQSection/>

      </MainContent> 
    </HomeContainer>
  );
};

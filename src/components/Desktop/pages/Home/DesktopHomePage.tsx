"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { MarketSection } from './components/MarketSection';
import { AISection } from './components/AISection';
import { UserTypesSection } from './components/UserTypesSection';
import { FAQSection } from './components/FAQSection'; 
import { useRouter } from 'next/navigation';
import { LineMiniDAppModal, DesktopAIAgentModal } from '../../modals';
import { useModalStore } from '@/stores/modalStore';

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
  const { openModal, closeModal, activeModal } = useModalStore();
  const router = useRouter()

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    // Open LINE mini dapp modal
    openModal('lineMiniDApp');
  };

  const handleTryDesktop = () => {
    router.push("/markets")
  };

  const handleAIAgent = () => {
    openModal('ai-agent');
  };
 

  if (!mounted) return null;

  return (
    <HomeContainer>
      <MainContent>
        <HeroSection
          onGetStarted={handleGetStarted}
          onTryDesktop={handleTryDesktop}
          onAIAgent={handleAIAgent}
        />

        <MarketSection
          onGetStarted={handleGetStarted}
        />

        <AISection/>

        <UserTypesSection/>

        <FAQSection/>

      </MainContent> 

      <LineMiniDAppModal
        isOpen={activeModal === 'lineMiniDApp'}
        onClose={() => closeModal()}
      />
      
      <DesktopAIAgentModal
        isOpen={activeModal === 'ai-agent'}
        onClose={() => closeModal()}
      />
    </HomeContainer>
  );
};

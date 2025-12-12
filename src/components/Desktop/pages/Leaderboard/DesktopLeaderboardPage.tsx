"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { SliderBanner } from './components/SliderBanner';
import { LeaderboardTable } from './components/LeaderboardTable';
import { UserPointsSection } from './components/UserPointsSection';

const LeaderboardContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
  
  @media (max-width: 1200px) {
    padding: 24px;
  }
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const PageSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
  align-items: start;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const LeaderboardSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const UserPointsSectionWrapper = styled.div`
  position: sticky;
  top: 32px;
  
  @media (max-width: 1200px) {
    position: static;
  }
`;

export const DesktopLeaderboard = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <LeaderboardContainer> 
      <MainContent>
        <PageHeader>
          <PageTitle> 
            KILO Points Leaderboard
          </PageTitle>
          <PageSubtitle>Earn KILO points daily and climb the ranks - your points are 1:1 redeemable for tokens at launch</PageSubtitle>
        </PageHeader>

        <ContentGrid>
          <LeaderboardSection>
            <LeaderboardTable />
          </LeaderboardSection>
          
          <UserPointsSectionWrapper>
            <SliderBanner />
            <UserPointsSection />
          </UserPointsSectionWrapper>
        </ContentGrid>
      </MainContent>
    </LeaderboardContainer>
  );
};

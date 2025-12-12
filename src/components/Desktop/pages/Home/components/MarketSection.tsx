"use client";

import styled from 'styled-components';
import { MarketAPYCard } from './MarketAPYCard';
import { AILeverageCard } from './AILeverageCard';

// Market Section Styles
const MarketSectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    gap: 20px;
  }
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  min-height: 400px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
    min-height: 350px;
  }
`;

interface MarketSectionProps {
  onGetStarted?: () => void;
}

export const MarketSection = ({ onGetStarted }: MarketSectionProps) => {
  return (
    <MarketSectionWrapper>


      <BottomRow>
        <MarketAPYCard />
        <AILeverageCard />
      </BottomRow>
    </MarketSectionWrapper>
  );
};

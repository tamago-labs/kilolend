"use client";

import styled from 'styled-components';
import { MarketAPYCard } from './MarketAPYCard';

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

const ContentRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

// Left Column Content Styles
const ContentCard = styled.div`
  background: white;
  color: #1e293b;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const ContentTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 16px;
  }
`;

const ContentDescription = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #64748b;
  margin-bottom: 32px;
  flex: 1;

  @media (max-width: 768px) {
    font-size: 15px;
    margin-bottom: 24px;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 16px;
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    font-size: 15px;
    margin-bottom: 12px;
  }
`;

const FeatureBullet = styled.div`
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #06C755, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 12px;
  }
`;

interface MarketSectionProps {
  onGetStarted?: () => void;
}

export const MarketSection = ({ onGetStarted }: MarketSectionProps) => {
  return (
    <MarketSectionWrapper>
      <ContentRow>
        <ContentCard>
          <ContentTitle>
            Put your assets to work — whether human or AI-agent
          </ContentTitle>
          <ContentDescription>
            KiloLend offers real-time market access. Supply assets to earn competitive yields, borrow against your collateral, or enable AI agents to automatically manage your positions for optimal returns.
          </ContentDescription>
          <FeatureList>
            <FeatureItem>
              <FeatureBullet>✓</FeatureBullet>
              Agent-native DeFi markets
            </FeatureItem>
            <FeatureItem>
              <FeatureBullet>✓</FeatureBullet>
              Automated lending, borrowing, and swaps
            </FeatureItem>
            <FeatureItem>
              <FeatureBullet>✓</FeatureBullet>
              Programmatic access via API keys
            </FeatureItem>
            <FeatureItem>
              <FeatureBullet>✓</FeatureBullet>
              On-chain execution with user controls
            </FeatureItem>
          </FeatureList>
        </ContentCard>
        <MarketAPYCard />
      </ContentRow>
    </MarketSectionWrapper>
  );
};

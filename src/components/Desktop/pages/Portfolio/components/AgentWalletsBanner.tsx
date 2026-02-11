"use client";

import styled from 'styled-components';
import { ArrowRight } from 'react-feather';
import { useRouter } from 'next/navigation';

// Pure LINE Green Gradient
const LINE_GREEN_GRADIENT = 'linear-gradient(135deg, #06C755, #05b648)';

const BannerContainer = styled.div`
  background: ${LINE_GREEN_GRADIENT};
  border-radius: 12px;
  padding: 20px 24px;
  margin: 24px 0; 
  position: relative;
  overflow: hidden;
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 16px 20px;
    margin: 20px 0;
  }
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
`;

const TextContent = styled.div`
  flex: 1;
`;

const BannerTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const BannerSubtitle = styled.p`
  font-size: 16px;
  line-height: 1.4;
  margin: 0;
  opacity: 0.95;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const CTAButton = styled.button`
  background: white;
  color: #1e293b;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  &:hover {
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

export const AgentWalletsBanner = () => {
  const router = useRouter();

  const handleCTAClick = () => {
    router.push('/agent-wallets');
  };

  return (
    <BannerContainer>
      <BannerContent>
        <TextContent>
          <BannerTitle>AI-Agent Wallets</BannerTitle>
          <BannerSubtitle>
            This page shows your connected wallet balances and lending positions. AI-agent wallet balances are managed separately.
          </BannerSubtitle>
        </TextContent>

        <CTAButton onClick={handleCTAClick}>
          View AI-Agent Wallets
          <ArrowRight size={16} />
        </CTAButton>
      </BannerContent>
    </BannerContainer>
  );
};
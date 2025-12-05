"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { DesktopHeader } from './DesktopHeader';

const LandingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #065f46 0%, #064e3b 100%);
  color: white;
  position: relative;
  overflow: hidden;
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(6, 199, 85, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(6, 199, 85, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(6, 199, 85, 0.1) 0%, transparent 50%);
  pointer-events: none;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 32px;
  position: relative;
  z-index: 1;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 80px;
`;

const MainTitle = styled.h1`
  font-size: 64px;
  font-weight: 800;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #06C755 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
`;

const Subtitle = styled.p`
  font-size: 24px;
  color: #d1fae5;
  margin-bottom: 48px;
  line-height: 1.5;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $primary?: boolean }>`
  background: ${({ $primary }) => $primary 
    ? 'linear-gradient(135deg, #06C755 0%, #059669 100%)' 
    : 'transparent'};
  color: white;
  border: ${({ $primary }) => $primary ? 'none' : '2px solid #06C755'};
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $primary }) => $primary 
      ? '0 12px 24px rgba(6, 199, 85, 0.4)' 
      : 'none'};
    background: ${({ $primary }) => $primary ? '#059669' : 'rgba(6, 199, 85, 0.1)'};
  }
`;

const FeaturesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
  margin-bottom: 80px;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(6, 199, 85, 0.3);
  }
`;

const FeatureIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #ffffff;
`;

const FeatureDescription = styled.p`
  font-size: 16px;
  color: #d1fae5;
  line-height: 1.6;
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  margin-bottom: 80px;
`;

const StatCard = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 48px;
  font-weight: 800;
  color: #06C755;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 18px;
  color: #d1fae5;
  font-weight: 500;
`;

const AIBadge = styled.div`
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
`;

export const Landing = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <LandingContainer> 
      <BackgroundPattern />
      
      <ContentContainer>
        <HeroSection>
          <AIBadge>
            🤖 AI-Powered DeFi Innovation
          </AIBadge>
          <MainTitle>
            Next-Generation
            <br />
            Lending Protocol
          </MainTitle>
          <Subtitle>
            Experience the future of decentralized finance with AI-driven insights, 
            multi-chain support, and intelligent portfolio management.
          </Subtitle>
          <ButtonGroup>
            <Button 
              $primary 
              onClick={() => window.location.href = '/dashboard'}
            >
              Launch Dashboard
            </Button>
            <Button onClick={() => window.location.href = '/markets'}>
              Explore Markets
            </Button>
          </ButtonGroup>
        </HeroSection>

        <StatsSection>
          <StatCard>
            <StatValue>$45.2M</StatValue>
            <StatLabel>Total Value Locked</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>12,847</StatValue>
            <StatLabel>Active Users</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>8.1%</StatValue>
            <StatLabel>Best APY</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>6</StatValue>
            <StatLabel>Supported Assets</StatLabel>
          </StatCard>
        </StatsSection>

        <FeaturesSection>
          <FeatureCard>
            <FeatureIcon>🤖</FeatureIcon>
            <FeatureTitle>AI Co-Pilot</FeatureTitle>
            <FeatureDescription>
              Get personalized investment recommendations and risk assessments powered by 
              advanced machine learning algorithms.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>⚡</FeatureIcon>
            <FeatureTitle>Lightning Fast</FeatureTitle>
            <FeatureDescription>
              Optimized for desktop performance with instant transactions and real-time 
              market updates.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🔗</FeatureIcon>
            <FeatureTitle>Multi-Chain</FeatureTitle>
            <FeatureDescription>
              Seamlessly operate across KAIA, Massa, and Ethereum networks with unified 
              portfolio management.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🛡️</FeatureIcon>
            <FeatureTitle>Enterprise Security</FeatureTitle>
            <FeatureDescription>
              Bank-grade security with smart contract audits and comprehensive insurance 
              coverage for your assets.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureTitle>Advanced Analytics</FeatureTitle>
            <FeatureDescription>
              Deep insights into your portfolio performance with predictive analytics 
              and trend analysis.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>💎</FeatureIcon>
            <FeatureTitle>Premium Features</FeatureTitle>
            <FeatureDescription>
              Access exclusive tools, higher yields, and priority support with our 
              premium membership tiers.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesSection>
      </ContentContainer>
    </LandingContainer>
  );
};

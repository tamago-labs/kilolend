"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DesktopHeader } from './DesktopHeader';

const LandingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
`;

const HeroSection = styled.section`
  padding: 120px 32px 80px;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: clamp(48px, 6vw, 72px);
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 24px;
  line-height: 1.1;
  background: linear-gradient(135deg, #1e293b 0%, #06C755 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroSubtitle = styled.p`
  font-size: clamp(20px, 2.5vw, 28px);
  color: #64748b;
  margin-bottom: 48px;
  line-height: 1.6;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAContainer = styled.div`
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 64px;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(6, 199, 85, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(6, 199, 85, 0.4);
  }
`;

const SecondaryButton = styled.button`
  background: white;
  color: #06C755;
  border: 2px solid #06C755;
  padding: 14px 30px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #06C755;
    color: white;
    transform: translateY(-2px);
  }
`;

const FeaturesSection = styled.section`
  padding: 80px 32px;
  background: white;
  position: relative;
  z-index: 2;
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: clamp(36px, 4vw, 48px);
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  margin-bottom: 64px;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
  margin-bottom: 64px;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }
`;

const FeatureIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  font-size: 28px;
`;

const FeatureTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
`;

const FeatureDescription = styled.p`
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
`;

const MobileSection = styled.section`
  padding: 80px 32px;
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  color: white;
  text-align: center;
`;

const MobileContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const MobileTitle = styled.h2`
  font-size: clamp(32px, 4vw, 40px);
  font-weight: 700;
  margin-bottom: 24px;
`;

const MobileDescription = styled.p`
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 32px;
  opacity: 0.9;
`;

const QRCode = styled.div`
  width: 200px;
  height: 200px;
  background: white;
  border-radius: 16px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #1e293b;
`;

const StatsSection = styled.section`
  padding: 80px 32px;
  background: #f8fafc;
`;

const StatsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 32px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
`;

const StatNumber = styled.div`
  font-size: clamp(36px, 4vw, 48px);
  font-weight: 800;
  color: #06C755;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 18px;
  color: #64748b;
  font-weight: 500;
`;

const BackgroundDecoration = styled.div`
  position: absolute;
  top: -200px;
  right: -200px;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(6, 199, 85, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
`;

export const DesktopLanding = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    router.push('/desktop/dashboard');
  };

  const handleViewMarkets = () => {
    router.push('/desktop/markets');
  };

  if (!mounted) return null;

  return (
    <LandingContainer> 
      <BackgroundDecoration />
      
      <HeroSection>
        <HeroContent>
          <HeroTitle>AI-Powered DeFi Lending</HeroTitle>
          <HeroSubtitle>
            Experience the future of decentralized lending with intelligent AI co-pilots that help you lend, borrow, and swap with confidence
          </HeroSubtitle>
          
          <CTAContainer>
            <PrimaryButton onClick={handleGetStarted}>
              Start Lending
            </PrimaryButton>
            <SecondaryButton onClick={handleViewMarkets}>
              View Markets
            </SecondaryButton>
          </CTAContainer>
        </HeroContent>
      </HeroSection>

      <FeaturesSection>
        <FeaturesContainer>
          <SectionTitle>Why Choose KiloLend?</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>🤖</FeatureIcon>
              <FeatureTitle>AI Co-Pilot</FeatureTitle>
              <FeatureDescription>
                Get personalized guidance from Penny the Penguin, Tora the Tiger, or Sly the Snake - each with unique strategies for your risk profile
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🔒</FeatureIcon>
              <FeatureTitle>Battle-Tested</FeatureTitle>
              <FeatureDescription>
                Built on Compound V2 with proven security and reliability, enhanced with custom risk models for optimal lending
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>⚡</FeatureIcon>
              <FeatureTitle>Smart Optimization</FeatureTitle>
              <FeatureDescription>
                AI-powered yield optimization and risk assessment help you maximize returns while maintaining healthy portfolio ratios
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🌐</FeatureIcon>
              <FeatureTitle>Multi-Chain Ready</FeatureTitle>
              <FeatureDescription>
                Start with KAIA/LINE today, with Massa and other chains coming soon. Unified portfolio management across all networks
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🎯</FeatureIcon>
              <FeatureTitle>Risk-Adjusted</FeatureTitle>
              <FeatureDescription>
                Dynamic interest rates based on market utilization and asset risk models, ensuring sustainable yields for all participants
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🏆</FeatureIcon>
              <FeatureTitle>KILO Rewards</FeatureTitle>
              <FeatureDescription>
                Earn KILO points for active participation, convertible to tokens at launch. Multiply rewards through social features
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesContainer>
      </FeaturesSection>

      <MobileSection>
        <MobileContent>
          <MobileTitle>Mobile Experience Available</MobileTitle>
          <MobileDescription>
            Access KiloLend on the go with our LINE Mini Dapp. Scan the QR code or visit us directly on LINE for the full mobile experience.
          </MobileDescription>
          <QRCode>
            LINE Mini Dapp QR Code
          </QRCode>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>
            Or visit: liff.line.me/2007932254-AVnKMMp9
          </p>
        </MobileContent>
      </MobileSection>

      <StatsSection>
        <StatsContainer>
          <StatCard>
            <StatNumber>$2.5M+</StatNumber>
            <StatLabel>Total Value Locked</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>1,200+</StatNumber>
            <StatLabel>Active Users</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>8.1%</StatNumber>
            <StatLabel>Best APY</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>6</StatNumber>
            <StatLabel>Supported Assets</StatLabel>
          </StatCard>
        </StatsContainer>
      </StatsSection>
    </LandingContainer>
  );
};
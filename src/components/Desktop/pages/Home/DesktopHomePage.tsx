"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react'; 

const HomeContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
`;

// Hero Section Styles
const HeroSection = styled.section`
  background: white;
  padding: 80px 32px;
  margin-bottom: 48px;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
`;

const HeroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  position: relative;
  z-index: 2;
`;

const HeroContent = styled.div`
  z-index: 2;
`;

const HeroTitle = styled.h1`
  font-size: clamp(36px, 4vw, 48px);
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 24px;
  line-height: 1.2;
`;

const HeroSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  margin-bottom: 40px;
  line-height: 1.6;
  max-width: 500px;
`;

const CTAContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(6, 199, 85, 0.25);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(6, 199, 85, 0.35);
  }
`;

const SecondaryButton = styled.button`
  background: white;
  color: #06C755;
  border: 2px solid #06C755;
  padding: 14px 30px;
  font-size: 16px;
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

// Mobile Mockup Styles
const MobileMockup = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PhoneFrame = styled.div`
  width: 320px;
  height: 640px;
  background: #1e293b;
  border-radius: 40px;
  padding: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const PhoneScreen = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
`;

const LINEHeader = styled.div`
  background: #00B900;
  color: white;
  padding: 16px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
`;

const ChatInterface = styled.div`
  padding: 16px;
  height: calc(100% - 48px);
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ChatBubble = styled.div<{ $isUser?: boolean }>`
  background: ${({ $isUser }) => $isUser ? '#06C755' : 'white'};
  color: ${({ $isUser }) => $isUser ? 'white' : '#1e293b'};
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 80%;
  font-size: 14px;
  align-self: ${({ $isUser }) => $isUser ? 'flex-end' : 'flex-start'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const AIResponse = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
`;

const AIIcon = styled.div`
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

// Floating AI Characters
const FloatingCharacter = styled.div<{ $top?: string; $right?: string; $left?: string; $bottom?: string; $delay?: number }>`
  position: absolute;
  ${({ $top }) => $top && `top: ${$top};`}
  ${({ $right }) => $right && `right: ${$right};`}
  ${({ $left }) => $left && `left: ${$left};`}
  ${({ $bottom }) => $bottom && `bottom: ${$bottom};`}
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: float 3s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  z-index: 3;
  border: 3px solid #06C755;

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  &:hover {
    transform: scale(1.1);
    transition: transform 0.3s;
  }
`;

const CharacterImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
`;

const ActionSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
`;

const ActionCard = styled.div<{ $gradient?: boolean }>`
  background: ${({ $gradient }) => $gradient 
    ? 'linear-gradient(135deg, #06C755 0%, #059669 100%)' 
    : 'white'};
  color: ${({ $gradient }) => $gradient ? 'white' : '#1e293b'};
  padding: 32px;
  border-radius: 16px;
  border: ${({ $gradient }) => $gradient ? 'none' : '1px solid #e2e8f0'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }
`;

const ActionTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const ActionDescription = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
  opacity: 0.9;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  background: ${({ $primary }) => $primary ? 'white' : 'rgba(255, 255, 255, 0.2)'};
  color: ${({ $primary }) => $primary ? '#06C755' : 'white'};
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${({ $primary }) => $primary ? '#f8fafc' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const PortfolioSection = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
`;

const ViewAllButton = styled.button`
  background: none;
  border: 1px solid #06C755;
  color: #06C755;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #06C755;
    color: white;
  }
`;

const AssetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AssetItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    background: #e2e8f0;
  }
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AssetIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
`;

const AssetDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AssetName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const AssetType = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const AssetValue = styled.div`
  text-align: right;
`;

const AssetAmount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const AssetAPY = styled.div`
  font-size: 14px;
  color: #10b981;
  font-weight: 500;
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

  if (!mounted) return null;

  return (
    <HomeContainer> 
      <MainContent>
        {/* New Hero Section */}
        <HeroSection>
          {/* Floating AI Characters */}
          <FloatingCharacter $top="20px" $right="100px" $delay={0}>
            <CharacterImage src="/images/icon-penguin.png" alt="Penny the Penguin" />
          </FloatingCharacter>
          <FloatingCharacter $top="60px" $right="40px" $delay={1}>
            <CharacterImage src="/images/icon-tiger.png" alt="Tora the Tiger" />
          </FloatingCharacter>
          <FloatingCharacter $bottom="40px" $right="80px" $delay={2}>
            <CharacterImage src="/images/icon-snake.png" alt="Sly the Snake" />
          </FloatingCharacter>

          <HeroContainer>
            <HeroContent>
              <HeroTitle>DeFi Made Easy on LINE — Earn, Borrow & Swap with AI</HeroTitle>
              <HeroSubtitle>
                KiloLend lets you earn yield, borrow assets, and swap tokens on KAIA using simple chat commands — no complex inputs, no DeFi knowledge required.
              </HeroSubtitle>
              
              <CTAContainer>
                <PrimaryButton onClick={handleGetStarted}>
                  Get Started on LINE
                </PrimaryButton>
                <SecondaryButton onClick={handleTryDesktop}>
                  Try Desktop Version
                </SecondaryButton>
              </CTAContainer>
            </HeroContent>

            <MobileMockup>
              <PhoneFrame>
                <PhoneScreen>
                  <LINEHeader>KiloLend on LINE</LINEHeader>
                  <ChatInterface>
                    <ChatBubble $isUser={false}>
                      Hi! I'm Penny, your AI DeFi assistant. How can I help you today?
                    </ChatBubble>
                    
                    <ChatBubble $isUser={true}>
                      I want to supply USDT to earn yield
                    </ChatBubble>
                    
                    <AIResponse>
                      <AIIcon>🐧</AIIcon>
                      <ChatBubble $isUser={false}>
                        Great choice! Current USDT APY is 5.2%. Would you like to supply $100 worth?
                      </ChatBubble>
                    </AIResponse>
                    
                    <ChatBubble $isUser={true}>
                      Yes, supply $100 USDT
                    </ChatBubble>
                    
                    <AIResponse>
                      <AIIcon>🐧</AIIcon>
                      <ChatBubble $isUser={false}>
                        ✅ Successfully supplied $100 USDT! You're now earning 5.2% APY. Your health factor is 3.2 - very safe!
                      </ChatBubble>
                    </AIResponse>
                  </ChatInterface>
                </PhoneScreen>
              </PhoneFrame>
            </MobileMockup>
          </HeroContainer>
        </HeroSection>

        {/* Existing Action Section */}
        <ActionSection>
          <ActionCard $gradient onClick={() => console.log('Supply clicked')}>
            <ActionTitle>Supply Assets</ActionTitle>
            <ActionDescription>
              Earn interest by supplying assets to the lending pool. Current best rates up to 8.1% APY.
            </ActionDescription>
            <ActionButton $primary>Start Supplying</ActionButton>
          </ActionCard>
          
          <ActionCard onClick={() => console.log('Borrow clicked')}>
            <ActionTitle>Borrow Assets</ActionTitle>
            <ActionDescription>
              Borrow against your collateral at competitive rates. Current borrow rates from 3.2% APR.
            </ActionDescription>
            <ActionButton>Start Borrowing</ActionButton>
          </ActionCard>
        </ActionSection>

        {/* Existing Portfolio Section */}
        <PortfolioSection>
          <SectionHeader>
            <SectionTitle>Your Positions</SectionTitle>
            <ViewAllButton onClick={() => console.log('View all clicked')}>
              View All
            </ViewAllButton>
          </SectionHeader>
          
          <AssetList>
            <AssetItem>
              <AssetInfo>
                <AssetIcon>USDT</AssetIcon>
                <AssetDetails>
                  <AssetName>USDT</AssetName>
                  <AssetType>Supplied</AssetType>
                </AssetDetails>
              </AssetInfo>
              <AssetValue>
                <AssetAmount>$8,000</AssetAmount>
                <AssetAPY>5.2% APY</AssetAPY>
              </AssetValue>
            </AssetItem>
            
            <AssetItem>
              <AssetInfo>
                <AssetIcon>KAIA</AssetIcon>
                <AssetDetails>
                  <AssetName>KAIA</AssetName>
                  <AssetType>Supplied</AssetType>
                </AssetDetails>
              </AssetInfo>
              <AssetValue>
                <AssetAmount>$4,450</AssetAmount>
                <AssetAPY>6.8% APY</AssetAPY>
              </AssetValue>
            </AssetItem>
            
            <AssetItem>
              <AssetInfo>
                <AssetIcon>SIX</AssetIcon>
                <AssetDetails>
                  <AssetName>SIX</AssetName>
                  <AssetType>Borrowed</AssetType>
                </AssetDetails>
              </AssetInfo>
              <AssetValue>
                <AssetAmount>$8,200</AssetAmount>
                <AssetAPY>4.1% APR</AssetAPY>
              </AssetValue>
            </AssetItem>
          </AssetList>
        </PortfolioSection>
      </MainContent>
    </HomeContainer>
  );
};

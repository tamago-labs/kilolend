"use client";

import styled from 'styled-components';
import { useState } from 'react';
import { useChain } from '@/contexts/ChainContext';

// Hero Section Styles
const HeroSectionWrapper = styled.section` 
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

// Blockchain Support Section
const BlockchainSupport = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;  
`;

const SupportLabel = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const BlockchainIcon = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
  margin-top: 4px;
`;

const IconImage = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: transform 0.2s ease;

  ${BlockchainIcon}:hover & {
    transform: scale(1.1);
  }
`;

const Tooltip = styled.div<{ $visible?: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  visibility: ${({ $visible }) => $visible ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  margin-bottom: 8px;
  z-index: 10;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: #1e293b;
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

const AIResponse = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
`;

const AIIcon = styled.div<{ $delay?: number }>`
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
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: ${({ $delay }) => $delay}s;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Animated Chat Components
const AnimatedChatBubble = styled.div<{ $isUser?: boolean; $delay?: number }>`
  background: ${({ $isUser }) => $isUser ? '#06C755' : 'white'};
  color: ${({ $isUser }) => $isUser ? 'white' : '#1e293b'};
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 80%;
  font-size: 14px;
  align-self: ${({ $isUser }) => $isUser ? 'flex-end' : 'flex-start'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: ${({ $delay }) => $delay}s;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const LoadingDots = styled.div<{ $delay?: number; $duration?: number }>`
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards, fadeOut 0.6s ease-out forwards;
  animation-delay: ${({ $delay }) => $delay}s, ${({ $duration, $delay }) => ($delay || 0) + ($duration || 2)}s;

  &::after {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    background: #06C755;
    border-radius: 50%;
    animation: loading 1.4s infinite ease-in-out both;
  }

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    background: #06C755;
    border-radius: 50%;
    animation: loading 1.4s infinite ease-in-out both;
    animation-delay: -0.32s;
  }

  span {
    display: inline-block;
    width: 4px;
    height: 4px;
    background: #06C755;
    border-radius: 50%;
    animation: loading 1.4s infinite ease-in-out both;
    animation-delay: -0.16s;
  }

  @keyframes loading {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  @keyframes fadeOut {
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
`;

interface HeroSectionProps {
  onGetStarted: () => void;
  onTryDesktop: () => void;
}

export const HeroSection = ({ onGetStarted, onTryDesktop }: HeroSectionProps) => {
  const { selectedChain } = useChain();
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  const getPrimaryButtonText = () => {
    if (selectedChain === 'line_sdk') {
      return 'Get Started on LINE';
    } else if (selectedChain === 'web3_wallet') {
      return 'Connect Web3 Wallet';
    }
    return 'Get Started';
  };

  return (
    <HeroSectionWrapper>
      <HeroContainer>
        <HeroContent>
          <HeroTitle>DeFi Made Easy on LINE — Earn, Borrow & Swap with AI</HeroTitle>
          <HeroSubtitle>
            KiloLend lets you earn yield, borrow assets, and swap tokens across blockchains using simple chat commands — no complex inputs, no DeFi knowledge required.
          </HeroSubtitle>

          <CTAContainer>
            <PrimaryButton onClick={onGetStarted}>
              {getPrimaryButtonText()}
            </PrimaryButton>
            <SecondaryButton onClick={onTryDesktop}>
              Try Desktop Version
            </SecondaryButton>
          </CTAContainer>

          {/* Blockchain Support Section */}
          <BlockchainSupport>
            <SupportLabel>Blockchains supported:</SupportLabel>
            <BlockchainIcon
              onMouseEnter={() => setTooltipVisible('kaia')}
              onMouseLeave={() => setTooltipVisible(null)}
            >
              <IconImage
                src="/images/blockchain-icons/kaia-token-icon.png"
                alt="KAIA"
              />
              <Tooltip $visible={tooltipVisible === 'kaia'}>
                KAIA Mainnet
              </Tooltip>
            </BlockchainIcon>
            <BlockchainIcon
              onMouseEnter={() => setTooltipVisible('kub')}
              onMouseLeave={() => setTooltipVisible(null)}
            >
              <IconImage
                src="/images/blockchain-icons/kub-chain-icon.png"
                alt="KUB"
              />
              <Tooltip $visible={tooltipVisible === 'kub'}>
                KUB Chain
              </Tooltip>
            </BlockchainIcon>
          </BlockchainSupport>

        </HeroContent>

        <MobileMockup>
          <PhoneFrame>
            <PhoneScreen>
              <LINEHeader>KiloLend on LINE</LINEHeader>
              <ChatInterface>
                {/* Welcome Message */}
                <AIResponse>
                  <AIIcon $delay={0}>🐍</AIIcon>
                  <AnimatedChatBubble $isUser={false} $delay={0}>
                    🐍 Welcome! I'm Sly, your DeFi Co-Pilot. Ready to earn some yield? 🚀
                  </AnimatedChatBubble>
                </AIResponse>

                {/* Sly's Initial Greeting */}
                <AIResponse>
                  <AIIcon $delay={2}>🐍</AIIcon>
                  <AnimatedChatBubble $isUser={false} $delay={2}>
                    🐍 Let's strike! Supply USDT to earn 6.1% APY! 🎯
                  </AnimatedChatBubble>
                </AIResponse>

                {/* User Action */}
                <AnimatedChatBubble $isUser={true} $delay={4}>
                  ok, help supply 100 USDT
                </AnimatedChatBubble>

                {/* Loading Animation */}
                <LoadingDots $delay={5} $duration={1}>
                  <span></span>
                </LoadingDots>

                {/* Transaction Success */}
                <AIResponse>
                  <AIIcon $delay={6}>🐍</AIIcon>
                  <AnimatedChatBubble $isUser={false} $delay={6}>
                    🐍 Perfect strike! You're earning $6.10 per year! 💰
                  </AnimatedChatBubble>
                </AIResponse>

                {/* User Question */}
                <AnimatedChatBubble $isUser={true} $delay={8}>
                  how much KAIA can I borrow?
                </AnimatedChatBubble>

                {/* Loading Animation */}
                <LoadingDots $delay={9} $duration={1}>
                  <span></span>
                </LoadingDots>

                {/* Borrowing Response */}
                <AIResponse>
                  <AIIcon $delay={10}>🐍</AIIcon>
                  <AnimatedChatBubble $isUser={false} $delay={10}>
                    🐍 You can borrow 50 KAIA! Your health factor is strong at 2.0 🛡️
                  </AnimatedChatBubble>
                </AIResponse>



              </ChatInterface>
            </PhoneScreen>
          </PhoneFrame>
        </MobileMockup>
      </HeroContainer>
    </HeroSectionWrapper>
  );
};

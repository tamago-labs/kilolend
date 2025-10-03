'use client';

import { DialogModal } from '../DialogModal';
import styled, { keyframes } from 'styled-components';
import { useState, useEffect } from 'react';
import { Star, Gift, TrendingUp, Users, ChevronRight } from 'react-feather';

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const WelcomeContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  text-align: center;
`;

const HeroSection = styled.div`
  position: relative;
  background: linear-gradient(135deg, #1e293b, #06C755);
  border-radius: 8px;
  padding: 32px 24px;
  color: white;
  overflow: hidden;
   
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
`;

const KiloIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  animation: ${float} 3s ease-in-out infinite;
  
  img {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
  
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 16px;
  margin: 0 0 16px 0;
  opacity: 0.9;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const KiloAnnouncement = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const AnnouncementEmoji = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const AnnouncementText = styled.p`
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: white;
  
  strong {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 700;
  }
`;
 
  

const KiloInfoSection = styled.div`
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #00C300;
  position: relative;
  overflow: hidden;
`;

const ShimmerEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(6, 199, 85, 0.8),
    transparent
  );
  background-size: 200px 2px;
  animation: ${shimmer} 2s infinite;
`;

const KiloInfoTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #047857;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const KiloInfoText = styled.p`
  font-size: 14px;
  color: #065f46;
  margin: 0;
  line-height: 1.5;
`;

const PointsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PointItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #065f46;
`;

const PointIcon = styled.div`
  width: 20px;
  height: 20px;
  background: #00C300;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;

const ActionSection = styled.div`
  margin-top: 0px;
`;

const GetStartedButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #00C300, #00A000);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 195, 0, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FooterText = styled.p`
  font-size: 12px;
  color: #94a3b8;
  margin: 16px 0 0 0;
  text-align: center;
`;

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
  const features = [
    {
      icon: <TrendingUp size={24} />,
      title: "AI-Powered DeFi",
      description: "Smart lending and borrowing with AI assistance"
    },
    {
      icon: <Gift size={24} />,
      title: "Earn KILO Points",
      description: "Daily rewards based on your activity"
    },
    {
      icon: <Users size={24} />,
      title: "Invite & Multiply",
      description: "Boost rewards by inviting friends"
    },
    {
      icon: <Star size={24} />,
      title: "Leaderboard",
      description: "Compete for top rewards daily"
    }
  ];

  const handleGetStarted = () => {
    onClose();
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome to KiloLend"
    >
      <WelcomeContent>
        <HeroSection>
          <HeroContent> 
            <WelcomeSubtitle>
              The first AI-powered DeFi lending on LINE
            </WelcomeSubtitle> 
            <KiloAnnouncement> 
              <AnnouncementText>
                Now live on KAIA Mainnet. Get ready for KILO Points starting 17 Sep.
              </AnnouncementText>
            </KiloAnnouncement>
          </HeroContent>
        </HeroSection> 
        <KiloInfoSection>
          <ShimmerEffect />
          <KiloInfoTitle>
            How KILO Points Work
          </KiloInfoTitle>
          <PointsList>
            <PointItem>
              <PointIcon>1</PointIcon>
              <span>Supply or borrow assets to start earning</span>
            </PointItem>
            <PointItem>
              <PointIcon>2</PointIcon>
              <span>100,000 points distributed daily</span>
            </PointItem>
            <PointItem>
              <PointIcon>3</PointIcon>
              <span>Invite friends to boost your multiplier</span>
            </PointItem>
            <PointItem>
              <PointIcon>4</PointIcon>
              <span>Compete on the leaderboard for top rewards</span>
            </PointItem>
          </PointsList>
        </KiloInfoSection>

        <ActionSection>
          <GetStartedButton onClick={handleGetStarted}>
            Get Started
            <ChevronRight size={20} />
          </GetStartedButton>
          <FooterText>
            Ready to start your DeFi journey? Tap to explore the platform!
          </FooterText>
        </ActionSection>
      </WelcomeContent>
    </DialogModal>
  );
};
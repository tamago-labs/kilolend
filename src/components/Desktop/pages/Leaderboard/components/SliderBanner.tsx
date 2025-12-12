"use client";

import styled, { keyframes } from 'styled-components';
import { useState, useEffect } from 'react';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const BannerContainer = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  color: #1e293b;
  min-height: 160px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const BannerContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const TextContent = styled.div`
  flex: 1;
  animation: ${slideIn} 0.6s ease-out;
`;

const BannerTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const BannerDescription = styled.p`
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
  opacity: 0.95;
  max-width: 600px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  img {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }
  
  @media (max-width: 768px) {
    width: 64px;
    height: 64px;
    
    img {
      width: 36px;
      height: 36px;
    }
  }
`;

const NavigationDots = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${({ $active }) => $active ? '#06C755' : '#e2e8f0'};
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: ${({ $active }) => $active ? '#059669' : '#cbd5e1'};
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 12px;
  position: absolute;
  bottom: 32px;
  right: 32px;
  z-index: 2;
  
  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
  }
`;

const NavButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #1e293b;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface SliderBannerProps {
  autoPlay?: boolean;
  interval?: number;
}

const infoSlides = [
  {
    title: "KILO Points Leaderboard",
    content: "Start collecting KILO points now. Points are fully claimable 1:1 for tokens at launch.",
    icon: "/images/icon-rewards.png"
  },
  {
    title: "Daily Distribution",
    content: "Over 100,000 points are distributed daily among active users based on their activity.",
    icon: "/images/icon-rewards.png"
  },
  {
    title: "How Points Work",
    content: "Points = TVL (50%) + Net Contribution (50%) × Multiplier. Invite friends to increase your multiplier.",
    icon: "/images/icon-rewards.png"
  },
  {
    title: "Real-time Rankings",
    content: "Rankings are updated hourly but are not final until the end of the day (GMT).",
    icon: "/images/icon-rewards.png"
  }
];

export const SliderBanner = ({ autoPlay = true, interval = 6000 }: SliderBannerProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % infoSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + infoSlides.length) % infoSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval]);

  const currentSlideData = infoSlides[currentSlide];

  return (
    <BannerContainer>
      <BannerContent>
        <TextContent>
          <BannerTitle>{currentSlideData.title}</BannerTitle>
          <BannerDescription>{currentSlideData.content}</BannerDescription>
        </TextContent>
      </BannerContent>
      
      <NavigationDots>
        {infoSlides.map((_, index) => (
          <Dot
            key={index}
            $active={index === currentSlide}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </NavigationDots>
    </BannerContainer>
  );
};

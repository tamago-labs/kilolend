'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SliderContainer = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
`;

const SliderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
`;

const SliderTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const SliderControls = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
  margin-right: auto;
`;

const SliderButton = styled.button<{ $active?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${({ $active }) => $active ? '#06C755' : '#cbd5e1'};
  
  &:hover {
    background: ${({ $active }) => $active ? '#059212' : '#94a3b8'};
  }
`;

const SliderContent = styled.div`
  padding: 0 24px 24px;
  height: 144px;
  position: relative;
  overflow: hidden;
`;

const StatsSlider = styled.div<{ $translateX: number }>`
  display: flex;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(${({ $translateX }) => $translateX}%);
`;

const StatsSlide = styled.div`
  min-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
`;

const StatDisplay = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div<{ $color?: string }>`
  font-size: 32px;
  font-weight: 800;
  color: ${({ $color }) => $color || '#059212'};
  margin-bottom: 12px;
  line-height: 1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  letter-spacing: -1px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 6px;
`;

const StatSubtext = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  opacity: 0.8;
`;

const StatIcon = styled.div<{ $color?: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color || '#059212'};
  margin-bottom: 16px;
  box-shadow: 0 0 20px ${({ $color }) => $color || '#059212'}40;
`;

const ProgressIndicator = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 3px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: linear-gradient(90deg, #06C755, #00A000);
  border-radius: 2px;
  transition: width 0.1s linear;
`;

const LoadingSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const SkeletonValue = styled.div`
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
  height: 56px;
  width: 200px;
  margin-bottom: 12px;

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const SkeletonLabel = styled.div`
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 6px;
  height: 18px;
  width: 120px;
  margin-bottom: 6px;
`;

const SkeletonSubtext = styled.div`
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  height: 14px;
  width: 100px;
`;

interface PortfolioStatsSliderProps {
  portfolioStats: {
    totalSupplyValue: number;
    totalBorrowValue: number;
    netPortfolioValue: number;
    healthFactor: number;
  };
  isLoading?: boolean;
}

export const PortfolioStatsSlider = ({
  portfolioStats,
  isLoading = false
}: PortfolioStatsSliderProps) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slideInterval = 4000; // 4 seconds per slide
  const updateInterval = 50; // Update progress every 50ms

  const calculateAPY = () => {
    if (portfolioStats.totalSupplyValue === 0) return 0;
    const mockAnnualEarnings = portfolioStats.totalSupplyValue * 0.05; // 5% APY
    const mockAnnualCosts = portfolioStats.totalBorrowValue * 0.07; // 7% APR
    const netAPY = ((mockAnnualEarnings - mockAnnualCosts) / portfolioStats.totalSupplyValue) * 100;
    return netAPY;
  };

  const calculateUtilization = () => {
    if (portfolioStats.totalSupplyValue === 0) return 0;
    return (portfolioStats.totalBorrowValue / portfolioStats.totalSupplyValue) * 100;
  };

  const netAPY = calculateAPY();
  const utilization = calculateUtilization();

  // Define slides data
  const slides = [
    {
      value: `$${portfolioStats.totalSupplyValue.toFixed(2)}`,
      label: 'Total Supply',
      subtext: 'Assets earning interest',
      color: '#1e293b'
    },
    {
      value: `$${portfolioStats.totalBorrowValue.toFixed(2)}`,
      label: 'Total Borrowed',
      subtext: 'Outstanding debt',
      color: '#1e293b'
    },
    {
      value: `$${portfolioStats.netPortfolioValue.toFixed(2)}`,
      label: 'Net Worth',
      subtext: 'Supply - Borrow',
      color: portfolioStats.netPortfolioValue >= 0 ? '#059212' : '#dc2626'
    },
    {
      value: `${netAPY.toFixed(2)}%`,
      label: 'Net APY',
      subtext: 'Estimated annual return',
      color: netAPY >= 0 ? '#059212' : '#dc2626'
    },
    {
      value: portfolioStats.healthFactor > 999 ? '∞' : portfolioStats.healthFactor.toFixed(2),
      label: 'Health Factor',
      subtext: portfolioStats.healthFactor > 1.5 ? 'Safe position' : 'At risk',
      color: portfolioStats.healthFactor > 1.5 ? '#059212' : '#dc2626'
    },
    {
      value: `${utilization.toFixed(1)}%`,
      label: 'Utilization',
      subtext: 'Borrow / Supply ratio',
      color: utilization > 80 ? '#dc2626' : utilization > 60 ? '#f59e0b' : '#059212'
    }
  ];

  const totalSlides = slides.length;

  useEffect(() => {
    if (isLoading || isPaused) return;

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (slideInterval / updateInterval));
        if (newProgress >= 100) {
          // setActiveSlide(current => current > totalSlides ? 0 : (current + 1));
          setActiveSlide((activeSlide > slides.length-2) ? 0 : activeSlide+1)
          return 0;
        }
        return newProgress;
      });
    }, updateInterval);

    return () => clearInterval(progressTimer);
  }, [isLoading, isPaused, slideInterval, updateInterval, activeSlide]);

  // Reset progress when slide changes manually
  useEffect(() => {
    setProgress(0);
  }, [activeSlide]);

  const handleSlideClick = (index: number) => {
    setActiveSlide(index);
    setProgress(0);
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (isLoading) {
    return (
      <SliderContainer>
        <SliderHeader>
          <SliderControls>
            {Array.from({ length: 3 }, (_, index) => (
              <SliderButton key={index} />
            ))}
          </SliderControls>
        </SliderHeader>
        <SliderContent>
          <StatsSlide>
            <LoadingSkeleton>
              <SkeletonValue />
              <SkeletonLabel />
              <SkeletonSubtext />
            </LoadingSkeleton>
          </StatsSlide>
        </SliderContent>
      </SliderContainer>
    );
  }

  return (
    <SliderContainer
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SliderHeader>

        <SliderControls>
          {Array.from({ length: totalSlides }, (_, index) => (
            <SliderButton
              key={index}
              $active={activeSlide === index}
              onClick={() => handleSlideClick(index)}
            />
          ))}
        </SliderControls>
      </SliderHeader>

      <SliderContent>
        <StatsSlider $translateX={-activeSlide * 100}>
          {slides.map((slide, index) => (
            <StatsSlide key={index}>
              <StatDisplay>
                <StatValue $color={slide.color}>
                  {slide.value}
                </StatValue>
                <StatLabel>{slide.label}</StatLabel>
                <StatSubtext>{slide.subtext}</StatSubtext>
              </StatDisplay>
            </StatsSlide>
          ))}
        </StatsSlider>

        {!isPaused && (
          <ProgressIndicator>
            <ProgressBar $progress={progress} />
          </ProgressIndicator>
        )}
      </SliderContent>
    </SliderContainer>
  );
};
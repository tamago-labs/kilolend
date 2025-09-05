'use client';

import styled, { keyframes } from 'styled-components';
import { useState, useEffect, useRef } from 'react';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
`;

const SwiperContainer = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

const SwiperSlide = styled.div<{ $isActive: boolean; $isExiting: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: ${({ $isActive, $isExiting }) => ($isActive || $isExiting ? 'block' : 'none')};
  animation: ${({ $isActive, $isExiting }) => {
    if ($isExiting) return slideOut;
    if ($isActive) return slideIn;
    return 'none';
  }} 0.5s ease-in-out;
`;

const DotsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
`;

const Dot = styled.div<{ $active: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $active }) => 
    $active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)'};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.7);
  }
`;

interface CardSwiperProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
}

export const CardSwiper = ({ 
  children, 
  autoPlay = true, 
  autoPlayInterval = 3000,
  showDots = true 
}: CardSwiperProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setIsExiting(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % children.length);
      setIsExiting(false);
    }, 250);
  };

  const goToSlide = (index: number) => {
    if (index !== currentIndex) {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsExiting(false);
      }, 250);
    }
  };

  useEffect(() => {
    if (autoPlay && children.length > 1) {
      intervalRef.current = setInterval(nextSlide, autoPlayInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoPlay, autoPlayInterval, children.length]);

  // Pause auto-play on hover
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (autoPlay && children.length > 1) {
      intervalRef.current = setInterval(nextSlide, autoPlayInterval);
    }
  };

  return (
    <SwiperContainer 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children.map((child, index) => (
        <SwiperSlide
          key={index}
          $isActive={index === currentIndex}
          $isExiting={isExiting && index === currentIndex}
        >
          {child}
        </SwiperSlide>
      ))}
      
      {showDots && children.length > 1 && (
        <DotsContainer>
          {children.map((_, index) => (
            <Dot
              key={index}
              $active={index === currentIndex}
              onClick={() => goToSlide(index)}
            />
          ))}
        </DotsContainer>
      )}
    </SwiperContainer>
  );
};
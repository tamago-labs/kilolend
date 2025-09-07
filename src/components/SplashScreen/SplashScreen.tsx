'use client';

import styled, { keyframes } from 'styled-components';
import { useEffect, useState } from 'react';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const SplashContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: #06C755; /* LINE official green color */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const LogoContainer = styled.div`
  animation: ${fadeIn} 1s ease-out;
`;

const Logo = styled.img`
  width: 280px;
  height: auto;
  max-width: 90vw;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    width: 240px;
    margin-bottom: 40px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: row; 
  gap: 10px; 
  margin-bottom: 20px;
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #ffffff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  color: #ffffff;
  font-size: 16px;
  margin-top: auto;
  margin-bottom: auto;
  font-weight: 500;
  text-align: center;
  line-height: 1.5;
  opacity: 0.9;
  
  @media (max-width: 480px) {
    font-size: 14px; 
  }
`;

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <SplashContainer>
      <LogoContainer>
        <Logo src="/images/kilolend-logo.png" alt="KiloLend" />
      </LogoContainer>
      <LoadingContainer>
        <Spinner />
        <LoadingText>{"DeFi Lending Made Simple on LINE"}</LoadingText>
      </LoadingContainer>
    </SplashContainer>
  );
};
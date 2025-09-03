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

  @media (max-width: 480px) {
    width: 240px;
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
    </SplashContainer>
  );
};
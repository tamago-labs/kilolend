"use client";

import styled from 'styled-components';
import { AGENT_PRESETS } from '@/types/aiAgent';

// AI Section Styles
const AISectionWrapper = styled.section`
  background: linear-gradient(135deg, #06C755 0%, #059669 50%, #047857 100%);
  padding: 80px 32px;
  margin: 48px 0;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 600;
  color: white;
  margin-bottom: 24px;
  line-height: 1.1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const SectionSubtitle = styled.p`
  font-size: clamp(10px, 1.5vw, 18px);
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  max-width: 600px;
  margin: 0 auto;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
`;

// Floating Characters
const FloatingCharacters = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
`;

const CharacterImage = styled.img<{ $delay?: number; $side: 'left' | 'right' }>`
  position: absolute;
  opacity: 1;
  animation: float ${({ $side }) => $side} 8s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;

  @keyframes floatLeft {
    0%, 100% { 
      transform: translateY(0px) rotate(-8deg); 
    }
    50% { 
      transform: translateY(-30px) rotate(-3deg); 
    }
  }

  @keyframes floatRight {
    0%, 100% { 
      transform: translateY(0px) rotate(8deg); 
    }
    50% { 
      transform: translateY(-30px) rotate(3deg); 
    }
  }

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

// Left side characters
const CharacterLeft1 = styled(CharacterImage)`
  top: 5%;
  left: 3%;
  width: 180px;
  height: 180px;
 
`;

const CharacterLeft2 = styled(CharacterImage)`
  top: 55%;
  left: 12%;
  width: 140px;
  height: 140px;
 
`;

// Right side characters
const CharacterRight1 = styled(CharacterImage)`
  top: 10%;
  right: 3%;
  width: 200px;
  height: 200px;
 
`;

const CharacterRight2 = styled(CharacterImage)`
  top: 65%;
  right: 16%;
  width: 100px;
  height: 100px;
 
`;

 

export const AISection = () => {
  return (
    <AISectionWrapper>
      <FloatingCharacters>
        <CharacterLeft1 
          src="/images/icon-penguin.png" 
          alt="Penny Penguin" 
          $side="left"
          $delay={0}
        />
        <CharacterLeft2 
          src="/images/icon-robot.png" 
          alt="Robo Analyst" 
          $side="left"
          $delay={2}
        />
        <CharacterRight1 
          src="/images/icon-tiger.png" 
          alt="Tora Tiger" 
          $side="right"
          $delay={1}
        />
        <CharacterRight2 
          src="/images/icon-snake.png" 
          alt="Sly Snake" 
          $side="right"
          $delay={3}
        />
      </FloatingCharacters>

      <SectionContainer>
        <SectionTitle>Your Personal DeFi Co-Pilot</SectionTitle>
        <SectionSubtitle>
        Access KiloLend and other KAIA DeFi more easily and let AI automate strategies while handling the complex steps for you
        </SectionSubtitle>
      </SectionContainer>
    </AISectionWrapper>
  );
};

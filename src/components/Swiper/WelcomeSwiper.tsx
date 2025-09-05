'use client';

import styled from 'styled-components';
import { CardSwiper } from './CardSwiper';

const CardContent = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CardIcon = styled.div<{ $white?: boolean }>`
width: 32px;
height: 32px;
border-radius: 50%;
background: ${({ $white }) =>
    $white
      ? 'rgba(255, 255, 255, 0.2)'
      : 'linear-gradient(135deg, #06C755, #04A94A)'};
display: flex;
align-items: center;
justify-content: center;
margin-bottom: 12px;
font-size: 16px;

@media (max-width: 480px) {
  width: 28px;
  height: 28px;
  font-size: 14px;
  margin-bottom: 10px;
}
`;

const CardTitle = styled.h3<{ $white?: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: ${({ $white }) => ($white ? 'white' : '#1e293b')};
  margin-bottom: 6px;
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 4px;
  }
`;

const CardSubtext = styled.div<{ $white?: boolean }>`
  font-size: 12px;
  color: ${({ $white }) => ($white ? 'rgba(255, 255, 255, 0.8)' : '#64748b')};
  line-height: 1.3;
  flex: 1;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const HighlightText = styled.span`
  color: #fbbf24;
  font-weight: 600;
`;

const slides = [
  {
    icon: 'K',
    title: 'KiloLend',
    subtitle: 'The first stablecoin-focused decentralized lending with AI on LINE Mini Dapp'
  },
  {
    icon: '🤖',
    title: 'AI Assistant',
    subtitle: (
      <>
        Get personalized lending advice with our <HighlightText>AI-powered assistant</HighlightText> that helps you make smart DeFi decisions
      </>
    )
  },
  {
    icon: '🎁',
    title: 'Earn KILO Points',
    subtitle: (
      <>
        <HighlightText>Collect KILO points</HighlightText> by inviting friends and unlock exclusive rewards in our ecosystem
      </>
    )
  }
];

export const WelcomeSwiper = () => {
  const slideElements = slides.map((slide, index) => (
    <CardContent key={index}>
      <CardIcon $white={index !== 0}>
        {typeof slide.icon === 'string' && slide.icon.length === 1 ? (
          <b>{slide.icon}</b>
        ) : (
          <span style={{ fontSize: '18px' }}>{slide.icon}</span>
        )}
      </CardIcon>
      <CardTitle $white>
        {slide.title}
      </CardTitle>
      <CardSubtext $white>
        {slide.subtitle}
      </CardSubtext>
    </CardContent>
  ));

  return (
    <CardSwiper
      autoPlay={true}
      autoPlayInterval={5000}
      showDots={true}
    >
      {slideElements}
    </CardSwiper>
  );
};
'use client';

import React, { useState, useEffect } from 'react';
import ReactCountryFlag from 'react-country-flag';
import styled from 'styled-components';

const IconContainer = styled.div<{ $size: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
`;

const TokenImage = styled.img<{ $size: number }>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const EmojiIcon = styled.span<{ $size: number }>`
  font-size: ${props => props.$size * 0.75}px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const FallbackIcon = styled.div<{ $size: number }>`
  font-size: ${props => props.$size * 0.75}px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-radius: 50%;
`;

const FlagContainer = styled.div<{ $size: number }>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
`;

interface TokenIconProps {
  icon: string;
  iconType: 'image' | 'flag' | 'emoji';
  alt?: string;
  size?: number;
  fallbackEmoji?: string;
}

export const TokenIcon: React.FC<TokenIconProps> = ({
  icon,
  iconType,
  alt = 'Token icon',
  size = 24,
  fallbackEmoji = '💰'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset image error when icon changes
  useEffect(() => {
    setImageError(false);
  }, [icon]);

  const handleImageError = () => {
    setImageError(true);
  };

  // Don't render on server to avoid hydration issues
  if (!isClient) {
    return (
      <IconContainer $size={size}>
        <FallbackIcon $size={size}>
          {fallbackEmoji}
        </FallbackIcon>
      </IconContainer>
    );
  }

  switch (iconType) {
    case 'image':
      if (imageError) {
        return (
          <IconContainer $size={size}>
            <FallbackIcon $size={size}>
              {fallbackEmoji}
            </FallbackIcon>
          </IconContainer>
        );
      }
      
      return (
        <IconContainer $size={size}>
          <TokenImage
            src={icon}
            alt={alt}
            $size={size}
            onError={handleImageError}
            loading="lazy"
          />
        </IconContainer>
      );

    case 'flag':
      return (
        <IconContainer $size={size}>
          <FlagContainer $size={size}>
            <ReactCountryFlag
              countryCode={icon}
              svg
              style={{
                width: `${size * 0.8}px`,
                height: `${size * 0.6}px`,
                borderRadius: '2px'
              }}
              title={icon}
            />
          </FlagContainer>
        </IconContainer>
      );

    case 'emoji':
    default:
      return (
        <IconContainer $size={size}>
          <EmojiIcon $size={size}>{icon}</EmojiIcon>
        </IconContainer>
      );
  }
};

export default TokenIcon;
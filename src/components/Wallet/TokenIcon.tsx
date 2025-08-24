'use client';

import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import styled from 'styled-components';

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const TokenImage = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
`;

const EmojiIcon = styled.span`
  font-size: 20px;
  line-height: 1;
`;

interface TokenIconProps {
  icon: string;
  iconType: 'image' | 'flag' | 'emoji';
  alt?: string;
  size?: number;
}

export const TokenIcon: React.FC<TokenIconProps> = ({
  icon,
  iconType,
  alt = 'Token icon',
  size = 24
}) => {
  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`
  };

  const imageStyle = {
    width: `${size}px`,
    height: `${size}px`
  };

  const emojiStyle = {
    fontSize: `${size * 0.8}px`
  };

  switch (iconType) {
    case 'image':
      return (
        <IconContainer style={containerStyle}>
          <TokenImage
            src={icon}
            alt={alt}
            style={imageStyle}
            onError={(e) => {
              // Fallback to emoji if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '💰';
              }
            }}
          />
        </IconContainer>
      );

    case 'flag':
      return (
        <IconContainer style={containerStyle}>
          <ReactCountryFlag
            countryCode={icon}
            svg
            style={{
              width: `${size}px`,
              height: `${size * 0.75}px`,
              borderRadius: '2px'
            }}
            title={icon}
          />
        </IconContainer>
      );

    case 'emoji':
    default:
      return (
        <IconContainer style={containerStyle}>
          <EmojiIcon style={emojiStyle}>{icon}</EmojiIcon>
        </IconContainer>
      );
  }
};

export default TokenIcon;

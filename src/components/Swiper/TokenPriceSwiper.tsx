'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { CardSwiper } from './CardSwiper';

const CardContent = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CardIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
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

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 4px;
  }
`;

const CardValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #06C755;
  margin-bottom: 4px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const CardSubtext = styled.div<{ $positive?: boolean }>`
  font-size: 12px;
  color: ${({ $positive }) => $positive ? '#06C755' : '#ef4444'};
  line-height: 1.3;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const IconImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  
  @media (max-width: 480px) {
    width: 100%;
    height: 100%;
  }
`;

const LoadingText = styled.div`
  font-size: 14px;
  color: #64748b;
  text-align: center;
`;

interface TokenData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
  icon: string;
}

// Initial token data that matches your requirements: KAIA -> USDT -> stKAIA -> MARBLEX -> BORA
const initialTokenData: TokenData[] = [
  {
    symbol: 'KAIA',
    name: 'KAIA price',
    price: '$0.1245',
    change: '+2.34%',
    isPositive: true,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png'
  },
  {
    symbol: 'USDT',
    name: 'USDT price',
    price: '$1.0001',
    change: '+0.01%',
    isPositive: true,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
  },
  {
    symbol: 'stKAIA',
    name: 'stKAIA price',
    price: '$0.1289',
    change: '+3.54%',
    isPositive: true,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png'
  },
  {
    symbol: 'MARBLEX',
    name: 'MARBLEX price',
    price: '$0.0245',
    change: '-1.23%',
    isPositive: false,
    icon: 'https://assets.coingecko.com/coins/images/17982/large/mbx.png'
  },
  {
    symbol: 'BORA',
    name: 'BORA price',
    price: '$0.1156',
    change: '+5.67%',
    isPositive: true,
    icon: 'https://assets.coingecko.com/coins/images/7646/large/bora.png'
  }
];

export const TokenPriceSwiper = () => {
  const [tokenData, setTokenData] = useState<TokenData[]>(initialTokenData);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate price updates with realistic variations
  useEffect(() => {
    const updatePrices = () => {
      setTokenData(prevData => 
        prevData.map(token => {
          // Generate small random price movements
          const basePrice = parseFloat(token.price.replace('$', ''));
          const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
          const newPrice = basePrice * (1 + variation);
          
          // Generate realistic change percentage
          const changeNum = (Math.random() - 0.4) * 10; // Slight bullish bias
          const isPositive = changeNum >= 0;
          
          return {
            ...token,
            price: `$${newPrice.toFixed(token.symbol === 'USDT' ? 4 : 4)}`,
            change: `${isPositive ? '+' : ''}${changeNum.toFixed(2)}%`,
            isPositive
          };
        })
      );
    };

    // Update prices every 8 seconds
    const interval = setInterval(updatePrices, 8000);
    return () => clearInterval(interval);
  }, []);

  const slides = tokenData.map((token, index) => (
    <CardContent key={`${token.symbol}-${index}`}>
      <CardIcon>
        <IconImage
          src={token.icon}
          alt={`${token.symbol} Logo`}
          onError={(e) => {
            // Fallback to text if image fails to load
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            if (img.parentElement) {
              img.parentElement.innerHTML = `<b>${token.symbol.charAt(0)}</b>`;
            }
          }}
        />
      </CardIcon>
      <CardTitle>{token.name}</CardTitle>
      <CardValue>{token.price}</CardValue>
      <CardSubtext $positive={token.isPositive}>{token.change}</CardSubtext>
    </CardContent>
  ));

  if (isLoading) {
    return (
      <CardContent>
        <LoadingText>Loading prices...</LoadingText>
      </CardContent>
    );
  }

  return (
    <CardSwiper 
      autoPlay={true} 
      autoPlayInterval={4000}
      showDots={true}
    >
      {slides}
    </CardSwiper>
  );
};
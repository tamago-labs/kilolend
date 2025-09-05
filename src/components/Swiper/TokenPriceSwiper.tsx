'use client';

import styled from 'styled-components';
import { CardSwiper } from './CardSwiper';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';

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

const LastUpdatedText = styled.div`
  font-size: 10px;
  color: #94a3b8;
  margin-top: 2px;
  
  @media (max-width: 480px) {
    font-size: 9px;
  }
`;

// Updated token configuration with new order: KAIA -> USDT -> MBX -> BORA -> SIX
const tokenConfig = [
  {
    symbol: 'KAIA',
    name: 'KAIA price',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png'
  },
  {
    symbol: 'USDT',
    name: 'USDT price',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
  },
  {
    symbol: 'MBX',
    name: 'MARBLEX price',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/18895.png'
  },
  {
    symbol: 'BORA',
    name: 'BORA price',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3801.png'
  },
  {
    symbol: 'SIX',
    name: 'SIX price',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3327.png'
  }
];

const formatLastUpdated = (date: Date | null): string => {
  if (!date) return '';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else if (diffMins > 0) {
    return `${diffMins}m ago`;
  } else {
    return 'Just now';
  }
};

export const TokenPriceSwiper = () => {
  const symbols = tokenConfig.map(token => token.symbol);
  
  const { 
    prices, 
    isLoading, 
    error, 
    getFormattedPrice, 
    getFormattedChange,
    getLastUpdated
  } = usePriceUpdates({ 
    symbols
  });

  if (isLoading && Object.keys(prices).length === 0) {
    return (
      <CardContent>
        <LoadingText>Loading prices...</LoadingText>
      </CardContent>
    );
  }

  if (error && Object.keys(prices).length === 0) {
    return (
      <CardContent>
        <LoadingText>Price data unavailable</LoadingText>
      </CardContent>
    );
  }

  const slides = tokenConfig.map((token, index) => {
    const price = getFormattedPrice(token.symbol);
    const change = getFormattedChange(token.symbol);
    const lastUpdated = getLastUpdated(token.symbol);
    
    return (
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
        <CardValue>{price}</CardValue>
        <CardSubtext $positive={change.isPositive}>
          {change.text}
        </CardSubtext>
        <LastUpdatedText>
          {lastUpdated ? formatLastUpdated(lastUpdated) : ''}
        </LastUpdatedText>
      </CardContent>
    );
  });

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
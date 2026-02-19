import styled from 'styled-components';
import { KAIA_MAINNET_TOKENS } from '@/utils/tokenConfig';
import { useCallback } from "react"


// Styled components for main wallet section
const PortfolioSection = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  padding: 20px 32px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const AssetList = styled.div`
  padding: 16px 0;
`;

const AssetItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AssetIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
`;

const TokenIconImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: contain;
`;

const AssetDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AssetName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const AssetSymbol = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const AssetStats = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
`;

const AssetValue = styled.div`
  text-align: right;
`;

const ValueLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
`;

const ValueAmount = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #64748b;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyStateText = styled.div`
  font-size: 16px;
  margin-bottom: 24px;
`;

interface MainWalletSectionProps {
  balances: any[];
  prices: Record<string, any>;
}

export const MainWalletSection = ({ balances, prices }: MainWalletSectionProps) => {
  
  const getTokenIcon = (symbol: string) => {
    if (symbol === 'KAIA') {
      return 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png';
    }
    if (symbol === 'KUB' || symbol === 'KKUB') {
      return 'https://s2.coinmarketcap.com/static/img/coins/64x64/16093.png';
    }
    if (symbol === 'KUSDT') {
      return 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png';
    }
    if (symbol === 'XTZ') {
      return 'https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png';
    }
    if (symbol === 'WXTZ') {
      return 'https://s2.coinmarketcap.com/static/img/coins/64x64/35930.png';
    }
    if (symbol === 'USDC') {
      return 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png';
    }
    const tokenConfig = KAIA_MAINNET_TOKENS[symbol as keyof typeof KAIA_MAINNET_TOKENS];
    return tokenConfig?.icon || 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png';
  };

  const formatBalance = (balance: string, symbol: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const getTokenPrice = useCallback((symbol: string): number => {
    // Handle special price mappings
    const priceMap: Record<string, string | number> = {
      'MBX': 'MARBLEX',
      'KKUB': 'KUB',
      'KUSDT': 'USDT',
      'USDC': 1, // USDC is pegged to USD
      'WXTZ': 'XTZ',
      'STAKED_KAIA' : "stKAIA"
    };

    const mappedPriceKey = priceMap[symbol];

    // If mappedPriceKey is a number (1 for USDC), return it directly
    if (typeof mappedPriceKey === 'number') {
      return mappedPriceKey;
    }

    // Otherwise, look up the price in the prices object
    const priceKey = mappedPriceKey || symbol;
    const price = prices[priceKey];
    return price ? price.price : 0;
  }, [prices]);

  const getTokenValue = useCallback((token: any) => { 
    const price = getTokenPrice(token.symbol); 
    const balance = parseFloat(token.balance || '0'); 
    return price ? balance * price : 0;
  },[getTokenPrice])

  return (
    <PortfolioSection>
      <SectionHeader>
        <SectionTitle>Main Wallet</SectionTitle>
      </SectionHeader>
      <AssetList>
        {balances.length > 0 ? (
          balances.map((token: any) => (
            <AssetItem key={token.symbol}>
              <AssetInfo>
                <AssetIcon>
                  <TokenIconImage 
                    src={getTokenIcon(token.symbol)} 
                    alt={token.symbol}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      if (img.parentElement) {
                        img.parentElement.innerHTML = `<span style="font-size: 14px; font-weight: 700;">${token.symbol.charAt(0)}</span>`;
                      }
                    }}
                  />
                </AssetIcon>
                <AssetDetails>
                  <AssetName>{token.name}</AssetName>
                  <AssetSymbol>{token.symbol}</AssetSymbol>
                </AssetDetails>
              </AssetInfo>
              <AssetStats>
                <AssetValue>
                  <ValueLabel>Balance</ValueLabel>
                  <ValueAmount>{formatBalance(token.balance, token.symbol)} {token.symbol}</ValueAmount>
                </AssetValue>
                <AssetValue>
                  <ValueLabel>Value</ValueLabel>
                  <ValueAmount>${getTokenValue(token).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ValueAmount>
                </AssetValue>
              </AssetStats>
            </AssetItem>
          ))
        ) : (
          <EmptyState>
            <EmptyStateIcon>💰</EmptyStateIcon>
            <EmptyStateText>No tokens in main wallet</EmptyStateText>
          </EmptyState>
        )}
      </AssetList>
    </PortfolioSection>
  );
};
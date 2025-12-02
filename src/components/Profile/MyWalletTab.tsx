'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';
import { useModalStore } from '@/stores/modalStore';
import { PRICE_API_CONFIG, KAIA_MAINNET_TOKENS } from '@/utils/tokenConfig';
import { RefreshCw, ArrowDownCircle } from 'react-feather';

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const WalletHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const WalletTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WalletAddress = styled.div`
  font-family: monospace;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
  word-break: break-all;
`;

const TotalBalanceSection = styled.div`
  background: linear-gradient(135deg, #f0fdf4, #f8fafc);
  border: 1px solid #00C300;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
`;

const TotalBalanceLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
`;

const TotalBalanceValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
`;

const DepositButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #00C300, #00A000);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 auto;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 195, 0, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TokensSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const RefreshButton = styled.button<{ $loading?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  svg {
    animation: ${({ $loading }) => $loading ? 'spin 1s linear infinite' : 'none'};
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TokenRow = styled.div<{ $hasBalance?: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px;
  background: ${({ $hasBalance }) => $hasBalance ? '#f8fafc' : '#fafbfc'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${({ $hasBalance }) => $hasBalance ? 'transparent' : '#f1f5f9'};
  opacity: ${({ $hasBalance }) => $hasBalance ? 1 : 0.7};

  &:hover {
    background: #f1f5f9;
    border-color: #e2e8f0;
    transform: translateY(-1px);
    opacity: 1;
  }
`;

const TokenIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TokenIconImage = styled.img`
  width: 75%;
  height: 75%;
  object-fit: contain;
`;

const TokenInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TokenName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
  margin-bottom: 2px;
`;

const TokenPrice = styled.div<{ $positive?: boolean }>`
  font-size: 13px;
  color: ${({ $positive }) => $positive ? '#06C755' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TokenBalance = styled.div`
  text-align: right;
`;

const TokenBalanceAmount = styled.div<{ $hasBalance?: boolean }>`
  font-weight: 600;
  color: ${({ $hasBalance }) => $hasBalance ? '#1e293b' : '#94a3b8'};
  font-size: 16px;
  margin-bottom: 2px;
`;

const TokenBalanceValue = styled.div<{ $hasBalance?: boolean }>`
  font-size: 13px;
  color: ${({ $hasBalance }) => $hasBalance ? '#64748b' : '#cbd5e1'};
`;

const ZeroBalanceText = styled.span`
  color: #94a3b8;
  font-style: italic;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
`;

interface MyWalletTabProps {
  totalUSDValue: number;
  onDepositClick: () => void;
  balances: any;
  prices: any;
  refreshBalances: any;
  account: any
  isLoading: boolean;
  getFormattedChange: any;
  getFormattedPrice: any;
  pricesLoading: any
}

export const MyWalletTab: React.FC<MyWalletTabProps> = ({ onDepositClick , totalUSDValue, balances, prices, refreshBalances, account, isLoading, getFormattedChange, getFormattedPrice, pricesLoading }) => {
  
 
  const { openModal } = useModalStore();

  // Get prices for tokens we have API data for
  const apiTokens = PRICE_API_CONFIG.supportedTokens;
  

  // Create a comprehensive list of all supported tokens (with and without balances)
  const getAllSupportedTokens = () => {
    const supportedTokenSymbols = ['KAIA', 'USDT', 'STAKED_KAIA', 'MBX', 'BORA', 'SIX'];
    const tokensList: any = [];

    supportedTokenSymbols.forEach(symbol => {
      // Find existing balance
      const existingBalance = balances.find((b: any) => b.symbol === symbol);

      if (existingBalance) {
        // Use existing balance data
        tokensList.push(existingBalance);
      } else {
        // Create placeholder for tokens with zero balance
        const tokenConfig = symbol === 'KAIA' ?
          {
            symbol: 'KAIA',
            name: 'KAIA',
            balance: '0',
            formattedBalance: '0',
            decimals: 18,
            icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
            iconType: 'image' as const,
            isLoading: false,
            error: null
          } :
          KAIA_MAINNET_TOKENS[symbol as keyof typeof KAIA_MAINNET_TOKENS] ?
            {
              symbol,
              name: KAIA_MAINNET_TOKENS[symbol as keyof typeof KAIA_MAINNET_TOKENS].name,
              balance: '0',
              formattedBalance: '0',
              decimals: KAIA_MAINNET_TOKENS[symbol as keyof typeof KAIA_MAINNET_TOKENS].decimals,
              icon: KAIA_MAINNET_TOKENS[symbol as keyof typeof KAIA_MAINNET_TOKENS].icon,
              iconType: KAIA_MAINNET_TOKENS[symbol as keyof typeof KAIA_MAINNET_TOKENS].iconType,
              isLoading: false,
              error: null
            } : null;

        if (tokenConfig) {
          tokensList.push(tokenConfig);
        }
      }
    });

    return tokensList;
  };

  const displayTokens = getAllSupportedTokens();

  const handleTokenClick = (tokenSymbol: string) => {
    // Handle MBX -> MARBLEX mapping for price lookup
    const priceKey = tokenSymbol === 'MBX' ? 'MBX' : tokenSymbol;

    const tokenData = {
      symbol: tokenSymbol,
      balance: balances.find((b: any) => b.symbol === tokenSymbol) || {
        symbol: tokenSymbol,
        balance: '0',
        formattedBalance: '0'
      },
      price: prices[priceKey]
    };

    openModal('token-details', tokenData);
  };

  const handleRefresh = () => {
    refreshBalances();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  if (!account) {
    return (
      <EmptyState>
        <div>Please connect your wallet to view your balances</div>
      </EmptyState>
    );
  }

  return (
    <TabContainer> 
 
  
      <TokensSection>
        <SectionHeader>
          <SectionTitle>Available Tokens</SectionTitle>
          <RefreshButton onClick={handleRefresh} $loading={isLoading}>
            <RefreshCw size={16} />
            Refresh
          </RefreshButton>
        </SectionHeader>

        {isLoading && balances.length === 0 ? (
          <EmptyState>Loading balances...</EmptyState>
        ) : (
          <TokenList>
            {displayTokens.map((token: any) => {
              const priceKey = token.symbol === 'MBX' ? 'MBX' : token.symbol;

              const priceData = prices[priceKey];
              const change = getFormattedChange(priceKey);
              const currentPrice = getFormattedPrice(priceKey);
              const hasBalance = parseFloat(token.balance) > 0;
              const usdValue = priceData && hasBalance ? parseFloat(token.balance) * priceData.price : 0;

              return (
                <TokenRow
                  key={token.symbol}
                  $hasBalance={hasBalance}
                  onClick={() => handleTokenClick(token.symbol)}
                >
                  <TokenIcon>
                    <TokenIconImage
                      src={token.icon}
                      alt={token.symbol}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        if (img.parentElement) {
                          img.parentElement.innerHTML = `<b>${token.symbol.charAt(0)}</b>`;
                        }
                      }}
                    />
                  </TokenIcon>

                  <TokenInfo>
                    <TokenName>{token.name}</TokenName>
                    {priceData ? (
                      <TokenPrice $positive={change.isPositive}>
                        {currentPrice}
                        <span>{change.text}</span>
                      </TokenPrice>
                    ) : (
                      <TokenPrice $positive={true}>
                        {pricesLoading ? 'Loading...' : 'Price unavailable'}
                      </TokenPrice>
                    )}
                  </TokenInfo>

                  <TokenBalance>
                    <TokenBalanceAmount $hasBalance={hasBalance}>
                      {hasBalance ?
                        `${parseFloat(token.formattedBalance).toFixed(4)} ${token.symbol}` :
                        <ZeroBalanceText>0 {token.symbol}</ZeroBalanceText>
                      }
                    </TokenBalanceAmount>
                    <TokenBalanceValue $hasBalance={hasBalance}>
                      {hasBalance ? `$${usdValue.toFixed(2)}` : <ZeroBalanceText>$0.00</ZeroBalanceText>}
                    </TokenBalanceValue>
                  </TokenBalance>
                </TokenRow>
              );
            })}
          </TokenList>
        )}
      </TokensSection>
    </TabContainer>
  );
};

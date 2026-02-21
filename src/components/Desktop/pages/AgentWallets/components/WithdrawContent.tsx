"use client";

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { AIWalletStatus } from '@/services/aiWalletService';
import { useAITokenBalancesV2, AITokenBalance } from '@/hooks/v2/useAITokenBalancesV2';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';
import { getTokenIcon } from '@/utils/chainConfig';
import {
  ContentCard,
  CardHeader,
  CardTitle,
  ChainSelectorContainer,
  ChainSelectorLabel,
  ChainSelect,
  TokenRow,
  TokenInfo,
  TokenIcon,
  TokenDetails,
  TokenSymbol,
  TokenName,
  TokenAmount,
  TokenUSD,
  FormContainer,
  FormGroup,
  FormLabel,
  FormSelect,
  FormInput,
  Button,
  ActionButtons,
} from '../DesktopAgentWalletsV2Page.styles';

interface WithdrawContentProps {
  aiWalletData: AIWalletStatus | null;
  isLoadingAIWallet: boolean;
}

const CHAINS = [
  { id: 8217, name: 'KAIA', icon: '/images/blockchain-icons/kaia-token-icon.png' },
  { id: 96, name: 'KUB', icon: '/images/blockchain-icons/kub-chain-icon.png' },
  { id: 128123, name: 'Etherlink', icon: '/images/blockchain-icons/etherlink-token-icon.png' },
];

const InfoBanner = styled.div`
  background: linear-gradient(135deg, #fef3c7, #fef9e7);
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const InfoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: rgba(245, 158, 11, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: #92400e;
  margin: 0 0 8px 0;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #78350f;
  margin: 0;
  line-height: 1.6;
`;

const InfoExample = styled.code`
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #92400e;
`;

export const WithdrawContent: React.FC<WithdrawContentProps> = ({ 
  aiWalletData, 
  isLoadingAIWallet 
}) => {
  const [selectedChain, setSelectedChain] = useState<number>(8217);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [showWithdrawInfo, setShowWithdrawInfo] = useState(false);

  // Fetch AI wallet balances
  const { balances: aiBalances, getBalancesByChain, isLoading: isBalancesLoading } = useAITokenBalancesV2(
    aiWalletData?.aiWalletAddress || null
  );

  // Fetch prices for USD calculations
  const { prices } = usePriceUpdates({
    symbols: ["KAIA", "USDT", "stKAIA", "MBX", "BORA", "SIX", "XTZ", "KUB"]
  });

  // Get balances for selected chain
  const chainBalances = getBalancesByChain(selectedChain);

  // Filter tokens with non-zero balances
  const availableTokens = chainBalances.filter(token => 
    parseFloat(token.balance) > 0
  );

  // Helper function to get price for a token symbol
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

  // Calculate USD value for a token
  const getTokenUSDValue = useCallback((balance: string, symbol: string): number => {
    const price = getTokenPrice(symbol);
    const balanceFloat = parseFloat(balance);
    return price * balanceFloat;
  }, [getTokenPrice]);

  const handleMaxClick = () => {
    const token = availableTokens.find(t => t.symbol === selectedToken);
    if (token) {
      setWithdrawAmount(token.balance);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowWithdrawInfo(true);
  };

  const selectedTokenData = availableTokens.find(t => t.symbol === selectedToken);
  const selectedTokenUSDValue = selectedTokenData 
    ? getTokenUSDValue(selectedTokenData.balance, selectedTokenData.symbol)
    : 0;

  const selectedChainInfo = CHAINS.find(c => c.id === selectedChain) || CHAINS[0];

  // Show loading state
  if (isLoadingAIWallet || isBalancesLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '80px 40px',
        gap: '20px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #06C755',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#64748b', fontSize: '16px' }}>Loading AI wallet balances...</p>
      </div>
    );
  }

  return (
    <>
      {/* Chain Selector */}
      <ChainSelectorContainer>
        <ChainSelectorLabel>Current Chain:</ChainSelectorLabel>
        <ChainSelect
          value={selectedChain}
          onChange={(e) => {
            setSelectedChain(Number(e.target.value));
            setSelectedToken('');
            setWithdrawAmount('');
            setShowWithdrawInfo(false);
          }}
        >
          {CHAINS.map(chain => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </ChainSelect>
      </ChainSelectorContainer>

      {/* AI Wallet Balance Card */}
      <ContentCard>
        <CardHeader>
          <CardTitle>Agent Wallet Balance</CardTitle>
        </CardHeader>
        
        {availableTokens.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b',
            fontSize: '14px'
          }}>
            No tokens found in Agent Wallet on {selectedChainInfo.name} chain
          </div>
        ) : (
          availableTokens.map((token) => (
            <TokenRow key={`${token.chainId}-${token.symbol}`}>
              <TokenInfo>
                <TokenIcon src={getTokenIcon(token.symbol) || '/images/icon-token.png'} alt={token.symbol} />
                <TokenDetails>
                  <TokenSymbol>{token.symbol}</TokenSymbol>
                  <TokenName>{token.name}</TokenName>
                </TokenDetails>
              </TokenInfo>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <TokenAmount style={{ fontWeight: 600, fontSize: '16px' }}>
                  {token.balance}
                </TokenAmount>
                <TokenUSD style={{ color: '#64748b', fontSize: '13px' }}>
                  ${getTokenUSDValue(token.balance, token.symbol).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TokenUSD>
              </div>
            </TokenRow>
          ))
        )}
      </ContentCard>

      {/* Withdraw Information Banner */}
      {showWithdrawInfo && (
        <InfoBanner>
          <InfoIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
          </InfoIcon>
          <InfoContent>
            <InfoTitle>Withdraw Instructions</InfoTitle>
            <InfoText>
              For now, to withdraw funds from your AI wallet, go to AI Chat and tell your AI agent:<br/>
              <InfoExample>Withdraw {withdrawAmount || '[amount]'} {selectedToken || '[token]'} to my main wallet</InfoExample>
            </InfoText>
          </InfoContent>
        </InfoBanner>
      )}

      {/* Withdraw Form */}
      <ContentCard>
        <CardHeader>
          <CardTitle>Withdraw from Agent Wallet</CardTitle>
        </CardHeader>
        
        {availableTokens.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b',
            fontSize: '14px'
          }}>
            No tokens available to withdraw on {selectedChainInfo.name} chain
          </div>
        ) : (
          <FormContainer onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel>Select Token</FormLabel>
              <FormSelect
                value={selectedToken}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setSelectedToken(e.target.value);
                  setWithdrawAmount('');
                  setShowWithdrawInfo(false);
                }}
              >
                <option value="">Choose a token...</option>
                {availableTokens.map(token => (
                  <option key={`${token.chainId}-${token.symbol}`} value={token.symbol}>
                    {token.symbol} - {token.name} (Available: {token.balance})
                  </option>
                ))}
              </FormSelect>
            </FormGroup>

            {selectedToken && (
              <>
                <FormGroup>
                  <FormLabel>Amount</FormLabel>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <FormInput
                      type="number"
                      value={withdrawAmount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setWithdrawAmount(e.target.value);
                        setShowWithdrawInfo(false);
                      }}
                      placeholder="0.00"
                      style={{ flex: 1 }}
                      max={selectedTokenData?.balance || ''}
                    />
                    <Button type="button" onClick={handleMaxClick} $variant="secondary">
                      MAX
                    </Button>
                  </div>
                </FormGroup>

                {selectedTokenData && withdrawAmount && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    <span>Available:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      {selectedTokenData.balance} {selectedTokenData.symbol} 
                      ($ {selectedTokenUSDValue.toLocaleString('en-US', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })})
                    </span>
                  </div>
                )}

                <ActionButtons>
                  <Button 
                    type="submit" 
                    $variant="primary" 
                    style={{ flex: 1 }}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  >
                    Withdraw
                  </Button>
                </ActionButtons>
              </>
            )}
          </FormContainer>
        )}
      </ContentCard>
    </>
  );
};
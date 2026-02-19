"use client";

import React, { useCallback } from 'react';
import { Cpu, Loader, ChevronRight, Info, Plus } from 'react-feather';
import { AIWalletStatus } from '@/services/aiWalletService';
import { useAITokenBalancesV2 } from '@/hooks/v2/useAITokenBalancesV2';
import { useTokenBalancesV2 } from '@/hooks/useTokenBalancesV2';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';
import {
  ContentCard,
  CardHeader,
  CardTitle,
  CardValue,
  CardLabel,
  BalanceGrid,
  BalanceCard,
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
  Button,
} from '../DesktopAgentWalletsV2Page.styles';
import { getTokenIcon } from "@/utils/chainConfig"

interface BalanceContentProps {
  selectedChain: number;
  onChainChange: (chainId: number) => void;
  aiWalletData: AIWalletStatus | null;
  isLoadingAIWallet: boolean;
  isCreatingAIWallet: boolean;
  onCreateAIWallet: () => Promise<void>;
  aiWalletError: string | null;
}

const CHAINS = [
  { id: 8217, name: 'KAIA', icon: '/images/blockchain-icons/kaia-token-icon.png' },
  { id: 96, name: 'KUB', icon: '/images/blockchain-icons/kub-chain-icon.png' },
  { id: 42793, name: 'Etherlink', icon: '/images/blockchain-icons/etherlink-icon.png' },
];


export const BalanceContent: React.FC<BalanceContentProps> = ({
  selectedChain,
  onChainChange,
  aiWalletData,
  isLoadingAIWallet,
  isCreatingAIWallet,
  onCreateAIWallet,
  aiWalletError
}) => {
  // Fetch AI wallet balances
  const { isLoading: isLoadingBalances, getBalancesByChain } = useAITokenBalancesV2(
    aiWalletData?.aiWalletAddress || null
  );

  // Fetch main wallet balances
  const { balances: mainWalletBalances } = useTokenBalancesV2();

  // Fetch prices for base tokens only (pegged tokens use the same price)
  const { prices } = usePriceUpdates({
    symbols: ["KAIA", "USDT", "stKAIA", "MBX", "BORA", "SIX", "XTZ", "KUB"]
  });

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

  // Calculate AI wallet balance value for selected chain
  const calculateAIWalletBalance = useCallback(() => {
    const chainBalances = getBalancesByChain(selectedChain);
    return chainBalances.reduce((total: number, token: any) => {
      const price = getTokenPrice(token.symbol);
      const balance = parseFloat(token.balance || '0');
      return total + (price * balance);
    }, 0);
  }, [selectedChain, getBalancesByChain, getTokenPrice]);

  // Calculate main wallet balance value
  const calculateMainWalletBalance = useCallback(() => {
    return mainWalletBalances.reduce((total: number, token: any) => {
      const price = getTokenPrice(token.symbol);
      const balance = parseFloat(token.balance || '0');
      return total + (price * balance);
    }, 0);
  }, [mainWalletBalances, getTokenPrice]);

  // Calculate USD value for a single token
  const getTokenUSDValue = useCallback((symbol: string, balance: string): number => {
    const price = getTokenPrice(symbol);
    const parsedBalance = parseFloat(balance || '0');
    return price * parsedBalance;
  }, [getTokenPrice]);

  // Get balances for the selected chain
  const chainBalances = getBalancesByChain(selectedChain);

  // Filter out tokens with zero balance
  // const nonZeroBalances = chainBalances.filter(b => parseFloat(b.balance) > 0);
  const nonZeroBalances = chainBalances

  // Calculate balances
  const aiWalletBalance = calculateAIWalletBalance();
  const mainWalletBalance = calculateMainWalletBalance();
  const totalBalance = aiWalletBalance + mainWalletBalance;

  const selectedChainInfo = CHAINS.find(c => c.id === selectedChain) || CHAINS[0];

  // Show loading state
  if (isLoadingAIWallet) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 40px',
        gap: '20px'
      }}>
        <Loader size={48} style={{ color: '#06C755', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '16px' }}>Loading AI wallet status...</p>
      </div>
    );
  }

  // Check if capacity is full
  const isCapacityFull = (aiWalletData?.status?.usedWallets ?? 0) >= (aiWalletData?.status?.totalWallets ?? 0);

  // Show create AI wallet UI when no AI wallet exists
  if (!aiWalletData?.hasWallet) {
    return (
      <>
        {aiWalletData?.status && (
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7, #fef9e7)',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Info size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                Agent Wallet (Beta Access)
              </div>
              <div style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.4 }}>
                Agent Wallet is currently in beta with {(aiWalletData.status?.totalWallets || 0) - (aiWalletData.status?.usedWallets || 0)} slots available
                {isCapacityFull && (
                  <div style={{ marginTop: '8px', fontWeight: '600', color: '#dc2626' }}>
                    All slots are currently taken. Please check back later.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 40px',
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <Plus size={48} style={{ color: '#06C755' }} />
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '12px'
          }}>
            Create Agent Wallet
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            lineHeight: 1.6,
            marginBottom: '32px',
            maxWidth: '600px'
          }}>
            Set up your Agent Wallet to enable automated lending, borrowing, and swaps. The wallet will have its own address and operate within your configured limits.
          </p>

          {aiWalletError && (
            <div style={{
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '14px',
              marginBottom: '24px',
              maxWidth: '500px',
              width: '100%'
            }}>
              {aiWalletError}
            </div>
          )}

          <Button
            $variant="primary"
            onClick={onCreateAIWallet}
            disabled={isCreatingAIWallet || isCapacityFull}
            style={{ minWidth: '200px', padding: '14px 32px', fontSize: '16px' }}
          >
            {isCapacityFull ? (
              'Capacity Full'
            ) : isCreatingAIWallet ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader size={18} />
                Creating...
              </span>
            ) : (
              'Create Now'
            )}
          </Button>
        </div>

        <ContentCard>
          <CardHeader>
            <CardTitle>Other Features Available After Creation</CardTitle>
          </CardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px'
            }}>
              <ChevronRight size={20} style={{ color: '#64748b' }} />
              <span style={{ color: '#1e293b', fontSize: '14px' }}>Deposit funds to your AI wallet</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px'
            }}>
              <ChevronRight size={20} style={{ color: '#64748b' }} />
              <span style={{ color: '#1e293b', fontSize: '14px' }}>Manage API keys for external integrations</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px'
            }}>
              <ChevronRight size={20} style={{ color: '#64748b' }} />
              <span style={{ color: '#1e293b', fontSize: '14px' }}>Track all trading activity</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px'
            }}>
              <ChevronRight size={20} style={{ color: '#64748b' }} />
              <span style={{ color: '#1e293b', fontSize: '14px' }}>Set security limits and risk controls</span>
            </div>
          </div>
        </ContentCard>
      </>
    );
  }

  // Show balance content when AI wallet exists
  return (
    <>
      <ChainSelectorContainer>
        <ChainSelectorLabel>Current Chain:</ChainSelectorLabel>
        <ChainSelect
          value={selectedChain}
          onChange={(e) => onChainChange(Number(e.target.value))}
        >
          {CHAINS.map(chain => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </ChainSelect>
      </ChainSelectorContainer>

      <BalanceGrid>
        <BalanceCard>
          <CardLabel>Agent Wallet Balance</CardLabel>
          <CardValue>${aiWalletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CardValue>
        </BalanceCard>

        <BalanceCard>
          <CardLabel>Main Wallet Balance</CardLabel>
          <CardValue>${mainWalletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CardValue>
        </BalanceCard>

        <BalanceCard>
          <CardLabel>Total Balance</CardLabel>
          <CardValue style={{ color: '#06C755' }}>${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CardValue>
        </BalanceCard>
      </BalanceGrid>

      <ContentCard>
        <CardHeader>
          <CardTitle>Token Holdings</CardTitle>
        </CardHeader>
        {isLoadingBalances ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            gap: '12px'
          }}>
            <Loader size={24} style={{ color: '#06C755', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#64748b' }}>Loading balances...</span>
          </div>
        ) : nonZeroBalances.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center'
          }}>
            <span style={{ color: '#64748b' }}>No token holdings on this chain</span>
          </div>
        ) : (
          nonZeroBalances.map((token, index) => (
            <TokenRow key={index}>
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
                  ${getTokenUSDValue(token.symbol, token.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TokenUSD>
              </div>
            </TokenRow>
          ))
        )}
      </ContentCard>
    </>
  );
};

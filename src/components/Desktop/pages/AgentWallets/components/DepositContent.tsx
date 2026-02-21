"use client";

import React, { useState, useCallback } from 'react';
import { AIWalletStatus } from '@/services/aiWalletService';
import { useTokenBalancesV2 } from '@/hooks/useTokenBalancesV2';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';
import { useDepositTransaction } from '@/hooks/v2/useDepositTransaction';
import { useAuth } from '@/contexts/ChainContext';
import { getTokenIcon } from '@/utils/chainConfig';
import { isNativeToken } from '@/config/multiChainTokens';
import { useChainId } from 'wagmi';
import {
  ContentCard,
  CardHeader,
  CardTitle,
  FormContainer,
  FormGroup,
  FormLabel,
  FormSelect,
  FormInput,
  Button,
  ActionButtons,
  TokenRow,
  TokenInfo,
  TokenIcon,
  TokenDetails,
  TokenSymbol,
  TokenName,
  TokenAmount,
  TokenUSD,
} from '../DesktopAgentWalletsV2Page.styles';

interface DepositContentProps {
  aiWalletData: AIWalletStatus | null;
  isLoadingAIWallet: boolean;
}

export const DepositContent: React.FC<DepositContentProps> = ({ aiWalletData, isLoadingAIWallet }) => {
  const [selectedToken, setSelectedToken] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);

  // Auth and chain info
  const { selectedAuthMethod } = useAuth();
  const chainId = useChainId();

  // Fetch real balances from main wallet (automatically uses connected chain)
  const { balances: mainWalletBalances, refetch: refetchMainWallet } = useTokenBalancesV2();

  // Unified deposit transaction hook
  const { sendDeposit, isLoading: transactionLoading, error: transactionError, resetError } = useDepositTransaction();

  // Fetch prices for USD calculations
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

  // Calculate USD value for a single token
  const getTokenUSDValue = useCallback((symbol: string, balance: string): number => {
    const price = getTokenPrice(symbol); 
    const parsedBalance = parseFloat(balance || '0');

    return price * parsedBalance;
  }, [getTokenPrice]);

  // Filter tokens with non-zero balances
  const availableTokens = mainWalletBalances.filter(token => {
    const balance = parseFloat(token.balance || '0');
    return balance > 0;
  });

  // Get selected token data
  const selectedTokenData = availableTokens.find(t => t.symbol === selectedToken);

  const handleMaxClick = () => {
    if (selectedTokenData) {
      setDepositAmount(selectedTokenData.balance);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aiWalletData?.aiWalletAddress) {
      return;
    }

    resetError();
    setDepositSuccess(null);

    try {
      // Determine if this is a native token
      const isNative = isNativeToken(chainId, selectedToken);

      // Send deposit transaction
      await sendDeposit({
        tokenSymbol: selectedToken,
        amount: depositAmount,
        recipient: aiWalletData.aiWalletAddress,
        isNative
      });

      setDepositSuccess(`Successfully deposited ${depositAmount} ${selectedToken} to AI Wallet`);

      // Reset form
      setDepositAmount('');
      setSelectedToken('');

      // Refresh balances
      await refetchMainWallet();

      // TODO: Refresh AI wallet balances once we have a hook for that

    } catch (error: any) {
      // Error is handled by the hook
      console.error('Deposit failed:', error);
    }
  };

  const clearTransactionStatus = () => {
    setDepositSuccess(null);
    resetError();
  };

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
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #06C755',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Loading...</p>
      </div>
    );
  }

  // Show state when no AI wallet exists
  if (!aiWalletData?.hasWallet) {
    return (
      <ContentCard>
        <CardHeader>
          <CardTitle>Deposit</CardTitle>
        </CardHeader>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 40px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '16px' }}>
            Please create an AI wallet first before making deposits.
          </p>
          <Button $variant="primary" onClick={() => {}} disabled>
            Create AI Wallet
          </Button>
        </div>
      </ContentCard>
    );
  }

  return (
    <>
      <ContentCard>
        <CardHeader>
          <CardTitle>Available Tokens</CardTitle>
        </CardHeader>
        {availableTokens.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center'
          }}>
            <span style={{ color: '#64748b' }}>No tokens available on this chain</span>
          </div>
        ) : (
          availableTokens.map((token, index) => (
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

          <ContentCard>
        <CardHeader>
          <CardTitle>Deposit to Agent Wallet</CardTitle>
        </CardHeader>

        {/* Success Message */}
        {depositSuccess && (
          <div style={{
            padding: '12px 16px',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
            color: '#166534',
            fontSize: '14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{depositSuccess}</span>
            <button
              onClick={clearTransactionStatus}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#166534'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Error Message */}
        {transactionError && (
          <div style={{
            padding: '12px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{transactionError}</span>
            <button
              onClick={clearTransactionStatus}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#dc2626'
              }}
            >
              ×
            </button>
          </div>
        )}

        <FormContainer onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>Select Token</FormLabel>
            <FormSelect
              value={selectedToken}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedToken(e.target.value)}
              disabled={availableTokens.length === 0}
            >
              <option value="">Choose a token...</option>
              {availableTokens.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel>Amount</FormLabel>
            <div style={{ display: 'flex', gap: '8px' }}>
              <FormInput
                type="number"
                value={depositAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                disabled={!selectedToken}
                style={{ flex: 1 }}
              />
              <Button 
                type="button" 
                onClick={handleMaxClick} 
                $variant="secondary"
                disabled={!selectedToken}
              >
                MAX
              </Button>
            </div>
            {selectedTokenData && (
              <div style={{ 
                marginTop: '8px', 
                fontSize: '13px', 
                color: '#64748b' 
              }}>
                Available: {selectedTokenData.balance} {selectedTokenData.symbol}
              </div>
            )}
          </FormGroup>

          <ActionButtons>
            <Button 
              type="submit" 
              $variant="primary" 
              style={{ flex: 1 }}
              disabled={!selectedToken || !depositAmount || parseFloat(depositAmount) <= 0 || transactionLoading}
            >
              {transactionLoading ? 'Processing...' : 'Deposit'}
            </Button>
          </ActionButtons>

          {/* Transaction Info */}
          {aiWalletData?.aiWalletAddress && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#64748b'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Agent Wallet Address:</div>
              <div style={{ 
                wordBreak: 'break-all', 
                fontFamily: 'monospace',
                fontSize: '12px'
              }}>
                {aiWalletData.aiWalletAddress}
              </div>
             {/* <div style={{ marginTop: '8px', fontSize: '12px' }}>
                Auth Method: {selectedAuthMethod === 'line_sdk' ? 'LINE SDK' : 'Web3 Wallet'}
              </div>*/}
            </div>
          )}
        </FormContainer>
      </ContentCard>
    </>
  );
};
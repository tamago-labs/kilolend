'use client';

import styled from 'styled-components';
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { KAIA_TESTNET_TOKENS, TokenSymbol, ERC20_ABI } from '@/utils/tokenConfig';
import { getKaiaProvider, parseTokenAmount, getTransactionErrorMessage } from '@/utils/ethersConfig';
import TokenIcon from './TokenIcon';

// NOT USED

const FaucetContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 16px;
`;

const FaucetButton = styled.button<{ $isLoading?: boolean }>`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  cursor: ${props => props.$isLoading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: ${props => props.$isLoading ? 0.6 : 1};
  
  &:hover:not(:disabled) {
    background: #f0fdf4;
    border-color: #00C300;
    color: #00A000;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const FaucetIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingSpinner = styled.div`
  width: 12px;
  height: 12px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #00C300;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StatusMessage = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  grid-column: 1 / -1;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  margin-top: 8px;
  
  ${props => props.$type === 'success' && `
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
  `}
  
  ${props => props.$type === 'error' && `
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  `}
  
  ${props => props.$type === 'info' && `
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
  `}
`;

interface TokenFaucetProps {
  onSuccess?: () => void;
}

// Predefined mint amounts for each token
const MINT_AMOUNTS = {
  USDT: '1000',     // 1,000 USDT
  KRW: '1000000',   // 1,000,000 KRW  
  JPY: '100000',    // 100,000 JPY
  THB: '10000',     // 10,000 THB
  stKAIA: '1000',    // 1000 stKAIA
  wKAIA: '1000',      // 1000 wKAIA
  MARBLEX: '1000',
  BORA: '1000',
  MBX: "100",
  SIX: "1000"
} as const;

export const TokenFaucet = ({ onSuccess }: TokenFaucetProps) => {
  const { account } = useWalletAccountStore();
  const { sendTransaction } = useKaiaWalletSdk();
  const [loadingStates, setLoadingStates] = useState<Record<TokenSymbol, boolean>>({} as Record<TokenSymbol, boolean>);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const setTokenLoading = (symbol: TokenSymbol, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [symbol]: loading }));
  };

  const showStatus = (type: 'success' | 'error' | 'info', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const mintToken = useCallback(async (symbol: TokenSymbol) => {
    if (!account) {
      showStatus('error', 'Please connect your wallet first');
      return;
    }

    const tokenConfig = KAIA_TESTNET_TOKENS[symbol];
    const mintAmount = MINT_AMOUNTS[symbol];

    setTokenLoading(symbol, true);
    
    try {
      // Parse amount to smallest unit based on token decimals
      const amountBigInt = parseTokenAmount(mintAmount, tokenConfig.decimals);
      
      // Create contract interface for encoding
      const iface = new ethers.Interface(ERC20_ABI);
      const data = iface.encodeFunctionData('mint', [account, amountBigInt.toString()]);

      // Prepare transaction
      const transaction = {
        from: account,
        to: tokenConfig.address,
        value: '0x0', // No ETH value for token minting
        gas: '0x186A0', // 100000 gas limit
        data: data
      };

      showStatus('info', `Minting ${mintAmount} ${symbol}...`);

      // Send transaction through wallet
      await sendTransaction([transaction]);
      
      showStatus('success', `Successfully minted ${mintAmount} ${symbol}!`);
      
      // Call success callback to refresh balances
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000); // Wait 2 seconds for blockchain confirmation
      }

    } catch (error: any) {
      console.error(`Error minting ${symbol}:`, error);
      const errorMessage = getTransactionErrorMessage(error);
      showStatus('error', `Failed to mint ${symbol}: ${errorMessage}`);
    } finally {
      setTokenLoading(symbol, false);
    }
  }, [account, sendTransaction, onSuccess]);

  if (!account) {
    return (
      <StatusMessage $type="info">
        Connect your wallet to use the token faucet
      </StatusMessage>
    );
  }

  return (
    <>
      <FaucetContainer>
        {Object.entries(KAIA_TESTNET_TOKENS).map(([symbol, config]) => {
          const tokenSymbol = symbol as TokenSymbol;
          const isLoading = loadingStates[tokenSymbol];
          const mintAmount = MINT_AMOUNTS[tokenSymbol];
          
          return (
            <FaucetButton
              key={symbol}
              onClick={() => mintToken(tokenSymbol)}
              disabled={isLoading}
              $isLoading={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Minting...
                </>
              ) : (
                <>
                  <FaucetIconContainer>
                    <TokenIcon 
                      icon={config.icon} 
                      iconType={config.iconType}
                      alt={config.name}
                      size={14}
                    />
                  </FaucetIconContainer>
                  Get {mintAmount} {symbol}
                </>
              )}
            </FaucetButton>
          );
        })}
      </FaucetContainer>
      
      {statusMessage && (
        <StatusMessage $type={statusMessage.type}>
          {statusMessage.message}
        </StatusMessage>
      )}
    </>
  );
};

export default TokenFaucet;

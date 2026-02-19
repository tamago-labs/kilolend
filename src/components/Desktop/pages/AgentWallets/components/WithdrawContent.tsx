"use client";

import React, { useState } from 'react';
import { AIWalletStatus } from '@/services/aiWalletService';
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
} from '../DesktopAgentWalletsV2Page.styles';

interface WithdrawContentProps {
  aiWalletData: AIWalletStatus | null;
  isLoadingAIWallet: boolean;
}

const AI_WALLET_TOKENS = [
  { symbol: 'KAIA', name: 'Kaia', balance: '500.00', icon: '/images/kaia-token-icon.png' },
  { symbol: 'USDT', name: 'Tether', balance: '2500.00', icon: '/images/icon-usdt.png' },
  { symbol: 'MBX', name: 'MARBLEX', balance: '1250.00', icon: '/images/icon-mbx.png' },
];

export const WithdrawContent: React.FC<WithdrawContentProps> = ({ aiWalletData, isLoadingAIWallet }) => {
  const [selectedToken, setSelectedToken] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleMaxClick = () => {
    const token = AI_WALLET_TOKENS.find(t => t.symbol === selectedToken);
    if (token) {
      setWithdrawAmount(token.balance);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock withdraw action
    alert(`Withdraw ${withdrawAmount} ${selectedToken} from AI Wallet`);
  };

  return (
    <>
      <ContentCard>
        <CardHeader>
          <CardTitle>AI Wallet Balance</CardTitle>
        </CardHeader>
        {AI_WALLET_TOKENS.map((token) => (
          <TokenRow key={token.symbol}>
            <TokenInfo>
              <TokenIcon src={token.icon} alt={token.symbol} />
              <TokenDetails>
                <TokenSymbol>{token.symbol}</TokenSymbol>
                <TokenName>{token.name}</TokenName>
              </TokenDetails>
            </TokenInfo>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                {token.balance}
              </div>
            </div>
          </TokenRow>
        ))}
      </ContentCard>

      <ContentCard>
        <CardHeader>
          <CardTitle>Withdraw from AI Wallet</CardTitle>
        </CardHeader>
        <FormContainer onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>Select Token</FormLabel>
            <FormSelect
              value={selectedToken}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedToken(e.target.value)}
            >
              <option value="">Choose a token...</option>
              {AI_WALLET_TOKENS.map(token => (
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
                value={withdrawAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                style={{ flex: 1 }}
              />
              <Button type="button" onClick={handleMaxClick} $variant="secondary">
                MAX
              </Button>
            </div>
          </FormGroup>

          <ActionButtons>
            <Button type="submit" $variant="primary" style={{ flex: 1 }}>
              Withdraw
            </Button>
          </ActionButtons>
        </FormContainer>
      </ContentCard>
    </>
  );
};
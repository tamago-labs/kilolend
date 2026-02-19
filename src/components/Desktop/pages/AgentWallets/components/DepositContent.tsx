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

interface DepositContentProps {
  aiWalletData: AIWalletStatus | null;
  isLoadingAIWallet: boolean;
}

const AVAILABLE_TOKENS = [
  { symbol: 'KAIA', name: 'Kaia', balance: '1000.00', icon: '/images/kaia-token-icon.png' },
  { symbol: 'USDT', name: 'Tether', balance: '5000.00', icon: '/images/icon-usdt.png' },
  { symbol: 'MBX', name: 'MARBLEX', balance: '2500.00', icon: '/images/icon-mbx.png' },
];

export const DepositContent: React.FC<DepositContentProps> = ({ aiWalletData, isLoadingAIWallet }) => {
  const [selectedToken, setSelectedToken] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  const handleMaxClick = () => {
    const token = AVAILABLE_TOKENS.find(t => t.symbol === selectedToken);
    if (token) {
      setDepositAmount(token.balance);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock deposit action
    alert(`Deposit ${depositAmount} ${selectedToken} to AI Wallet`);
  };

  return (
    <>
      <ContentCard>
        <CardHeader>
          <CardTitle>Available Tokens</CardTitle>
        </CardHeader>
        {AVAILABLE_TOKENS.map((token) => (
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
          <CardTitle>Deposit to AI Wallet</CardTitle>
        </CardHeader>
        <FormContainer onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>Select Token</FormLabel>
            <FormSelect
              value={selectedToken}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedToken(e.target.value)}
            >
              <option value="">Choose a token...</option>
              {AVAILABLE_TOKENS.map(token => (
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
                style={{ flex: 1 }}
              />
              <Button type="button" onClick={handleMaxClick} $variant="secondary">
                MAX
              </Button>
            </div>
          </FormGroup>

          <ActionButtons>
            <Button type="submit" $variant="primary" style={{ flex: 1 }}>
              Deposit
            </Button>
          </ActionButtons>
        </FormContainer>
      </ContentCard>
    </>
  );
};
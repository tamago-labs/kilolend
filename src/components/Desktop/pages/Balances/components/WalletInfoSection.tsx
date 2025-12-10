'use client';

import React from 'react';
import styled from 'styled-components';
import { HelpCircle } from 'react-feather';

const WalletInfoContainer = styled.div`
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 32px;
`;

const InfoTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WalletCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const WalletCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const WalletName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const WalletDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 12px 0;
`;

const WalletFeatures = styled.ul`
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #475569;
`;

const WalletFeature = styled.li`
  margin-bottom: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e2e8f0;
  margin: 20px 0;
`;

const QuickTip = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  padding: 12px;
  margin-top: 16px;
`;

const TipText = styled.p`
  font-size: 13px;
  color: #92400e;
  margin: 0;
  line-height: 1.4;
`;

export const WalletInfoSection: React.FC = () => {
  return (
    <WalletInfoContainer>
      <InfoTitle>
        <HelpCircle size={20} />
        Understanding Your Wallets
      </InfoTitle>
      
      <WalletCardsContainer>
        <WalletCard>
          <WalletName>What is Main Wallet?</WalletName>
          <WalletDescription>
            Your primary wallet connected through KAIA Wallet, Google, LINE, or other wallet providers.
          </WalletDescription>
          <WalletFeatures>
            <WalletFeature>Full control over your connected assets</WalletFeature>
            <WalletFeature>Direct trading and lending with your connected wallet</WalletFeature>
            <WalletFeature>Manage funds across all connected services</WalletFeature>
          </WalletFeatures>
        </WalletCard>

        <WalletCard>
          <WalletName>What is AI Wallet?</WalletName>
          <WalletDescription>
            A dedicated wallet controlled by your AI-agent to implement sophisticated trading strategies.
          </WalletDescription>
          <WalletFeatures>
            <WalletFeature>Automated execution of advanced strategies</WalletFeature>
            <WalletFeature>Integration with multiple DeFi protocols</WalletFeature>
            <WalletFeature>Continuous market analysis and trading</WalletFeature>
          </WalletFeatures>
        </WalletCard>
      </WalletCardsContainer>

      <QuickTip>
        <TipText>
          💡 <strong>Tip:</strong> Transfer funds between wallets to optimize your trading strategy. Use the Main Wallet for manual trades and the AI Wallet for automated strategies.
        </TipText>
      </QuickTip>
    </WalletInfoContainer>
  );
};
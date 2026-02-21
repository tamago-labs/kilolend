"use client";

import styled from 'styled-components';

const HeaderContainer = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  margin: 0;
`;

interface DesktopAgentWalletsHeaderProps {
  account: string | null;
}

export const DesktopAgentWalletsHeader = ({ account }: DesktopAgentWalletsHeaderProps) => {
  return (
    <HeaderContainer>
      <PageTitle>Agent Wallets</PageTitle>
      <PageSubtitle>Connect your wallet to create and manage your Agent Wallet, API keys, and agent skills</PageSubtitle>
    </HeaderContainer>
  );
};
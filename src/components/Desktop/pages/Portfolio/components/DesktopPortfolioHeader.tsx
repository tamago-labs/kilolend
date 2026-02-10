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

interface DesktopPortfolioHeaderProps {
  account: string | null;
  isLoading: boolean;
}

export const DesktopPortfolioHeader = ({ account, isLoading }: DesktopPortfolioHeaderProps) => {
  return (
    <HeaderContainer>
      <PageTitle>Portfolio</PageTitle>
      <PageSubtitle>Manage your lending activities and view your wallet balances</PageSubtitle>
    </HeaderContainer>
  );
};

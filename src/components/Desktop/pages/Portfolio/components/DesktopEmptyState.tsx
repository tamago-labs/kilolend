"use client";

import styled from 'styled-components';
import { WifiOff, TrendingUp } from 'react-feather';

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const EmptyStateGraphic = styled.div`
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #06C755, #059669);
    opacity: 0.1;
  }
`;

const EmptyStateIconWrapper = styled.div`
  font-size: 48px;
  color: #06C755;
  padding-top: 10px;
  z-index: 1;
`;

const EmptyStateTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
`;

const EmptyStateDescription = styled.p`
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 400px;
`;

interface DesktopEmptyStateProps {
  isConnected?: boolean;
}

export const DesktopEmptyState = ({ isConnected = false }: DesktopEmptyStateProps) => {
  if (!isConnected) {
    return (
      <EmptyStateContainer>
        <EmptyStateGraphic>
          <EmptyStateIconWrapper>
            <WifiOff size={48}/>
          </EmptyStateIconWrapper>
        </EmptyStateGraphic>
        <EmptyStateTitle>Connect Your Wallet</EmptyStateTitle>
        <EmptyStateDescription>
          Connect your wallet to manage positions and view available balances
        </EmptyStateDescription>
      </EmptyStateContainer>
    );
  }

  return (
    <EmptyStateContainer>
      <EmptyStateGraphic>
        <EmptyStateIconWrapper>
          <TrendingUp size={48}/>
        </EmptyStateIconWrapper>
      </EmptyStateGraphic>
      <EmptyStateTitle>No Portfolio Positions</EmptyStateTitle>
      <EmptyStateDescription>
        Start supplying assets to earn interest or borrow against collateral to build your portfolio
      </EmptyStateDescription>
    </EmptyStateContainer>
  );
};
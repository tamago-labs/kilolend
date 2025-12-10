import styled from 'styled-components';
import { DollarSign } from 'react-feather';

// Styled components for header
const PortfolioHeader = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PageSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $positive }) => $positive ? '#06C755' : '#ef4444'};
`;

interface PortfolioHeaderProps {
  totalValue: number;
  mainWalletValue: number;
  aiWalletValue: number;
}

export const PortfolioHeaderComponent = ({ 
  totalValue, 
  mainWalletValue, 
  aiWalletValue 
}: PortfolioHeaderProps) => {
  return (
    <PortfolioHeader> 
      <StatsGrid>
        <StatCard>
          <StatLabel>Total Portfolio</StatLabel>
          <StatValue>${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatValue>
          <StatChange $positive>All Wallets</StatChange>
        </StatCard>
        <StatCard>
          <StatLabel>Main Wallet</StatLabel>
          <StatValue>${mainWalletValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatValue>
          <StatChange $positive>Available for Deposit</StatChange>
        </StatCard>
        <StatCard>
          <StatLabel>AI Wallet</StatLabel>
          <StatValue>${aiWalletValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatValue>
          <StatChange $positive>AI Managed</StatChange>
        </StatCard>
      </StatsGrid>
    </PortfolioHeader>
  );
};
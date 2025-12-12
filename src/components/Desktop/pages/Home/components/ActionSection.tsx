"use client";

import styled from 'styled-components';

// Action Section Styles
const ActionSectionWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
`;

const ActionCard = styled.div<{ $gradient?: boolean }>`
  background: ${({ $gradient }) => $gradient 
    ? 'linear-gradient(135deg, #06C755 0%, #059669 100%)' 
    : 'white'};
  color: ${({ $gradient }) => $gradient ? 'white' : '#1e293b'};
  padding: 32px;
  border-radius: 16px;
  border: ${({ $gradient }) => $gradient ? 'none' : '1px solid #e2e8f0'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }
`;

const ActionTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const ActionDescription = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
  opacity: 0.9;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  background: ${({ $primary }) => $primary ? 'white' : 'rgba(255, 255, 255, 0.2)'};
  color: ${({ $primary }) => $primary ? '#06C755' : 'white'};
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${({ $primary }) => $primary ? '#f8fafc' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

interface ActionSectionProps {
  onSupplyClick: () => void;
  onBorrowClick: () => void;
}

export const ActionSection = ({ onSupplyClick, onBorrowClick }: ActionSectionProps) => {
  return (
    <ActionSectionWrapper>
      <ActionCard $gradient onClick={onSupplyClick}>
        <ActionTitle>Supply Assets</ActionTitle>
        <ActionDescription>
          Earn interest by supplying assets to the lending pool. Current best rates up to 8.1% APY.
        </ActionDescription>
        <ActionButton $primary>Start Supplying</ActionButton>
      </ActionCard>
      
      <ActionCard onClick={onBorrowClick}>
        <ActionTitle>Borrow Assets</ActionTitle>
        <ActionDescription>
          Borrow against your collateral at competitive rates. Current borrow rates from 3.2% APR.
        </ActionDescription>
        <ActionButton>Start Borrowing</ActionButton>
      </ActionCard>
    </ActionSectionWrapper>
  );
};

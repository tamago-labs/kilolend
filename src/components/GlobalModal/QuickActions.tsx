'use client';

import styled from 'styled-components';
import { useModalStore } from '@/stores/modalStore';
import { useMarketStore } from '@/stores/marketStore';

const QuickActionButton = styled.button<{ $variant?: 'supply' | 'borrow' }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  ${({ $variant }) =>
    $variant === 'supply' &&
    `
    background: #00C300;
    color: white;
    &:hover { 
      background: #00a000; 
      transform: translateY(-1px);
    }
  `}

  ${({ $variant }) =>
    $variant === 'borrow' &&
    `
    background: #f3f4f6;
    color: #1e293b;
    border: 1px solid #e2e8f0;
    &:hover { 
      background: #e2e8f0; 
      transform: translateY(-1px);
    }
  `}
`;

const ActionContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

interface QuickActionsProps {
  marketId: string;
  showSupply?: boolean;
  showBorrow?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const QuickActions = ({ 
  marketId, 
  showSupply = true, 
  showBorrow = true,
  size = 'medium' 
}: QuickActionsProps) => {
  const { openModal } = useModalStore();
  const { getMarketById } = useMarketStore();

  const market = getMarketById(marketId);
  if (!market) return null;

  const handleAction = (action: 'supply' | 'borrow') => {
    openModal(action, { marketId, action });
  };

  return (
    <ActionContainer>
      {showSupply && (
        <QuickActionButton 
          $variant="supply" 
          onClick={() => handleAction('supply')}
        >
          Supply
        </QuickActionButton>
      )}
      {showBorrow && (
        <QuickActionButton 
          $variant="borrow" 
          onClick={() => handleAction('borrow')}
        >
          Borrow
        </QuickActionButton>
      )}
    </ActionContainer>
  );
};

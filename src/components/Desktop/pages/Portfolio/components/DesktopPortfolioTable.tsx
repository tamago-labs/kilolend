"use client";

import styled from 'styled-components';
import { DesktopAssetItem } from './DesktopAssetItem';

const PortfolioTable = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  padding: 20px 32px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
`;

const AssetList = styled.div`
  max-height: 500px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 32px;
  color: #64748b;
`;

const EmptyStateText = styled.div`
  font-size: 16px;
  line-height: 1.5;
`;

interface Position {
  marketId: string;
  symbol: string;
  type: 'supply' | 'borrow';
  amount: string;
  usdValue: number;
  apy: number;
  icon: string;
  market: any;
}

interface DesktopPortfolioTableProps {
  positions: Position[];
  onAction: (action: string, position: Position) => void;
  type: 'supply' | 'borrow';
}

export const DesktopPortfolioTable = ({ 
  positions, 
  onAction, 
  type 
}: DesktopPortfolioTableProps) => {
  const getEmptyStateText = () => {
    return type === 'supply' 
      ? 'No supplied assets yet. Start earning interest by supplying tokens to the protocol.'
      : 'No borrowed assets yet. Use your supplied assets as collateral to borrow tokens.';
  };

  const getHeaderText = () => {
    return type === 'supply' ? 'Supplied Assets' : 'Borrowed Assets';
  };

  return (
    <PortfolioTable>
      <TableHeader>
        <div>Asset</div>
        <div>Balance</div>
        <div>USD Value</div>
        <div>{type === 'supply' ? 'Supply APY' : 'Borrow APR'}</div>
        <div>Actions</div>
      </TableHeader>
      
      <AssetList>
        {positions.length > 0 ? (
          positions.map((position) => (
            <DesktopAssetItem
              key={`${position.marketId}-${position.type}`}
              position={position}
              onAction={onAction}
            />
          ))
        ) : (
          <EmptyState>
            <EmptyStateText>
              {getEmptyStateText()}
            </EmptyStateText>
          </EmptyState>
        )}
      </AssetList>
    </PortfolioTable>
  );
};

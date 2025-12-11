"use client";

import styled from 'styled-components';
import { DesktopAssetItem } from './DesktopAssetItem';

const PortfolioSection = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  padding: 20px 32px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AssetCount = styled.span`
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
`;

const AssetList = styled.div`
  max-height: 400px;
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

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyStateText = styled.div`
  font-size: 16px;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const StartButton = styled.button<{ $variant?: 'supply' | 'borrow' }>`
  background: ${({ $variant }) => 
    $variant === 'supply' ? 
    'linear-gradient(135deg, #06C755 0%, #059669 100%)' : 
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  };
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${({ $variant }) => 
      $variant === 'supply' ? 'rgba(6, 199, 85, 0.3)' : 'rgba(59, 130, 246, 0.3)'
    };
  }
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

interface DesktopAssetsSectionProps {
  title: string;
  positions: Position[];
  onAction: (action: string, position: Position) => void;
  type: 'supply' | 'borrow';
}

export const DesktopAssetsSection = ({ 
  title, 
  positions, 
  onAction, 
  type 
}: DesktopAssetsSectionProps) => {
  const getEmptyStateText = () => {
    return type === 'supply' 
      ? 'No supplied assets yet'
      : 'No borrowed assets yet';
  };

  const getEmptyStateDescription = () => {
    return type === 'supply'
      ? 'Start earning interest by supplying tokens to the protocol.'
      : 'Use your supplied assets as collateral to borrow tokens.';
  };

  return (
    <PortfolioSection>
      <SectionHeader>
        <SectionTitle>
          {title}
          {positions.length > 0 && (
            <AssetCount>{positions.length}</AssetCount>
          )}
        </SectionTitle>
      </SectionHeader>
      
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
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              {getEmptyStateText()}
            </div>
            <EmptyStateText>
              {getEmptyStateDescription()}
            </EmptyStateText>
          </EmptyState>
        )}
      </AssetList>
    </PortfolioSection>
  );
};

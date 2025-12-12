"use client";

import styled from 'styled-components';

const AssetItemContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  padding: 20px 32px;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const AssetIconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const AssetIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const AssetIconFallback = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #64748b;
`;

const AssetDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const AssetName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const AssetSymbol = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const AssetStats = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
`;

const AssetValue = styled.div`
  text-align: left;
  min-width: 120px;
`;

const ValueLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
  font-weight: 500;
`;

const ValueAmount = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

const APYValue = styled.div<{ $type: 'supply' | 'borrow' }>`
  text-align: right;
  min-width: 100px;
`;

const APYLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
  font-weight: 500;
`;

const APYAmount = styled.div<{ $type: 'supply' | 'borrow' }>`
  font-size: 16px;
  font-weight: 600;
  text-align: left;
  color: ${({ $type }) => $type === 'supply' ? '#06C755' : '#ef4444'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px; 

`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
  
  ${props =>
    props.$variant === 'primary' ? `
      background: linear-gradient(135deg, #00C300, #00A000);
      color: white;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 195, 0, 0.3);
      }
    ` : props.$variant === 'danger' ? `
      background: #ef4444;
      color: white;
      
      &:hover {
        background: #dc2626;
        transform: translateY(-1px);
      }
    ` : `
      background: white;
      color: #64748b;
      border: 1px solid #e2e8f0;
      
      &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
    `
  }

  &:active {
    transform: translateY(0);
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

interface DesktopAssetItemProps {
  position: Position;
  onAction: (action: string, position: Position) => void;
}

export const DesktopAssetItem = ({ position, onAction }: DesktopAssetItemProps) => {
  const handleAction = (action: string) => {
    onAction(action, position);
  };

  return (
    <AssetItemContainer>
      <AssetInfo>
        <AssetIconContainer>
          {position.icon ? (
            <AssetIcon 
              src={position.icon} 
              alt={position.symbol}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML = position.symbol.charAt(0);
                }
              }}
            />
          ) : (
            <AssetIconFallback>{position.symbol.charAt(0)}</AssetIconFallback>
          )}
        </AssetIconContainer>
        <AssetDetails>
          <AssetName>{position.market?.name || position.symbol}</AssetName>
          <AssetSymbol>{position.symbol}</AssetSymbol>
        </AssetDetails>
      </AssetInfo>
      
      <AssetValue>
        <ValueAmount>{parseFloat(position.amount).toFixed(4)}</ValueAmount>
      </AssetValue>
      
      <AssetValue>
        <ValueAmount>${position.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ValueAmount>
      </AssetValue>
      
      <APYValue $type={position.type}>
        <APYAmount $type={position.type}>{position.apy.toFixed(2)}%</APYAmount>
      </APYValue>

      <ActionButtons>
        {position.type === 'supply' ? (
          <ActionButton onClick={() => handleAction('withdraw')}>
            Withdraw
          </ActionButton>
        ) : (
          <ActionButton onClick={() => handleAction('repay')}>
            Repay
          </ActionButton>
        )}
      </ActionButtons>
    </AssetItemContainer>
  );
};

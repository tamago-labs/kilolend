'use client';

import styled from 'styled-components';
import { ContractMarket } from '@/stores/contractMarketStore';

const OverviewTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const PreviewSection = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const PreviewRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    font-weight: 600;
  }
`;

const PreviewLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const PreviewValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const WarningSection = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const WarningText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #92400e;
  line-height: 1.4;
`;

interface SupplyTransactionPreviewProps {
  selectedAsset: ContractMarket;
  amount: string;
  isLoading?: boolean;
}

export const SupplyTransactionPreview = ({
  selectedAsset,
  amount,
  isLoading = false
}: SupplyTransactionPreviewProps) => {
  const usdValue = amount && selectedAsset ? parseFloat(amount) * selectedAsset.price : 0;
  const expectedCTokens = parseFloat(amount || '0') * 5; // Simplified calculation

  return (
    <div>
      <OverviewTitle>Transaction Preview</OverviewTitle>
      
      <PreviewSection>
        <PreviewRow>
          <PreviewLabel>Asset</PreviewLabel>
          <PreviewValue>{selectedAsset.symbol}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Amount</PreviewLabel>
          <PreviewValue>{amount} {selectedAsset.symbol}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>USD Value</PreviewLabel>
          <PreviewValue>${usdValue.toFixed(2)}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Supply APY</PreviewLabel>
          <PreviewValue>{selectedAsset.supplyAPY.toFixed(2)}%</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Est. Gas Fee</PreviewLabel>
          <PreviewValue>~$0.05</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>You will receive</PreviewLabel>
          <PreviewValue>{expectedCTokens.toFixed(2)} c{selectedAsset.symbol}</PreviewValue>
        </PreviewRow>
      </PreviewSection>

      <WarningSection>
        <WarningText>
          By supplying {selectedAsset.symbol}, you will earn {selectedAsset.supplyAPY.toFixed(2)}% APY. 
          {selectedAsset.isCollateralOnly 
            ? ' This asset can be used as collateral for borrowing.' 
            : ' Your supplied assets will be available for others to borrow.'
          }
        </WarningText>
      </WarningSection>
    </div>
  );
};

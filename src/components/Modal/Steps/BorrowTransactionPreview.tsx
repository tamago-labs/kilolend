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

const PreviewValue = styled.span<{ $danger?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $danger }) => $danger ? '#dc2626' : '#1e293b'};
`;

const RiskSection = styled.div<{ $level: 'low' | 'medium' | 'high' }>`
  background: ${({ $level }) => 
    $level === 'high' ? '#fef2f2' : 
    $level === 'medium' ? '#fef3c7' : '#f0fdf4'};
  border: 1px solid ${({ $level }) => 
    $level === 'high' ? '#ef4444' : 
    $level === 'medium' ? '#f59e0b' : '#22c55e'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const RiskTitle = styled.div<{ $level: 'low' | 'medium' | 'high' }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $level }) => 
    $level === 'high' ? '#dc2626' : 
    $level === 'medium' ? '#92400e' : '#166534'};
  margin-bottom: 8px;
`;

const RiskText = styled.p<{ $level: 'low' | 'medium' | 'high' }>`
  margin: 0;
  font-size: 14px;
  color: ${({ $level }) => 
    $level === 'high' ? '#dc2626' : 
    $level === 'medium' ? '#92400e' : '#166534'};
  line-height: 1.4;
`;

const HealthFactorBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  margin: 8px 0;
  overflow: hidden;
`;

const HealthFactorFill = styled.div<{ $percentage: number; $level: 'low' | 'medium' | 'high' }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: ${({ $level }) => 
    $level === 'high' ? '#ef4444' : 
    $level === 'medium' ? '#f59e0b' : '#22c55e'};
  transition: all 0.3s ease;
`;

interface BorrowTransactionPreviewProps {
  selectedAsset: ContractMarket;
  amount: string;
  currentDebt: string;
  borrowingPower: string;
  isLoading?: boolean;
}

export const BorrowTransactionPreview = ({
  selectedAsset,
  amount,
  currentDebt,
  borrowingPower,
  isLoading = false
}: BorrowTransactionPreviewProps) => {
  const amountNum = parseFloat(amount || '0');
  const currentDebtNum = parseFloat(currentDebt || '0');
  const borrowingPowerNum = parseFloat(borrowingPower || '0');
  
  const newTotalDebt = currentDebtNum + amountNum;
  const utilizationAfterBorrow = borrowingPowerNum > 0 ? (newTotalDebt / borrowingPowerNum) * 100 : 0;
  const usdValue = amountNum * selectedAsset.price;
  
  // Calculate health factor (simplified)
  const healthFactor = borrowingPowerNum > 0 ? (borrowingPowerNum / newTotalDebt) : 0;
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (utilizationAfterBorrow > 80) riskLevel = 'high';
  else if (utilizationAfterBorrow > 60) riskLevel = 'medium';

  // Calculate yearly interest
  const yearlyInterest = amountNum * (selectedAsset.borrowAPR / 100);

  return (
    <div>
      <OverviewTitle>Borrow Preview</OverviewTitle>
      
      <PreviewSection>
        {/* <PreviewRow>
          <PreviewLabel>Asset</PreviewLabel>
          <PreviewValue>{selectedAsset.symbol}</PreviewValue>
        </PreviewRow> */}
        <PreviewRow>
          <PreviewLabel>Borrow Amount</PreviewLabel>
          <PreviewValue>{amountNum.toFixed(4)} {selectedAsset.symbol}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>USD Value</PreviewLabel>
          <PreviewValue>${usdValue.toFixed(2)}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Borrow APR</PreviewLabel>
          <PreviewValue>{selectedAsset.borrowAPR.toFixed(2)}%</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Yearly Interest</PreviewLabel>
          <PreviewValue>${yearlyInterest.toFixed(2)}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Current Debt</PreviewLabel>
          <PreviewValue>{currentDebtNum.toFixed(4)} {selectedAsset.symbol}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>New Total Debt</PreviewLabel>
          <PreviewValue>{newTotalDebt.toFixed(4)} {selectedAsset.symbol}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Borrowing Power Used</PreviewLabel>
          <PreviewValue $danger={utilizationAfterBorrow > 80}>
            {utilizationAfterBorrow.toFixed(1)}%
          </PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Health Factor</PreviewLabel>
          <PreviewValue $danger={healthFactor < 1.2}>
            {healthFactor.toFixed(2)}
          </PreviewValue>
        </PreviewRow>
      </PreviewSection>

      {/* Health Factor Visualization */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: '#64748b' }}>
          <span>Health Factor</span>
          <span>{healthFactor.toFixed(2)}</span>
        </div>
        <HealthFactorBar>
          <HealthFactorFill 
            $percentage={Math.min(healthFactor * 50, 100)} 
            $level={riskLevel}
          />
        </HealthFactorBar>
      </div>

      <RiskSection $level={riskLevel}>
        <RiskTitle $level={riskLevel}>
          {riskLevel === 'high' ? '⚠️ High Risk' : 
           riskLevel === 'medium' ? '⚡ Medium Risk' : 
           '✅ Low Risk'}
        </RiskTitle>
        <RiskText $level={riskLevel}>
          {riskLevel === 'high' && 
            'Your position will be at high risk of liquidation. Consider borrowing less or supplying more collateral.'
          }
          {riskLevel === 'medium' && 
            'Your position has moderate risk. Monitor your health factor and be prepared to repay or add collateral if needed.'
          }
          {riskLevel === 'low' && 
            'Your position is relatively safe. You have good collateral coverage for this borrow amount.'
          }
        </RiskText>
      </RiskSection>

      <div style={{ background: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#0369a1' }}>
        <strong>Important:</strong> Interest accrues continuously. Your debt will increase over time. 
        Make sure you can repay the loan to avoid liquidation.
      </div>
    </div>
  );
};

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

const InfoSection = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const InfoText = styled.div`
  font-size: 14px;
  color: #0369a1;
  line-height: 1.4;
`;

interface BorrowTransactionPreviewProps {
  selectedAsset: ContractMarket;
  amount: string;
  currentDebt: string;
  borrowingPowerData: any; // Complete borrowing power data object
  isLoading?: boolean;
}

export const BorrowTransactionPreview = ({
  selectedAsset,
  amount,
  currentDebt,
  borrowingPowerData,
  isLoading = false
}: BorrowTransactionPreviewProps) => {
  const amountNum = parseFloat(amount || '0');
  const currentDebtNum = parseFloat(currentDebt || '0');
  const amountUSD = amountNum * selectedAsset.price;
  
  // Extract borrowing power data
  const totalCollateralValue = parseFloat(borrowingPowerData?.totalCollateralValue || '0');
  const totalBorrowValue = parseFloat(borrowingPowerData?.totalBorrowValue || '0');
  const borrowingPowerRemaining = parseFloat(borrowingPowerData?.borrowingPowerRemaining || '0');
  const currentHealthFactor = parseFloat(borrowingPowerData?.healthFactor || '999');
  
  // Calculate new values after this borrow
  const newTotalBorrowValueUSD = totalBorrowValue + amountUSD;
  const newBorrowingPowerRemaining = borrowingPowerRemaining - amountUSD;
  
  // Calculate new health factor after borrow
  // Health Factor = Total Collateral Value / Total Borrow Value
  const newHealthFactor = newTotalBorrowValueUSD > 0 ? 
    totalCollateralValue / newTotalBorrowValueUSD : 999;
  
  // Calculate utilization percentage
  const utilizationBefore = totalCollateralValue > 0 ? 
    (totalBorrowValue / totalCollateralValue) * 100 : 0;
  const utilizationAfter = totalCollateralValue > 0 ? 
    (newTotalBorrowValueUSD / totalCollateralValue) * 100 : 0;
  
  // Determine risk level based on health factor and utilization
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (newHealthFactor < 1.2 || utilizationAfter > 80) riskLevel = 'high';
  else if (newHealthFactor < 1.5 || utilizationAfter > 60) riskLevel = 'medium';

  // Calculate yearly interest
  const yearlyInterest = amountNum * (selectedAsset.borrowAPR / 100);

  // console.log('BorrowTransactionPreview calculations:', {
  //   amountNum,
  //   amountUSD,
  //   totalCollateralValue,
  //   totalBorrowValue,
  //   newTotalBorrowValueUSD,
  //   currentHealthFactor,
  //   newHealthFactor,
  //   utilizationBefore,
  //   utilizationAfter,
  //   riskLevel
  // });

  return (
    <div>
      <OverviewTitle>Borrow Preview</OverviewTitle>
      
      <PreviewSection>
        <PreviewRow>
          <PreviewLabel>Borrow Amount</PreviewLabel>
          <PreviewValue>{amountNum.toFixed(4)} {selectedAsset.symbol}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>USD Value</PreviewLabel>
          <PreviewValue>${amountUSD.toFixed(2)}</PreviewValue>
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
          <PreviewLabel>Current Total Debt</PreviewLabel>
          <PreviewValue>${totalBorrowValue.toFixed(2)}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>New Total Debt</PreviewLabel>
          <PreviewValue>${newTotalBorrowValueUSD.toFixed(2)}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Total Collateral Value</PreviewLabel>
          <PreviewValue>${totalCollateralValue.toFixed(2)}</PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Utilization</PreviewLabel>
          <PreviewValue $danger={utilizationAfter > 80}>
            {utilizationBefore.toFixed(1)}% → {utilizationAfter.toFixed(1)}%
          </PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Health Factor</PreviewLabel>
          <PreviewValue $danger={newHealthFactor < 1.2}>
            {currentHealthFactor.toFixed(2)} → {newHealthFactor.toFixed(2)}
          </PreviewValue>
        </PreviewRow>
        <PreviewRow>
          <PreviewLabel>Remaining Borrowing Power</PreviewLabel>
          <PreviewValue>${newBorrowingPowerRemaining.toFixed(2)}</PreviewValue>
        </PreviewRow>
      </PreviewSection>

      {/* Health Factor Visualization */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: '#64748b' }}>
          <span>New Health Factor</span>
          <span>{newHealthFactor > 10 ? '10+' : newHealthFactor.toFixed(2)}</span>
        </div>
        <HealthFactorBar>
          <HealthFactorFill 
            $percentage={Math.min((newHealthFactor / 3) * 100, 100)} 
            $level={riskLevel}
          />
        </HealthFactorBar>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
          {`Safe: > 1.5 • Risky: 1.2-1.5 • Danger: < 1.2`}
        </div>
      </div>

      <RiskSection $level={riskLevel}>
        <RiskTitle $level={riskLevel}>
          {riskLevel === 'high' ? '⚠️ High Risk' : 
           riskLevel === 'medium' ? '⚡ Medium Risk' : 
           '✅ Low Risk'}
        </RiskTitle>
        <RiskText $level={riskLevel}>
          {riskLevel === 'high' && 
            `Your health factor will be ${newHealthFactor.toFixed(2)}, which is dangerously low. Your position will be at high risk of liquidation. Consider borrowing less or supplying more collateral.`
          }
          {riskLevel === 'medium' && 
            `Your health factor will be ${newHealthFactor.toFixed(2)}, which indicates moderate risk. Monitor your position closely and be prepared to repay or add collateral if needed.`
          }
          {riskLevel === 'low' && 
            `Your health factor will be ${newHealthFactor.toFixed(2)}, which is relatively safe. You have good collateral coverage for this borrow amount.`
          }
        </RiskText>
      </RiskSection>

      {/* {borrowingPowerData?.enteredMarkets && borrowingPowerData.enteredMarkets.length > 0 && (
        <InfoSection>
          <InfoText>
            <strong>Collateral Assets:</strong> You have {borrowingPowerData.enteredMarkets.length} asset(s) enabled as collateral. 
            If market conditions change significantly, you may need to repay debt or add more collateral to maintain a healthy position.
          </InfoText>
        </InfoSection>
      )} */}

      {/* <div style={{ background: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#0369a1' }}>
        <strong>Important:</strong> Interest accrues continuously. Your debt will increase over time. 
        Monitor your health factor and make sure you can repay the loan to avoid liquidation.
      </div> */}
    </div>
  );
};
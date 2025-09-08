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
  margin-bottom: 16px;
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

const CollateralSection = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const CollateralHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CollateralTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #075985;
  flex: 1;
`;

const CollateralToggle = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #075985;
`;

const ToggleSwitch = styled.input`
  margin-left: 8px;
  width: 16px;
  height: 16px;
`;

const CollateralInfo = styled.p`
  margin: 0;
  font-size: 13px;
  color: #0369a1;
  line-height: 1.4;
`;

const StatusBadge = styled.span<{ $status: 'enabled' | 'disabled' | 'already' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => 
    props.$status === 'enabled' ? '#dcfce7' : 
    props.$status === 'already' ? '#fef3c7' : '#fee2e2'
  };
  color: ${props => 
    props.$status === 'enabled' ? '#166534' : 
    props.$status === 'already' ? '#92400e' : '#991b1b'
  };
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
  needsApproval?: boolean;
  enableAsCollateral?: boolean;
  isMarketAlreadyEntered?: boolean;
  onCollateralToggle?: (enabled: boolean) => void;
}

export const SupplyTransactionPreview = ({
  selectedAsset,
  amount,
  isLoading = false,
  needsApproval = false,
  enableAsCollateral = true,
  isMarketAlreadyEntered = false,
  onCollateralToggle
}: SupplyTransactionPreviewProps) => {
  const usdValue = amount && selectedAsset ? parseFloat(amount) * selectedAsset.price : 0;
  const expectedCTokens = parseFloat(amount || '0') * 5; // Simplified calculation

  const getCollateralStatus = () => {
    if (isMarketAlreadyEntered) return 'already';
    return enableAsCollateral ? 'enabled' : 'disabled';
  };

  const getCollateralStatusText = () => {
    if (isMarketAlreadyEntered) return 'Already Enabled';
    return enableAsCollateral ? 'Will be Enabled' : 'Will not be Enabled';
  };

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
          <PreviewLabel>You will receive</PreviewLabel>
          <PreviewValue>{expectedCTokens.toFixed(2)} c{selectedAsset.symbol}</PreviewValue>
        </PreviewRow>
      </PreviewSection>

      {/* Collateral Configuration Section */}
      {!selectedAsset.isCollateralOnly && (
        <CollateralSection>
          <CollateralHeader>
            <CollateralTitle>Use as Collateral</CollateralTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusBadge $status={getCollateralStatus()}>
                {getCollateralStatusText()}
              </StatusBadge>
              {!isMarketAlreadyEntered && onCollateralToggle && (
                <CollateralToggle>
                  Enable
                  <ToggleSwitch
                    type="checkbox"
                    checked={enableAsCollateral}
                    onChange={(e) => onCollateralToggle(e.target.checked)}
                  />
                </CollateralToggle>
              )}
            </div>
          </CollateralHeader>
          <CollateralInfo>
            {isMarketAlreadyEntered ? (
              `This asset is already enabled as collateral in your account. You can borrow against it immediately after supply.`
            ) : enableAsCollateral ? (
              `This asset will be enabled as collateral, allowing you to borrow against it. You can disable this later if needed.`
            ) : (
              `This asset will only earn supply APY. To use it as collateral for borrowing, you can enable it later in your portfolio.`
            )}
          </CollateralInfo>
        </CollateralSection>
      )}

       
      <WarningSection>
        <WarningText> 
          {selectedAsset.isCollateralOnly 
            ? ' This asset can be used as collateral for borrowing.' 
            : ' Your supplied assets will be available for others to borrow.'
          }
          {needsApproval && ' You will need to approve token spending first.'}
          {enableAsCollateral && !isMarketAlreadyEntered && !selectedAsset.isCollateralOnly && 
            ' Enabling as collateral will increase your borrowing power.'
          }
        </WarningText>
      </WarningSection>
    </div>
  );
};
'use client';

import styled from 'styled-components';
import { Info } from 'react-feather';
import { ContractMarket } from '@/stores/contractMarketStore';
import { formatUSD } from '@/utils/formatters';

const OverviewTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const AssetGrid = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
`;

const AssetCard = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid ${({ $selected }) => $selected ? '#06C755' : '#e2e8f0'};
  background: ${({ $selected }) => $selected ? '#f0fdf4' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ $selected }) => $selected ? '#06C755' : '#cbd5e1'};
    transform: translateY(-1px);
  }
`;

const AssetIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
`;

const AssetIconImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const AssetInfo = styled.div`
  flex: 1;
`;

const AssetName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const AssetDetails = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
`;

const AssetMetrics = styled.div`
  text-align: right;
`;

const APYValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #06C755;
`;

const APYLabel = styled.div`
  font-size: 10px;
  color: #64748b;
  margin-top: 2px;
  font-weight: 500;
`;

const BalanceValue = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
`;

const CollateralInfo = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  border-left: 4px solid #06C755;
`;

const CollateralTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const CollateralText = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
`;

interface SupplyAssetSelectionProps {
  markets: ContractMarket[];
  selectedAsset: ContractMarket | null;
  userBalances: Record<string, string>;
  onAssetSelect: (asset: ContractMarket) => void;
  isLoading?: boolean;
}

export const SupplyAssetSelection = ({ 
  markets, 
  selectedAsset, 
  userBalances,
  onAssetSelect,
  isLoading = false 
}: SupplyAssetSelectionProps) => {
  
  return (
    <div>
      <OverviewTitle>Select Asset to Supply</OverviewTitle>
      <AssetGrid>
        {markets.map((market) => (
          <AssetCard
            key={market.id}
            $selected={selectedAsset?.id === market.id}
            onClick={() => onAssetSelect(market)}
          >
            <AssetIcon>
              <AssetIconImage 
                src={market.icon} 
                alt={market.symbol}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = market.symbol.charAt(0);
                  }
                }}
              />
            </AssetIcon>
            <AssetInfo>
              <AssetName>{market.symbol}</AssetName>
              <AssetDetails>
                {/* {market.isCollateralOnly ? 'Collateral Only' : `Utilization: ${market.utilization.toFixed(1)}%`} */}
                {market.isCollateralOnly && 'Collateral Only • '}
                Liquidity: {formatUSD(market.totalSupply)}
              </AssetDetails>
            </AssetInfo>
            <AssetMetrics>
              <APYValue>{market.supplyAPY.toFixed(1)}%</APYValue> 
              <BalanceValue>
                Balance: {isLoading ? 'Loading...' : (userBalances[market.symbol] || '0.00')} {market.symbol}
              </BalanceValue>
            </AssetMetrics>
          </AssetCard>
        ))}
      </AssetGrid>
      
      <CollateralInfo>
        <CollateralTitle>
          <Info size={16} color="#06C755" />
          About Collateral Assets
        </CollateralTitle>
        <CollateralText>
          Some assets are collateral-only with minimal APY. They cannot be borrowed and serve as reliable collateral within the protocol.
        </CollateralText>
      </CollateralInfo>
    </div>
  );
};

'use client';

import styled, { keyframes } from 'styled-components';
import { TrendingUp, TrendingDown, Shield, AlertCircle, Info } from 'react-feather';
import { ContractMarket } from '@/stores/contractMarketStore';
import { formatUSD } from '@/utils/formatters';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const progressAnimation = keyframes`
  from {
    width: 0%;
  }
  to {
    width: var(--target-width);
  }
`;

const CardContainer = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  padding: 24px; 
  position: relative;
  animation: ${fadeIn} 0.3s ease-out;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const MarketHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const MarketIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MarketIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const MarketIconImage = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
`;

const MarketInfo = styled.div`
  flex: 1;
`;

const MarketName = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
`;

const MarketSymbol = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const MarketBadge = styled.div<{ $type: 'collateral' | 'borrowable' | 'volatile' }>`
  padding: 4px 12px; 
  font-size: 12px;
  font-weight: 600;
  background: ${props => 
    props.$type === 'collateral' ? '#fef3c7' :
    props.$type === 'volatile' ? '#fee2e2' : '#dcfce7'
  };
  color: ${props => 
    props.$type === 'collateral' ? '#92400e' :
    props.$type === 'volatile' ? '#991b1b' : '#166534'
  };
  display: flex;
  align-items: center;
  gap: 4px;
`;

const APYSection = styled.div`
  text-align: right;
`;

const APYValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: #00C300;
  line-height: 1;
  margin-bottom: 4px;
`;

const APYLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
`;

const MetricCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #f1f5f9;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetricValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const MetricSubtext = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

const UtilizationSection = styled.div`
  margin-bottom: 24px;
`;

const UtilizationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const UtilizationLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const UtilizationValue = styled.div<{ $level: 'low' | 'medium' | 'high' }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => 
    props.$level === 'low' ? '#059669' :
    props.$level === 'medium' ? '#d97706' : '#dc2626'
  };
`;

const ProgressBarContainer = styled.div`
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ProgressBar = styled.div<{ $percentage: number; $level: 'low' | 'medium' | 'high' }>`
  height: 100%;
  background: ${props => 
    props.$level === 'low' ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' :
    props.$level === 'medium' ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' : 
    'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
  };
  border-radius: 4px;
  --target-width: ${props => props.$percentage}%;
  animation: ${progressAnimation} 1s ease-out 0.3s both;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const UserBalanceSection = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const BalanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const BalanceLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #075985;
`;

const BalanceValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #0c4a6e;
`;

const BalanceUSD = styled.div`
  font-size: 12px;
  color: #0369a1;
  margin-top: 4px;
`;

const RiskIndicator = styled.div<{ $level: 'low' | 'medium' | 'high' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => 
    props.$level === 'low' ? '#059669' :
    props.$level === 'medium' ? '#d97706' : '#dc2626'
  };
  margin-top: 12px;
`;

const CollateralFactorBadge = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #166534;
  display: flex;
  align-items: center;
  gap: 6px;
`;

interface EnhancedMarketCardProps {
  market: ContractMarket;
  userBalance: string;
  isLoading?: boolean;
}

export const EnhancedMarketCard = ({ 
  market, 
  userBalance,
  isLoading = false 
}: EnhancedMarketCardProps) => {
  
  const utilizationRate = market.utilization || 0;
  const utilizationLevel = utilizationRate < 40 ? 'low' : utilizationRate < 80 ? 'medium' : 'high';
  
  const balanceNumeric = parseFloat(userBalance || '0');
  const balanceUSD = balanceNumeric * market.price;
  
  // const availableLiquidity = parseFloat(`${market.totalSupply}`) - parseFloat(`${market.totalBorrow}`);
  
  const getRiskLevel = () => {
    if (market.isCollateralOnly) return 'low';
    if (utilizationRate > 90) return 'high';
    if (utilizationRate > 70) return 'medium';
    return 'low';
  };

  const getMarketBadgeType = () => {
    if (market.isCollateralOnly) return 'collateral'; 
    return 'borrowable';
  };

  const getBadgeText = () => {
    if (market.isCollateralOnly) return 'Collateral Only'; 
    return 'Borrowable';
  };

  const getBadgeIcon = () => {
    if (market.isCollateralOnly) return <Shield size={12} />; 
    return <TrendingUp size={12} />;
  };

  const getRiskText = () => {
    const level = getRiskLevel();
    switch (level) {
      case 'low': return 'Low Risk';
      case 'medium': return 'Medium Risk';
      case 'high': return 'High Risk';
      default: return 'Unknown Risk';
    }
  };

  const getRiskIcon = () => {
    const level = getRiskLevel();
    switch (level) {
      case 'low': return <Shield size={12} />;
      case 'medium': return <Info size={12} />;
      case 'high': return <AlertCircle size={12} />;
      default: return <Info size={12} />;
    }
  };

  return (
    <CardContainer>
      <MarketHeader>
        <MarketIdentity>
          <MarketIcon>
            <MarketIconImage 
              src={market.icon} 
              alt={market.symbol}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML = market.symbol.charAt(0);
                  target.parentElement.style.fontSize = '24px';
                  target.parentElement.style.fontWeight = 'bold';
                  target.parentElement.style.color = '#64748b';
                }
              }}
            />
          </MarketIcon>
          <MarketInfo>
            <MarketName>{market.name}</MarketName>
            <MarketSymbol>{market.symbol}</MarketSymbol> 
          </MarketInfo>
        </MarketIdentity>
        <APYSection>
          <APYValue>{market.supplyAPY.toFixed(2)}%</APYValue>
          <APYLabel>Supply APY</APYLabel>
        </APYSection>
      </MarketHeader> 
      <UtilizationSection>
        <UtilizationHeader>
          <UtilizationLabel> 
            Market Utilization
          </UtilizationLabel>
          <UtilizationValue $level={utilizationLevel}>
            {utilizationRate.toFixed(1)}%
          </UtilizationValue>
        </UtilizationHeader>
        <ProgressBarContainer>
          <ProgressBar $percentage={utilizationRate} $level={utilizationLevel} />
        </ProgressBarContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '8px'
        }}> 
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {/* {formatUSD(availableLiquidity.toString())} available */}
          {formatUSD(market.totalSupply)} USD liquidity
          </div>
           { getMarketBadgeType() === "collateral" && (
              <MarketBadge $type={"collateral"}> 
              {getBadgeText()}
            </MarketBadge>
            ) }
        </div>
      </UtilizationSection>

      <UserBalanceSection>
        <BalanceHeader>
          <BalanceLabel>Your Balance</BalanceLabel>
          <BalanceValue>
            {isLoading ? 'Loading...' : `${parseFloat(userBalance || '0').toFixed(4)} ${market.symbol}`}
          </BalanceValue>
        </BalanceHeader>
        {!isLoading && balanceUSD > 0 && (
          <BalanceUSD>≈ ${balanceUSD.toFixed(2)} USD</BalanceUSD>
        )}
      </UserBalanceSection>
 
    </CardContainer>
  );
};
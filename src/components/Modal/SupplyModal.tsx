'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { ChevronRight, TrendingUp, Info } from 'react-feather';

// Mock data aligned with deployed contracts
const MOCK_ASSETS = [
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether USD',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    cTokenAddress: '0x3466441C38D2F76405085b730268240E4F2d0D25',
    tokenAddress: '0x5F7392Ec616F829Ab54092e7F167F518835Ac740',
    decimals: 6,
    supplyAPY: 5.2,
    totalSupply: 1200000,
    utilization: 74.2,
    price: 1.0,
    walletBalance: 1500.0,
    currentSupply: 0,
    collateralFactor: 0.85,
    type: 'stablecoin'
  },
  {
    id: 'six',
    symbol: 'SIX',
    name: 'SIX Token',
    icon: 'https://cryptologos.cc/logos/six-six-logo.png',
    cTokenAddress: '0x772195938d86fcf500dF18563876d7Cefcf47e4D',
    tokenAddress: '0xe438E6157Ad6e38A8528fd68eBf5d8C4F57420eC',
    decimals: 18,
    supplyAPY: 8.1,
    totalSupply: 450000,
    utilization: 62.2,
    price: 0.05,
    walletBalance: 10000.0,
    currentSupply: 0,
    collateralFactor: 0.70,
    type: 'volatile'
  },
  {
    id: 'bora',
    symbol: 'BORA',
    name: 'BORA Token',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5222.png',
    cTokenAddress: '0x260fC7251fAe677B6254773d347121862336fb9f',
    tokenAddress: '0xFdB35092c0cf5e1A5175308CB312613972C3DF3D',
    decimals: 18,
    supplyAPY: 7.8,
    totalSupply: 680000,
    utilization: 61.8,
    price: 0.10,
    walletBalance: 5000.0,
    currentSupply: 0,
    collateralFactor: 0.70,
    type: 'volatile'
  },
  {
    id: 'mbx',
    symbol: 'MBX',
    name: 'MARBLEX Token',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/9170.png',
    cTokenAddress: '0x10bB22532eC21Fd25719565f440b0322c010bDF3',
    tokenAddress: '0xCeB75a9a4Af613afd42BD000893eD16fB1F0F057',
    decimals: 18,
    supplyAPY: 6.9,
    totalSupply: 320000,
    utilization: 58.3,
    price: 0.25,
    walletBalance: 2000.0,
    currentSupply: 0,
    collateralFactor: 0.70,
    type: 'volatile'
  },
  {
    id: 'kaia',
    symbol: 'KAIA',
    name: 'KAIA',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/28007.png',
    cTokenAddress: '0x976895C7CdE329144405A584035A5c79F13D544e',
    tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    decimals: 18,
    supplyAPY: 0.1,
    totalSupply: 890000,
    utilization: 0,
    price: 0.15,
    walletBalance: 50.0,
    currentSupply: 0,
    collateralFactor: 0.75,
    type: 'collateral'
  }
];

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const StepProgress = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  padding: 0 20px;
`;

const StepDot = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active, $completed }) => 
    $completed ? '#06C755' : $active ? '#06C755' : '#e2e8f0'};
  margin: 0 4px;
  transition: all 0.3s ease;
`;

const StepContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const OverviewTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

// Step 1: Asset Selection
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

const AssetIcon = styled.img`
  width: 40px;
  height: 40px;
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

// Step 2: Amount Input
const AmountSection = styled.div`
  margin-bottom: 24px;
`;

const AmountLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const AmountInputContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const AmountInput = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  background: white;
  color: #1e293b;
  
  &:focus {
    outline: none;
    border-color: #06C755;
  }
  
  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }
`;

const MaxButton = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: #06C755;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #059212;
  }
`;

const USDValue = styled.div`
  font-size: 14px;
  color: #64748b;
  text-align: center;
  margin-bottom: 16px;
`;

const QuickAmounts = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const QuickAmountButton = styled.button<{ $selected: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${({ $selected }) => $selected ? '#06C755' : '#e2e8f0'};
  background: ${({ $selected }) => $selected ? '#06C755' : 'white'};
  color: ${({ $selected }) => $selected ? 'white' : '#64748b'};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #06C755;
  }
`;

const DetailsCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const StatValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

// Step 3: Transaction Preview
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

// Navigation
const NavigationContainer = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  margin-top: auto;
`;

const NavButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
  
  ${({ $primary }) => $primary ? `
    background: #06C755;
    color: white;
    border-color: #06C755;
    
    &:hover {
      background: #059212;
      border-color: #059212;
      transform: translateY(-1px);
    }
    
    &:disabled {
      background: #94a3b8;
      border-color: #94a3b8;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: white;
    color: #64748b;
    border-color: #e2e8f0;
    
    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  `}
`;

interface SupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupplyModal = ({ isOpen, onClose }: SupplyModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);

  const totalSteps = 4;
  const usdValue = selectedAsset && amount ? parseFloat(amount) * selectedAsset.price : 0;

  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
    setAmount('');
    setSelectedQuickAmount(null);
  };

  const handleQuickAmount = (percentage: number) => {
    if (selectedAsset) {
      const quickAmount = (selectedAsset.walletBalance * percentage / 100).toString();
      setAmount(quickAmount);
      setSelectedQuickAmount(percentage);
    }
  };

  const handleMaxAmount = () => {
    if (selectedAsset) {
      setAmount(selectedAsset.walletBalance.toString());
      setSelectedQuickAmount(100);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedAsset !== null;
      case 2: return amount && parseFloat(amount) > 0;
      case 3: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = () => {
    // Mock transaction
    console.log('Supply Transaction:', {
      asset: selectedAsset,
      amount,
      usdValue
    });
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <OverviewTitle>Select Asset to Supply</OverviewTitle>
            <AssetGrid>
              {MOCK_ASSETS.map((asset) => (
                <AssetCard
                  key={asset.id}
                  $selected={selectedAsset?.id === asset.id}
                  onClick={() => handleAssetSelect(asset)}
                >
                  <AssetIcon src={asset.icon} alt={asset.symbol} />
                  <AssetInfo>
                    <AssetName>{asset.symbol}</AssetName>
                    <AssetDetails>
                      {asset.type === 'collateral' ? 'Collateral Only' : `Utilization: ${asset.utilization}%`}
                      
                    </AssetDetails>
                  </AssetInfo>
                  <AssetMetrics>
                    <APYValue>{asset.supplyAPY}%</APYValue> 
                    <BalanceValue>
                      Balance: {asset.walletBalance.toLocaleString()} {asset.symbol}
                    </BalanceValue>
                  </AssetMetrics>
                </AssetCard>
              ))}
            </AssetGrid>
            
            <CollateralInfo>
              <CollateralTitle>
                <Info size={16} color="#06C755" />
                Collateral Only Assets
              </CollateralTitle>
              <CollateralText>
               KAIA is a collateral-only asset with a nominal 0.1% APY. It cannot be borrowed, and its role is to provide users with a reliable and stable source of collateral within the protocol.
              </CollateralText>
            </CollateralInfo>
          </div>
        );

      case 2:
        return selectedAsset ? (
          <div>
            <OverviewTitle>Enter Supply Amount</OverviewTitle>
            <AmountSection>
              <AmountLabel>Amount to Supply</AmountLabel>
              <AmountInputContainer>
                <AmountInput
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setSelectedQuickAmount(null);
                  }}
                />
                <MaxButton onClick={handleMaxAmount}>MAX</MaxButton>
              </AmountInputContainer>
              {usdValue > 0 && (
                <USDValue>≈ ${usdValue.toFixed(2)} USD</USDValue>
              )}
              <QuickAmounts>
                {[25, 50, 75, 100].map((percentage) => (
                  <QuickAmountButton
                    key={percentage}
                    $selected={selectedQuickAmount === percentage}
                    onClick={() => handleQuickAmount(percentage)}
                  >
                    {percentage}%
                  </QuickAmountButton>
                ))}
              </QuickAmounts>
            </AmountSection>

            <DetailsCard>
              <StatRow>
                <StatLabel>Supply APY</StatLabel>
                <StatValue>{selectedAsset.supplyAPY}%</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Collateral Factor</StatLabel>
                <StatValue>{(selectedAsset.collateralFactor * 100).toFixed(0)}%</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Available Balance</StatLabel>
                <StatValue>{selectedAsset.walletBalance} {selectedAsset.symbol}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Interest Model</StatLabel>
                <StatValue>
                  {selectedAsset.type === 'stablecoin' ? 'Stablecoin Model' : 
                   selectedAsset.type === 'collateral' ? 'Collateral Model' : 'JumpRate Model'}
                </StatValue>
              </StatRow>
            </DetailsCard>
          </div>
        ) : null;

      case 3:
        return selectedAsset ? (
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
                <PreviewValue>{selectedAsset.supplyAPY}%</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>Est. Gas Fee</PreviewLabel>
                <PreviewValue>~$0.05</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>You will receive</PreviewLabel>
                <PreviewValue>{(parseFloat(amount || '0') * 5).toFixed(2)} c{selectedAsset.symbol}</PreviewValue>
              </PreviewRow>
            </PreviewSection>
          </div>
        ) : null;

      case 4:
        return (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <TrendingUp size={48} color="#06C755" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Transaction Submitted!</h3>
            <p style={{ color: '#64748b', margin: 0 }}>
              Your supply transaction has been submitted to the network.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Supply Assets"
    >
      <Container>
        <StepProgress>
          {Array.from({ length: totalSteps }, (_, i) => (
            <StepDot
              key={i}
              $active={i + 1 === currentStep}
              $completed={i + 1 < currentStep}
            />
          ))}
        </StepProgress>

        <StepContent>
          {renderStepContent()}
        </StepContent>

        {currentStep < 4 && (
          <NavigationContainer>
            {currentStep > 1 && (
              <NavButton onClick={handleBack}>
                Back
              </NavButton>
            )}
            <NavButton
              $primary
              disabled={!canProceed()}
              onClick={currentStep === 3 ? handleConfirm : handleNext}
            >
              {currentStep === 3 ? 'Confirm Supply' : 'Next'}
              {currentStep < 3 && <ChevronRight size={16} style={{ marginLeft: '4px' }} />}
            </NavButton>
          </NavigationContainer>
        )}
      </Container>
    </BaseModal>
  );
};
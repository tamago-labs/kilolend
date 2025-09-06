'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { BaseModal } from './BaseModal';
import { ChevronRight, DollarSign, Info } from 'react-feather';

// Mock data aligned with deployed contracts (borrowable assets only - no KAIA)
const MOCK_BORROWABLE_ASSETS = [
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether USD',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    cTokenAddress: '0x3466441C38D2F76405085b730268240E4F2d0D25',
    tokenAddress: '0x5F7392Ec616F829Ab54092e7F167F518835Ac740',
    decimals: 6,
    borrowAPR: 6.1,
    availableLiquidity: 890000,
    utilization: 74.2,
    price: 1.0,
    currentBorrow: 0,
    type: 'stablecoin',
    interestModel: 'Stablecoin Model'
  },
  {
    id: 'six',
    symbol: 'SIX',
    name: 'SIX Token',
    icon: 'https://cryptologos.cc/logos/six-six-logo.png',
    cTokenAddress: '0x772195938d86fcf500dF18563876d7Cefcf47e4D',
    tokenAddress: '0xe438E6157Ad6e38A8528fd68eBf5d8C4F57420eC',
    decimals: 18,
    borrowAPR: 9.2,
    availableLiquidity: 280000,
    utilization: 62.2,
    price: 0.05,
    currentBorrow: 0,
    type: 'volatile',
    interestModel: 'JumpRate Model'
  },
  {
    id: 'bora',
    symbol: 'BORA',
    name: 'BORA Token',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5222.png',
    cTokenAddress: '0x260fC7251fAe677B6254773d347121862336fb9f',
    tokenAddress: '0xFdB35092c0cf5e1A5175308CB312613972C3DF3D',
    decimals: 18,
    borrowAPR: 8.8,
    availableLiquidity: 420000,
    utilization: 61.8,
    price: 0.10,
    currentBorrow: 0,
    type: 'volatile',
    interestModel: 'JumpRate Model'
  },
  {
    id: 'mbx',
    symbol: 'MBX',
    name: 'MARBLEX Token',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/9170.png',
    cTokenAddress: '0x10bB22532eC21Fd25719565f440b0322c010bDF3',
    tokenAddress: '0xCeB75a9a4Af613afd42BD000893eD16fB1F0F057',
    decimals: 18,
    borrowAPR: 7.9,
    availableLiquidity: 195000,
    utilization: 58.3,
    price: 0.25,
    currentBorrow: 0,
    type: 'volatile',
    interestModel: 'JumpRate Model'
  }
];

// Mock user collateral data
const MOCK_USER_COLLATERAL = {
  totalCollateralUSD: 1250.0,
  borrowLimitUSD: 875.0,
  currentBorrowUSD: 0.0,
  healthFactor: 2.5,
  positions: [
    { symbol: 'KAIA', amount: 5000, usdValue: 750, collateralFactor: 0.75, interestModel: 'Collateral Model' },
    { symbol: 'USDT', amount: 500, usdValue: 500, collateralFactor: 0.85, interestModel: 'Stablecoin Model' }
  ]
};

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

// Step 1: Borrowing Power Overview
const PowerCard = styled.div`
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border: 1px solid #bbf7d0;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const PowerValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #06C755;
  margin-bottom: 8px;
`;

const PowerLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
`;

const PowerStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
`;

const PowerStat = styled.div`
  text-align: center;
`;

const PowerStatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

const PowerStatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
`;

// Collateral Positions
const CollateralSection = styled.div`
  margin-bottom: 24px;
`;

const CollateralGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const CollateralCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const CollateralInfo = styled.div``;

const CollateralSymbol = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const CollateralDetails = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
`;

const CollateralValues = styled.div`
  text-align: right;
`;

const CollateralAmount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const CollateralUSD = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
`;

const InterestModelInfo = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  border-left: 4px solid #06C755;
`;

const ModelTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const ModelText = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
`;

// Step 2: Asset Selection
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

const APRValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #ef4444;
`;

const APRLabel = styled.div`
  font-size: 10px;
  color: #64748b;
  margin-top: 2px;
  font-weight: 500;
`;

const LiquidityValue = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
`;

// Step 3: Amount Input with Slider
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

const SafeButton = styled.button`
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

// Collateral Ratio Slider
const SliderSection = styled.div`
  margin: 20px 0;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SliderTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const SliderValue = styled.span<{ $danger?: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${({ $danger }) => $danger ? '#ef4444' : '#06C755'};
`;

const SliderContainer = styled.div`
  position: relative;
  margin: 16px 0;
`;

const SliderTrack = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  position: relative;
`;

const SliderFill = styled.div<{ $percentage: number; $danger?: boolean }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: ${({ $danger }) => $danger ? '#ef4444' : '#06C755'};
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
`;

const HealthFactorCard = styled.div<{ $level: 'safe' | 'medium' | 'danger' }>`
  background: ${({ $level }) => 
    $level === 'safe' ? '#f0fdf4' : 
    $level === 'medium' ? '#fef3c7' : '#fef2f2'};
  border: 1px solid ${({ $level }) => 
    $level === 'safe' ? '#bbf7d0' : 
    $level === 'medium' ? '#fcd34d' : '#fca5a5'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;
`;

const HealthFactorValue = styled.div<{ $level: 'safe' | 'medium' | 'danger' }>`
  font-size: 24px;
  font-weight: 700;
  color: ${({ $level }) => 
    $level === 'safe' ? '#166534' : 
    $level === 'medium' ? '#d97706' : '#dc2626'};
  margin-bottom: 4px;
`;

const HealthFactorLabel = styled.div`
  font-size: 12px;
  color: #64748b;
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

// Step 4: Transaction Preview
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

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BorrowModal = ({ isOpen, onClose }: BorrowModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [amount, setAmount] = useState('');

  const totalSteps = 5;
  const usdValue = selectedAsset && amount ? parseFloat(amount) * selectedAsset.price : 0;
  const newBorrowUSD = MOCK_USER_COLLATERAL.currentBorrowUSD + usdValue;
  const borrowUtilization = (newBorrowUSD / MOCK_USER_COLLATERAL.borrowLimitUSD) * 100;
  const newHealthFactor = newBorrowUSD > 0 ? MOCK_USER_COLLATERAL.totalCollateralUSD / (newBorrowUSD * 1.5) : 999;

  const getHealthFactorLevel = (hf: number) => {
    if (hf >= 2) return 'safe';
    if (hf >= 1.5) return 'medium';
    return 'danger';
  };

  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
    setAmount('');
  };

  const handleSafeAmount = () => {
    if (selectedAsset) {
      const safeUSDAmount = (MOCK_USER_COLLATERAL.borrowLimitUSD - MOCK_USER_COLLATERAL.currentBorrowUSD) * 0.8;
      const safeAmount = (safeUSDAmount / selectedAsset.price).toString();
      setAmount(safeAmount);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return selectedAsset !== null;
      case 3: return amount && parseFloat(amount) > 0 && newHealthFactor >= 1.2;
      case 4: return true;
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
    console.log('Borrow Transaction:', {
      asset: selectedAsset,
      amount,
      usdValue,
      newHealthFactor
    });
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <OverviewTitle>Your Borrowing Power</OverviewTitle>
            <PowerCard>
              <PowerValue>${(MOCK_USER_COLLATERAL.borrowLimitUSD - MOCK_USER_COLLATERAL.currentBorrowUSD).toLocaleString()}</PowerValue>
              <PowerLabel>Available to Borrow</PowerLabel>
              <PowerStats>
                <PowerStat>
                  <PowerStatValue>${MOCK_USER_COLLATERAL.totalCollateralUSD.toLocaleString()}</PowerStatValue>
                  <PowerStatLabel>Total Collateral</PowerStatLabel>
                </PowerStat>
                <PowerStat>
                  <PowerStatValue>{MOCK_USER_COLLATERAL.healthFactor.toFixed(2)}</PowerStatValue>
                  <PowerStatLabel>Health Factor</PowerStatLabel>
                </PowerStat>
              </PowerStats>
            </PowerCard>

            <CollateralSection>
              <OverviewTitle>Your Collateral Positions</OverviewTitle>
              <CollateralGrid>
                {MOCK_USER_COLLATERAL.positions.map((position, index) => (
                  <CollateralCard key={index}>
                    <CollateralInfo>
                      <CollateralSymbol>{position.symbol}</CollateralSymbol>
                      <CollateralDetails>{position.interestModel}</CollateralDetails>
                    </CollateralInfo>
                    <CollateralValues>
                      <CollateralAmount>{position.amount.toLocaleString()} {position.symbol}</CollateralAmount>
                      <CollateralUSD>${position.usdValue.toLocaleString()}</CollateralUSD>
                    </CollateralValues>
                  </CollateralCard>
                ))}
              </CollateralGrid>
            </CollateralSection>
 
          </div>
        );

      case 2:
        return (
          <div>
            <OverviewTitle>Select Asset to Borrow</OverviewTitle>
            <AssetGrid>
              {MOCK_BORROWABLE_ASSETS.map((asset) => (
                <AssetCard
                  key={asset.id}
                  $selected={selectedAsset?.id === asset.id}
                  onClick={() => handleAssetSelect(asset)}
                >
                  <AssetIcon src={asset.icon} alt={asset.symbol} />
                  <AssetInfo>
                    <AssetName>{asset.symbol}</AssetName>
                    <AssetDetails>
                      Utilization: {asset.utilization}%
                    </AssetDetails>
                  </AssetInfo>
                  <AssetMetrics>
                    <APRValue>{asset.borrowAPR}%</APRValue> 
                    <LiquidityValue>
                      Available: {asset.availableLiquidity.toLocaleString()} {asset.symbol}
                    </LiquidityValue>
                  </AssetMetrics>
                </AssetCard>
              ))}
            </AssetGrid>
          </div>
        );

      case 3:
        return selectedAsset ? (
          <div>
            <OverviewTitle>Enter Borrow Amount</OverviewTitle>
            <AmountSection>
              <AmountLabel>Amount to Borrow</AmountLabel>
              <AmountInputContainer>
                <AmountInput
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <SafeButton onClick={handleSafeAmount}>SAFE</SafeButton>
              </AmountInputContainer>
              {usdValue > 0 && (
                <USDValue>≈ ${usdValue.toFixed(2)} USD</USDValue>
              )}
            </AmountSection>

            <SliderSection>
              <SliderLabel>
                <SliderTitle>Collateral Ratio</SliderTitle>
                <SliderValue $danger={borrowUtilization > 80}>
                  {borrowUtilization.toFixed(1)}%
                </SliderValue>
              </SliderLabel>
              <SliderContainer>
                <SliderTrack>
                  <SliderFill 
                    $percentage={borrowUtilization} 
                    $danger={borrowUtilization > 80}
                  />
                </SliderTrack>
              </SliderContainer>
              <SliderLabels>
                <span>Safe (0-60%)</span>
                <span>Risky (80%+)</span>
              </SliderLabels>
            </SliderSection>

            <HealthFactorCard $level={getHealthFactorLevel(newHealthFactor)}>
              <HealthFactorValue $level={getHealthFactorLevel(newHealthFactor)}>
                {newHealthFactor.toFixed(2)}
              </HealthFactorValue>
              <HealthFactorLabel>New Health Factor</HealthFactorLabel>
            </HealthFactorCard>

            <DetailsCard>
              <StatRow>
                <StatLabel>Borrow APR</StatLabel>
                <StatValue>{selectedAsset.borrowAPR}%</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Interest Model</StatLabel>
                <StatValue>{selectedAsset.interestModel}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Available Liquidity</StatLabel>
                <StatValue>{selectedAsset.availableLiquidity.toLocaleString()} {selectedAsset.symbol}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Monthly Interest</StatLabel>
                <StatValue>
                  ${((usdValue * selectedAsset.borrowAPR / 100) / 12).toFixed(2)}
                </StatValue>
              </StatRow>
            </DetailsCard>
          </div>
        ) : null;

      case 4:
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
                <PreviewLabel>Borrow APR</PreviewLabel>
                <PreviewValue>{selectedAsset.borrowAPR}%</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>Interest Model</PreviewLabel>
                <PreviewValue>{selectedAsset.interestModel}</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>Monthly Interest</PreviewLabel>
                <PreviewValue>${((usdValue * selectedAsset.borrowAPR / 100) / 12).toFixed(2)}</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>New Health Factor</PreviewLabel>
                <PreviewValue>{newHealthFactor.toFixed(2)}</PreviewValue>
              </PreviewRow>
              <PreviewRow>
                <PreviewLabel>Est. Gas Fee</PreviewLabel>
                <PreviewValue>~$0.08</PreviewValue>
              </PreviewRow>
            </PreviewSection>
          </div>
        ) : null;

      case 5:
        return (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <DollarSign size={48} color="#06C755" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Borrow Successful!</h3>
            <p style={{ color: '#64748b', margin: 0 }}>
              Your borrow transaction has been submitted to the network.
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
      title="Borrow Assets"
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

        {currentStep < 5 && (
          <NavigationContainer>
            {currentStep > 1 && (
              <NavButton onClick={handleBack}>
                Back
              </NavButton>
            )}
            <NavButton
              $primary
              disabled={!canProceed()}
              onClick={currentStep === 4 ? handleConfirm : handleNext}
            >
              {currentStep === 4 ? 'Confirm Borrow' : 'Next'}
              {currentStep < 4 && <ChevronRight size={16} style={{ marginLeft: '4px' }} />}
            </NavButton>
          </NavigationContainer>
        )}
      </Container>
    </BaseModal>
    );
};
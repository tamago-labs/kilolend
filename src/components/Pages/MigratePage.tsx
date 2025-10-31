'use client';

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useMigration } from '@/contexts/MigrationContext';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useUserPositions } from '@/hooks/useUserPositions';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { MigrationWizard } from '@/components/Migration/MigrationWizard';

const PageContainer = styled.div`
  flex: 1;
  padding: 20px 16px;
  padding-bottom: 80px;
  background: #f8fafc;
  min-height: 100vh;

  @media (max-width: 480px) {
    padding: 16px 12px;
    padding-bottom: 80px;
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
`;

const AlertBanner = styled.div`
  background: linear-gradient(135deg, #06C755, #05a547);
  color: white;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(6, 199, 85, 0.2);
`;

const BannerTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
`;

const PositionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AssetIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const AssetDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AssetName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const AssetBalance = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const ImprovementBadge = styled.span`
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
`;

const ComparisonCard = styled.div<{ $highlight?: boolean }>`
  padding: 16px;
  border-radius: 8px;
  border: 2px solid ${props => props.$highlight ? '#06C755' : '#e2e8f0'};
  background: ${props => props.$highlight ? '#f0fdf4' : 'white'};
`;

const ComparisonLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
`;

const ComparisonValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
`;

const StartButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #06C755, #05a547);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(6, 199, 85, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(6, 199, 85, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
`;

const InfoBox = styled.div`
  background: #eff6ff;
  border: 1px solid #93c5fd;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #1e40af;
`;

const ConnectCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  text-align: center;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    padding: 32px 20px;
    margin-bottom: 16px;
  }
`;

const ConnectIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 28px;
`;

const ConnectTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const ConnectDescription = styled.p`
  font-size: 16px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

const SuccessContent = styled.div`
  padding: 20px 0;
`;

const SuccessText = styled.p`
  margin-bottom: 12px;
  font-size: 16px;
  line-height: 1.6;
`;

const BonusText = styled.p`
  font-size: 20px;
  font-weight: 700;
  color: #06C755;
  margin: 16px 0;
`;

export const MigratePage = () => {
  const { account } = useWalletAccountStore();
  const { positions, isLoading } = useUserPositions();
  const { markets } = useContractMarketStore();
  const { currentStep, setCurrentStep, setV1Positions } = useMigration();

  const [hasV1Positions, setHasV1Positions] = useState(false);
  const [totalSupplyUSD, setTotalSupplyUSD] = useState(0);

  useEffect(() => {
    // Check if user has any V1 positions
    const positionsArray = Object.values(positions);
    const hasPositions = positionsArray.some(
      (pos: any) => parseFloat(pos.supplyBalance) > 0
    );
    setHasV1Positions(hasPositions);

    // Calculate total supply USD
    let total = 0;
    positionsArray.forEach((pos: any) => {
      const market = markets.find(m => m.id === pos.marketId);
      if (market && parseFloat(pos.supplyBalance) > 0) {
        total += parseFloat(pos.supplyBalance) * market.price;
      }
    });
    setTotalSupplyUSD(total);
  }, [positions, markets]);

  const handleStartMigration = () => {
    // Convert positions to V1Position format
    const v1Positions = Object.values(positions)
      .filter((pos: any) => parseFloat(pos.supplyBalance) > 0)
      .map((pos: any) => {
        const market = markets.find(m => m.id === pos.marketId);
        return {
          marketId: pos.marketId,
          symbol: pos.symbol,
          supplyBalance: pos.supplyBalance,
          borrowBalance: pos.borrowBalance,
          priceUSD: market?.price || 0
        };
      });

    setV1Positions(v1Positions);
    setCurrentStep('wizard');
  };

  // Calculate KAIA bonus: ~20 KAIA per user for 4-5 users = ~$100 total
  const kaiaBonus = 20; // KAIA tokens per user
  const bonusUSD = kaiaBonus * 0.11; // ~$2.20 per user

  if (!account) {
    return (
      <PageContainer>
        <PageTitle>Migrate to V2</PageTitle>
        <PageSubtitle>Convenient tool for V1 users to migrate assets to V2 smart contracts</PageSubtitle>
        <ConnectCard>
          <ConnectIcon>👤</ConnectIcon>
          <ConnectTitle>Wallet Not Connected</ConnectTitle>
          <ConnectDescription>
            Please connect your wallet to access the migration tool and transfer your V1 positions to V2
          </ConnectDescription>
        </ConnectCard>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageTitle>Loading</PageTitle>
        <PageSubtitle>Preparing your migration data</PageSubtitle>
      </PageContainer>
    );
  }

  // ✅ ADDED: Wizard step
  if (currentStep === 'wizard') {
    return (
      <PageContainer>
        <PageTitle>Migration Wizard</PageTitle>
        <PageSubtitle>Follow the step-by-step migration process</PageSubtitle>
        <MigrationWizard />
      </PageContainer>
    );
  }

  // ✅ ADDED: Success step
  if (currentStep === 'success') {
    return (
      <PageContainer>
        <PageTitle>Migration Complete</PageTitle>
        <PageSubtitle>Your positions have been successfully transferred to V2</PageSubtitle>
        <Card>
          <CardTitle>Success!</CardTitle>
          <SuccessContent>
            <SuccessText>
              Your positions have been successfully migrated to V2 contracts with enhanced security and stability.
            </SuccessText>
            <BonusText>
              You've earned {kaiaBonus} KAIA bonus!
            </BonusText>
            <SuccessText style={{ fontSize: '14px', color: '#64748b' }}>
              The bonus will be sent to your wallet within 24 hours.
            </SuccessText>
          </SuccessContent>
          <StartButton onClick={() => setCurrentStep('overview')}>
            Back to Overview
          </StartButton>
        </Card>
      </PageContainer>
    );
  }

  // ✅ EXISTING: Overview step (default)
  if (!hasV1Positions) {
    return (
      <PageContainer>
        <PageTitle>Migrate to V2</PageTitle>
        <PageSubtitle>You don't have any positions eligible for migration</PageSubtitle>
        <EmptyState>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            No V1 Positions Found
          </div>
          <div>You don't have any active V1 positions to migrate</div>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Migrate to V2</PageTitle>
      <PageSubtitle>
        Upgrade to our enhanced protocol with improved security and stability
      </PageSubtitle>

      <AlertBanner>
        <BannerTitle>Migration Bonus!</BannerTitle>
        <BenefitsList>
          <BenefitItem>Enhanced protocol security and stability</BenefitItem>
          <BenefitItem>Improved contract architecture for long-term reliability</BenefitItem>
          <BenefitItem>Receive {kaiaBonus} KAIA (~${bonusUSD.toFixed(2)}) bonus!</BenefitItem>
        </BenefitsList>
      </AlertBanner>

      <InfoBox>
        Smart contract migration in progress. We've upgraded to V2 contracts with enhanced
        long-term stability and prepared for future KILO token integration. All existing users will receive a migration bonus!
      </InfoBox>

      <Card>
        <CardTitle>Your V1 Positions</CardTitle>
        {Object.values(positions).map((pos: any) => {
          if (parseFloat(pos.supplyBalance) === 0) return null;

          const market = markets.find(m => m.id === pos.marketId);

          return (
            <PositionItem key={pos.marketId}>
              <AssetInfo>
                <AssetIcon src={market?.icon} alt={pos.symbol} />
                <AssetDetails>
                  <AssetName>{pos.symbol}</AssetName>
                  <AssetBalance>
                    {parseFloat(pos.formattedSupplyBalance).toFixed(4)} supplied
                  </AssetBalance>
                </AssetDetails>
              </AssetInfo>
              <ImprovementBadge>V2 ✓</ImprovementBadge>
            </PositionItem>
          );
        })}
      </Card>

      <Card>
        <CardTitle>Migration Benefits</CardTitle>
        <ComparisonGrid>
          <ComparisonCard>
            <ComparisonLabel>Current Balance</ComparisonLabel>
            <ComparisonValue>${totalSupplyUSD.toFixed(2)}</ComparisonValue>
          </ComparisonCard>
          <ComparisonCard $highlight>
            <ComparisonLabel>KAIA Bonus</ComparisonLabel>
            <ComparisonValue>{kaiaBonus}</ComparisonValue>
          </ComparisonCard>
        </ComparisonGrid>

        <ComparisonGrid style={{ marginTop: '12px' }}>
          <ComparisonCard>
            <ComparisonLabel>V1 Protocol</ComparisonLabel>
            <ComparisonValue>Old</ComparisonValue>
          </ComparisonCard>
          <ComparisonCard $highlight>
            <ComparisonLabel>V2 Protocol</ComparisonLabel>
            <ComparisonValue>New</ComparisonValue>
          </ComparisonCard>
        </ComparisonGrid>
      </Card>

      <StartButton onClick={handleStartMigration}>
        Start Migration →
      </StartButton>
    </PageContainer>
  );
};

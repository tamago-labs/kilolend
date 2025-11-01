'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ArrowLeft, TrendingUp, AlertCircle } from 'react-feather';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useModalStore } from '@/stores/modalStore';
import { useDualPositions } from '@/hooks/useDualPositions';
import { useMigrationContract } from '@/hooks/useMigrationContract';
import { AssetMigrationCard } from '@/components/Migration/AssetMigrationCard';
import { EligibilityStatus } from '@/components/Migration/EligibilityStatus';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  overflow-y: auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;
 

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: ${({ $active }) => $active ? '#06C755' : '#64748b'};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $active }) => $active ? '#06C755' : 'transparent'};
    transition: all 0.2s ease;
  }
  
  &:hover {
    color: ${({ $active }) => $active ? '#06C755' : '#1e293b'};
  }
`;

const Content = styled.div`
  min-height: 400px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  border: 1px solid #cbd5e1;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #64748b;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const EmptyDescription = styled.p`
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
`;

const InfoCard = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InfoIcon = styled.div`
  color: #0ea5e9;
  flex-shrink: 0;
`;

const InfoText = styled.div`
  font-size: 14px;
  color: #0369a1;
  line-height: 1.5;
`;

type TabType = 'supply' | 'borrow';

export const MigratePage = () => {
  const { account } = useWalletAccountStore();
  const { openModal, closeModal } = useModalStore();
  const { hackathonPositions, v1Positions, isLoading } = useDualPositions();
  const { 
    checkHackathonEligibility, 
    checkV1Eligibility, 
    getBonusStatus, 
    claimBonus, 
    isLoading: isClaimingBonus 
  } = useMigrationContract();
  
  const [activeTab, setActiveTab] = useState<TabType>('supply');
  const [hackathonEligible, setHackathonEligible] = useState(false);
  const [v1Eligible, setV1Eligible] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<Record<string, string>>({});

  // Check eligibility when account changes
  useEffect(() => {
    const checkEligibility = async () => {
      if (!account) return;

      try {
        const [hackEligible, v1Eligible, bonusStatus] = await Promise.all([
          checkHackathonEligibility(account),
          checkV1Eligibility(account),
          getBonusStatus(account)
        ]);

        setHackathonEligible(hackEligible);
        setV1Eligible(v1Eligible);
        setBonusClaimed(bonusStatus.claimed);
      } catch (error) {
        console.error('Error checking eligibility:', error);
      }
    };

    checkEligibility();
  }, [account]);

  // Initialize migration status
  useEffect(() => {
    const status: Record<string, string> = {};
    
    hackathonPositions.forEach(position => {
      const key = `${position.marketId}-supply`;
      status[key] = 'pending';
    });
    
    hackathonPositions.forEach(position => {
      const key = `${position.marketId}-borrow`;
      status[key] = 'pending';
    });

    setMigrationStatus(status);
  }, [hackathonPositions]);

  const handleWithdraw = (position: any) => {
    openModal('withdraw', {
      market: position,
      currentSupply: position.formattedSupplyBalance,
      maxWithdraw: position.formattedSupplyBalance
    });
  };

  const handleSupply = (position: any) => {
    openModal('supply', {
      preSelectedMarket: position
    });
  };

  const handleRepay = (position: any) => {
    openModal('repay', {
      market: position,
      currentDebt: position.formattedBorrowBalance,
      totalDebt: position.formattedBorrowBalance
    });
  };

  const handleClaimBonus = async () => {
    try {
      const result = await claimBonus();
      if (result.status === 'confirmed') {
        setBonusClaimed(true);
      }
    } catch (error) {
      console.error('Error claiming bonus:', error);
    }
  };

  const getSupplyPositions = () => {
    return hackathonPositions.filter(pos => 
      parseFloat(pos.formattedSupplyBalance) > 0
    );
  };

  const getBorrowPositions = () => {
    return hackathonPositions.filter(pos => 
      parseFloat(pos.formattedBorrowBalance) > 0
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <EmptyState> 
        <EmptyTitle>Loading positions...</EmptyTitle>
      </EmptyState>;
    }

    switch (activeTab) {
      case 'supply':
        const supplyPositions = getSupplyPositions();
        if (supplyPositions.length === 0) {
          return (
            <EmptyState> 
              <EmptyTitle>No Supply Positions Found</EmptyTitle>
              <EmptyDescription>
                You don't have any supply positions in the hackathon version that need migration.
              </EmptyDescription>
            </EmptyState>
          );
        }

        return (
          <>
            {/* <InfoCard>
              <InfoIcon><AlertCircle size={20} /></InfoIcon>
              <InfoText>
                Migrate your supply positions from the hackathon version to V1. 
                First withdraw from hackathon, then supply to V1 to complete the migration.
              </InfoText>
            </InfoCard> */}
            {supplyPositions.map(position => (
              <AssetMigrationCard
                key={position.marketId}
                position={position}
                type="supply"
                migrationStatus={migrationStatus[`${position.marketId}-supply`] || 'pending'}
              />
            ))}
          </>
        );

      case 'borrow':
        const borrowPositions = getBorrowPositions();
        if (borrowPositions.length === 0) {
          return (
            <EmptyState> 
              <EmptyTitle>No Borrow Positions Found</EmptyTitle>
              <EmptyDescription>
                You don't have any borrow positions in the hackathon version.
              </EmptyDescription>
            </EmptyState>
          );
        }

        return (
          <>
            {/* <InfoCard>
              <InfoIcon><AlertCircle size={20} /></InfoIcon>
              <InfoText>
                Repay your borrow positions from the hackathon version. 
                This will improve your health factor and reduce your debt.
              </InfoText>
            </InfoCard> */}
            {borrowPositions.map(position => (
              <AssetMigrationCard
                key={position.marketId}
                position={position}
                type="borrow"
                migrationStatus={migrationStatus[`${position.marketId}-borrow`] || 'pending'}
              />
            ))}
          </>
        );


      default:
        return null;
    }
  };

  return (
    <Container>
      <Header> 
        <Title>Migrate to V1</Title>
        <Subtitle>
          Migrate your assets from the hackathon version to V1 and claim your 100 KAIA bonus.
        </Subtitle>
      </Header>

      <TabContainer>
        <Tab 
          $active={activeTab === 'supply'} 
          onClick={() => setActiveTab('supply')}
        >
          Supply Positions ({getSupplyPositions().length})
        </Tab>
        <Tab 
          $active={activeTab === 'borrow'} 
          onClick={() => setActiveTab('borrow')}
        >
          Borrow Positions ({getBorrowPositions().length})
        </Tab>
      </TabContainer>

      <Content>
        {renderContent()} 
      </Content>

      <EligibilityStatus
        hackathonEligible={hackathonEligible}
        v1Eligible={v1Eligible}
        bonusClaimed={bonusClaimed}
        onClaimBonus={handleClaimBonus}
        isClaimingBonus={isClaimingBonus}
      />
    </Container>
  );
};

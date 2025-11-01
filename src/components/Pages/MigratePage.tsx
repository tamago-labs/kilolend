'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ArrowLeft, TrendingUp, AlertCircle, AlertTriangle } from 'react-feather';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useDualPositions } from '@/hooks/useDualPositions';
import { useMigrationContract } from '@/hooks/useMigrationContract';
import { AssetMigrationCard } from '@/components/Migration/AssetMigrationCard';
import { EligibilityStatus } from '@/components/Migration/EligibilityStatus';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { Position } from '@/hooks/useDualPositions';
import { useMarketContract } from '@/hooks/useMarketContract';
import { useMarketContract as useV1MarketContract } from '@/hooks/v1/useMarketContract';
import { useBorrowingPower } from '@/hooks/useBorrowingPower';
import { truncateToSafeDecimals, validateAmountAgainstBalance, getSafeMaxAmount } from '@/utils/tokenUtils';
import { useTokenApproval } from '@/hooks/useTokenApproval'; // For repay
import { useTokenApproval as useV1TokenApproval } from '@/hooks/v1/useTokenApproval'; // For supply
import { useComptrollerContract } from '@/hooks/v1/useComptrollerContract';


const Container = styled.div`
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

const Header = styled.div`
  margin-bottom: 32px;
`;


const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
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
  flex: 1;
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

  const { getBalanceBySymbol } = useTokenBalances();

  const { account } = useWalletAccountStore();
  const { hackathonPositions, v1Positions, isLoading, refreshPositions } = useDualPositions();
  const { withdraw: hackathonWithdraw, repay: hackathonRepay } = useMarketContract();
  const { supply: v1Supply } = useV1MarketContract();
  const {
    checkAllowance: checkV1Allowance,
    ensureApproval: ensureV1Approval
  } = useV1TokenApproval();
  const {
    checkAllowance: checkHackathonAllowance,
    ensureApproval: ensureHackathonApproval
  } = useTokenApproval();
  const { enterMarkets, isMarketEntered } = useComptrollerContract();
  const { calculateBorrowingPower } = useBorrowingPower();


  // const {
  //     checkHackathonEligibility,
  //     checkV1Eligibility,
  //     getBonusStatus,
  //     claimBonus,
  //     isLoading: isClaimingBonus
  // } = useMigrationContract();

  const [activeTab, setActiveTab] = useState<TabType>('supply');
  // const [hackathonEligible, setHackathonEligible] = useState(false);
  // const [v1Eligible, setV1Eligible] = useState(false);
  // const [bonusClaimed, setBonusClaimed] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<Record<string, string>>({});

   

  const borrowPositions = hackathonPositions.filter(pos =>
    parseFloat(pos.formattedSupplyBalance) > 0 ||
    parseFloat(pos.formattedBorrowBalance) > 0
  );

  const supplyPositions = hackathonPositions.filter(pos =>
    parseFloat(pos.formattedSupplyBalance) > 0 ||
    parseFloat(pos.formattedBorrowBalance) > 0
  );

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
          Supply Positions
        </Tab>
        <Tab
          $active={activeTab === 'borrow'}
          onClick={() => setActiveTab('borrow')}
        >
          Borrow Positions
        </Tab>
      </TabContainer>

      <Content>

        {isLoading && (
          <EmptyState>
            <EmptyTitle>Loading positions...</EmptyTitle>
          </EmptyState>
        )}

        {!isLoading && (
          <>
            {activeTab === "supply" && (
              <>
                {supplyPositions.length === 0 ?
                  <EmptyState>
                    <EmptyTitle>No Supply Positions Found</EmptyTitle>
                    <EmptyDescription>
                      You don't have any supply positions in the hackathon version that need migration.
                    </EmptyDescription>
                  </EmptyState>
                  : <>
                    <InfoCard>
                      <InfoIcon><AlertCircle size={20} /></InfoIcon>
                      <InfoText>
                        Ensure you have repaid all debts before starting to withdraw from the hackathon version and supplying to v1.
                      </InfoText>
                    </InfoCard>
                    {supplyPositions.map(position => (
                      <AssetMigrationCard
                        key={position.marketId}
                        position={position}
                        type="supply"
                        migrationStatus={migrationStatus[`${position.marketId}-supply`] || 'pending'}
                        onRefreshPositions={refreshPositions}
                        getBalanceBySymbol={getBalanceBySymbol}
                        account={account}
                        hackathonWithdraw={hackathonWithdraw}
                        hackathonRepay={hackathonRepay}
                        v1Supply={v1Supply}
                        checkV1Allowance={checkV1Allowance}
                        ensureV1Approval={ensureV1Approval}
                        checkHackathonAllowance={checkHackathonAllowance}
                        ensureHackathonApproval={ensureHackathonApproval}
                        enterMarkets={enterMarkets}
                        isMarketEntered={isMarketEntered}
                        calculateBorrowingPower={calculateBorrowingPower}
                      />
                    ))}
                  </>
                }
              </>
            )

            }
            {activeTab === "borrow" && (
              <>
                {supplyPositions.length === 0 ?
                  <EmptyState>
                    <EmptyTitle>No Borrow Positions Found</EmptyTitle>
                    <EmptyDescription>
                      You don't have any borrow positions in the hackathon version.
                    </EmptyDescription>
                  </EmptyState>
                  : <>
                    {borrowPositions.map(position => (
                      <AssetMigrationCard
                        key={position.marketId}
                        position={position}
                        type="borrow"
                        migrationStatus={migrationStatus[`${position.marketId}-borrow`] || 'pending'}
                        onRefreshPositions={refreshPositions}
                        getBalanceBySymbol={getBalanceBySymbol}
                        account={account}
                        hackathonWithdraw={hackathonWithdraw}
                        hackathonRepay={hackathonRepay}
                        v1Supply={v1Supply}
                        checkV1Allowance={checkV1Allowance}
                        ensureV1Approval={ensureV1Approval}
                        checkHackathonAllowance={checkHackathonAllowance}
                        ensureHackathonApproval={ensureHackathonApproval}
                        enterMarkets={enterMarkets}
                        isMarketEntered={isMarketEntered}
                        calculateBorrowingPower={calculateBorrowingPower}
                      />
                    ))}
                  </>
                }
              </>
            )

            }
          </>
        )}

      </Content>

      <InfoCard>
        <InfoIcon><AlertCircle size={20} /></InfoIcon>
        <InfoText>
          Stay tuned for the bonus claim. Follow our Twitter/X for announcements.
        </InfoText>
      </InfoCard>

      <br />
      <br />
      <br />
      <br />
      <br />



    </Container >
  )
}

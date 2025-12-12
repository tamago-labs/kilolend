"use client";

import styled, { keyframes } from 'styled-components';
import { AlertCircle, RefreshCw, TrendingUp, Award } from 'react-feather';
import { useUserPoints, formatNumber, formatDate } from '../hooks/useLeaderboardData';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const UserPointsContainer = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const TotalPointsBanner = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  padding: 32px;
  text-align: right;
  position: relative;
  overflow: hidden;
  color: #1e293b;
  min-height: 140px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;


const TotalPointsLabel = styled.p`
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TotalPointsValue = styled.p`
  font-size: 36px;
  font-weight: 700;
  margin: 0;
`;

const LastUpdatedText = styled.p`
  font-size: 12px;
  opacity: 0.75;
  margin: 4px 0 0 0;
`;

const ContentSection = styled.div`
  padding: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DailyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
    
    &:hover {
      background: #94a3b8;
    }
  }
`;

const DailyItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
`;

const DailyItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DateIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  flex-shrink: 0;
`;

const DateText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #475569;
`;

const DailyItemRight = styled.div`
  text-align: right;
`;

const PointsValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
`;

const KiloLabel = styled.span`
  font-size: 12px;
  color: #64748b;
  margin-left: 4px;
`;

const InfoCard = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
`;

const InfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #ecfdf5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
`;

const InfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  line-height: 1.4;
`;

const BenefitIcon = styled.div`
  width: 16px;
  height: 16px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 24px;
  color: #64748b;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #06C755;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px 24px;
  color: #ef4444;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 48px 24px;
`;

const EmptyStateIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #64748b;
`;

const EmptyStateTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const EmptyStateText = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
`;

const ConnectWalletMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 32px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  color: #64748b;
  font-size: 16px;
  font-weight: 600;
  
  svg {
    color: #3b82f6;
  }
`;

interface UserPointsSectionProps {
  className?: string;
}

export const UserPointsSection = ({ className }: UserPointsSectionProps) => {
  const { account } = useWalletAccountStore();
  const { data, loading, error, refetch } = useUserPoints(account || undefined);

  const renderContent = () => {
    if (!account) {
      return (
        <ConnectWalletMessage>
          <AlertCircle size={16} />
          Please connect your wallet to view your KILO points
        </ConnectWalletMessage>
      );
    }

    if (loading) {
      return (
        <LoadingState>
          <LoadingSpinner />
          Loading your KILO points...
        </LoadingState>
      );
    }

    if (error) {
      return (
        <ErrorState>
          <div style={{ marginBottom: '16px' }}>❌ Error loading points</div>
          <RetryButton onClick={refetch}>
            <RefreshCw size={16} />
            Retry
          </RetryButton>
        </ErrorState>
      );
    }

    if (!data) {
      return (
        <EmptyStateContainer>
          <EmptyStateIcon>
            <Award size={32} />
          </EmptyStateIcon>
          <EmptyStateTitle>No Points Data</EmptyStateTitle>
          <EmptyStateText>
            Unable to load your points information. Please try again later.
          </EmptyStateText>
        </EmptyStateContainer>
      );
    }

    if (data.isNewUser) {
      return (
        <EmptyStateContainer>
          <EmptyStateIcon>
            <TrendingUp size={32} />
          </EmptyStateIcon>
          <EmptyStateTitle>Start Earning KILO!</EmptyStateTitle>
          <EmptyStateText>
            Supply or borrow assets to start earning KILO points daily.
            Points are distributed based on your lending activity.
          </EmptyStateText>
        </EmptyStateContainer>
      );
    }

    const dailyEntries = Object.entries(data.dailyBreakdown || {})
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA));

    return (
      <>
        <ContentSection>
          <SectionTitle>
            <TrendingUp size={20} />
            Daily Breakdown
          </SectionTitle>
          <DailyList>
            {dailyEntries.map(([date, points]) => (
              <DailyItem key={date}>
                <DailyItemLeft>
                  <DateIndicator />
                  <DateText>{formatDate(date)}</DateText>
                </DailyItemLeft>
                <DailyItemRight>
                  <PointsValue>+{formatNumber(points)}</PointsValue>
                  <KiloLabel>KILO</KiloLabel>
                </DailyItemRight>
              </DailyItem>
            ))}
          </DailyList>

          {dailyEntries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
              No daily rewards yet
            </div>
          )}
        </ContentSection>

        {/*<InfoCard>
          <InfoHeader>
            <InfoIcon>
              <Award size={20} />
            </InfoIcon>
            <InfoTitle>How KILO Points Work</InfoTitle>
          </InfoHeader>
          <BenefitsList>
            <BenefitItem>
              <BenefitIcon>+</BenefitIcon>
              <span><strong>100,000 points</strong> are allocated daily at midnight GMT.</span>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon>+</BenefitIcon>
              <span>Your share is based on your <strong>daily net contribution</strong> + <strong>overall contribution</strong> to TVL.</span>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon>+</BenefitIcon>
              <span>A <strong>multiplier</strong> is applied to calculate your final <strong>KILO points</strong>.</span>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon>+</BenefitIcon>
              <span>Points are <strong>fully claimable 1:1 for tokens</strong> at launch.</span>
            </BenefitItem>
          </BenefitsList>
        </InfoCard>*/}
      </>
    );
  };

  return (
    <UserPointsContainer className={className}>
      <TotalPointsBanner>
        <TotalPointsLabel>Your KILO Points</TotalPointsLabel>
        <TotalPointsValue>
          {data?.isNewUser ? '0' : formatNumber(data?.totalPoints || 0)}
        </TotalPointsValue>
       {/* <LastUpdatedText>
          Last updated: {data?.lastUpdated ? formatDate(data.lastUpdated) : "N/A"}
        </LastUpdatedText>*/}
      </TotalPointsBanner>

      {renderContent()}
    </UserPointsContainer>
  );
};

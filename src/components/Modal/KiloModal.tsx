'use client';

import { BaseModal } from './BaseModal';
import styled, { keyframes } from 'styled-components';
import { useState, useEffect } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { AlertCircle, RefreshCw, HelpCircle, MessageCircle, Settings } from 'react-feather';
import { ethers } from "ethers";

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

const KiloPointsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0; 

   
`;


const InfoMessage = styled.div`
  display: flex;
  align-items: center;
    justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #dbeafe;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  margin-bottom: 16px;
    margin-top: 16px;
`;

const MessageText = styled.span`
  font-size: 14px;
`;

const TotalPointsBanner = styled.div`
 background: linear-gradient(135deg, #1e293b, #06C755);
  padding: 24px 32px;
  text-align: right;
    border-radius: 8px;
  position: relative;
  overflow: hidden;
  color: white;
  
  @media (max-width: 480px) {
    padding: 28px 20px;
  }

    &::before {
    content: '';
    position: absolute;
    top: -10%;
    right: -10%;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    z-index: 0;
  }
`;

const AnimatedKiloIcon = styled.div`
  position: absolute;
  top: 30px;
  left: 40px;
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s ease-in-out infinite; 
`;

const KiloIconInner = styled.div`
  width: 64px;
  height: 64px;  
  border-radius: 50%;
  animation: ${bounce} 2s ease-in-out infinite;
  animation-delay: 0.5s;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
 
`;

const TotalPointsLabel = styled.p`
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 480px) {
    font-size: 13px;
    margin: 0 0 3px 0;
  }
`;

const TotalPointsValue = styled.p`
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 32px;
  }
`;

const LastUpdatedText = styled.p`
  font-size: 12px;
  opacity: 0.75;
  margin: 4px 0 0 0;
  
  @media (max-width: 480px) {
    font-size: 11px;
    margin: 5px 0 0 0;
  }
`;

const DailyBreakdownSection = styled.div`
  padding-top: 24px;
  
  
  @media (max-width: 480px) {
    padding-top: 20px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 480px) {
    font-size: 16px;
    margin: 0 0 12px 0;
  }
`;

const DailyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  }
  
  @media (max-width: 480px) {
    padding: 14px;
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
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const DailyItemRight = styled.div`
  text-align: right;
`;

const PointsValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const KiloLabel = styled.span`
  font-size: 12px;
  color: #64748b;
  margin-left: 4px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 24px;
  color: #64748b;
  
  @media (max-width: 480px) {
    padding: 32px 20px;
  }
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px 24px;
  
  @media (max-width: 480px) {
    padding: 32px 20px;
  }
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
  
  @media (max-width: 480px) {
    padding: 40px 20px;
  }
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
  
  svg {
    width: 32px;
    height: 32px;
  }
`;

const EmptyStateTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const EmptyStateText = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
`;



const ContactSection = styled.div`
  margin-top: 16px;
  padding: 20px;
  padding-left: 40px;
    padding-bottom: 10px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  border: 1px solid #e2e8f0; 
`;

const ContactTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const ContactText = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
`;


const InfoCard = styled.div`
margin-top: 16px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 16px 0;
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
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
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
`;

interface PointsData {
  totalPoints: number;
  dailyBreakdown: Record<string, number>;
  lastUpdated?: string;
  status?: string;
  isNewUser: boolean;
}

interface KiloPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KiloPointsModal = ({ isOpen, onClose }: KiloPointsModalProps) => {

  const { account } = useWalletAccountStore();
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen && account) {
      loadUserPoints(account);
    }
  }, [isOpen, account]);

  const loadUserPoints = async (account: string) => {
  setLoading(true);
  setError(false);

  try { 

    const parsedAddress= ethers.getAddress(account)

    const response = await fetch(
      `https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod/users/${parsedAddress}`
    );
    const data = await response.json();
  
    if (!data.success) {
      setPointsData({
        totalPoints: 0,
        dailyBreakdown: {},
        isNewUser: true
      });
    } else {
      // Convert dailyPoints array into an object keyed by date

      let totalPoints = 0

      const dailyBreakdown: Record<string, number> = {};
      data.dailyPoints.forEach((entry: any) => { 
        const key = entry.date; // "2025-09-11"
        const value = entry[key]; // 52537
        dailyBreakdown[entry.date] = value;
        totalPoints+=value
      });

      setPointsData({
        totalPoints,
        dailyBreakdown,
        isNewUser: false
      });
    }
  } catch (err) {
    console.error('Error fetching points:', err);
    setError(true);
  } finally {
    setLoading(false);
  }
};

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const renderContent = () => {

    if (!account) {
      return (
        <InfoMessage>
          <AlertCircle size={16} color="#3b82f6" />
          <MessageText style={{ color: '#1e40af' }}>Please connect your wallet</MessageText>
        </InfoMessage>
      );
    }

    if (loading) {
      return (
        <LoadingState>
          Loading your KILO points...
        </LoadingState>
      );
    }

    if (error) {
      return (
        <ErrorState>
          <div style={{ color: '#ef4444', marginBottom: '16px' }}>❌ Error loading points</div>
        </ErrorState>
      );
    }

    if (pointsData?.isNewUser) {
      return (
        <EmptyStateContainer>
          <EmptyStateIcon>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </EmptyStateIcon>
          <EmptyStateTitle>Start Earning KILO!</EmptyStateTitle>
          <EmptyStateText>
            Supply or borrow assets to start earning KILO points daily.
            Points are distributed based on your lending activity.
          </EmptyStateText>
        </EmptyStateContainer>
      );
    }

    const dailyEntries = Object.entries(pointsData?.dailyBreakdown || {})
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA));

    return (
      <DailyBreakdownSection>
        <SectionTitle>Daily Breakdown</SectionTitle>
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
      </DailyBreakdownSection>
    );
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="KILO Points">
      <KiloPointsContent>
        <TotalPointsBanner>
          <AnimatedKiloIcon>
            <KiloIconInner>
              <img src="./images/icon-rewards.png"
                alt="KILO" />
            </KiloIconInner>
          </AnimatedKiloIcon>

          <TotalPointsLabel>Your KILO Points</TotalPointsLabel>
          <TotalPointsValue>
            {pointsData?.isNewUser ? '0' : formatNumber(pointsData?.totalPoints || 0)}
          </TotalPointsValue>
          <LastUpdatedText>
            Last updated: {pointsData?.lastUpdated ? new Date(pointsData.lastUpdated).toLocaleDateString() : "N/A"}
          </LastUpdatedText>
        </TotalPointsBanner>
 

        <InfoCard> 
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
          </BenefitsList>
        </InfoCard>

        {renderContent()}
      </KiloPointsContent>
    </BaseModal>
  );
};
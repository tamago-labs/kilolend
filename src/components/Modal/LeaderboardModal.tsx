'use client';

import { BaseModal, BaseModalProps } from './BaseModal';
import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';

const LeaderboardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-radius: 8px;
  background: #f1f5f9;
  padding: 4px;
  gap: 2px;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 6px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ $active }) => $active ? `
    background: white;
    color: #1e293b;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  ` : `
    background: transparent;
    color: #64748b;
    
    &:hover {
      color: #1e293b;
    }
  `}
`;

const InfoCard = styled.div`
  border-radius: 8px;
  padding: 16px;
  background: linear-gradient(135deg, #1e293b, #06C755);
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 120px;
  
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

const InfoContent = styled.div`
  position: relative;
  z-index: 1;
`;

const InfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoText = styled.p`
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  opacity: 0.95;
`;

const InfoDots = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 12px;
`;

const InfoDot = styled.div<{ $active: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $active }) => $active ? 'white' : 'rgba(255, 255, 255, 0.4)'};
  transition: all 0.3s;
`;

const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
`;

const Table = styled.table`
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const TableRow = styled.tr<{ $isMe?: boolean }>`
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;
  
  ${({ $isMe }) => $isMe ? `
    background: #ecfdf5;
    border-left: 3px solid #10b981;
  ` : ''}
  
  &:hover {
    background: ${({ $isMe }) => $isMe ? '#dcfce7' : '#f8fafc'};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td<{ $fixed?: boolean }>`
  padding: 12px 8px;
  font-size: 13px;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
  
  ${({ $fixed }) => $fixed ? `
    position: sticky;
    left: 0;
    background: white;
    z-index: 1;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  ` : ''}
  
  &:first-child {
    padding-left: 12px;
  }
  
  &:last-child {
    padding-right: 12px;
  }
`;

const TableHeaderCell = styled.th<{ $fixed?: boolean }>`
  padding: 12px 8px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  
  ${({ $fixed }) => $fixed ? `
    position: sticky;
    left: 0;
    background: #f8fafc;
    z-index: 2;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  ` : ''}
  
  &:first-child {
    padding-left: 12px;
  }
  
  &:last-child {
    padding-right: 12px;
  }
`;

const RankCell = styled(TableCell)`
  width: 50px;
  text-align: center;
  font-weight: 700;
  color: #1e293b;
`;

const WalletCell = styled(TableCell)`
  width: 140px;
  font-family: monospace;
  font-size: 12px;
`;

const KiloCell = styled(TableCell)`
  width: 100px;
  font-weight: 600;
  color: #06C755; 
`;

const YouIndicator = styled.span`
  color: #10b981;
  font-weight: 700;
  margin-left: 4px;
`;

const NetContribution = styled.span<{ $positive: boolean }>`
  color: ${({ $positive }) => $positive ? '#10b981' : '#ef4444'};
  font-weight: 600;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  color: #64748b;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #64748b;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px;
  color: #ef4444;
  background: #fef2f2;
  border-radius: 6px;
  border: 1px solid #fecaca;
`;

interface LeaderboardData {
  address: string;
  rank: number;
  kiloReward: number;
  basePoints: number;
  baseTVL: number;
  multiplier: number;
  netContribution: number;
  share: number
}

interface LeaderboardResponse {
  success: boolean;
  data?: {
    date: string;
    leaderboard: LeaderboardData[];
    totalUsers: number;
  };
  message?: string;
}
 
const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatKilo = (kilo: number) => {
  return kilo.toLocaleString();
};

const getDateString = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const getTabLabel = (daysAgo: number) => {
  switch (daysAgo) {
    case 0: return 'Today';
    case 1: return 'Yesterday';
    case 2: return '2 Days Ago';
    case 7: return '7 Days Ago';
    default: return `${daysAgo} Days Ago`;
  }
};

const infoSlides = [
  {
    title: "Leaderboard is Live",
    content: "Start collecting KILO points now. Points are fully claimable 1:1 for tokens at launch."
  },
  {
    title: "Daily Distribution",
    content: "Over 100,000 points are distributed daily among active users based on their activity."
  },
  {
    title: "Today's Leaderboard",
    content: "Rankings are updated hourly but are not final until the end of the day (GMT)."
  }, 
  {
    title: "Point Calculation",
    content: "Points = TVL (50%) + Net Contribution (50%) × Multiplier. Invite friends to increase your multiplier."
  }
];

export const LeaderboardModal = ({ isOpen, onClose, title = "Leaderboard" }: any) => {
  
  const { account } = useWalletAccountStore();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(false); 
  const [currentSlide, setCurrentSlide] = useState(0);

  const tabs = [0, 1, 2, 3]; // Today, Yesterday, 2 Days Ago, 7 Days Ago

  // Rotate info slides
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % infoSlides.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const dateString = getDateString(selectedTab);
        const response = await fetch(
          `https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod/leaderboard/${dateString}`
        );
        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setLeaderboardData({
          success: false,
          message: 'Failed to load leaderboard data'
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchLeaderboard();
    }
  }, [selectedTab, isOpen]);

  const renderContent = () => {
    if (loading) {
      return <LoadingState>Loading leaderboard...</LoadingState>;
    }

    if (!leaderboardData?.success) {
      return (
        <ErrorState>
          {leaderboardData?.message || 'No leaderboard data available for this date'}
        </ErrorState>
      );
    }

    if (!leaderboardData.data?.leaderboard?.length) {
      return <EmptyState>No users found for this date</EmptyState>;
    }

    return (
      <div>
        {/* <SectionLabel>Swipe right to see detailed breakdown →</SectionLabel> */}
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>#</TableHeaderCell>
                <TableHeaderCell $fixed={true}>Wallet</TableHeaderCell>
                <TableHeaderCell>KILO</TableHeaderCell>
                {/* <TableHeaderCell>Share %</TableHeaderCell> */}
                <TableHeaderCell>Multiplier</TableHeaderCell> 
                <TableHeaderCell>Base Points</TableHeaderCell> 
                <TableHeaderCell>TVL</TableHeaderCell>  
                <TableHeaderCell>Net Daily</TableHeaderCell> 
              </tr>
            </TableHeader>
            <tbody>
              {leaderboardData.data.leaderboard.map((user) => (
                <TableRow 
                  key={user.address} 
                  $isMe={user.address.toLowerCase() === account?.toLowerCase()}
                >
                  <RankCell>{user.rank}</RankCell>
                  <WalletCell $fixed={true}>
                    {formatAddress(user.address)}
                    {user.address.toLowerCase() === account?.toLowerCase() && (
                      <YouIndicator>⭐</YouIndicator>
                    )}
                  </WalletCell>
                  <KiloCell>{formatKilo(user.kiloReward)}</KiloCell>
                  {/* <TableCell>{user.share.toFixed(2)}</TableCell>  */}
                  <TableCell> {parseFloat(Number(user.multiplier).toFixed(4))}x</TableCell> 
                  <TableCell>{user.basePoints.toFixed(2)}</TableCell> 
                  <TableCell>{user.baseTVL.toFixed(2)}</TableCell> 
                  <TableCell>
                    <NetContribution $positive={user.netContribution >= 0}>
                      {user.netContribution >= 0 ? '+' : ''}{user.netContribution.toFixed(1)} USD
                    </NetContribution>
                  </TableCell> 
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </div>
    );
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <LeaderboardContent> 
        <InfoCard>
          <InfoContent>
            <InfoTitle>{infoSlides[currentSlide].title}</InfoTitle>
            <InfoText>{infoSlides[currentSlide].content}</InfoText> 
              {/* <InfoText style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                Current day KILO points is not final until end of day GMT
              </InfoText>  */}
            <InfoDots>
              {infoSlides.map((_, index) => (
                <InfoDot key={index} $active={index === currentSlide} />
              ))}
            </InfoDots>
          </InfoContent>
        </InfoCard>

        <TabsContainer>
          {tabs.map((daysAgo) => (
            <Tab 
              key={daysAgo}
              $active={selectedTab === daysAgo}
              onClick={() => setSelectedTab(daysAgo)}
            >
              {getTabLabel(daysAgo)}
            </Tab>
          ))}
        </TabsContainer> 
        {renderContent()}
      </LeaderboardContent>
    </BaseModal>
  );
};
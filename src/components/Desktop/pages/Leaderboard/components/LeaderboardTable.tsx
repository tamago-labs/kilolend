"use client";

import styled from 'styled-components';
import { useState } from 'react';
import { 
  useLeaderboardData, 
  getDateString, 
  getTabLabel, 
  formatAddress, 
  formatKilo,
  LeaderboardData 
} from '../hooks/useLeaderboardData';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 120px 120px 120px 120px 100px;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 60px 1fr 100px 100px 100px 80px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 50px 1fr 80px 80px;
  }
`;

const TableRow = styled.div<{ $isMe?: boolean }>`
  display: grid;
  grid-template-columns: 80px 1fr 120px 120px 120px 120px 100px;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.3s;
  background: ${({ $isMe }) => $isMe ? '#ecfdf5' : 'white'};

  &:hover {
    background: ${({ $isMe }) => $isMe ? '#dcfce7' : '#f8fafc'};
  }

  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 60px 1fr 100px 100px 100px 80px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 50px 1fr 80px 80px;
  }
`;

const RankCell = styled.div<{ $top?: boolean }>`
  display: flex;
  align-items: center;
  font-weight: 700;
  color: ${({ $top }) => $top ? '#06C755' : '#1e293b'};
  font-size: ${({ $top }) => $top ? '18px' : '16px'};
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserAddress = styled.div`
  font-size: 12px;
  color: #64748b;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  background: #f8fafc;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
`;

const ValueCell = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  
  @media (max-width: 1200px) {
    &:nth-child(6),
    &:nth-child(7) {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    &:nth-child(4),
    &:nth-child(5) {
      display: none;
    }
  }
`;

const KiloCell = styled.div`
  font-weight: 600;
  color: #06C755;
  font-size: 14px;
`;

const PositiveCell = styled.div`
  font-weight: 600;
  color: #10b981;
  font-size: 14px;
`;

const NegativeCell = styled.div`
  font-weight: 600;
  color: #ef4444;
  font-size: 14px;
`;

const YouIndicator = styled.span`
  color: #10b981;
  font-weight: 700;
  margin-left: 4px;
  font-size: 12px;
`;

const Badge = styled.span<{ $type?: 'gold' | 'silver' | 'bronze' }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $type }) => {
    switch ($type) {
      case 'gold': return '#fef3c7';
      case 'silver': return '#f3f4f6';
      case 'bronze': return '#fed7aa';
      default: return '#f3f4f6';
    }
  }};
  color: ${({ $type }) => {
    switch ($type) {
      case 'gold': return '#92400e';
      case 'silver': return '#374151';
      case 'bronze': return '#9a3412';
      default: return '#374151';
    }
  }};
`;

const TabsContainer = styled.div`
  display: flex;
  border-radius: 8px;
  background: #f1f5f9;
  padding: 4px;
  gap: 2px;
  margin-bottom: 24px;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
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

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: #64748b;
  font-size: 16px;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: #ef4444;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
  margin: 24px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: #64748b;
  font-size: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
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

interface LeaderboardTableProps {
  className?: string;
}

export const LeaderboardTable = ({ className }: LeaderboardTableProps) => {
  const { account } = useWalletAccountStore();
  const [selectedTab, setSelectedTab] = useState(0);
  
  const tabs = [0, 1, 2, 7]; // Today, Yesterday, 2 Days Ago, 7 Days Ago
  const selectedDate = getDateString(selectedTab);
  
  const { data, loading, error } = useLeaderboardData(selectedDate);

  const getBadgeType = (rank: number): 'gold' | 'silver' | 'bronze' | undefined => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return undefined;
  };

  const getInitials = (address: string): string => {
    return address.slice(2, 4).toUpperCase();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingState>
          <LoadingSpinner />
          Loading leaderboard data...
        </LoadingState>
      );
    }

    if (error || !data?.success) {
      return (
        <ErrorState>
          ❌ {data?.message || 'Failed to load leaderboard data'}
        </ErrorState>
      );
    }

    if (!data.data?.leaderboard?.length) {
      return (
        <EmptyState>
          No leaderboard data available for {getTabLabel(selectedTab)}
        </EmptyState>
      );
    }

    return (
      <>
        <TableHeader>
          <div>Rank</div>
          <div>Wallet</div>
          <div>KILO Points</div>
          <div>Base Points</div>
          <div>TVL Points</div>
          <div>Net Daily</div>
          <div>Badge</div>
        </TableHeader>
        
        {data.data.leaderboard.map((user: LeaderboardData) => {
          const isMe = user.address.toLowerCase() === account?.toLowerCase();
          const badgeType = getBadgeType(user.rank);
          
          return (
            <TableRow 
              key={user.address} 
              $isMe={isMe}
            >
              <RankCell $top={user.rank <= 3}>
                #{user.rank}
              </RankCell>
              <UserCell>
                <UserInfo>
                  <UserName>
                    {formatAddress(user.address)}
                    {isMe && <YouIndicator>⭐ YOU</YouIndicator>}
                  </UserName>
                </UserInfo>
              </UserCell>
              <KiloCell>{formatKilo(user.kiloReward)}</KiloCell>
              <ValueCell>{user.basePoints.toFixed(2)}</ValueCell>
              <ValueCell>${user.baseTVL.toFixed(2)}</ValueCell>
              <ValueCell>
                {user.netContribution >= 0 ? (
                  <PositiveCell>+${user.netContribution.toFixed(1)}</PositiveCell>
                ) : (
                  <NegativeCell>-${Math.abs(user.netContribution).toFixed(1)}</NegativeCell>
                )}
              </ValueCell>
              <div>
                {badgeType && (
                  <Badge $type={badgeType}>
                    {badgeType === 'gold' ? '🥇' : badgeType === 'silver' ? '🥈' : '🥉'} {badgeType.charAt(0).toUpperCase() + badgeType.slice(1)}
                  </Badge>
                )}
              </div>
            </TableRow>
          );
        })}
      </>
    );
  };

  return (
    <div className={className}>
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
      
      <TableContainer>
        {renderContent()}
      </TableContainer>
    </div>
  );
};

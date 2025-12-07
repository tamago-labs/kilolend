"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react'; 

const LeaderboardContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PageSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $positive }) => $positive ? '#10b981' : '#ef4444'};
`;

const FilterSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FilterTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

const FilterOptions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${({ $active }) => $active ? '#06C755' : '#e2e8f0'};
  background: ${({ $active }) => $active ? '#06C755' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#64748b'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${({ $active }) => $active ? '#059669' : '#f8fafc'};
    border-color: ${({ $active }) => $active ? '#059669' : '#cbd5e1'};
  }
`;

const LeaderboardTable = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 200px 200px 200px 150px;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
`;

const TableRow = styled.div<{ $highlighted?: boolean }>`
  display: grid;
  grid-template-columns: 80px 1fr 200px 200px 200px 150px;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.3s;
  background: ${({ $highlighted }) => $highlighted ? '#f0fdf4' : 'white'};

  &:hover {
    background: ${({ $highlighted }) => $highlighted ? '#dcfce7' : '#f8fafc'};
  }

  &:last-child {
    border-bottom: none;
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
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
`;

const UserAddress = styled.div`
  font-size: 12px;
  color: #64748b;
  font-family: monospace;
`;

const ValueCell = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
`;

const PositiveCell = styled.div`
  font-weight: 600;
  color: #10b981;
  font-size: 14px;
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

const mockLeaderboardData = [
  {
    rank: 1,
    address: "0x1234...5678",
    name: "Whale Trader",
    totalSupply: "$125,430",
    totalBorrow: "$45,200",
    netAPY: "8.2%",
    badge: "gold" as const
  },
  {
    rank: 2,
    address: "0xabcd...efgh",
    name: "DeFi Master",
    totalSupply: "$98,750",
    totalBorrow: "$32,100",
    netAPY: "7.8%",
    badge: "silver" as const
  },
  {
    rank: 3,
    address: "0x5678...9abc",
    name: "Yield Farmer",
    totalSupply: "$87,320",
    totalBorrow: "$28,500",
    netAPY: "7.5%",
    badge: "bronze" as const
  },
  {
    rank: 4,
    address: "0xdef0...1234",
    name: "Smart Investor",
    totalSupply: "$76,890",
    totalBorrow: "$25,300",
    netAPY: "7.2%"
  },
  {
    rank: 5,
    address: "0x3456...7890",
    name: "Risk Taker",
    totalSupply: "$65,430",
    totalBorrow: "$42,100",
    netAPY: "6.9%"
  },
  {
    rank: 6,
    address: "0x7890...abcd",
    name: "Conservative",
    totalSupply: "$54,320",
    totalBorrow: "$15,200",
    netAPY: "6.5%"
  },
  {
    rank: 7,
    address: "0xcdef...3456",
    name: "Balanced",
    totalSupply: "$43,210",
    totalBorrow: "$18,900",
    netAPY: "6.3%"
  },
  {
    rank: 8,
    address: "0x2345...6789",
    name: "Growing",
    totalSupply: "$32,100",
    totalBorrow: "$12,300",
    netAPY: "6.1%"
  }
];

export const DesktopLeaderboard = () => {
  const [mounted, setMounted] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [metricFilter, setMetricFilter] = useState('supply');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <LeaderboardContainer> 
      
      <MainContent>
        <PageHeader>
          <PageTitle>
            {/*<Trophy size={32} />*/}
            Leaderboard
          </PageTitle>
          <PageSubtitle>Top performers in the KiloLend ecosystem</PageSubtitle>
        </PageHeader>

        <StatsGrid>
          <StatCard>
            <StatLabel>
              {/*<Users size={16} />*/}
              Total Participants
            </StatLabel>
            <StatValue>1,247</StatValue>
            <StatChange $positive>+12% this week</StatChange>
          </StatCard>
          
          <StatCard>
            <StatLabel>
              {/*<TrendingUp size={16} />*/}
              Average Net APY
            </StatLabel>
            <StatValue>6.8%</StatValue>
            <StatChange $positive>+0.3% today</StatChange>
          </StatCard>
          
          <StatCard>
            <StatLabel>
              {/*<Award size={16} />*/}
              Total Supply Volume
            </StatLabel>
            <StatValue>$2.4M</StatValue>
            <StatChange $positive>+$45K today</StatChange>
          </StatCard>
          
          <StatCard>
            <StatLabel>
              {/*<Trophy size={16} />*/}
              Top Performer APY
            </StatLabel>
            <StatValue>8.2%</StatValue>
            <StatChange $positive>Best rate</StatChange>
          </StatCard>
        </StatsGrid>

        <FilterSection>
          <FilterHeader>
            <FilterTitle>Filters</FilterTitle>
          </FilterHeader>
          <FilterOptions>
            <FilterButton 
              $active={timeFilter === 'all'} 
              onClick={() => setTimeFilter('all')}
            >
              All Time
            </FilterButton>
            <FilterButton 
              $active={timeFilter === 'month'} 
              onClick={() => setTimeFilter('month')}
            >
              This Month
            </FilterButton>
            <FilterButton 
              $active={timeFilter === 'week'} 
              onClick={() => setTimeFilter('week')}
            >
              This Week
            </FilterButton>
            <FilterButton 
              $active={metricFilter === 'supply'} 
              onClick={() => setMetricFilter('supply')}
            >
              By Supply
            </FilterButton>
            <FilterButton 
              $active={metricFilter === 'borrow'} 
              onClick={() => setMetricFilter('borrow')}
            >
              By Borrow
            </FilterButton>
            <FilterButton 
              $active={metricFilter === 'apy'} 
              onClick={() => setMetricFilter('apy')}
            >
              By APY
            </FilterButton>
          </FilterOptions>
        </FilterSection>

        <LeaderboardTable>
          <TableHeader>
            <div>Rank</div>
            <div>User</div>
            <div>Total Supply</div>
            <div>Total Borrow</div>
            <div>Net APY</div>
            <div>Badge</div>
          </TableHeader>
          
          {mockLeaderboardData.map((user) => (
            <TableRow key={user.rank} $highlighted={user.rank <= 3}>
              <RankCell $top={user.rank <= 3}>
                #{user.rank}
              </RankCell>
              <UserCell>
                <UserAvatar>
                  {getInitials(user.name)}
                </UserAvatar>
                <UserInfo>
                  <UserName>{user.name}</UserName>
                  <UserAddress>{formatAddress(user.address)}</UserAddress>
                </UserInfo>
              </UserCell>
              <ValueCell>{user.totalSupply}</ValueCell>
              <ValueCell>{user.totalBorrow}</ValueCell>
              <PositiveCell>{user.netAPY}</PositiveCell>
              <div>
                {user.badge && (
                  <Badge $type={user.badge}>
                    {user.badge === 'gold' ? '🥇' : user.badge === 'silver' ? '🥈' : '🥉'} {user.badge.charAt(0).toUpperCase() + user.badge.slice(1)}
                  </Badge>
                )}
              </div>
            </TableRow>
          ))}
        </LeaderboardTable>
      </MainContent>
    </LeaderboardContainer>
  );
};
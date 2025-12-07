"use client";

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { DesktopHeader } from './DesktopHeader';

const MarketsContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
`;

const MarketsHeader = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => $active ? '#06C755' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#1e293b'};
  border: 1px solid ${({ $active }) => $active ? '#06C755' : '#e2e8f0'};
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${({ $active }) => $active ? '#059669' : '#f8fafc'};
  }
`;

const SearchBar = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
`;

const MarketsTable = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  padding: 20px 32px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  padding: 20px 32px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AssetIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 12px;
`;

const AssetDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AssetName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const AssetSymbol = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const RateValue = styled.div<{ $highlight?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $highlight }) => $highlight ? '#06C755' : '#1e293b'};
`;

const RateLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  background: ${({ $primary }) => $primary ? '#06C755' : 'white'};
  color: ${({ $primary }) => $primary ? 'white' : '#06C755'};
  border: 1px solid #06C755;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;

  &:hover {
    background: ${({ $primary }) => $primary ? '#059669' : '#06C755'};
    color: white;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
`;

const mockMarkets = [
  {
    name: 'Tether USD',
    symbol: 'USDT',
    totalSupply: '$45.2M',
    supplyApy: '5.2%',
    totalBorrow: '$12.8M',
    borrowApy: '6.1%',
    liquidity: '$32.4M'
  },
  {
    name: 'KAIA Token',
    symbol: 'KAIA',
    totalSupply: '$28.7M',
    supplyApy: '6.8%',
    totalBorrow: '$8.3M',
    borrowApy: '8.2%',
    liquidity: '$20.4M'
  },
  {
    name: 'SIX Token',
    symbol: 'SIX',
    totalSupply: '$15.6M',
    supplyApy: '8.1%',
    totalBorrow: '$4.2M',
    borrowApy: '10.5%',
    liquidity: '$11.4M'
  },
  {
    name: 'BORA Token',
    symbol: 'BORA',
    totalSupply: '$12.3M',
    supplyApy: '7.8%',
    totalBorrow: '$3.1M',
    borrowApy: '9.8%',
    liquidity: '$9.2M'
  },
  {
    name: 'MBX Token',
    symbol: 'MBX',
    totalSupply: '$8.9M',
    supplyApy: '6.9%',
    totalBorrow: '$2.4M',
    borrowApy: '8.7%',
    liquidity: '$6.5M'
  },
  {
    name: 'Staked KAIA',
    symbol: 'stKAIA',
    totalSupply: '$6.2M',
    supplyApy: '7.2%',
    totalBorrow: '$1.8M',
    borrowApy: '9.1%',
    liquidity: '$4.4M'
  }
];

export const DesktopMarkets = () => {
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredMarkets = mockMarkets.filter(market => {
    const matchesSearch = market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         market.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'stablecoins') return market.symbol === 'USDT' && matchesSearch;
    if (activeFilter === 'volatile') return market.symbol !== 'USDT' && matchesSearch;
    
    return matchesSearch;
  });

  return (
    <MarketsContainer> 
      
      <MainContent>
        <MarketsHeader>
          <PageTitle>Markets</PageTitle>
          <PageSubtitle>Explore all available lending markets with real-time rates</PageSubtitle>
        </MarketsHeader>

        <StatsSection>
          <StatCard>
            <StatLabel>Total Supply</StatLabel>
            <StatValue>$116.9M</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Total Borrow</StatLabel>
            <StatValue>$32.6M</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Total Liquidity</StatLabel>
            <StatValue>$84.3M</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Best Supply APY</StatLabel>
            <StatValue>8.1%</StatValue>
          </StatCard>
        </StatsSection>

        <FilterSection>
          <FilterButton 
            $active={activeFilter === 'all'} 
            onClick={() => setActiveFilter('all')}
          >
            All Assets
          </FilterButton>
          <FilterButton 
            $active={activeFilter === 'stablecoins'} 
            onClick={() => setActiveFilter('stablecoins')}
          >
            Stablecoins
          </FilterButton>
          <FilterButton 
            $active={activeFilter === 'volatile'} 
            onClick={() => setActiveFilter('volatile')}
          >
            Volatile Assets
          </FilterButton>
          <SearchBar
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FilterSection>

        <MarketsTable>
          <TableHeader>
            <div>Asset</div>
            <div>Total Supply</div>
            <div>Supply APY</div>
            <div>Total Borrow</div>
            <div>Borrow APR</div>
            <div>Actions</div>
          </TableHeader>
          
          {filteredMarkets.map((market, index) => (
            <TableRow key={index}>
              <AssetInfo>
                <AssetIcon>{market.symbol}</AssetIcon>
                <AssetDetails>
                  <AssetName>{market.name}</AssetName>
                  <AssetSymbol>{market.symbol}</AssetSymbol>
                </AssetDetails>
              </AssetInfo>
              
              <div>
                <RateValue>{market.totalSupply}</RateValue>
              </div>
              
              <div>
                <RateValue $highlight>{market.supplyApy}</RateValue>
                <RateLabel>Supply APY</RateLabel>
              </div>
              
              <div>
                <RateValue>{market.totalBorrow}</RateValue>
              </div>
              
              <div>
                <RateValue>{market.borrowApy}</RateValue>
                <RateLabel>Borrow APR</RateLabel>
              </div>
              
              <div>
                <ActionButtons>
                  <ActionButton 
                    $primary 
                    onClick={() => console.log(`Supply ${market.symbol}`)}
                  >
                    Supply
                  </ActionButton>
                  <ActionButton 
                    onClick={() => console.log(`Borrow ${market.symbol}`)}
                  >
                    Borrow
                  </ActionButton>
                </ActionButtons>
              </div>
            </TableRow>
          ))}
        </MarketsTable>
      </MainContent>
    </MarketsContainer>
  );
};

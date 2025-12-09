"use client";

import styled from 'styled-components';
import { useMarketContext } from '@/contexts/MarketContext';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useRouter } from 'next/navigation';

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
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const AssetIconImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
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

const LoadingMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #64748b;
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #ef4444;
  font-size: 16px;
`;

interface DesktopMarketTableProps {
  className?: string;
  searchTerm?: string;
  activeFilter?: string;
  sortBy?: string;
}

export const DesktopMarketTable = ({ 
  className, 
  searchTerm = '', 
  activeFilter = 'all',
  sortBy = 'supply-apy-desc'
}: DesktopMarketTableProps) => {
  const { state, actions } = useMarketContext();
  const { markets: contractMarkets } = useContractMarketStore();
  const router = useRouter();
  const { markets, prices, isLoading, error } = state;

  // Transform markets data for display
  const marketData = Object.entries(markets).map(([symbol, market]) => {
    const displaySymbol = actions.getDisplaySymbol(symbol);
    const priceData = prices[symbol];
    
    return {
      symbol: displaySymbol,
      apiSymbol: symbol,
      name: getTokenName(displaySymbol),
      totalSupply: parseFloat(market.totalSupply || '0'),
      supplyApy: market.supplyAPY,
      totalBorrow: parseFloat(market.totalBorrow || '0'),
      borrowApy: market.borrowAPY,
      liquidity: (parseFloat(market.totalSupply || '0') - parseFloat(market.totalBorrow || '0')),
      price: market.price,
      priceChange: priceData?.change24h || 0,
    };
  });

  // Filter markets based on search and filter
  let filteredMarkets = marketData.filter(market => {
    const matchesSearch = market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         market.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'stablecoins') return market.symbol === 'USDT' && matchesSearch;
    if (activeFilter === 'volatile') return market.symbol !== 'USDT' && matchesSearch;
    
    return matchesSearch;
  });

  // Sort markets based on sortBy parameter
  filteredMarkets.sort((a, b) => {
    switch (sortBy) {
      case 'supply-apy-desc':
        return b.supplyApy - a.supplyApy;
      case 'supply-apy-asc':
        return a.supplyApy - b.supplyApy;
      case 'borrow-apr-desc':
        return b.borrowApy - a.borrowApy;
      case 'borrow-apr-asc':
        return a.borrowApy - b.borrowApy;
      case 'total-supply-desc':
        return b.totalSupply - a.totalSupply;
      case 'total-supply-asc':
        return a.totalSupply - b.totalSupply;
      case 'liquidity-desc':
        return b.liquidity - a.liquidity;
      case 'liquidity-asc':
        return a.liquidity - b.liquidity;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return b.supplyApy - a.supplyApy;
    }
  });

  // Format currency values
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Get token name helper
  function getTokenName(symbol: string): string {
    const nameMap: Record<string, string> = {
      'USDT': 'Tether USD',
      'KAIA': 'KAIA Token',
      'SIX': 'SIX Token',
      'BORA': 'BORA Token',
      'MBX': 'MBX Token',
      'stKAIA': 'Staked KAIA',
    };
    return nameMap[symbol] || symbol;
  }

  // Handle navigation to market detail page
  const handleMarketClick = (apiSymbol: string) => {
    router.push(`/markets/${apiSymbol.toLowerCase()}`);
  };

  // Handle supply action
  const handleSupply = (e: React.MouseEvent, apiSymbol: string) => {
    e.stopPropagation();
    router.push(`/markets/${apiSymbol.toLowerCase()}?action=supply`);
  };

  // Handle borrow action
  const handleBorrow = (e: React.MouseEvent, apiSymbol: string) => {
    e.stopPropagation();
    router.push(`/markets/${apiSymbol.toLowerCase()}?action=borrow`);
  };

  if (isLoading && markets.length === 0) {
    return <LoadingMessage>Loading market data...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>Error loading market data: {error}</ErrorMessage>;
  }

  if (filteredMarkets.length === 0) {
    return <LoadingMessage>No markets found matching your criteria.</LoadingMessage>;
  }

  return (
    <MarketsTable className={className}>
      <TableHeader>
        <div>Asset</div>
        <div>Total Supply</div>
        <div>Supply APY</div>
        <div>Total Borrow</div>
        <div>Borrow APR</div>
        <div>Actions</div>
      </TableHeader>
      
      {filteredMarkets.map((market) => (
        <TableRow 
          key={market.apiSymbol}
          onClick={() => handleMarketClick(market.apiSymbol)}
        >
          <AssetInfo>
            <AssetIcon>
              <AssetIconImage 
                src={contractMarkets.find(m => m.symbol === market.symbol)?.icon || `/images/icon-${market.symbol.toLowerCase()}.png`}
                alt={market.symbol}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = market.symbol.charAt(0);
                    target.parentElement.style.fontSize = '16px';
                    target.parentElement.style.fontWeight = 'bold';
                    target.parentElement.style.color = '#64748b';
                  }
                }}
              />
            </AssetIcon>
            <AssetDetails>
              <AssetName>{market.name}</AssetName>
              <AssetSymbol>{market.symbol}</AssetSymbol>
            </AssetDetails>
          </AssetInfo>
          
          <div>
            <RateValue>{formatCurrency(market.totalSupply)}</RateValue>
          </div>
          
          <div>
            <RateValue $highlight>{formatPercentage(market.supplyApy)}</RateValue>
            <RateLabel>Supply APY</RateLabel>
          </div>
          
          <div>
            <RateValue>{formatCurrency(market.totalBorrow)}</RateValue>
          </div>
          
          <div>
            <RateValue>{formatPercentage(market.borrowApy)}</RateValue>
            <RateLabel>Borrow APR</RateLabel>
          </div>
          
          <div>
            <ActionButtons>
              <ActionButton 
                $primary 
                onClick={(e) => handleSupply(e, market.apiSymbol)}
              >
                Supply
              </ActionButton>
              <ActionButton 
                onClick={(e) => handleBorrow(e, market.apiSymbol)}
              >
                Borrow
              </ActionButton>
            </ActionButtons>
          </div>
        </TableRow>
      ))}
    </MarketsTable>
  );
};

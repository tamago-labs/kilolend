"use client";

import styled from 'styled-components';
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
  grid-template-columns: 2.5fr 1fr 1fr 1fr 1fr 1fr;
  padding: 20px 32px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr 1fr 1fr;
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
  flex-shrink: 0;
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
  gap: 4px;
`;

const AssetNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AssetName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const ChainBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: #e2e8f0;
  color: #475569;
  text-transform: uppercase;
  white-space: nowrap;
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

interface DesktopMarketTableV2Props {
  className?: string;
  searchTerm?: string;
  activeFilter?: string;
  sortBy?: string;
  selectedChain?: string;
}

// Token name mapping
const TOKEN_NAMES: Record<string, string> = {
  'USDT': 'Tether USD',
  'USDC': 'USD Coin',
  'KAIA': 'KAIA Token',
  'SIX': 'SIX Token',
  'WBTC': 'Wrapped Bitcoin',
  'WETH': 'Wrapped Ethereum',
  'KDAI': 'KaiDAI',
  'KUSDT': 'KaiUSDT',
  'KUSDC': 'KaiUSDC',
  'MBX': 'MARBLEX',
  'stKAIA': 'Staked KAIA',
  'KUB': 'KUB Token',
  'XTZ': 'Tezos',
  'BTC': 'Bitcoin',
  'ETH': 'Ethereum',
};

// Chain name mapping
const CHAIN_NAMES: Record<string, string> = {
  'kaia': 'KAIA',
  'kub': 'KUB',
  'etherlink': 'Etherlink',
};

export const DesktopMarketTableV2 = ({
  className,
  searchTerm = '',
  activeFilter = 'all',
  sortBy = 'supply-apy-desc',
  selectedChain = 'all',
}: DesktopMarketTableV2Props) => {
  const { markets, isLoading } = useContractMarketStore();
  const router = useRouter();

  // Filter markets by chain
  let filteredMarkets = markets.filter(market => {
    // Chain filter
    if (selectedChain !== 'all' && market.chainId.toString() !== selectedChain) {
      return false;
    }

    // Asset type filter
    if (activeFilter === 'stablecoins') {
      const symbol = market.symbol.toUpperCase();
      const isStablecoin = ['USDT', 'USDC', 'DAI', 'USDC.E'].includes(symbol);
      return isStablecoin;
    }
    if (activeFilter === 'volatile') {
      const symbol = market.symbol.toUpperCase();
      const isStablecoin = ['USDT', 'USDC', 'DAI', 'USDC.E'].includes(symbol);
      return !isStablecoin;
    }

    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = market.name.toLowerCase().includes(searchLower) ||
                         market.symbol.toLowerCase().includes(searchLower) ||
                         market.chainName.toLowerCase().includes(searchLower);
    
    return matchesSearch;
  });

  // Sort markets
  filteredMarkets.sort((a, b) => {
    switch (sortBy) {
      case 'supply-apy-desc':
        return b.supplyAPY - a.supplyAPY;
      case 'supply-apy-asc':
        return a.supplyAPY - b.supplyAPY;
      case 'borrow-apr-desc':
        return b.borrowAPR - a.borrowAPR;
      case 'borrow-apr-asc':
        return a.borrowAPR - b.borrowAPR;
      case 'total-supply-desc':
        return b.totalSupply - a.totalSupply;
      case 'total-supply-asc':
        return a.totalSupply - b.totalSupply;
      case 'liquidity-desc':
        return (b.totalSupply - b.totalBorrow) - (a.totalSupply - a.totalBorrow);
      case 'liquidity-asc':
        return (a.totalSupply - a.totalBorrow) - (b.totalSupply - b.totalBorrow);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return b.supplyAPY - a.supplyAPY;
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
    return `${value.toFixed(2)}%`;
  };

  // Get chain name from chainId
  const getChainName = (chainId: number): string => {
    const chainNameMap: Record<number, string> = {
      8217: 'KAIA',
      96: 'KUB',
      42793: 'Etherlink',
    };
    return chainNameMap[chainId] || `Chain ${chainId}`;
  };

  // Handle navigation to market detail page
  const handleMarketClick = (market: any) => {
    const chainName = getChainName(market.chainId).toLowerCase();
    const tokenSymbol = market.symbol.toLowerCase();
    router.push(`/markets/${chainName}/${tokenSymbol}`);
  };

  // Handle supply action
  const handleSupply = (e: React.MouseEvent, market: any) => {
    e.stopPropagation();
    const chainName = getChainName(market.chainId).toLowerCase();
    const tokenSymbol = market.symbol.toLowerCase();
    router.push(`/markets/${chainName}/${tokenSymbol}?action=supply`);
  };

  // Handle borrow action
  const handleBorrow = (e: React.MouseEvent, market: any) => {
    e.stopPropagation();
    const chainName = getChainName(market.chainId).toLowerCase();
    const tokenSymbol = market.symbol.toLowerCase();
    router.push(`/markets/${chainName}/${tokenSymbol}?action=borrow`);
  };

  // Helper function to render token icon with fallback
  const renderTokenIcon = (market: any) => {
    const iconUrl = market?.icon;

    if (iconUrl) {
      return <AssetIconImage 
        src={iconUrl} 
        alt={market.symbol} 
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.parentElement) {
            target.parentElement.innerHTML = market.symbol.charAt(0);
            target.parentElement.style.fontSize = '18px';
            target.parentElement.style.fontWeight = 'bold';
            target.parentElement.style.color = '#64748b';
          }
        }} 
      />;
    }

    return <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#64748b' }}>
      {market.symbol.charAt(0)}
    </span>;
  };

  if (isLoading && markets.length === 0) {
    return <LoadingMessage>Loading market data...</LoadingMessage>;
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
      
      {filteredMarkets.map((market) => {
        const liquidity = market.totalSupply - market.totalBorrow;
        const chainName = getChainName(market.chainId);

        return (
          <TableRow 
            key={market.id}
            onClick={() => handleMarketClick(market)}
          >
            <AssetInfo>
              <AssetIcon>
                {renderTokenIcon(market)}
              </AssetIcon>
              <AssetDetails>
                <AssetNameRow>
                  <AssetName>{market.name}</AssetName>
                  <ChainBadge>{chainName}</ChainBadge>
                </AssetNameRow>
                <AssetSymbol>{market.symbol}</AssetSymbol>
              </AssetDetails>
            </AssetInfo>
            
            <div>
              <RateValue>{formatCurrency(market.totalSupply)}</RateValue>
            </div>
            
            <div>
              <RateValue $highlight={market.supplyAPY > 5}>{formatPercentage(market.supplyAPY)}</RateValue>
              <RateLabel>Supply APY</RateLabel>
            </div>
            
            <div>
              <RateValue>{formatCurrency(market.totalBorrow)}</RateValue>
            </div>
            
            <div>
              <RateValue>{formatPercentage(market.borrowAPR)}</RateValue>
              <RateLabel>Borrow APR</RateLabel>
            </div>
            
            <div>
              <ActionButtons>
                <ActionButton 
                  $primary 
                  onClick={(e) => handleSupply(e, market)}
                >
                  Supply
                </ActionButton>
                <ActionButton 
                  onClick={(e) => handleBorrow(e, market)}
                >
                  Borrow
                </ActionButton>
              </ActionButtons>
            </div>
          </TableRow>
        );
      })}
    </MarketsTable>
  );
};
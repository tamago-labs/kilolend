"use client";

import styled from 'styled-components';
import { ChainSelector, Chain } from './ChainSelector';

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
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
  min-width: 250px;
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

const SortDropdown = styled.select`
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #06C755;
  }
`;

interface DesktopMarketFiltersV2Props {
  className?: string;
  activeFilter: string;
  searchTerm: string;
  sortBy: string;
  selectedChain: string;
  chains: Chain[];
  onFilterChange: (filter: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onChainChange: (chain: string) => void;
}

export const DesktopMarketFiltersV2 = ({
  className,
  activeFilter,
  searchTerm,
  sortBy,
  selectedChain,
  chains,
  onFilterChange,
  onSearchChange,
  onSortChange,
  onChainChange,
}: DesktopMarketFiltersV2Props) => {
  return (
    <FilterSection className={className}>
      <FilterRow>
        <ChainSelector
          selectedChain={selectedChain}
          chains={chains}
          onChainChange={onChainChange}
        />
      </FilterRow>

      <FilterRow>
        <FilterButton 
          $active={activeFilter === 'all'} 
          onClick={() => onFilterChange('all')}
        >
          All Assets
        </FilterButton>
        <FilterButton 
          $active={activeFilter === 'stablecoins'} 
          onClick={() => onFilterChange('stablecoins')}
        >
          Stablecoins
        </FilterButton>
        <FilterButton 
          $active={activeFilter === 'volatile'} 
          onClick={() => onFilterChange('volatile')}
        >
          Volatile Assets
        </FilterButton>
        
        <SortDropdown 
          value={sortBy} 
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="supply-apy-desc">Highest Supply APY</option>
          <option value="supply-apy-asc">Lowest Supply APY</option>
          <option value="borrow-apr-desc">Highest Borrow APR</option>
          <option value="borrow-apr-asc">Lowest Borrow APR</option>
          <option value="total-supply-desc">Highest Total Supply</option>
          <option value="total-supply-asc">Lowest Total Supply</option>
          <option value="liquidity-desc">Highest Liquidity</option>
          <option value="liquidity-asc">Lowest Liquidity</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </SortDropdown>
        
        <SearchBar
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </FilterRow>
    </FilterSection>
  );
};
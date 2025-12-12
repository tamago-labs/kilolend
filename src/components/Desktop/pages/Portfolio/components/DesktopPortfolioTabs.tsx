"use client";

import styled from 'styled-components';

const FilterSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
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

interface DesktopPortfolioTabsProps {
  className?: string;
  activeTab: string;
  searchTerm: string;
  sortBy: string;
  onTabChange: (tab: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
}

export const DesktopPortfolioTabs = ({
  className,
  activeTab,
  searchTerm,
  sortBy,
  onTabChange,
  onSearchChange,
  onSortChange,
}: DesktopPortfolioTabsProps) => {
  return (
    <FilterSection className={className}>
      <FilterButton 
        $active={activeTab === 'supply'} 
        onClick={() => onTabChange('supply')}
      >
        Supplied Assets
      </FilterButton>
      <FilterButton 
        $active={activeTab === 'borrow'} 
        onClick={() => onTabChange('borrow')}
      >
        Borrowed Assets
      </FilterButton>
      
      <SortDropdown 
        value={sortBy} 
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="value-desc">Highest USD Value</option>
        <option value="value-asc">Lowest USD Value</option>
        <option value="apy-desc">Highest APY/APR</option>
        <option value="apy-asc">Lowest APY/APR</option>
        <option value="balance-desc">Highest Balance</option>
        <option value="balance-asc">Lowest Balance</option>
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
      </SortDropdown>
      
      <SearchBar
        placeholder="Search positions..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </FilterSection>
  );
};

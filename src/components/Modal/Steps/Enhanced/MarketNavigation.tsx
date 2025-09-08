'use client';

import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { ContractMarket } from '@/stores/contractMarketStore';

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 4px;
`;

const NavigationSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  margin-right: auto;
`;

const NavButton = styled.button<{ $disabled?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${props => props.$disabled ? '#e2e8f0' : '#06C755'};
  background: ${props => props.$disabled ? '#f8fafc' : 'white'};
  color: ${props => props.$disabled ? '#94a3b8' : '#06C755'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  font-weight: 600;

  &:hover:not(:disabled) {
    background: ${props => props.$disabled ? '#f8fafc' : '#06C755'};
    color: ${props => props.$disabled ? '#94a3b8' : 'white'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const MarketCounter = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  min-width: 60px;
  text-align: center;
`;

const MarketIndicators = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const IndicatorDot = styled.button<{ $active: boolean; $hasBalance?: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${props => 
    props.$active ? '#06C755' : 
    props.$hasBalance ? '#3b82f6' : '#e2e8f0'
  };
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: scale(1.2);
    background: ${props => 
      props.$active ? '#00A000' : 
      props.$hasBalance ? '#2563eb' : '#cbd5e1'
    };
  }

  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    background: ${props => props.$active ? 'rgba(6, 199, 85, 0.2)' : 'transparent'};
    opacity: ${props => props.$active ? 1 : 0};
    transition: opacity 0.2s ease;
  }
`;

const QuickSelectDropdown = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  min-width: 120px;
  
  &:hover {
    border-color: #cbd5e1;
  }
  
  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
`;

const KeyboardHint = styled.div`
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const KeyboardKey = styled.span`
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 10px;
  font-weight: 600;
`;

interface MarketNavigationProps {
  markets: ContractMarket[];
  currentIndex: number;
  userBalances: Record<string, string>;
  onNavigate: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const MarketNavigation = ({
  markets,
  currentIndex,
  userBalances,
  onNavigate,
  onPrevious,
  onNext
}: MarketNavigationProps) => {
  
  const totalMarkets = markets.length;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalMarkets - 1;

  const hasBalance = (market: ContractMarket) => {
    const balance = parseFloat(userBalances[market.symbol] || '0');
    return balance > 0;
  };

  return (
    <NavigationContainer>
      <NavigationSection>
        <NavButton 
          $disabled={!canGoPrevious}
          onClick={onPrevious}
          disabled={!canGoPrevious}
          title="Previous market (←)"
        >
          <ChevronLeft size={20} />
        </NavButton>
        
        <MarketCounter>
          {currentIndex + 1} of {totalMarkets}
        </MarketCounter>
        
        <NavButton 
          $disabled={!canGoNext}
          onClick={onNext}
          disabled={!canGoNext}
          title="Next market (→)"
        >
          <ChevronRight size={20} />
        </NavButton>
      </NavigationSection>

       

       
    </NavigationContainer>
  );
};
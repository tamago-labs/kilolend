'use client';

import styled from 'styled-components';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 16px 0;
  z-index: 40;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: 10px;
`;

const NavButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  color: ${props => props.$active ? '#000000' : '#64748b'};
  font-size: 16px;
  font-weight: ${props => props.$active ? '600' : '500'};

  &:hover {
    color: #000000;
  }
`;

export type TabType = 'home' | 'portfolio' | 'activity' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <NavContainer>
      <NavContent>
        <NavButton $active={activeTab === 'home'} onClick={() => onTabChange('home')}>
          HOME
        </NavButton> 
        <NavButton $active={activeTab === 'portfolio'} onClick={() => onTabChange('portfolio')}>
          PORTFOLIO
        </NavButton> 
        {/* <NavButton $active={activeTab === 'activity'} onClick={() => onTabChange('activity')}>
          ACTIVITY
        </NavButton>  */}
        <NavButton $active={activeTab === 'profile'} onClick={() => onTabChange('profile')}>
          PROFILE
        </NavButton>
      </NavContent>
    </NavContainer>
  );
};

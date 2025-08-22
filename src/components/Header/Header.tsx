'use client';

import styled from 'styled-components';
import { WalletButton } from '@/components/Wallet/Button/WalletButton';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 50;
  height: 60px;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

export const Header = () => {
  return (
    <HeaderContainer>
      <LeftSection>
        <WalletButton />
      </LeftSection>
    </HeaderContainer>
  );
};

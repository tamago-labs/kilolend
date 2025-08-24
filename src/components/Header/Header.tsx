'use client';

import styled from 'styled-components';
import { useState, useCallback } from 'react';
import { WalletButton } from '@/components/Wallet/Button/WalletButton';
import { useWalletAccountStore } from "@/components/Wallet/Account/auth.hooks";
import { useKaiaWalletSdk } from "@/components/Wallet/Sdk/walletSdk.hooks";

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
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

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f8fafc;
  }
`;

const ProfileIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #00C300, #00A000);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ConnectedStatus = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #00C300;
  line-height: 1;
`;

const WalletAddress = styled.div`
  font-size: 11px;
  color: #64748b;
  font-family: monospace;
  line-height: 1;
  margin-top: 2px;
`;

const DisconnectButton = styled.button`
  font-size: 12px;
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #fef2f2;
    border-color: #ef4444;
    color: #ef4444;
  }
`;

// Dropdown menu for mobile
const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  min-width: 200px;
  z-index: 100;
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s;
  
  &:hover {
    background: #f8fafc;
  }
`;

const AddressRow = styled.div`
  font-family: monospace;
  font-size: 12px;
  color: #64748b;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 8px;
  word-break: break-all;
`;

const DisconnectRow = styled.div`
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #ef4444;
  border-top: 1px solid #f1f5f9;
  margin-top: 8px;
  text-align: center;
  transition: all 0.2s;
  
  &:hover {
    background: #fef2f2;
  }
`;

export const Header = () => {
  const { account, setAccount } = useWalletAccountStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const { disconnectWallet } = useKaiaWalletSdk();

  const handleDisconnect = useCallback(() => {
    disconnectWallet().then(() => {
      setAccount(null);
      sessionStorage.removeItem('ACCOUNT');
    });
  }, [disconnectWallet])


  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <HeaderContainer>
      {/* <LeftSection>
       
      </LeftSection> */}

      <RightSection>
        {!account ? (
          <WalletButton />
        ) : (
          <>
            {/* Desktop view */}
            <ProfileSection
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ display: 'none' }}
              className="hidden md:flex"
            >
              <ProfileIcon>👤</ProfileIcon>
              <ProfileInfo>
                <ConnectedStatus>Connected</ConnectedStatus>
                <WalletAddress>{formatAddress(account)}</WalletAddress>
              </ProfileInfo>
            </ProfileSection>

            {/* Mobile view */}
            <ProfileSection onClick={() => setShowDropdown(!showDropdown)}>
              <ProfileIcon>👤</ProfileIcon>
              <ProfileInfo>
                <ConnectedStatus>Connected</ConnectedStatus>
                <WalletAddress>{formatAddress(account)}</WalletAddress>
              </ProfileInfo>
            </ProfileSection>

            <DisconnectButton onClick={handleDisconnect}>
              Disconnect
            </DisconnectButton>

            {/* Mobile Dropdown */}
            <DropdownMenu $isOpen={showDropdown}>
              <AddressRow>
                {account}
              </AddressRow>
              <DropdownItem onClick={() => {
                navigator.clipboard.writeText(account);
                setShowDropdown(false);
              }}>
                📋 Copy Address
              </DropdownItem>
              <DropdownItem>🌐 KAIA Testnet</DropdownItem>
              <DisconnectRow onClick={handleDisconnect}>
                Disconnect Wallet
              </DisconnectRow>
            </DropdownMenu>
          </>
        )}
      </RightSection>
    </HeaderContainer>
  );
};

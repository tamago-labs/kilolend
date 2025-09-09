'use client';

import styled from 'styled-components';
import { useState, useCallback } from 'react';
import { WalletButton } from '@/components/Wallet/Button/WalletButton';
import { useWalletAccountStore } from "@/components/Wallet/Account/auth.hooks";
import { useKaiaWalletSdk } from "@/components/Wallet/Sdk/walletSdk.hooks";
import Blockies from 'react-blockies';
import { Settings, Clock } from "react-feather"
import { useModalStore } from '@/stores/modalStore';
import { useAppStore } from '@/stores/appStore';
import { liff } from "@/utils/liff";
import { KAIA_SCAN_URL } from "@/utils/ethersConfig"

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
  cursor: pointer;
  padding: 4px 12px;
  padding-left: 0px;
  border-radius: 8px;
  transition: all 0.2s; 
`;

const CopyButton = styled.button<{ $copied?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: ${({ $copied }) => ($copied ? '#06C755' : 'white')};
  color: ${({ $copied }) => ($copied ? 'white' : '#64748b')};
  border: 1px solid ${({ $copied }) => ($copied ? '#06C755' : '#e2e8f0')};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
 
`;

const ProfileIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #00C300, #00A000);
  border-radius: 5px;
  overflow: hidden;
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
  background: linear-gradient(135deg, #00C300, #00A000);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
 
`;


const Icon = styled.div<{ $white?: boolean }>`
  width: 40px;
  height: 40px; 
  background: #f1f5f9;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  font-size: 14px;
  font-weight: bold;
`;

// Dropdown menu for mobile
const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 16px;
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
  display: flex;
  
  &:hover {
    background: #f8fafc;
  }
`;

const AddressRow = styled.div`
  font-family: monospace;
  font-size: 12px;
  color: #64748b;  
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

  const { activeTab } = useAppStore();
  const { openModal } = useModalStore();

  const { account, setAccount } = useWalletAccountStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const { disconnectWallet } = useKaiaWalletSdk();

  const handleDisconnect = useCallback(() => {
    disconnectWallet().then(() => {
      setAccount(null);
      sessionStorage.removeItem('ACCOUNT');
    });
  }, [disconnectWallet])

  const handleSettings = () => {
    openModal('settings');
  };

  const handleActivities = () => {
    if (!account) {
      alert("Connect your wallet first to open activities");
      return
    }

    const accountUrl = `${KAIA_SCAN_URL}/address/${account}?tabId=txList&page=1`;

    if (liff.isInClient()) {
      liff.openWindow({
        url: accountUrl,
        external: true,
      });
    } else { 
      window.open(accountUrl, "_blank"); 
    }

  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <HeaderContainer>
      <LeftSection>
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
              <ProfileIcon>
                <Blockies
                  seed={account}
                />
              </ProfileIcon>
              <ProfileInfo>
                <ConnectedStatus>Connected</ConnectedStatus>
                <WalletAddress>{formatAddress(account)}</WalletAddress>
              </ProfileInfo>
            </ProfileSection>
            <ProfileSection>
              <AddressRow>
                <DropdownItem onClick={() => {
                  navigator.clipboard.writeText(account);
                }}>

                  <div style={{ marginTop: "auto", marginBottom: "auto", marginLeft: "10px" }}>
                    {formatAddress(account)}
                  </div>
                </DropdownItem>
              </AddressRow>

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
      </LeftSection>
      <RightSection>
        {activeTab !== "portfolio" && (
          <Icon onClick={handleSettings}>
            <Settings size={22} />
          </Icon>
        )}
        {activeTab === "portfolio" && (
          <Icon onClick={handleActivities}>
            <Clock size={22} />
          </Icon>
        )}
      </RightSection>
    </HeaderContainer>
  );
};

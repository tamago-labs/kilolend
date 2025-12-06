'use client';

import styled from 'styled-components';
import { useState, useCallback } from 'react';
import { WalletButton } from '@/components/Wallet/Button/WalletButton';
import { useWalletAccountStore } from "@/components/Wallet/Account/auth.hooks";
import { useKaiaWalletSdk } from "@/components/Wallet/Sdk/walletSdk.hooks";
import Blockies from 'react-blockies';
import { Settings, Clock, Menu, X } from "react-feather"
import { useModalStore } from '@/stores/modalStore';
import { useAppStore } from '@/stores/appStore';
import { liff } from "@/utils/liff";
import { KAIA_SCAN_URL } from "@/utils/ethersConfig"
import { useRouter, usePathname } from 'next/navigation';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 50;
  height: 72px;
  width: 100%;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 5px;
`;

const LogoIcon = styled.img`
  width: 180px;
  height: 55px;
`;

const Navigation = styled.nav`
  display: flex;
  gap: 24px;
`;

const NavItem = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #1e293b;
  }
  
  &.active {
    color: #06C755;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const ProfileIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ConnectedStatus = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #06C755;
  line-height: 1;
`;

const WalletAddress = styled.div`
  font-size: 14px;
  color: #64748b;
  font-family: monospace;
  line-height: 1;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
  
  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const ConnectButton = styled(WalletButton)`
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 12px;
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 32px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 12px;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  min-width: 240px;
  z-index: 100;
  margin-top: 8px;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    background: #f8fafc;
  }
`;

const DropdownSeparator = styled.div`
  height: 1px;
  background: #e2e8f0;
  margin: 8px 0;
`;

const DisconnectItem = styled(DropdownItem)`
  color: #ef4444;
  
  &:hover {
    background: #fef2f2;
  }
`;

export const DesktopHeader = () => {
  const { openModal } = useModalStore();
  const { account, setAccount } = useWalletAccountStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChainDropdown, setShowChainDropdown] = useState(false);
  const { disconnectWallet } = useKaiaWalletSdk();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedChain, setSelectedChain] = useState('kaia');

  const chains = [
    { id: 'kaia', name: 'KAIA Testnet', icon: '🌐' },
    { id: 'massa', name: 'Massa (Coming Soon)', icon: '⚡' },
    { id: 'ethereum', name: 'Ethereum (Coming Soon)', icon: '🔷' }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleChainChange = (chainId: string) => {
    if (chainId !== 'kaia') {
      alert(`${chainId} network is coming soon!`);
      return;
    }
    setSelectedChain(chainId);
    setShowChainDropdown(false);
  };

  const handleDisconnect = useCallback(() => {
    disconnectWallet().then(() => {
      setAccount(null);
      sessionStorage.removeItem('ACCOUNT');
      setShowDropdown(false);
    });
  }, [disconnectWallet, setAccount]);

  const handleSettings = () => {
    openModal('settings');
    setShowDropdown(false);
  };

  const handleActivities = () => {
    if (!account) {
      alert("Connect your wallet first to open activities");
      return;
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
    setShowDropdown(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setShowDropdown(false);
    }
  };

  return (
    <HeaderContainer>
      <LeftSection>
        {/*<Logo>
          <LogoIcon src="./images/kilolend-logo-desktop.png" alt="KiloLend" /> 
        </Logo>*/}
        <Navigation> 
          <NavItem 
            className={(pathname === '/home' || pathname === '/') ? 'active' : ''}
            onClick={() => handleNavigation('/home')}
          >
            Home
          </NavItem>
          <NavItem 
            className={pathname === '/markets' ? 'active' : ''}
            onClick={() => handleNavigation('/markets')}
          >
            Markets
          </NavItem>
          <NavItem 
            className={pathname === '/portfolio' ? 'active' : ''}
            onClick={() => handleNavigation('/portfolio')}
          >
            Portfolio
          </NavItem>
        </Navigation>
      </LeftSection>
      
      <RightSection>
        {!account ? (
          <ConnectButton />
        ) : (
          <>
            <IconButton onClick={handleSettings}>
              <Settings size={20} />
            </IconButton>
            <IconButton onClick={handleActivities}>
              <Clock size={20} />
            </IconButton>
            <ProfileSection onClick={() => setShowDropdown(!showDropdown)}>
              <ProfileIcon>
                <Blockies seed={account} size={40} />
              </ProfileIcon>
              <ProfileInfo>
                <ConnectedStatus>Connected</ConnectedStatus>
                <WalletAddress>{formatAddress(account)}</WalletAddress>
              </ProfileInfo>
            </ProfileSection>
            
            <DropdownMenu $isOpen={showDropdown}>
              <DropdownItem onClick={copyAddress}>
                📋 Copy Address
              </DropdownItem>
              <DropdownItem onClick={handleActivities}>
                🕐 View Transactions
              </DropdownItem>
              <DropdownItem onClick={handleSettings}>
                ⚙️ Settings
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => setShowChainDropdown(!showChainDropdown)}>
                🌐 {chains.find(c => c.id === selectedChain)?.name}
              </DropdownItem>
              <DisconnectItem onClick={handleDisconnect}>
                🔌 Disconnect Wallet
              </DisconnectItem>
            </DropdownMenu>
            
            <DropdownMenu $isOpen={showChainDropdown} style={{ right: '280px' }}>
              {chains.map((chain) => (
                <DropdownItem 
                  key={chain.id}
                  onClick={() => handleChainChange(chain.id)}
                  style={{ 
                    opacity: chain.id === 'kaia' ? 1 : 0.6,
                    cursor: chain.id === 'kaia' ? 'pointer' : 'not-allowed'
                  }}
                >
                  {chain.icon} {chain.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </>
        )}
      </RightSection>
    </HeaderContainer>
  );
};

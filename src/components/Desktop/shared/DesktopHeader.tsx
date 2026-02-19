'use client';

import styled from 'styled-components';
import { useState, useCallback } from 'react';
import { useWalletAccountStore } from "@/components/Wallet/Account/auth.hooks";
import { useKaiaWalletSdk } from "@/components/Wallet/Sdk/walletSdk.hooks";
import Blockies from 'react-blockies';
import { useAuth, useChain } from '@/contexts/ChainContext';
import { Settings, Clock, CreditCard, DollarSign, LogOut, ChevronDown } from "react-feather"
import { useModalStore } from '@/stores/modalStore';
import { useAppStore } from '@/stores/appStore';
import { liff } from "@/utils/liff";
import { KAIA_SCAN_URL } from "@/utils/ethersConfig"
import { useRouter, usePathname } from 'next/navigation';
import { DesktopWalletAddressModal, DesktopSettingsModal, NetworkSwitchModal, DesktopWalletConnectionModal } from '../modals';
import { Logo } from "@/components/Assets/Logo";
import { signatureService } from '@/services/signatureService';
import { useConnection, useChainId, useDisconnect } from 'wagmi';
import { kaia, kubChain, etherlink } from '@/wagmi_config';

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

const BrandLogo = styled.div`
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

const NetworkBadge = styled.div<{ $clickable?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #1e293b;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: ${({ $clickable }) => $clickable ? 'pointer' : 'default'};
  
  &:hover {
    border-color: ${({ $clickable }) => $clickable ? '#06C755' : '#e2e8f0'};
    box-shadow: ${({ $clickable }) => $clickable ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'};
  }
`;

const NetworkIcon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
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

const ConnectButton = styled.button`
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  min-width: 280px;
  height: 48px;
  color: #ffffff;
  background-color: #06c755;
  border-radius: 12px;
  border: none;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #05b54e;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  }
`;

const ConnectIcon = styled(Logo)`
  width: 22px;
  height: 22px;
  fill: white;
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

const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 32px;
`;

const BrandName = styled.div`
  font-size: 24px;
  font-weight: bold;
  font-style: italic;
  color: #06C755; 
  
  &:hover { 
    transform: translateY(-1px);
  }
`;

const NavDropdownContainer = styled.div`
  position: relative;
`;

const NavDropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 12px;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  min-width: 200px;
  z-index: 100;
  margin-top: 8px;
`;

const NavDropdownItem = styled.div`
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
  
  &.active {
    color: #06C755;
    background: rgba(6, 199, 85, 0.1);
  }
`;

export const DesktopHeader = () => {

  const { selectedAuthMethod } = useAuth()

  const { openModal, closeModal, activeModal } = useModalStore();
  const { account, setAccount } = useWalletAccountStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNavDropdown, setShowNavDropdown] = useState(false);
  const { disconnectWallet } = useKaiaWalletSdk();
  const { selectedChain } = useChain();
  const { isConnected: isWeb3Connected } = useConnection();

  const disconnect = useDisconnect();
  const wagmiChainId = useChainId();
  const router = useRouter();
  const pathname = usePathname();
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  // Determine the actual network to display
  const getNetworkInfo = () => {
    if (selectedChain === 'line_sdk') {
      // Using LINE SDK - always KAIA chain
      return {
        name: 'KAIA',
        icon: '/images/blockchain-icons/kaia-token-icon.png',
        alt: 'KAIA'
      };
    } else if (selectedChain === 'web3_wallet' && isWeb3Connected) {
      // Using Web3 wallet - check actual chain
      if (wagmiChainId === kaia.id) {
        return {
          name: 'KAIA',
          icon: '/images/blockchain-icons/kaia-token-icon.png',
          alt: 'KAIA'
        };
      } else if (wagmiChainId === kubChain.id) {
        return {
          name: 'KUB',
          icon: '/images/blockchain-icons/kub-chain-icon.png',
          alt: 'KUB'
        };
      } else if (wagmiChainId === etherlink.id) {
        return {
          name: 'Etherlink',
          icon: '/images/blockchain-icons/etherlink-icon.png',
          alt: 'Etherlink'
        };
      }
    }

    // Fallback - shouldn't happen but provide safe default
    return {
      name: 'KAIA',
      icon: '/images/blockchain-icons/kaia-token-icon.png',
      alt: 'KAIA'
    };
  };

  const networkInfo = getNetworkInfo();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleBrandClick = () => {
    router.push('/home');
  };

  const handleDisconnect = useCallback(() => {

    // Clear signature state on disconnect
    if (account) {
      signatureService.clearSignatureState(account);
    }

    disconnectWallet().then(() => {
      setAccount(null);
      sessionStorage.removeItem('ACCOUNT');
      setShowDropdown(false);
    });

    // Additional wagmi disconnect for web3_wallet mode
    if (selectedChain === 'web3_wallet') {
      disconnect.mutate()
    }

  }, [disconnectWallet, disconnect, setAccount, account, selectedChain]);

  const handleSettings = () => {
    openModal('settings');
  };

  const handleActivities = () => {
    if (!account) {
      alert("Connect your wallet first to open activities");
      return;
    }

    // Determine the correct block explorer URL based on the current chain
    let blockExplorerUrl;
    if (selectedChain === 'line_sdk') {
      // Using LINE SDK - always KAIA chain
      blockExplorerUrl = KAIA_SCAN_URL;
    } else if (selectedChain === 'web3_wallet' && isWeb3Connected) {
      // Using Web3 wallet - check actual chain 
      if (wagmiChainId === kaia.id) {
        blockExplorerUrl = KAIA_SCAN_URL;
      } else if (wagmiChainId === kubChain.id) {
        blockExplorerUrl = "https://www.kubscan.com";
      } else if (wagmiChainId === etherlink.id) {
        blockExplorerUrl = "https://explorer.etherlink.com";
      } else {
        blockExplorerUrl = KAIA_SCAN_URL; // fallback
      }
    } else {
      blockExplorerUrl = KAIA_SCAN_URL; // fallback
    }

    const accountUrl = `${blockExplorerUrl}/address/${account}?tabId=txList&page=1`;

    if (liff.isInClient()) {
      liff.openWindow({
        url: accountUrl,
        external: true,
      });
    } else {
      window.open(accountUrl, "_blank");
    }
  };

  const handleViewQR = () => {
    if (account) {
      openModal('walletAddress');
      setShowDropdown(false);
    }
  };

  const handleViewPortfolio = () => {
    router.push('/portfolio');
    setShowDropdown(false);
  };

  const handleApiKeys = () => {
    router.push('/agent-wallets');
    setShowDropdown(false);
  };

  const handleAgentWallets = () => {
    router.push('/agent-wallets');
    setShowDropdown(false);
  };


  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <HeaderContainer>
        <LeftSection>
          <BrandContainer onClick={handleBrandClick}>
            <BrandName>KiloLend</BrandName>
          </BrandContainer>
          <Navigation>
            {/*  <NavItem 
              className={(pathname === '/home' || pathname === '/') ? 'active' : ''}
              onClick={() => handleNavigation('/home')}
            >
              Home
            </NavItem>*/}
            <NavItem
              className={pathname === '/markets' ? 'active' : ''}
              onClick={() => handleNavigation('/markets')}
            >
              Lending
            </NavItem>
            <NavItem
              className={pathname === '/swap' ? 'active' : ''}
              onClick={() => handleNavigation('/swap')}
            >
              Swap
            </NavItem>
            <NavItem
              className={pathname === '/leaderboard' ? 'active' : ''}
              onClick={() => handleNavigation('/leaderboard')}
            >
              Leaderboard
            </NavItem>
            <NavDropdownContainer>
              <NavItem
                className={(pathname === '/portfolio' || showNavDropdown) ? 'active' : ''}
                onClick={() => setShowNavDropdown(!showNavDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                More
                <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: showNavDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </NavItem>
              <NavDropdownMenu $isOpen={showNavDropdown}>
                <NavDropdownItem
                  className={pathname === '/portfolio' ? 'active' : ''}
                  onClick={() => {
                    handleNavigation('/portfolio');
                    setShowNavDropdown(false);
                  }}
                >
                  Portfolio
                </NavDropdownItem>
                <NavDropdownItem
                  className={pathname === '/agent-wallets' ? 'active' : ''}
                  onClick={() => {
                    handleNavigation('/agent-wallets');
                    setShowNavDropdown(false);
                  }}
                >
                  Setup AI-Wallet
                </NavDropdownItem>
                <NavDropdownItem
                  className={''}
                  onClick={() => {
                    handleNavigation('https://docs.kilolend.xyz');
                    setShowNavDropdown(false);
                  }}
                >
                  Documentation
                </NavDropdownItem>
              </NavDropdownMenu>
            </NavDropdownContainer>
          </Navigation>
        </LeftSection>

        <RightSection>
          {!account ? (
            <ConnectButton onClick={() => openModal('walletConnection')}>
              <ConnectIcon />
              Connect
            </ConnectButton>
          ) : (
            <>
              <NetworkBadge
                $clickable={selectedChain === 'web3_wallet'}
                onClick={() => selectedChain === 'web3_wallet' && setShowNetworkModal(true)}
              >
                <NetworkIcon
                  src={networkInfo.icon}
                  alt={networkInfo.alt}
                />
                {networkInfo.name}
              </NetworkBadge>
              {selectedAuthMethod === "line_sdk" && (
                <IconButton onClick={handleSettings}>
                  <Settings size={20} />
                </IconButton>
              )} 
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
                {selectedChain === 'line_sdk' && (
                  <DropdownItem onClick={handleViewQR}>
                    Wallet Details
                  </DropdownItem>
                )
                }
                <DropdownItem onClick={handleViewPortfolio}>
                  Portfolio
                </DropdownItem>
                <DropdownItem onClick={handleAgentWallets}>
                  Agent Wallets
                </DropdownItem>
                <DropdownItem onClick={handleApiKeys}>
                  Agent API Keys
                </DropdownItem>
                <DropdownSeparator />
                <DisconnectItem onClick={handleDisconnect}>
                  Disconnect Wallet
                </DisconnectItem>
              </DropdownMenu>
            </>
          )}
        </RightSection>
      </HeaderContainer>

      <DesktopWalletAddressModal
        isOpen={activeModal === 'walletAddress'}
        onClose={() => closeModal()}
        walletAddress={account || ''}
      />

      <DesktopSettingsModal
        isOpen={activeModal === 'settings'}
        onClose={() => closeModal()}
      />

      <NetworkSwitchModal
        isOpen={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
      />

      <DesktopWalletConnectionModal
        isOpen={activeModal === 'walletConnection'}
        onClose={() => closeModal()}
      />
    </>
  );
};
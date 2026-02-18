'use client';

import styled from 'styled-components';
import { DesktopBaseModal } from './shared/DesktopBaseModal';
import { useChain } from '@/contexts/ChainContext';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { WalletSelectionModal } from '@/components/Wallet/WalletSelectionModal/WalletSelectionModal';
import { useConnect, useConnection } from 'wagmi';
import { kubChain } from '@/wagmi_config';
import { useEffect, useState, useCallback } from 'react';

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  text-align: center;
`;

const ConnectionOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const ConnectionCard = styled.div`
  border-radius: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #06C755 0%, #059669 50%, #047857 100%);
  transition: all 0.2s ease;
  cursor: pointer;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
    pointer-events: none;
  }

  &:hover {
    box-shadow: 0 8px 24px rgba(6, 199, 85, 0.3);
    transform: translateY(-2px);
  }
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  margin: 0 auto 16px auto;
  border-radius: 10px;
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardDescription = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 12px 0;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.95);
  color: #047857;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #06C755;
    border-color: #06C755;
    color: white;
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.2);
  }
`;

interface DesktopWalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopWalletConnectionModal = ({ isOpen, onClose }: DesktopWalletConnectionModalProps) => {
  const { setSelectedChain, selectedChain } = useChain();
  const { connectAndSign } = useKaiaWalletSdk();
  const { setAccount } = useWalletAccountStore();
  const connect = useConnect();
  const { address: wagmiAddress } = useConnection();
  const [tick, setTick ] = useState(0)
  const [showWalletSelection, setShowWalletSelection] = useState(false);

  const handleSocialLogin = async () => {
    try {

      // Set the auth method to line_sdk
      setSelectedChain('line_sdk');

      // Connect using LINE Mini Dapp SDK
      const [account] = await connectAndSign("connect");
      sessionStorage.setItem('ACCOUNT', account);
      setAccount(account);
      onClose();
    } catch (error) {
      console.log('Social login error:', error);
    }
  };

  const increaseTick = useCallback(() => {
    if (selectedChain === "web3_wallet") {
      setTick(tick+1)
    } 
  },[selectedChain, tick])

  const handleWeb3Wallet = () => {
    // Set the auth method to web3_wallet
    setSelectedChain('web3_wallet');
    setShowWalletSelection(true);
  };

  useEffect(() => {  
    if (wagmiAddress) {  
      sessionStorage.setItem('ACCOUNT', wagmiAddress);
      setAccount(wagmiAddress);
    }
  }, [ wagmiAddress, tick])

  const handleWalletSelect = async (connector: any) => {
    try { 
      await connect.mutate({ connector, chainId: kubChain.id })
      setShowWalletSelection(false);
      onClose();

      // Store the connected account in our existing store for consistency
      // if (wagmiAddress) {
      //   sessionStorage.setItem('ACCOUNT', wagmiAddress);
      //   setAccount(wagmiAddress);
      // }
    } catch (error) {
      console.log('Wallet connection error:', error);
    } 
    increaseTick()

  };
 
  return (
    <>
      <DesktopBaseModal isOpen={isOpen && !showWalletSelection} onClose={onClose} title="Connect Your Wallet" width="480px">
        <ModalContainer>
          <ConnectionOptions>
            {/* LINE Mini Dapp SDK Option */}
            <ConnectionCard onClick={handleSocialLogin}>
              {/*<CardIcon>L</CardIcon>*/}
              <CardTitle>LINE & Social Login</CardTitle>
              <CardDescription>
                Connect using LINE, Google, Apple, Naver, Kakao, or KAIA Wallet.
              </CardDescription>
              <Badge>Available on KAIA</Badge>
            </ConnectionCard>

            {/* Traditional Web3 Wallet Option */}
            <ConnectionCard onClick={handleWeb3Wallet}>
              {/*<CardIcon>W</CardIcon>*/}
              <CardTitle>External Wallets</CardTitle>
              <CardDescription>
                Connect using MetaMask, Trust Wallet, or other browser extension wallets.
              </CardDescription>
              <Badge>Available on KAIA, KUB & Etherlink</Badge>
            </ConnectionCard>
          </ConnectionOptions>

          <CloseButton onClick={onClose}>
            Close
          </CloseButton>
        </ModalContainer>
      </DesktopBaseModal>

      {/* Web3 Wallet Selection Modal */}
      <WalletSelectionModal
        isOpen={showWalletSelection}
        onClose={() => setShowWalletSelection(false)}
        onWalletSelect={handleWalletSelect}
      />
    </>
  );
};
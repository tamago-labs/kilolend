/* GUIDELINE https://docs.dappportal.io/mini-dapp/design-guide#connect-button */
import { useState } from 'react';
import styles from "./WalletButton.module.css";
import { Logo } from "@/components/Assets/Logo";
import { useKaiaWalletSdk } from "@/components/Wallet/Sdk/walletSdk.hooks";
import { useWalletAccountStore } from "@/components/Wallet/Account/auth.hooks";
import { useChain } from '@/contexts/ChainContext';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { kubChain } from '@/wagmi_config';
import { WalletSelectionModal } from '../WalletSelectionModal/WalletSelectionModal';

export const WalletButton = () => {
  const [showWalletModal, setShowWalletModal] = useState(false);

  const { connectAndSign } = useKaiaWalletSdk();
  const { setAccount } = useWalletAccountStore();
  const { selectedChain } = useChain();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { address: wagmiAddress } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const handleKaiaConnect = async () => {
    try {
      const [account] = await connectAndSign("connect");
      sessionStorage.setItem('ACCOUNT', account);
      setAccount(account);
    }
    catch (error: unknown) {
      console.log(error);
    }
  };
 

  const handleClick = async () => {
    if (selectedChain === 'kaia') {
      await handleKaiaConnect();
    } else if (selectedChain === 'kub') {
      setShowWalletModal(true);
    }
  };

  const handleWalletSelect = async (connector: any) => {
    try {
      await wagmiConnect({ connector, chainId: kubChain.id });
      setShowWalletModal(false);

      // Store the connected account in our existing store for consistency
      if (wagmiAddress) {
        sessionStorage.setItem('ACCOUNT', wagmiAddress);
        setAccount(wagmiAddress);
      }
    } catch (error) {
      console.log('Wallet connection error:', error);
    }
  };

  const getButtonText = () => {
    return 'Connect';
  };

  const getButtonIcon = () => {
    if (selectedChain === 'kub') {
      return (
        <>
          {/* <img 
          src="/images/blockchain-icons/kub-chain-icon.png" 
          alt="KUB Chain" 
          width="20" 
          height="20"
          style={{ borderRadius: '50%' }}
        /> */}
        </>
      );
    }
    return <Logo className={styles.icon} />;
  };

  return (
    <>
      <button className={styles.root} onClick={handleClick}>
        {getButtonIcon()}
        <p className={styles.description}>{getButtonText()}</p>
      </button>

      <WalletSelectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onWalletSelect={handleWalletSelect}
      />
    </>
  );
} 

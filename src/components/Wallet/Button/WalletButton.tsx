/* GUIDELINE https://docs.dappportal.io/mini-dapp/design-guide#connect-button */
import { useState } from 'react';
import styles from "./WalletButton.module.css";
import { Logo } from "@/components/Assets/Logo";
import { useKaiaWalletSdk } from "@/components/Wallet/Sdk/walletSdk.hooks";
import { useWalletAccountStore } from "@/components/Wallet/Account/auth.hooks";
import { useChain } from '@/contexts/ChainContext';
import { useConnect, useConnection, useDisconnect } from 'wagmi';
import { kubChain } from '@/wagmi_config';
import { WalletSelectionModal } from '../WalletSelectionModal/WalletSelectionModal';

export const WalletButton = () => {
  const [showWalletModal, setShowWalletModal] = useState(false);

  const { connectAndSign } = useKaiaWalletSdk();
  const { setAccount } = useWalletAccountStore();
  const { selectedChain } = useChain();
  const connect = useConnect();
  const { address: wagmiAddress } = useConnection();

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
    if (selectedChain === 'line_sdk') {
      await handleKaiaConnect();
    } else if (selectedChain === 'web3_wallet') {
      setShowWalletModal(true);
    }
  };

  const handleWalletSelect = async (connector: any) => {
    try {
      await connect.mutateAsync({ connector, chainId: kubChain.id });
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


// export const WalletButtonMobile = () => { 

//   const { connectAndSign } = useKaiaWalletSdk();
//   const { setAccount } = useWalletAccountStore(); 

//   const handleKaiaConnect = async () => {
//     try {
//       const [account] = await connectAndSign("connect");
//       sessionStorage.setItem('ACCOUNT', account);
//       setAccount(account);
//     }
//     catch (error: unknown) {
//       console.log(error);
//     }
//   };


//   const handleClick = async () => {
//     await handleKaiaConnect();
//   };


//   const getButtonText = () => {
//     return 'Connect';
//   };

//   const getButtonIcon = () => {
//     return <Logo className={styles.icon} />;
//   };

//   return (
//     <button className={styles.root} onClick={handleClick}>
//       {getButtonIcon()}
//       <p className={styles.description}>{getButtonText()}</p>
//     </button>
//   );
// } 
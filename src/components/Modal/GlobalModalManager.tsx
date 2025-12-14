'use client';

import { useModalStore } from '@/stores/modalStore'; 
import { TokenDetailsModal } from './TokenDetailsModal';
import { FaucetModal } from './FaucetModal';
import { SupplyModal } from './SupplyModal';
import { BorrowModal } from './BorrowModal';
import { WithdrawModal } from './WithdrawModal';
import { RepayModal } from './RepayModal';
import { SettingsModal } from './SettingsModal'; 
import { FAQModal } from './FAQModal';
import { WalletAddressModal } from './WalletAddressModal';
import { SendModal } from './SendModal';
import { LeaderboardModal } from './LeaderboardModal';
import { KiloPointsModal } from "./KiloModal"
import { InviteModal } from './InviteModal'; 
import { NewsModal } from './NewsModal';
import { DepositModal } from '../Profile/DepositModal';
import { WithdrawModal as AIWithdrawModal } from '../Profile/WithdrawModal';
import { AIAgentModal } from './AIAgentModal';


export const GlobalModalManager = () => {
  const { activeModal, isOpen, closeModal, modalData, openModal } = useModalStore();

  const handleOpenFaucet = () => {
    openModal('faucet');
  };

  const renderModal = () => {
    switch (activeModal) {
      case 'supply':
        return (
          <SupplyModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );

      case 'borrow':
        return (
          <BorrowModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );

      case 'withdraw':
        return (
          <WithdrawModal
            isOpen={isOpen}
            onClose={closeModal}
            market={modalData.market}
            currentSupply={modalData.currentSupply}
            maxWithdraw={modalData.maxWithdraw}
          />
        );

      case 'repay':
        return (
          <RepayModal
            isOpen={isOpen}
            onClose={closeModal}
            market={modalData.market}
            currentDebt={modalData.currentDebt}
            totalDebt={modalData.totalDebt}
          />
        );
 
      case 'settings':
        return (
          <SettingsModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );
 

      case 'faq':
        return (
          <FAQModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );

      case 'invite':
        return (
          <InviteModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );

      case 'kilo':
        return (
          <KiloPointsModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );

       

      case 'token-details':
        return (
          <TokenDetailsModal
            isOpen={isOpen}
            onClose={closeModal}
            onOpenFaucet={handleOpenFaucet}
            tokenData={modalData}
          />
        );

      case 'wallet-address':
        return (
          <WalletAddressModal
            isOpen={isOpen}
            onClose={closeModal}
            walletAddress={modalData.walletAddress || ''}
          />
        );

      

      

      case 'faucet':
        return (
          <FaucetModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );

      case 'send':
        return (
          <SendModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );

      case 'leaderboard':
        return (
          <LeaderboardModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );

      case 'news':
        return (
          <NewsModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );

      case 'ai-deposit':
        return (
          <DepositModal
            aiWalletAddress={modalData.aiWalletAddress || ''}
            onClose={closeModal}
            onSuccess={modalData.onSuccess}
          />
        );

      case 'ai-withdraw':
        return (
          <AIWithdrawModal
            aiWalletAddress={modalData.aiWalletAddress || ''}
            onClose={closeModal}
            onSuccess={modalData.onSuccess}
          />
        );

      case 'ai-agent':
        return (
          <AIAgentModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );

      // case 'buy':
      //   return (
      //     <BuyModal
      //       isOpen={isOpen}
      //       onClose={closeModal}
      //     />
      //   );
      // case 'swap':
      //   return (
      //     <SwapModal
      //       // isOpen={isOpen}
      //       onClose={closeModal}
      //     />
      //   );

      default:
        return null;
    }
  };

  return <>{renderModal()}</>;
};

'use client';

import { useModalStore } from '@/stores/modalStore';
import { BlankModal } from './BlankModal';
import { TokenDetailsModal } from './TokenDetailsModal';
import { FaucetModal } from './FaucetModal';
import { SupplyModal } from './SupplyModal';
import { BorrowModal } from './BorrowModal';
import { WithdrawModal } from './WithdrawModal';
import { RepayModal } from './RepayModal';
import { SettingsModal } from './SettingsModal';
import { AIRecommendationModal } from './AIRecommendationModal';
import { FAQModal } from './FAQModal';
import { WalletAddressModal } from './WalletAddressModal';
import { SendModal } from './SendModal';
import { LeaderboardModal } from './LeaderboardModal';
import { KiloPointsModal } from "./KiloModal"
import { InviteModal } from './InviteModal';
import { AIChatModal } from './AIChatModal';
import { SwapModal } from './SwapModal';
import { BoostModal } from './BoostModal';

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

      case 'portfolio':
        return (
          <BlankModal
            isOpen={isOpen}
            onClose={closeModal}
            title="Portfolio"
            icon="📊"
            placeholderTitle="Your Portfolio"
            placeholderText="View your lending positions, earnings, and portfolio analytics. This feature will be available soon."
          />
        );

      case 'analytics':
        return (
          <BlankModal
            isOpen={isOpen}
            onClose={closeModal}
            title="Analytics"
            icon="📈"
            placeholderTitle="Market Analytics"
            placeholderText="Analyze market trends, APY rates, and lending opportunities. This feature will be available soon."
          />
        );

      case 'ai-chat':
        return (
          <BlankModal
            isOpen={isOpen}
            onClose={closeModal}
            title="AI Assistant"
            icon="🤖"
            placeholderTitle="AI Chat"
            placeholderText="Chat with KiloBot for general DeFi questions and guidance. This feature will be available soon."
          />
        );

      case 'ai-chat-new':
        return (
          <AIChatModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );

      case 'ai-recommendations':
        return (
          <AIRecommendationModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );

      case 'settings':
        return (
          <SettingsModal
            isOpen={isOpen}
            onClose={closeModal}
          />
        );

      case 'activities':
        return (
          <BlankModal
            isOpen={isOpen}
            onClose={closeModal}
            title="Activity"
            icon="⚙️"
            placeholderTitle="Activity"
            placeholderText="View your transaction history."
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

      case 'contacts':
        return (
          <BlankModal
            isOpen={isOpen}
            onClose={closeModal}
            title="Contacts"
            icon="📇"
            placeholderTitle="Contact Us"
            placeholderText="Get in touch with support or the Kaia team for help and inquiries."
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

      case 'support':
        return (
          <BlankModal
            isOpen={isOpen}
            onClose={closeModal}
            title="Support"
            icon="🆘"
            placeholderTitle="Get Support"
            placeholderText="Need help? Contact our support team for assistance with KiloLend features and troubleshooting."
          />
        );

      case 'feedback':
        return (
          <BlankModal
            isOpen={isOpen}
            onClose={closeModal}
            title="Feedback"
            icon="💬"
            placeholderTitle="Send Feedback"
            placeholderText="We value your feedback! Let us know how we can improve KiloLend for you."
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
      case 'swap':
        return (
          <SwapModal
            // isOpen={isOpen}
            onClose={closeModal}
          />
        );
      case 'boost':
        return (
          <BoostModal
            // isOpen={isOpen}
            onClose={closeModal}
          />
        );

      default:
        return null;
    }
  };

  return <>{renderModal()}</>;
};
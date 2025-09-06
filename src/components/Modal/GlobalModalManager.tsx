'use client';

import { useModalStore } from '@/stores/modalStore';
import { BlankModal } from './BlankModal';
import { TokenDetailsModal } from './TokenDetailsModal';
import { FaucetModal } from './FaucetModal';
import { SupplyModal } from './SupplyModal';
import { BorrowModal } from './BorrowModal';

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
            placeholderTitle="AI Recommendations"
            placeholderText="Get personalized lending strategies and AI-powered deal recommendations. This feature will be available soon."
          />
        );

      case 'settings':
        return (
          <BlankModal
            isOpen={isOpen}
            onClose={closeModal}
            title="Settings"
            icon="⚙️"
            placeholderTitle="App Settings"
            placeholderText="Configure your preferences, notifications, and account settings. This feature will be available soon."
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

      case 'learn':
        return (
          <BlankModal
            isOpen={isOpen}
            onClose={closeModal}
            title="Learn"
            icon="📚"
            placeholderTitle="Learn the Platform"
            placeholderText="Understand how Kaia works, its features, and how to earn KILO Points."
          />
        );

      case 'invite':
        return (
          <BlankModal
            isOpen={isOpen}
            onClose={closeModal}
            title="Invite"
            icon="✉️"
            placeholderTitle="Invite Friends"
            placeholderText="Invite your friends on LINE Messenger and earn KILO Points when they join."
          />
        );

      case 'kilo':
        return (
          <BlankModal
            isOpen={isOpen}
            onClose={closeModal}
            title="KILO Points"
            icon="💎"
            placeholderTitle="Your KILO Points"
            placeholderText="Check your current KILO Points balance and learn how to earn more."
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

      default:
        return null;
    }
  };

  return <>{renderModal()}</>;
};

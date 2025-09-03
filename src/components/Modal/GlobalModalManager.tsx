'use client';

import { useModalStore } from '@/stores/modalStore';
import { BlankModal } from './BlankModal';

export const GlobalModalManager = () => {
  const { activeModal, isOpen, closeModal } = useModalStore();

  const renderModal = () => {
    switch (activeModal) {
      case 'supply':
        return (
          <BlankModal
            isOpen={isOpen}
            onClose={closeModal}
            title="Supply"
            icon="📈"
            placeholderTitle="Supply Assets"
            placeholderText="Supply your stablecoins and earn yield. This feature will be available soon."
          />
        );

      case 'borrow':
        return (
          <BlankModal
            isOpen={isOpen}
            onClose={closeModal}
            title="Borrow"
            icon="💰"
            placeholderTitle="Borrow Assets"
            placeholderText="Get stablecoin loans using your crypto as collateral. This feature will be available soon."
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

      default:
        return null;
    }
  };

  return <>{renderModal()}</>;
};
'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';
import { useModalStore } from '@/stores/modalStore';
import { PRICE_API_CONFIG, KAIA_MAINNET_TOKENS } from '@/utils/tokenConfig';
import { AlertCircle, RefreshCw, HelpCircle, MessageCircle, Settings, CreditCard, ArrowUpCircle, ArrowDownCircle } from 'react-feather';
import { liff } from "@/utils/liff";
import ExternalLinksSection from '../Profile/ExternalLinks';
import { MyWalletTab } from '../Profile/MyWalletTab';
import { AIWalletTab } from '../Profile/AIWalletTab';
import { DepositModal } from '../Profile/DepositModal';
import { WithdrawModal } from '../Profile/WithdrawModal';
import { ProfileOverview } from '../Profile/ProfileOverview';

const PageContainer = styled.div`
  flex: 1;
  padding: 20px 16px;
  padding-bottom: 80px;
  background: #f8fafc;
  min-height: 100vh;

  @media (max-width: 480px) {
    padding: 16px 12px;
    padding-bottom: 80px;
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
`;

const TabsContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
`;

const TabsList = styled.div`
  display: flex;
  gap: 8px;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $active }) => $active
    ? 'linear-gradient(135deg, #00C300, #00A000)'
    : 'transparent'
  };
  color: ${({ $active }) => $active ? 'white' : '#64748b'};

  &:hover {
    background: ${({ $active }) => $active
    ? 'linear-gradient(135deg, #00C300, #00A000)'
    : '#f8fafc'
  };
  }
`;

const TabContent = styled.div` 
  margin-bottom: 24px; 

  @media (max-width: 480px) { 
    margin-bottom: 20px;
  }
`;

const InfoMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #dbeafe;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const MessageText = styled.span`
  font-size: 14px;
`;

interface LineProfile {
  displayName: string;
  pictureUrl: string;
  userId: string;
}

export const ProfilePage = () => {
  const { account } = useWalletAccountStore();
  const { balances, isLoading, refreshBalances } = useTokenBalances();
  const { openModal, modalData } = useModalStore();

  const [lineProfile, setLineProfile] = useState<LineProfile | null>(null);
  const [totalUSDValue, setTotalUSDValue] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'my-wallet' | 'ai-wallet'>('my-wallet');

  // Get prices for tokens we have API data for
  const apiTokens = PRICE_API_CONFIG.supportedTokens;

  const { prices, getFormattedPrice, getFormattedChange, isLoading: pricesLoading } = usePriceUpdates({
    symbols: ["MBX", ...apiTokens]
  });

  useEffect(() => {
    if (liff.isInClient()) {
      liff.getProfile().then(
        ({ userId, displayName, pictureUrl }) => {
          setLineProfile({
            userId,
            displayName,
            pictureUrl: pictureUrl || "https://kilolend.xyz/images/kilo-icon.png"
          })
        })
    }
  }, []);

  // Calculate total USD value using only real price data
  useEffect(() => {
    let total = 0;

    balances.forEach(balance => {
      // Handle MBX -> MARBLEX mapping for price lookup
      const priceKey = balance.symbol === 'MBX' ? 'MBX' : balance.symbol;
      const price = prices[priceKey];

      if (price && parseFloat(balance.balance) > 0) {
        total += parseFloat(balance.balance) * price.price;
      }
    });

    setTotalUSDValue(total);
  }, [balances, prices]);

  const handleProfileClick = () => {
    if (account) {
      openModal('wallet-address', { walletAddress: account });
    }
  };

  const handleDepositClick = () => {
    if (account) {
      openModal('ai-deposit', {
        userAddress: account,
        onSuccess: () => {
          // Refresh balances after successful deposit
          // refreshBalances();
        }
      });
    }
  };

  const handleWithdrawClick = () => {
    if (account) {
      openModal('ai-withdraw', {
        userAddress: account,
        onSuccess: () => {
          // Refresh balances after successful withdrawal
          //  refreshBalances();
        }
      });
    }
  };

  // Get modal data for deposit/withdraw
  const depositModalData = modalData?.['ai-deposit'];
  const withdrawModalData = modalData?.['ai-withdraw'];

  return (
    <PageContainer>
      <PageTitle>Profile</PageTitle>
      <PageSubtitle>
        View and manage your account details
      </PageSubtitle>

      {/* Profile Section */}
      <ProfileOverview
        lineProfile={lineProfile}
        account={account}
        totalUSDValue={totalUSDValue}
        onProfileClick={handleProfileClick}
      />

      {/* {!account && (
        <InfoMessage>
          <AlertCircle size={16} color="#3b82f6" />
          <MessageText style={{ color: '#1e40af' }}>Please connect your wallet to access full function</MessageText>
        </InfoMessage>
      )}*/}

      {/* Wallet Tabs */}
      <TabsContainer>
        <TabsList>
          <TabButton
            $active={activeTab === 'my-wallet'}
            onClick={() => setActiveTab('my-wallet')}
          >
            Main Wallet
          </TabButton>
          <TabButton
            $active={activeTab === 'ai-wallet'}
            onClick={() => setActiveTab('ai-wallet')}
          >
            AI Wallet
          </TabButton>
        </TabsList>
      </TabsContainer>

      <TabContent>
        {activeTab === 'my-wallet' ? (
          <MyWalletTab
            totalUSDValue={totalUSDValue}
            onDepositClick={handleDepositClick}
            balances={balances}
            prices={prices}
            refreshBalances={refreshBalances}
            account={account}
            isLoading={isLoading}
            getFormattedChange={getFormattedChange}
            getFormattedPrice={getFormattedPrice}
            pricesLoading={pricesLoading}
          />
        ) : (
          <AIWalletTab
            onWithdrawClick={handleWithdrawClick}
            account={account} 
            prices={prices}
            getFormattedChange={getFormattedChange}
            getFormattedPrice={getFormattedPrice}
            pricesLoading={pricesLoading}
          />
        )}
      </TabContent>

      {/* External Links Section */}
      <ExternalLinksSection />

      {/* Modals */}
      {depositModalData && (
        <DepositModal
          aiWalletAddress={depositModalData.aiWalletAddress || ''}
          onClose={() => openModal('ai-deposit', undefined)}
          onSuccess={depositModalData.onSuccess}
        />
      )}

      {withdrawModalData && (
        <WithdrawModal
          aiWalletAddress={withdrawModalData.aiWalletAddress || ''}
          onClose={() => openModal('ai-withdraw', undefined)}
          onSuccess={withdrawModalData.onSuccess}
        />
      )}
    </PageContainer>
  );
};

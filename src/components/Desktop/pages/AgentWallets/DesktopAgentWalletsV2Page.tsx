"use client";

import React, { useState, useEffect } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { aiWalletService, AIWalletStatus } from '@/services/aiWalletService';
import { WifiOff, Cpu, Loader } from 'react-feather';
import { DesktopAgentWalletsHeader } from './components/DesktopAgentWalletsHeader';
import { BalanceContent } from './components/BalanceContent';
import { DepositContent } from './components/DepositContent';
import { WithdrawContent } from './components/WithdrawContent';
import { APIKeysContent } from './components/APIKeysContent';
import { AgentSkillsContent } from './components/AgentSkillsContent';
import { ActivityLogContent } from './components/ActivityLogContent';
import { SecurityLimitsContent } from './components/SecurityLimitsContent';
import {
  PortfolioContainer,
  MainContent,
  SideTabContainer,
  SideTabNavigation,
  SideTabButton,
  SideTabContent,
  ContentTitle,
  ContentSubtitle,
  Button,
} from './DesktopAgentWalletsV2Page.styles';

type TabType = 'balance' | 'deposit' | 'withdraw' | 'apikeys' | 'skills' | 'activity' | 'security';

const EMPTY_STATE_CONTAINER = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  padding: '80px 40px',
  textAlign: 'center' as const,
  background: 'white',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
};

const EMPTY_STATE_GRAPHIC = {
  width: '120px',
  height: '120px',
  background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  marginBottom: '24px',
  position: 'relative' as const,
};

const EMPTY_STATE_TITLE = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#1e293b',
  marginBottom: '12px',
};

const EMPTY_STATE_TEXT = {
  fontSize: '16px',
  color: '#64748b',
  lineHeight: 1.6,
  marginBottom: '32px',
  maxWidth: '400px',
};

export const DesktopAgentWalletsV2Page = () => {
  const { account } = useWalletAccountStore();
  const [activeTab, setActiveTab] = useState<TabType>('balance');
  const [selectedChain, setSelectedChain] = useState(8217);

  // AI wallet state
  const [aiWalletData, setAiWalletData] = useState<AIWalletStatus | null>(null);
  const [isCreatingAIWallet, setIsCreatingAIWallet] = useState(false);
  const [isLoadingAIWallet, setIsLoadingAIWallet] = useState(true);
  const [aiWalletError, setAiWalletError] = useState<string | null>(null);

  // Fetch AI wallet status
  const fetchAIWalletStatus = async () => {
    if (!account) return;
    
    setIsLoadingAIWallet(true);
    setAiWalletError(null);
    
    try {
      const status = await aiWalletService.getAIWalletStatus(account);
      setAiWalletData(status);
    } catch (error) {
      console.error('Failed to fetch AI wallet status:', error);
      setAiWalletError(error instanceof Error ? error.message : 'Failed to fetch AI wallet status');
    } finally {
      setIsLoadingAIWallet(false);
    }
  };

  // Create AI wallet
  const handleCreateAIWallet = async () => {
    if (!account) return;
    
    setIsCreatingAIWallet(true);
    setAiWalletError(null);
    
    try {
      const result = await aiWalletService.createAIWallet(account);
      setAiWalletData({
        hasWallet: true,
        aiWalletAddress: result.aiWalletAddress,
        assignedAt: result.assignedAt,
        status: result.status
      });
    } catch (error) {
      console.error('Failed to create AI wallet:', error);
      setAiWalletError(error instanceof Error ? error.message : 'Failed to create AI wallet');
    } finally {
      setIsCreatingAIWallet(false);
    }
  };

  // Fetch AI wallet data on component mount and when account changes
  useEffect(() => {
    if (account) {
      fetchAIWalletStatus();
    }
  }, [account]);

  const tabs = [
    { id: 'balance' as TabType, label: 'Balance' },
    { id: 'deposit' as TabType, label: 'Deposit' },
    { id: 'withdraw' as TabType, label: 'Withdraw' },
    { id: 'activity' as TabType, label: 'Activity Log' },
    { id: 'apikeys' as TabType, label: 'API Keys' },
    { id: 'skills' as TabType, label: 'Agent Skills' },
    { id: 'security' as TabType, label: 'Security & Limits' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'balance':
        return (
          <>
            <ContentTitle>
              Balance Overview
            </ContentTitle>
            <ContentSubtitle>
              View and manage your Agent Wallet balances across supported chains
            </ContentSubtitle>
            <BalanceContent 
              selectedChain={selectedChain} 
              onChainChange={setSelectedChain}
              aiWalletData={aiWalletData}
              isLoadingAIWallet={isLoadingAIWallet}
              isCreatingAIWallet={isCreatingAIWallet}
              onCreateAIWallet={handleCreateAIWallet}
              aiWalletError={aiWalletError}
            />
          </>
        );
      case 'deposit':
        return (
          <>
            <ContentTitle>
              Deposit Funds
            </ContentTitle>
            <ContentSubtitle>
              Transfer tokens from your connected wallet to your Agent Wallet to enable automated execution
            </ContentSubtitle>
            <DepositContent 
              aiWalletData={aiWalletData}
              isLoadingAIWallet={isLoadingAIWallet}
            />
          </>
        );
      case 'withdraw':
        return (
          <>
            <ContentTitle>
              Withdraw Funds
            </ContentTitle>
            <ContentSubtitle>
              Transfer tokens from your AI wallet back to your main wallet
            </ContentSubtitle>
            <WithdrawContent 
              aiWalletData={aiWalletData}
              isLoadingAIWallet={isLoadingAIWallet}
            />
          </>
        );
      case 'apikeys':
        return (
          <>
            <ContentTitle>
              API Keys
            </ContentTitle>
            <ContentSubtitle>
              Manage API keys for programmatic access to your AI wallet and trading operations
            </ContentSubtitle>
            <APIKeysContent 
              aiWalletData={aiWalletData}
              isLoadingAIWallet={isLoadingAIWallet}
            />
          </>
        );
      case 'skills':
        return (
          <>
            <ContentTitle>
              Agent Skills
            </ContentTitle>
            <ContentSubtitle>
              Configure and manage trading skills that your AI agent can execute autonomously
            </ContentSubtitle>
            <AgentSkillsContent 
              aiWalletData={aiWalletData}
              isLoadingAIWallet={isLoadingAIWallet}
            />
          </>
        );
      case 'activity':
        return (
          <>
            <ContentTitle>
              Activity Log
            </ContentTitle>
            <ContentSubtitle>
              Track all activities including deposits, withdrawals, trades, and other operations
            </ContentSubtitle>
            <ActivityLogContent 
              aiWalletData={aiWalletData}
              isLoadingAIWallet={isLoadingAIWallet}
            />
          </>
        );
      case 'security':
        return (
          <>
            <ContentTitle>
              Security & Limits
            </ContentTitle>
            <ContentSubtitle>
              Configure security settings, trading limits, and risk management rules
            </ContentSubtitle>
            <SecurityLimitsContent 
              aiWalletData={aiWalletData}
              isLoadingAIWallet={isLoadingAIWallet}
            />
          </>
        );
      default:
        return null;
    }
  };

  if (!account) {
    return (
      <PortfolioContainer>
        <MainContent>
          <DesktopAgentWalletsHeader account={account} />
          <div style={EMPTY_STATE_CONTAINER}>
            <div style={EMPTY_STATE_GRAPHIC}>
              <WifiOff size={48} style={{ color: '#06C755' }} />
            </div>
            <h2 style={EMPTY_STATE_TITLE}>Connect Your Wallet</h2>
            <p style={EMPTY_STATE_TEXT}>
              Connect your wallet to create and manage your Agent Wallet, API keys, and agent skills
            </p>
          </div>
        </MainContent>
      </PortfolioContainer>
    );
  }

  return (
    <PortfolioContainer>
      <MainContent>
        <DesktopAgentWalletsHeader account={account} />

        <SideTabContainer>
          <SideTabNavigation>
            {tabs.map((tab) => {
              const isDisabled = tab.id !== 'balance' && !aiWalletData?.hasWallet;
              return (
                <SideTabButton
                  key={tab.id}
                  $active={activeTab === tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  style={{
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {tab.label}
                </SideTabButton>
              );
            })}
          </SideTabNavigation>

          <SideTabContent>
            {!aiWalletData?.hasWallet && activeTab !== 'balance' ? (
              <div style={EMPTY_STATE_CONTAINER}>
                <div style={EMPTY_STATE_GRAPHIC}>
                  <Cpu size={48} style={{ color: '#06C755' }} />
                </div>
                <h2 style={EMPTY_STATE_TITLE}>Create Your AI Wallet First</h2>
                <p style={EMPTY_STATE_TEXT}>
                  Please create an AI wallet from the Balance tab to access this feature
                </p>
                <Button 
                  $variant="primary" 
                  onClick={() => setActiveTab('balance')}
                  style={{ marginTop: '24px' }}
                >
                  Go to Balance
                </Button>
              </div>
            ) : (
              renderContent()
            )}
          </SideTabContent>
        </SideTabContainer>
      </MainContent>
    </PortfolioContainer>
  );
};
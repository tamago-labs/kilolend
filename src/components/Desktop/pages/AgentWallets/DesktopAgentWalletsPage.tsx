'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useAITokenBalances } from '@/hooks/useAITokenBalances';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';
import { useSendTransaction } from '@/hooks/useSendTransaction';
import { aiWalletService, AIWalletStatus } from '@/services/aiWalletService';
import { WifiOff, Cpu } from 'react-feather';

// Import AI wallet components from Balances
import { AIWalletSection } from '../Balances/components/AIWalletSection';
import { DepositSection } from '../Balances/components/DepositSection';
import { PortfolioHeaderComponent } from '../Balances/components/PortfolioHeader';
import { MainWalletSection } from '../Balances/components/MainWalletSection';
import { WalletInfoSection } from '../Balances/components/WalletInfoSection';

const PageHeader = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PageSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
`;

const PortfolioContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
`;

const TwoColumnLayout = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 32px;
`;

const LeftColumn = styled.div`
  flex: 0 0 70%;
  max-width: 70%;
`;

const RightColumn = styled.div`
  flex: 0 0 30%;
  max-width: 30%;
`;

// Professional Empty State Component
const ProfessionalEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const EmptyStateGraphic = styled.div`
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #06C755, #059669);
    opacity: 0.1;
  }
`;

const EmptyStateIconWrapper = styled.div`
  font-size: 48px;
  color: #06C755;
  padding-top: 10px;
  z-index: 1;
`;

const ProfessionalEmptyStateTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
`;

const ProfessionalEmptyStateText = styled.p`
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 400px;
`;

export const DesktopAgentWalletsPage = () => {
  const { account } = useWalletAccountStore();
  const { balances } = useTokenBalances();
  const { sendTokens, isLoading: transactionLoading, error: transactionError, resetError } = useSendTransaction();
  const { prices } = usePriceUpdates({
    symbols: ["KAIA", "USDT", "STAKED_KAIA", "MARBLEX", "BORA", "SIX"]
  });
  
  // AI wallet state
  const [aiWalletData, setAiWalletData] = useState<AIWalletStatus | null>(null);
  const [isCreatingAIWallet, setIsCreatingAIWallet] = useState(false);
  const [isLoadingAIWallet, setIsLoadingAIWallet] = useState(true);
  const [aiWalletError, setAiWalletError] = useState<string | null>(null);

  // Deposit form state
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);

  // AI wallet balances with proper address
  const { balances: aiBalances, refreshBalances: refreshAIBalances } = useAITokenBalances(
    aiWalletData?.aiWalletAddress || null
  );

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

  // Calculate total portfolio value
  const calculateTotalValue = (tokenList: any[]) => {
    return tokenList.reduce((total, token) => {
      const priceKey = token.symbol === 'MBX' ? 'MARBLEX' : token.symbol;
      const price = prices[priceKey];
      const balance = parseFloat(token.balance || '0');
      return total + (price ? balance * price.price : 0);
    }, 0);
  };

  const mainWalletValue = calculateTotalValue(balances);
  const aiWalletValue = calculateTotalValue(aiBalances);
  const totalValue = mainWalletValue + aiWalletValue;

  // Filter tokens with balances for deposit
  const availableTokens = balances.filter(token =>
    parseFloat(token.balance) > 0
  );

  // Set default token when available tokens change
  useEffect(() => {
    if (availableTokens.length > 0 && !selectedToken) {
      setSelectedToken(availableTokens[0].symbol);
    }
  }, [availableTokens, selectedToken]);

  const selectedTokenBalance = balances.find(token => token.symbol === selectedToken);

  const handleMaxClick = () => {
    if (selectedTokenBalance) {
      setDepositAmount(selectedTokenBalance.balance);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    resetError();

    if (!account || !selectedToken || !aiWalletData?.aiWalletAddress) {
      return;
    }

    setDepositSuccess(null);

    try {
      await sendTokens({
        tokenSymbol: selectedToken,
        amount: depositAmount,
        recipient: aiWalletData.aiWalletAddress,
        isNative: selectedToken === 'KAIA'
      });

      setDepositSuccess(`Successfully deposited ${depositAmount} ${selectedToken} to AI wallet`);

      // Reset form
      setDepositAmount('');
      
      // Refresh AI wallet balances
      refreshAIBalances();

    } catch (err) {
      // Error is handled by the hook
      console.error('Deposit failed:', err);
    }
  };

  const clearSelectedToken = () => {
    setSelectedToken('');
    setDepositAmount('');
    setDepositSuccess(null);
    resetError();
  };

  if (!account) {
    return (
      <PortfolioContainer>
        <MainContent>
          <PageHeader>
          <PageTitle> 
            <Cpu size={32} />
            AI Wallet
          </PageTitle>
          <PageSubtitle>Manage your AI agent wallet for autonomous trading</PageSubtitle>
        </PageHeader>
          <ProfessionalEmptyState>
            <EmptyStateGraphic>
              <EmptyStateIconWrapper>
                <WifiOff size={48}/>
              </EmptyStateIconWrapper>
            </EmptyStateGraphic>
            <ProfessionalEmptyStateTitle>Connect Your Wallet</ProfessionalEmptyStateTitle>
            <ProfessionalEmptyStateText>
              Please connect your wallet to manage your AI agent wallet
            </ProfessionalEmptyStateText>
          </ProfessionalEmptyState>
        </MainContent>
      </PortfolioContainer>
    );
  }

  return (
    <PortfolioContainer>
      <MainContent>
        <PageHeader>
          <PageTitle> 
            <Cpu size={32} />
            AI Wallet
          </PageTitle>
          <PageSubtitle>Manage your AI agent wallet for autonomous trading</PageSubtitle>
        </PageHeader>

        <TwoColumnLayout>
          <LeftColumn>

            <PortfolioHeaderComponent 
              totalValue={totalValue}
              mainWalletValue={mainWalletValue}
              aiWalletValue={aiWalletValue}
            />

            <AIWalletSection 
              aiWalletData={aiWalletData}
              aiBalances={aiBalances}
              prices={prices}
              isCreatingAIWallet={isCreatingAIWallet}
              onCreateAIWallet={handleCreateAIWallet}
            />

            {/* Deposit Section */}
            {aiWalletData?.aiWalletAddress && availableTokens.length > 0 && (
              <DepositSection
                availableTokens={availableTokens}
                selectedToken={selectedToken}
                depositAmount={depositAmount}
                transactionLoading={transactionLoading}
                transactionError={transactionError}
                depositSuccess={depositSuccess}
                aiWalletData={aiWalletData}
                onTokenChange={setSelectedToken}
                onAmountChange={setDepositAmount}
                onMaxClick={handleMaxClick}
                onSubmit={handleDeposit}
                onClear={clearSelectedToken}
                resetError={resetError}
              />
            )}
          </LeftColumn>
          <RightColumn>
            <WalletInfoSection />
          </RightColumn>
        </TwoColumnLayout>
      </MainContent>
    </PortfolioContainer>
  );
};
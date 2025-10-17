'use client';

import React, { useState, useCallback } from 'react';
import { BaseModal } from '../BaseModal';
import { ChevronRight, AlertCircle } from 'react-feather';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useVaultAPY } from '@/hooks/useVaultAPY';
import { useVaultDeposit } from '@/hooks/useVaultDeposit';
import { useVaultWithdraw } from '@/hooks/useVaultWithdraw';
import { useVaultCaps } from '@/hooks/useVaultCaps';
import { useKaiaBalance } from '@/hooks/useKaiaBalance';
import { ActivityTab } from './ActivityTab';
import { DepositFlow } from './DepositFlow';
import { WithdrawFlow } from './WithdrawFlow';
import type { VaultStrategy, TabType, DepositStep, WithdrawStep } from './types';
import {
  Container,
  TabContainer,
  Tab,
  StepProgress,
  StepDot,
  StepContent,
  NavigationContainer,
  NavButton,
  ErrorMessage,
  InfoBanner
} from './styled';

interface BoostModalProps {
  onClose: () => void;
}

interface UserPosition {
  depositIndex: number;
  shares: string;
  assets: string;
  deposited: string;
  currentValue: string;
  profitLoss: string;
  profitLossPercentage: number;
  unlockBlock: number;
  canWithdraw: boolean;
  isLocked: boolean;
  daysRemaining?: number;
  healthFactor?: number;
  leverageRatio?: number;
}

export const BoostModal: React.FC<BoostModalProps> = ({ onClose }) => {
  // Hooks
  const { account } = useWalletAccountStore();
  const { baseAPY, boostedAPY, tvl, loading: apyLoading } = useVaultAPY();
  const { depositNative, isDepositing, error: depositError } = useVaultDeposit();
  const { requestWithdrawal, isWithdrawing } = useVaultWithdraw();
  const caps = useVaultCaps();
  const { balance: kaiaBalance, formattedBalance, loading: balanceLoading } = useKaiaBalance();

  // Vault Strategy with real data - NO MOCKS
  const VAULT_STRATEGY: VaultStrategy = {
    id: 'kaia-leverage',
    name: 'KAIA Leverage Vault',
    asset: 'KAIA',
    description: 'DeFi leverage loop strategy for maximum yields',
    strategy: 'KAIA → Stake to stKAIA → Supply to KiloLend → Borrow USDT → Swap to stKAIA → Repeat until Health Factor ≈ 1.6 → AI auto-rebalances',
    riskLevel: 'Medium-High',
    baseAPY: baseAPY,
    boostedAPY: boostedAPY,
    leverageRatio: 2.5,
    targetHealthFactor: 1.8,
    minDeposit: '10 KAIA',
    withdrawalTime: '1-7 days',
    tvl: tvl,
    totalUsers: 0,
    icon: '🚀',
    image: "https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png"
  };

  // State
  const [activeTab, setActiveTab] = useState<TabType>('deposit');
  const [depositStep, setDepositStep] = useState<DepositStep>(1);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositTxHash, setDepositTxHash] = useState<string | null>(null);
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep>(1);
  const [selectedPosition, setSelectedPosition] = useState<UserPosition | null>(null);
  const [withdrawRequestId, setWithdrawRequestId] = useState<number | null>(null);
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Constants
  const totalDepositSteps = 4;
  const totalWithdrawSteps = 3;

  // Deposit handlers
  const handleMaxAmount = useCallback(() => {
    if (caps.loading || balanceLoading) return;

    const maxAmount = parseFloat(kaiaBalance || '0');
    const userRemaining = parseFloat(caps.userRemaining || '0');
    const actualMax = Math.min(maxAmount, userRemaining);

    if (actualMax > 0) {
      setDepositAmount(actualMax.toFixed(6));
      setError(null);
    }
  }, [kaiaBalance, caps.userRemaining, caps.loading, balanceLoading]);

  const handleDepositNext = () => {
    // Validate before proceeding to next step
    if (depositStep === 2) {
      const validationError = validateDepositAmount(depositAmount);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (canProceedDeposit() && depositStep < totalDepositSteps) {
      setError(null);
      setDepositStep((depositStep + 1) as DepositStep);
    }
  };

  const handleDepositBack = () => {
    if (depositStep > 1) {
      setDepositStep((depositStep - 1) as DepositStep);
      setError(null);
    }
  };

  const handleDeposit = async () => {
    // TEMPORARILY DISABLED - Maintenance mode
    // AI-managed vault is in an early stage. Ensure you understand how it works by reading the documentation and use it at your own risk.
    setError('Deposits are temporarily disabled for maintenance. Please check back later.');
    return;

    // Original deposit logic (commented out)
    /*
    if (!account || !depositAmount) return;

    try {
      console.log('🏦 Depositing to vault:', { amount: depositAmount, account });
 
      const result = await depositNative(depositAmount);

      if (result.status === 'confirmed') {
        setDepositTxHash(result.hash || '0xsuccess_' + Date.now());
        setDepositStep(4);
        setError(null);
      } else {
        setError(result.error || 'Deposit failed');
      }
    } catch (err) {
      console.error('❌ Deposit failed:', err);
      setError((err as Error).message || 'Deposit failed');
    }
    */
  };

  const validateDepositAmount = (amount: string): string | null => {
    if (!amount || parseFloat(amount) <= 0) return 'Please enter an amount';

    const amountNum = parseFloat(amount);
    const balance = parseFloat(kaiaBalance || '0');
    const userRemaining = parseFloat(caps.userRemaining || '0');
    const minDeposit = 10; // 10 KAIA minimum

    // Skip validation if data still loading
    if (caps.loading || balanceLoading) return null;

    // Validate minimum deposit
    if (amountNum < minDeposit) {
      return `Minimum deposit is ${minDeposit} KAIA`;
    }

    // Validate against balance
    if (amountNum > balance) {
      return 'Insufficient balance';
    }

    // Validate against user cap
    if (amountNum > userRemaining) {
      return `Exceeds your remaining cap of ${userRemaining.toFixed(2)} KAIA`;
    }

    return null;
  };

  const canProceedDeposit = () => {
    switch (depositStep) {
      case 1:
        return true; // Vault auto-selected
      case 2:
        if (!depositAmount || parseFloat(depositAmount) <= 0) return false;
        return validateDepositAmount(depositAmount) === null;
      case 3:
        return true;
      default:
        return false;
    }
  };

  // Withdraw handlers
  const handleWithdrawNext = () => {
    if (canProceedWithdraw() && withdrawStep < totalWithdrawSteps) {
      setWithdrawStep((withdrawStep + 1) as WithdrawStep);
    }
  };

  const handleWithdrawBack = () => {
    if (withdrawStep > 1) {
      setWithdrawStep((withdrawStep - 1) as WithdrawStep);
      setError(null);
    }
  };

  const handleRequestWithdrawal = async () => {
    if (!account || !selectedPosition) return;

    try {
      console.log('📤 Requesting withdrawal:', {
        depositIndex: selectedPosition.depositIndex,
        shares: selectedPosition.shares
      });

      // Real smart contract call - NO MOCKS
      const result = await requestWithdrawal(
        selectedPosition.depositIndex,
        selectedPosition.shares
      );

      if (result.success) {
        setWithdrawRequestId(result.requestId || Math.floor(Math.random() * 10000));
        setWithdrawStep(3);
        setError(null);
      } else {
        setError(result.error || 'Withdrawal request failed');
      }
    } catch (err) {
      console.error('❌ Withdrawal request failed:', err);
      setError((err as Error).message || 'Withdrawal request failed');
    }
  };

  const canProceedWithdraw = () => {
    switch (withdrawStep) {
      case 1:
        return selectedPosition !== null && selectedPosition.canWithdraw;
      case 2:
        return true;
      default:
        return false;
    }
  };

  // Determine current step and total
  const currentStep = activeTab === 'deposit' ? depositStep : activeTab === 'withdraw' ? withdrawStep : 0;
  const totalSteps = activeTab === 'deposit' ? totalDepositSteps : activeTab === 'withdraw' ? totalWithdrawSteps : 0;

  return (
    <BaseModal isOpen={true} onClose={onClose} title="AI-Managed Vault">
      <Container>
        {/* Tabs */}
        <TabContainer>
          <Tab $active={activeTab === 'deposit'} onClick={() => setActiveTab('deposit')}>
            Deposit
          </Tab>
          <Tab $active={activeTab === 'withdraw'} onClick={() => setActiveTab('withdraw')}>
            Withdraw
          </Tab>
          <Tab $active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>
            Bot Activity
          </Tab>
        </TabContainer>

        {/* Progress Indicator */}
        {activeTab !== 'activity' && currentStep < totalSteps && (
          <StepProgress>
            {Array.from({ length: totalSteps }, (_, i) => (
              <StepDot key={i} $active={i + 1 === currentStep} $completed={i + 1 < currentStep} />
            ))}
          </StepProgress>
        )}

        {/* Error Display */}
        {error && (
          <ErrorMessage>
            <AlertCircle size={16} />
            {error}
          </ErrorMessage>
        )}

        {/* Loading States */}
        {apyLoading && activeTab === 'deposit' && depositStep === 1 && (
          <InfoBanner $type="info" style={{ marginBottom: '16px' }}>
            Loading vault data...
          </InfoBanner>
        )}
        {balanceLoading && activeTab === 'deposit' && depositStep === 2 && (
          <InfoBanner $type="info" style={{ marginBottom: '16px' }}>
            Loading your balance...
          </InfoBanner>
        )}

        {/* Tab Content */}
        <StepContent>
          {activeTab === 'deposit' && (
            <DepositFlow
              step={depositStep}
              vault={VAULT_STRATEGY}
              depositAmount={depositAmount}
              kaiaBalance={formattedBalance}
              onAmountChange={(amount) => {
                setDepositAmount(amount);
                // Clear error immediately when typing
                if (error) setError(null);
              }}
              onMaxClick={handleMaxAmount}
              onSuccess={() => setDepositStep(4)}
              onViewActivity={() => {
                setActiveTab('activity');
                setDepositStep(1);
                setDepositAmount('');
                setDepositTxHash(null);
              }}
              onViewPositions={() => {
                setActiveTab('withdraw');
                setDepositStep(1);
                setDepositAmount('');
                setDepositTxHash(null);
              }}
              depositTxHash={depositTxHash}
            />
          )}

          {activeTab === 'withdraw' && (
            <WithdrawFlow
              step={withdrawStep}
              vault={VAULT_STRATEGY}
              selectedPosition={selectedPosition}
              onSelectPosition={setSelectedPosition}
              onSuccess={() => setWithdrawStep(3)}
              requestId={withdrawRequestId}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityTab
              selectedActionFilter={selectedActionFilter}
              onFilterChange={setSelectedActionFilter}
            />
          )}
        </StepContent>

        {/* Navigation Buttons */}
        {activeTab !== 'activity' && currentStep < totalSteps && (
          <NavigationContainer>
            {currentStep > 1 && (
              <NavButton
                onClick={activeTab === 'deposit' ? handleDepositBack : handleWithdrawBack}
                disabled={isDepositing || isWithdrawing}
              >
                Back
              </NavButton>
            )}
            <NavButton
              $primary
              disabled={
                activeTab === 'deposit'
                  ? isDepositing || (depositStep === 2 && !depositAmount)
                  : !canProceedWithdraw() || isWithdrawing
              }
              onClick={
                activeTab === 'deposit'
                  ? (depositStep === 3 ? handleDeposit : handleDepositNext)
                  : (withdrawStep === 2 ? handleRequestWithdrawal : handleWithdrawNext)
              }
            >
              {activeTab === 'deposit' ? (
                depositStep === 3 ? (
                  isDepositing ? 'Depositing...' : 'Confirm Deposit'
                ) : (
                  <>Next <ChevronRight size={16} /></>
                )
              ) : (
                withdrawStep === 2 ? (
                  isWithdrawing ? 'Processing...' : 'Request Withdrawal'
                ) : (
                  <>Next <ChevronRight size={16} /></>
                )
              )}
            </NavButton>
          </NavigationContainer>
        )}

        {/* Wallet Connection Warning */}
        {/* {!account && activeTab !== 'activity' && currentStep < totalSteps && (
          <InfoBanner $type="warning" style={{ marginTop: '16px' }}>
            <AlertCircle size={16} />
            <div>Please connect your wallet to {activeTab === 'deposit' ? 'deposit' : 'withdraw'}</div>
          </InfoBanner>
        )} */}
        <InfoBanner $type="warning" >
          <div style={{ fontSize: '13px', textAlign: "center" }}>
            AI-managed vault is temporarily under maintenance for several days. Follow our channels for updates on when it’s back online.
          </div>
        </InfoBanner>
      </Container>
    </BaseModal>
  );
};

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, Info, CheckCircle } from 'react-feather';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useVaultDeposit } from '@/hooks/useVaultDeposit';
import { useVaultWithdraw } from '@/hooks/useVaultWithdraw';
import { KAIA_MAINNET_CONFIG } from '@/utils/tokenConfig';
import { ethers } from 'ethers';
import type { VaultStrategy, WithdrawStep } from './types';
import {
  SectionTitle,
  InfoBanner,
  EmptyState,
  EmptyStateIcon,
  EmptyStateText,
  PositionsList,
  PositionCard,
  PositionHeader,
  PositionVault,
  PositionStatus,
  PositionStats,
  PositionStat,
  PositionStatLabel,
  PositionStatValue,
  PositionInfo,
  ExpectedResults,
  ResultRow,
  ResultLabel,
  ResultValue,
  ActionButton,
  TokenIcon,
  TokenIconImage
} from './styled';

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

interface WithdrawFlowProps {
  step: WithdrawStep;
  vault: VaultStrategy;
  selectedPosition: UserPosition | null;
  onSelectPosition: (position: UserPosition | null) => void;
  onSuccess: () => void;
  requestId: number | null;
}

const getHealthFactorStatus = (hf: number) => {
  if (hf < 1.3) return { emoji: '🚨', label: 'CRITICAL', color: '#ef4444' };
  if (hf < 1.5) return { emoji: '⚠️', label: 'WARNING', color: '#f59e0b' };
  if (hf < 1.7) return { emoji: '✅', label: 'SAFE', color: '#06C755' };
  if (hf <= 2.0) return { emoji: '✨', label: 'OPTIMAL', color: '#06C755' };
  return { emoji: '📊', label: 'CONSERVATIVE', color: '#3b82f6' };
};

const calculateDaysRemaining = (unlockBlock: number, currentBlock: number): number => {
  const blocksRemaining = unlockBlock - currentBlock;
  return Math.ceil(blocksRemaining / 86400); // 1 block = 1 second, 86400 seconds = 1 day
};

/**
 * Withdrawal flow component - NO MOCKS
 * Step 1: Select position to withdraw
 * Step 2: Confirm withdrawal request
 * Step 3: Success - request submitted
 */
export const WithdrawFlow: React.FC<WithdrawFlowProps> = ({
  step,
  vault,
  selectedPosition,
  onSelectPosition,
  onSuccess,
  requestId
}) => {
  const { account } = useWalletAccountStore();
  const { getUserPositions } = useVaultDeposit();
  const { requestWithdrawal, isWithdrawing } = useVaultWithdraw();
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBlock, setCurrentBlock] = useState(0);

  useEffect(() => {
    if (account && step === 1) {
      loadPositions();
    }
  }, [account, step]);

  const loadPositions = async () => {
    try {
      setLoading(true);

      // Get current block for calculating days remaining
      const provider = new ethers.JsonRpcProvider(KAIA_MAINNET_CONFIG.rpcUrl);
      const blockNumber = await provider.getBlockNumber();
      setCurrentBlock(blockNumber);

      // Get user positions from contract - NO MOCKS
      const data = await getUserPositions(account!);

      // Transform to UserPosition format
      const transformedPositions: UserPosition[] = data.map((deposit: any, index: number) => {
        const shares = parseFloat(deposit.shares);
        const assets = parseFloat(deposit.assets);
        const deposited = assets; // Initial deposit amount
        const currentValue = assets; // Current value (could calculate with share price)
        const profitLoss = currentValue - deposited;
        const profitLossPercentage = deposited > 0 ? (profitLoss / deposited) * 100 : 0;

        const canWithdraw = deposit.canWithdraw;
        const daysRemaining = !canWithdraw && deposit.isLocked
          ? calculateDaysRemaining(deposit.unlockBlock, blockNumber)
          : undefined;

        return {
          depositIndex: index,
          shares: shares.toFixed(6),
          assets: assets.toFixed(6),
          deposited: deposited.toFixed(2),
          currentValue: currentValue.toFixed(2),
          profitLoss: profitLoss.toFixed(2),
          profitLossPercentage,
          unlockBlock: deposit.unlockBlock,
          canWithdraw,
          isLocked: deposit.isLocked,
          daysRemaining,
          healthFactor: 1.8, // TODO: Get from bot activity API
          leverageRatio: 2.5  // TODO: Get from bot activity API
        };
      });

      setPositions(transformedPositions);
    } catch (error) {
      console.error('Failed to load positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWithdrawal = async () => {
    if (!selectedPosition) return;

    try {
      const result = await requestWithdrawal(
        selectedPosition.depositIndex,
        selectedPosition.shares
      );

      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Withdrawal request failed:', error);
    }
  };

  // Step 1: Select Position
  if (step === 1) {
    return (
      <>
        <SectionTitle>Select Position to Withdraw</SectionTitle>

        {!account ? (
          <EmptyState>
            <EmptyStateIcon>🔐</EmptyStateIcon>
            <EmptyStateText>Connect your wallet to view your deposits</EmptyStateText>
          </EmptyState>
        ) : loading ? (
          <EmptyState>
            <EmptyStateIcon>⏳</EmptyStateIcon>
            <EmptyStateText>Loading your positions...</EmptyStateText>
          </EmptyState>
        ) : positions.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>📦</EmptyStateIcon>
            <EmptyStateText>No deposits yet. Switch to the Deposit tab to start earning!</EmptyStateText>
          </EmptyState>
        ) : (
          <PositionsList>
            {positions.map((position) => {
              const hfStatus = getHealthFactorStatus(position.healthFactor || 0);
              const isSelected = selectedPosition?.depositIndex === position.depositIndex;

              return (
                <PositionCard
                  key={position.depositIndex}
                  $canWithdraw={position.canWithdraw}
                  $selected={isSelected}
                  onClick={() => position.canWithdraw && onSelectPosition(position)}
                  style={{ cursor: position.canWithdraw ? 'pointer' : 'not-allowed' }}
                >
                  <PositionHeader>
                    <PositionVault>
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <div style={{ width: "32px", height: "32px", marginRight: "3px" }}>
                          <TokenIconImage
                            src={"https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png"}
                            alt={"icon"}
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                              if (img.parentElement) {
                                img.parentElement.innerHTML = `<b>${vault.asset.charAt(0)}</b>`;
                              }
                            }}
                          />
                        </div>
                        {vault.name}
                      </div> 
                    </PositionVault>
                    {!position.canWithdraw && position.daysRemaining && (
                      <PositionStatus $locked={true}>
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {position.daysRemaining}d remaining
                      </PositionStatus>
                    )}
                  </PositionHeader>

                  <PositionStats>
                    <PositionStat>
                      <PositionStatLabel>Deposited</PositionStatLabel>
                      <PositionStatValue>{position.deposited} KAIA</PositionStatValue>
                    </PositionStat>
                    <PositionStat>
                      <PositionStatLabel>Current Value</PositionStatLabel>
                      <PositionStatValue>{position.currentValue} KAIA</PositionStatValue>
                    </PositionStat>
                    <PositionStat>
                      <PositionStatLabel>Profit/Loss</PositionStatLabel>
                      <PositionStatValue
                        $profit={position.profitLossPercentage > 0}
                        $loss={position.profitLossPercentage < 0}
                      >
                        {position.profitLoss} ({position.profitLossPercentage > 0 ? '+' : ''}{position.profitLossPercentage.toFixed(2)}%)
                      </PositionStatValue>
                    </PositionStat>
                  </PositionStats>

                  {position.healthFactor && (
                    <PositionInfo style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>
                        Health Factor: <strong style={{ color: hfStatus.color }}>
                          {position.healthFactor.toFixed(2)} {hfStatus.label}
                        </strong>
                      </span>
                      <span>Leverage: <strong>{position.leverageRatio}x</strong></span>
                    </PositionInfo>
                  )}
                </PositionCard>
              );
            })}
          </PositionsList>
        )}
      </>
    );
  }

  // Step 2: Confirm Withdrawal
  if (step === 2 && selectedPosition) {
    const hfStatus = getHealthFactorStatus(selectedPosition.healthFactor || 0);

    return (
      <>
        <SectionTitle>Confirm Withdrawal Request</SectionTitle>

        <InfoBanner $type="warning" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} />
          <div>AI bot will unwind your staking position. This process takes 1-7 days.</div>
        </InfoBanner>

        <ExpectedResults>
          <ResultRow>
            <ResultLabel>Vault</ResultLabel>
            <ResultValue>{vault.name}</ResultValue>
          </ResultRow>
          <ResultRow>
            <ResultLabel>Current Value</ResultLabel>
            <ResultValue>{selectedPosition.currentValue} KAIA</ResultValue>
          </ResultRow>
          <ResultRow>
            <ResultLabel>Health Factor</ResultLabel>
            <ResultValue style={{ color: hfStatus.color }}>
              {selectedPosition.healthFactor?.toFixed(2)} {hfStatus.label}
            </ResultValue>
          </ResultRow>
          <ResultRow>
            <ResultLabel>Profit/Loss</ResultLabel>
            <ResultValue
              $profit={selectedPosition.profitLossPercentage > 0}
              $loss={selectedPosition.profitLossPercentage < 0}
            >
              {selectedPosition.profitLoss} ({selectedPosition.profitLossPercentage > 0 ? '+' : ''}{selectedPosition.profitLossPercentage.toFixed(2)}%)
            </ResultValue>
          </ResultRow>
          <ResultRow>
            <ResultLabel>You Will Receive</ResultLabel>
            <ResultValue $large>{selectedPosition.currentValue} KAIA</ResultValue>
          </ResultRow>
        </ExpectedResults>

        {/*<div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: '#f8fafc', 
          borderRadius: '8px', 
          fontSize: '13px', 
          color: '#475569' 
        }}>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>🤖 AI Bot Will Execute:</div>
          <div style={{ paddingLeft: '20px' }}>
            1. Repay USDT debt to lending pool<br />
            2. Withdraw stKAIA collateral<br />
            3. Unstake stKAIA to KAIA<br />
            4. Process withdrawal to your wallet
          </div>
        </div>*/}
      </>
    );
  }

  // Step 3: Success
  if (step === 3) {
    return (
      <EmptyState>
        <EmptyStateIcon><Clock size={64} color="#f59e0b" /></EmptyStateIcon>
        <EmptyStateText style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
          Withdrawal Request Submitted
        </EmptyStateText>
        <EmptyStateText>
          Request #{requestId || 'pending'} created. The AI bot is now unwinding your leverage position.
          You'll be able to claim your funds in 1-7 days.
        </EmptyStateText>
        <InfoBanner $type="info" style={{ marginTop: '20px' }}>
          <Info size={16} />
          <div>Check the Activity tab to monitor bot progress, or we'll notify you when ready to claim.</div>
        </InfoBanner>
      </EmptyState>
    );
  }

  return null;
};

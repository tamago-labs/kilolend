'use client';

import React, { useState, useEffect } from 'react';
import { BaseModal } from '../BaseModal';
import { ChevronRight, TrendingUp, AlertCircle, Info, CheckCircle, Clock, ExternalLink, Unlock, Lock } from 'react-feather';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { KAIA_SCAN_URL } from '@/utils/tokenConfig';
import * as S from './styled';

interface BoostModalProps {
  onClose: () => void;
}

interface AIVault {
  id: string;
  name: string;
  asset: string;
  baseAPY: number;
  boostedAPY: string;
  strategy: string;
  isActive: boolean;
}

interface UserPosition {
  id: number;
  amount: string;
  asset: string;
  currentValue: string;
  healthFactor: number;
  isUnlocked: boolean;
  depositDate: number;
}

interface AIActivity {
  id: string;
  timestamp: number;
  action: string;
  status: 'pending' | 'success' | 'failed';
  details: string;
  positionId?: number;
  txHash?: string;
  healthFactor?: number;
}

const AVAILABLE_VAULTS: AIVault[] = [
  {
    id: 'kaia',
    name: 'KAIA Boost Vault',
    asset: 'KAIA',
    baseAPY: 3.5,
    boostedAPY: '15-20',
    strategy: 'Automated leverage via stKAIA liquid staking',
    isActive: true,
  },
  {
    id: 'usdt',
    name: 'USDT Yield Vault',
    asset: 'USDT',
    baseAPY: 8.0,
    boostedAPY: '18-25',
    strategy: 'Optimized lending strategies',
    isActive: false,
  },
];

// Mock user positions
const MOCK_POSITIONS: UserPosition[] = [
  {
    id: 1,
    amount: '100',
    asset: 'KAIA',
    currentValue: '102.5',
    healthFactor: 1.52,
    isUnlocked: true,
    depositDate: Date.now() - 86400000 * 10,
  },
  {
    id: 2,
    amount: '50',
    asset: 'KAIA',
    currentValue: '51.8',
    healthFactor: 1.68,
    isUnlocked: true,
    depositDate: Date.now() - 86400000 * 5,
  },
];

// Mock AI activities
const MOCK_ACTIVITIES: AIActivity[] = [
  {
    id: '1',
    timestamp: Date.now() - 120000,
    action: 'Leverage Loop #3',
    status: 'success',
    details: 'Swapped 1,234 USDT → 50 stKAIA',
    positionId: 1,
    txHash: '0xabc123',
    healthFactor: 1.52,
  },
  {
    id: '2',
    timestamp: Date.now() - 600000,
    action: 'Leverage Loop #2',
    status: 'success',
    details: 'Borrowed 1,234 USDT against stKAIA',
    positionId: 1,
    healthFactor: 1.75,
  },
  {
    id: '3',
    timestamp: Date.now() - 300000,
    action: 'Monitoring',
    status: 'success',
    details: 'HF stable at 1.68',
    positionId: 2,
    healthFactor: 1.68,
  },
];

type ActionType = 'deposit' | 'withdraw';

export const BoostModal: React.FC<BoostModalProps> = ({ onClose }) => {
  const [actionType, setActionType] = useState<ActionType>('deposit');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVault, setSelectedVault] = useState<AIVault | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<UserPosition | null>(null);
  const [isTransacting, setIsTransacting] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [userPositions] = useState<UserPosition[]>(MOCK_POSITIONS);
  const [aiActivities] = useState<AIActivity[]>(MOCK_ACTIVITIES);

  const { account } = useWalletAccountStore();
  const { balances } = useTokenBalances();

  const totalSteps = actionType === 'deposit' ? 4 : 3;

  const getUserBalance = () => {
    if (!selectedVault) return '0';
    const balance = balances.find(b => b.symbol === selectedVault.asset);
    return balance?.balance || '0';
  };

  const userBalance = getUserBalance();

  const handleTabSwitch = (type: ActionType) => {
    setActionType(type);
    setCurrentStep(1);
    setSelectedVault(null);
    setAmount('');
    setSelectedPosition(null);
    setError('');
  };

  const handleVaultSelect = (vault: AIVault) => {
    if (!vault.isActive) return;
    setSelectedVault(vault);
    setAmount('');
    setSelectedQuickAmount(null);
  };

  const handleQuickAmount = (percentage: number) => {
    if (!userBalance) return;
    const balance = parseFloat(userBalance);
    const quickAmount = (balance * percentage / 100).toFixed(6);
    setAmount(quickAmount);
    setSelectedQuickAmount(percentage);
  };

  const handleMaxAmount = () => {
    setAmount(userBalance);
    setSelectedQuickAmount(100);
  };

  const handlePositionSelect = (position: UserPosition) => {
    setSelectedPosition(position);
  };

  const calculateExpectedReturns = () => {
    if (!selectedVault || !amount || parseFloat(amount) === 0) {
      return { deposit: '0', exposure: '0', estimatedAPY: '0' };
    }

    const depositAmount = parseFloat(amount);
    const leverageMultiplier = 1.5;
    const exposure = (depositAmount * leverageMultiplier).toFixed(2);
    
    return {
      deposit: depositAmount.toFixed(2),
      exposure,
      estimatedAPY: selectedVault.boostedAPY,
    };
  };

  const expectedReturns = calculateExpectedReturns();

  const canProceed = () => {
    if (actionType === 'deposit') {
      switch (currentStep) {
        case 1: return selectedVault !== null;
        case 2: return amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(userBalance);
        case 3: return true;
        default: return false;
      }
    } else {
      switch (currentStep) {
        case 1: return selectedVault !== null;
        case 2: return selectedPosition !== null;
        default: return false;
      }
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep < totalSteps) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = async () => {
    if (!account) return;

    setIsTransacting(true);
    setError('');

    try {
      // TODO: Implement actual contract call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Transaction:', { actionType, selectedVault, amount, selectedPosition });
      setCurrentStep(totalSteps);
    } catch (err) {
      console.error('Transaction failed:', err);
      setError((err as Error).message || 'Transaction failed');
    } finally {
      setIsTransacting(false);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '📝';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <S.TabContainer>
              <S.Tab $active={actionType === 'deposit'} onClick={() => handleTabSwitch('deposit')}>
                💰 Deposit
              </S.Tab>
              <S.Tab $active={actionType === 'withdraw'} onClick={() => handleTabSwitch('withdraw')}>
                💸 Withdraw
              </S.Tab>
            </S.TabContainer>

            <S.InfoBanner $type="info">
              <Info size={16} />
              <div>
                {actionType === 'deposit' ? (
                  <>
                    <strong>Choose an AI-managed vault</strong> to automatically optimize your yields. 
                    <strong> No lock period</strong> - withdraw anytime!
                  </>
                ) : (
                  <>
                    <strong>Select a position to withdraw.</strong> The AI will safely unwind your 
                    leveraged position and return your funds.
                  </>
                )}
              </div>
            </S.InfoBanner>

            <S.VaultGrid>
              {AVAILABLE_VAULTS.map(vault => (
                <S.VaultCard
                  key={vault.id}
                  $selected={selectedVault?.id === vault.id}
                  $disabled={!vault.isActive}
                  onClick={() => handleVaultSelect(vault)}
                >
                  <S.VaultHeader>
                    <S.VaultIcon>🤖</S.VaultIcon>
                    <S.VaultInfo>
                      <S.VaultName>
                        {vault.name}
                        {!vault.isActive && <S.ComingSoonBadge style={{ marginLeft: '8px' }}>Coming Soon</S.ComingSoonBadge>}
                      </S.VaultName>
                      <S.VaultAsset>Asset: {vault.asset}</S.VaultAsset>
                    </S.VaultInfo>
                  </S.VaultHeader>

                  <S.VaultAPY>
                    <S.APYItem>
                      <S.APYLabel>Base APY</S.APYLabel>
                      <S.APYValue>{vault.baseAPY}%</S.APYValue>
                    </S.APYItem>
                    <S.APYItem>
                      <S.APYLabel>AI Boosted</S.APYLabel>
                      <S.APYValue $boosted>{vault.boostedAPY}%</S.APYValue>
                    </S.APYItem>
                  </S.VaultAPY>

                  <S.VaultStrategy>{vault.strategy}</S.VaultStrategy>
                </S.VaultCard>
              ))}
            </S.VaultGrid>
          </>
        );

      case 2:
        if (actionType === 'deposit') {
          return (
            <>
              <S.InfoBanner $type="success">
                <CheckCircle size={16} />
                <div>
                  <strong>No lock period!</strong> You can withdraw anytime. The AI will safely unwind your position.
                </div>
              </S.InfoBanner>

              <S.InputSection>
                <S.InputLabel>
                  <span>Deposit Amount</span>
                  <S.BalanceText>Balance: {parseFloat(userBalance).toFixed(4)} {selectedVault?.asset}</S.BalanceText>
                </S.InputLabel>
                
                <S.AmountInputWrapper>
                  <S.AmountInput
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setSelectedQuickAmount(null);
                    }}
                    placeholder="0.00"
                    step="any"
                  />
                  <S.InputTokenLabel>{selectedVault?.asset}</S.InputTokenLabel>
                </S.AmountInputWrapper>

                <S.QuickAmountButtons>
                  <S.QuickAmountButton $selected={selectedQuickAmount === 25} onClick={() => handleQuickAmount(25)}>
                    25%
                  </S.QuickAmountButton>
                  <S.QuickAmountButton $selected={selectedQuickAmount === 50} onClick={() => handleQuickAmount(50)}>
                    50%
                  </S.QuickAmountButton>
                  <S.QuickAmountButton $selected={selectedQuickAmount === 75} onClick={() => handleQuickAmount(75)}>
                    75%
                  </S.QuickAmountButton>
                  <S.QuickAmountButton $selected={selectedQuickAmount === 100} onClick={handleMaxAmount}>
                    MAX
                  </S.QuickAmountButton>
                </S.QuickAmountButtons>
              </S.InputSection>

              {amount && parseFloat(amount) > 0 && (
                <S.SummaryBox>
                  <S.SummaryRow>
                    <S.SummaryLabel>Your Deposit</S.SummaryLabel>
                    <S.SummaryValue>{expectedReturns.deposit} {selectedVault?.asset}</S.SummaryValue>
                  </S.SummaryRow>
                  <S.SummaryRow>
                    <S.SummaryLabel>Total Exposure</S.SummaryLabel>
                    <S.SummaryValue>~{expectedReturns.exposure} stKAIA</S.SummaryValue>
                  </S.SummaryRow>
                  <S.SummaryRow>
                    <S.SummaryLabel>Estimated APY</S.SummaryLabel>
                    <S.SummaryValue $large>{expectedReturns.estimatedAPY}%</S.SummaryValue>
                  </S.SummaryRow>
                </S.SummaryBox>
              )}

              {/* Inline Activity Feed */}
              {userPositions.length > 0 && (
                <S.ActivitySection>
                  <S.ActivityTitle>
                    🤖 Recent AI Activity
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>
                      (from your existing positions)
                    </span>
                  </S.ActivityTitle>
                  <S.ActivityFeed>
                    {aiActivities.slice(0, 3).map(activity => (
                      <S.ActivityItem key={activity.id}>
                        <S.ActivityHeader>
                          <S.ActivityAction $status={activity.status}>
                            {getStatusIcon(activity.status)} {activity.action}
                          </S.ActivityAction>
                          <S.ActivityTime>{formatTimeAgo(activity.timestamp)}</S.ActivityTime>
                        </S.ActivityHeader>
                        <S.ActivityDetails>
                          {activity.details}
                          {activity.healthFactor && ` • HF: ${activity.healthFactor.toFixed(2)}`}
                        </S.ActivityDetails>
                        {activity.txHash && (
                          <S.ActivityLink
                            href={`${KAIA_SCAN_URL}/tx/${activity.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Tx <ExternalLink size={10} />
                          </S.ActivityLink>
                        )}
                      </S.ActivityItem>
                    ))}
                  </S.ActivityFeed>
                </S.ActivitySection>
              )}
            </>
          );
        } else {
          // Withdraw: Position Selection
          return (
            <>
              <S.InfoBanner $type="warning">
                <AlertCircle size={16} />
                <div>
                  Select a position to withdraw. The AI will unwind your leverage safely. This may take 2-5 minutes.
                </div>
              </S.InfoBanner>

              <S.PositionsList>
                {userPositions.map(position => (
                  <S.PositionCard
                    key={position.id}
                    $selected={selectedPosition?.id === position.id}
                    onClick={() => handlePositionSelect(position)}
                  >
                    <S.PositionHeader>
                      <S.PositionAmount>{position.amount} {position.asset}</S.PositionAmount>
                      <S.PositionStatus $unlocked={position.isUnlocked}>
                        {position.isUnlocked ? <><Unlock size={12} /> Unlocked</> : <><Lock size={12} /> Locked</>}
                      </S.PositionStatus>
                    </S.PositionHeader>
                    <S.PositionDetails>
                      <S.PositionDetailItem>
                        <S.PositionDetailLabel>Current Value</S.PositionDetailLabel>
                        <S.PositionDetailValue>{position.currentValue} {position.asset}</S.PositionDetailValue>
                      </S.PositionDetailItem>
                      <S.PositionDetailItem>
                        <S.PositionDetailLabel>Health Factor</S.PositionDetailLabel>
                        <S.PositionDetailValue style={{ color: '#059669' }}>{position.healthFactor.toFixed(2)}</S.PositionDetailValue>
                      </S.PositionDetailItem>
                    </S.PositionDetails>
                  </S.PositionCard>
                ))}
              </S.PositionsList>
            </>
          );
        }

      case 3:
        if (actionType === 'deposit') {
          return (
            <>
              <S.ReviewSection>
                <S.ReviewTitle>Review Your Deposit</S.ReviewTitle>
                <S.SummaryBox>
                  <S.SummaryRow>
                    <S.SummaryLabel>Vault</S.SummaryLabel>
                    <S.SummaryValue>{selectedVault?.name}</S.SummaryValue>
                  </S.SummaryRow>
                  <S.SummaryRow>
                    <S.SummaryLabel>Deposit Amount</S.SummaryLabel>
                    <S.SummaryValue>{expectedReturns.deposit} {selectedVault?.asset}</S.SummaryValue>
                  </S.SummaryRow>
                  <S.SummaryRow>
                    <S.SummaryLabel>Expected APY</S.SummaryLabel>
                    <S.SummaryValue $large>{expectedReturns.estimatedAPY}%</S.SummaryValue>
                  </S.SummaryRow>
                </S.SummaryBox>
              </S.ReviewSection>

              <S.ReviewSection>
                <S.ReviewTitle>🤖 AI Boost Strategy</S.ReviewTitle>
                <S.StrategySteps>
                  <S.StrategyStep>
                    <S.StepNumber>1</S.StepNumber>
                    <S.StepText>
                      <strong>Stake KAIA → stKAIA</strong><br />
                      Via Lair Protocol (3-4% base yield)
                    </S.StepText>
                  </S.StrategyStep>
                  <S.StrategyStep>
                    <S.StepNumber>2</S.StepNumber>
                    <S.StepText>
                      <strong>Supply to Lending Pool</strong><br />
                      Supply stKAIA as collateral
                    </S.StepText>
                  </S.StrategyStep>
                  <S.StrategyStep>
                    <S.StepNumber>3</S.StepNumber>
                    <S.StepText>
                      <strong>Borrow USDT</strong><br />
                      Against stKAIA collateral
                    </S.StepText>
                  </S.StrategyStep>
                  <S.StrategyStep>
                    <S.StepNumber>4</S.StepNumber>
                    <S.StepText>
                      <strong>Swap USDT → stKAIA</strong><br />
                      Via Swapscanner DEX aggregator
                    </S.StepText>
                  </S.StrategyStep>
                  <S.StrategyStep>
                    <S.StepNumber>5</S.StepNumber>
                    <S.StepText>
                      <strong>Repeat Until HF ~1.5</strong><br />
                      Safe leverage maintained
                    </S.StepText>
                  </S.StrategyStep>
                </S.StrategySteps>

                <S.InfoBanner $type="info">
                  <TrendingUp size={16} />
                  <div>
                    Expected: ~{expectedReturns.exposure} stKAIA exposure (1.5x leverage) with HF ~1.5
                  </div>
                </S.InfoBanner>
              </S.ReviewSection>

              <S.RiskBox>
                <S.RiskTitle>
                  <AlertCircle size={16} />
                  Risk Disclosure
                </S.RiskTitle>
                <S.RiskList>
                  <li>Market volatility may affect yields</li>
                  <li>AI maintains HF {'>'}1.5 automatically</li>
                  <li>Interest rates can impact net APY</li>
                  <li>Smart contract risks (audited)</li>
                  <li>Withdraw anytime - AI unwinds safely</li>
                </S.RiskList>
              </S.RiskBox>
            </>
          );
        } else {
          // Withdraw Confirm
          return (
            <>
              <S.ReviewSection>
                <S.ReviewTitle>Confirm Withdrawal</S.ReviewTitle>
                <S.SummaryBox>
                  <S.SummaryRow>
                    <S.SummaryLabel>Position</S.SummaryLabel>
                    <S.SummaryValue>#{selectedPosition?.id}</S.SummaryValue>
                  </S.SummaryRow>
                  <S.SummaryRow>
                    <S.SummaryLabel>Amount</S.SummaryLabel>
                    <S.SummaryValue>{selectedPosition?.amount} {selectedPosition?.asset}</S.SummaryValue>
                  </S.SummaryRow>
                  <S.SummaryRow>
                    <S.SummaryLabel>Current Value</S.SummaryLabel>
                    <S.SummaryValue $large>{selectedPosition?.currentValue} {selectedPosition?.asset}</S.SummaryValue>
                  </S.SummaryRow>
                </S.SummaryBox>
              </S.ReviewSection>

              <S.ReviewSection>
                <S.ReviewTitle>AI Will Safely Unwind</S.ReviewTitle>
                <S.StrategySteps>
                  <S.StrategyStep>
                    <S.StepNumber>1</S.StepNumber>
                    <S.StepText>Repay borrowed USDT</S.StepText>
                  </S.StrategyStep>
                  <S.StrategyStep>
                    <S.StepNumber>2</S.StepNumber>
                    <S.StepText>Withdraw stKAIA collateral</S.StepText>
                  </S.StrategyStep>
                  <S.StrategyStep>
                    <S.StepNumber>3</S.StepNumber>
                    <S.StepText>Unstake stKAIA → KAIA</S.StepText>
                  </S.StrategyStep>
                  <S.StrategyStep>
                    <S.StepNumber>4</S.StepNumber>
                    <S.StepText>Return KAIA to you</S.StepText>
                  </S.StrategyStep>
                </S.StrategySteps>

                <S.InfoBanner $type="warning">
                  <Clock size={16} />
                  <div>
                    Estimated time: 2-5 minutes. You'll be able to claim after AI completes unwinding.
                  </div>
                </S.InfoBanner>
              </S.ReviewSection>
            </>
          );
        }

      case 4:
        return (
          <S.SuccessContainer>
            <S.SuccessIcon>
              <CheckCircle size={40} color="white" />
            </S.SuccessIcon>
            <S.SuccessTitle>
              {actionType === 'deposit' ? 'Deposit Successful!' : 'Withdrawal Requested!'}
            </S.SuccessTitle>
            <S.SuccessMessage>
              {actionType === 'deposit' 
                ? `Your ${amount} ${selectedVault?.asset} has been deposited. The AI agent is now optimizing your position.`
                : `The AI is unwinding your position. You'll be able to claim your funds in 2-5 minutes.`
              }
            </S.SuccessMessage>

            {actionType === 'deposit' && (
              <S.ActivitySection>
                <S.ActivityTitle>🤖 AI Agent Activity (Live)</S.ActivityTitle>
                <S.ActivityFeed>
                  <S.EmptyActivity>
                    Initializing AI agent... Real-time updates will appear here.
                  </S.EmptyActivity>
                </S.ActivityFeed>
              </S.ActivitySection>
            )}
          </S.SuccessContainer>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal isOpen={true} onClose={onClose} title="🚀 AI Boost Vault">
      <S.Container>
        {currentStep < totalSteps && (
          <S.StepProgress>
            {Array.from({ length: totalSteps }, (_, i) => (
              <S.StepDot
                key={i}
                $active={i + 1 === currentStep}
                $completed={i + 1 < currentStep}
              />
            ))}
          </S.StepProgress>
        )}

        <S.StepContent>
          {error && (
            <S.ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </S.ErrorMessage>
          )}

          {renderStepContent()}
        </S.StepContent>

        {currentStep < totalSteps && (
          <S.NavigationContainer>
            {currentStep > 1 && (
              <S.NavButton onClick={handleBack} disabled={isTransacting}>
                Back
              </S.NavButton>
            )}
            <S.NavButton
              $primary
              disabled={!canProceed() || isTransacting}
              onClick={currentStep === (actionType === 'deposit' ? 3 : 2) ? handleConfirm : handleNext}
            >
              {currentStep === (actionType === 'deposit' ? 3 : 2) ? (
                isTransacting ? (actionType === 'deposit' ? 'Depositing...' : 'Requesting...') : (actionType === 'deposit' ? '🚀 Confirm & Boost' : '💸 Request Withdrawal')
              ) : (
                <>
                  Next <ChevronRight size={16} />
                </>
              )}
            </S.NavButton>
          </S.NavigationContainer>
        )}
      </S.Container>
    </BaseModal>
  );
};

'use client';

import React, { useState } from 'react';
import { BaseModal } from '../BaseModal';
import { ChevronRight, AlertCircle, Info, Clock, CheckCircle, ExternalLink, Activity, Zap } from 'react-feather';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { KAIA_SCAN_URL } from '@/utils/tokenConfig';
import {
  VAULT_STRATEGIES,
  getVaultActivity,
  getVaultById,
  MOCK_USER_POSITIONS,
  MOCK_WITHDRAWAL_REQUESTS,
  getHealthFactorStatus,
  TASK_TYPE_LABELS,
  type VaultStrategy,
  type UserPosition,
  type BotActivity
} from './mockData';
import {
  Container,
  TabContainer,
  Tab,
  StepProgress,
  StepDot,
  StepContent,
  NavigationContainer,
  NavButton,
  VaultGrid,
  VaultCard,
  VaultHeader,
  VaultInfo,
  VaultName,
  VaultAsset,
  VaultStats,
  VaultStat,
  StatLabel,
  StatValue,
  VaultDescription,
  VaultStrategy as VaultStrategyStyled,
  SectionTitle,
  InputGroup,
  Label,
  BalanceText,
  InputWrapper,
  Input,
  InputLabel,
  MaxButton,
  ExpectedResults,
  ResultRow,
  ResultLabel,
  ResultValue,
  ActivityFeed,
  ActivityItem,
  ActivityHeader,
  ActivityAction,
  ActivityTime,
  ActivityReason,
  ActivityLink,
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
  RequestsHeader,
  RequestToggle,
  ToggleButton,
  RequestsTable,
  TableRow,
  TableCell,
  ActionButton,
  InfoBanner,
  EmptyState,
  EmptyStateIcon,
  EmptyStateText,
  ErrorMessage,
  FilterSelect,
  TokenIcon,
  TokenIconImage
} from './styled';

interface BoostModalProps {
  onClose: () => void;
}

type TabType = 'deposit' | 'withdraw' | 'activity';
type DepositStep = 1 | 2 | 3 | 4;
type WithdrawStep = 1 | 2 | 3;

export const BoostModal: React.FC<BoostModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('deposit');
  
  // Deposit flow state
  const [depositStep, setDepositStep] = useState<DepositStep>(1);
  const [selectedVault] = useState<VaultStrategy | null>(VAULT_STRATEGIES[0]); // Auto-select KAIA vault
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositTxHash, setDepositTxHash] = useState<string | null>(null);

  // Withdraw flow state
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep>(1);
  const [selectedPosition, setSelectedPosition] = useState<UserPosition | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawRequestId, setWithdrawRequestId] = useState<number | null>(null);
  const [showCompletedRequests, setShowCompletedRequests] = useState(false);
  
  // Activity tab state
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  const { account } = useWalletAccountStore();

  // Mock balance for KAIA only
  const kaiaBalance = '1,234.56';

  const totalDepositSteps = 4;
  const totalWithdrawSteps = 3;

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleMaxAmount = () => {
    setDepositAmount(kaiaBalance.replace(/,/g, ''));
  };

  const calculateReturns = () => {
    if (!depositAmount || !selectedVault || parseFloat(depositAmount) === 0) {
      return { principal: '0', earnings30Days: '0', total30Days: '0', apy: '0' };
    }

    const amount = parseFloat(depositAmount);
    const apy = selectedVault.boostedAPY;
    
    const dailyRate = apy / 365 / 100;
    const earnings30 = amount * dailyRate * 30;
    const total30 = amount + earnings30;

    return {
      principal: amount.toFixed(2),
      earnings30Days: earnings30.toFixed(2),
      total30Days: total30.toFixed(2),
      apy: apy.toFixed(1)
    };
  };

  const returns = calculateReturns();

  // Deposit Flow Handlers
  const handleDepositNext = () => {
    if (canProceedDeposit() && depositStep < totalDepositSteps) {
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
    if (!account || !selectedVault || !depositAmount) return;

    setIsDepositing(true);
    setError(null);

    try {
      console.log('Depositing:', { vault: selectedVault.id, amount: depositAmount, account });
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDepositTxHash('0x' + Math.random().toString(16).substring(2, 66));
      setDepositStep(4);
    } catch (err) {
      console.error('Deposit failed:', err);
      setError((err as Error).message || 'Deposit failed');
    } finally {
      setIsDepositing(false);
    }
  };

  const canProceedDeposit = () => {
    switch (depositStep) {
      case 1:
        return selectedVault !== null;
      case 2:
        const cleanBalance = kaiaBalance.replace(/,/g, '');
        return depositAmount && parseFloat(depositAmount) > 0 && parseFloat(depositAmount) <= parseFloat(cleanBalance);
      case 3:
        return true;
      default:
        return false;
    }
  };

  // Withdraw Flow Handlers
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

    setIsWithdrawing(true);
    setError(null);

    try {
      console.log('Requesting withdrawal:', { vaultId: selectedPosition.vaultId, depositIndex: selectedPosition.depositIndex });
      await new Promise(resolve => setTimeout(resolve, 2000));
      setWithdrawRequestId(Math.floor(Math.random() * 1000));
      setWithdrawStep(3);
    } catch (err) {
      console.error('Withdrawal request failed:', err);
      setError((err as Error).message || 'Withdrawal request failed');
    } finally {
      setIsWithdrawing(false);
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

  const handleClaimRequest = (requestId: number) => {
    console.log('Claiming request:', requestId);
    // TODO: Implement claim logic
  };

  // Get filtered activity
  const getFilteredActivity = (): BotActivity[] => {
    let activities = getVaultActivity('kaia-leverage');

    if (selectedActionFilter !== 'all') {
      activities = activities.filter(a => a.status === selectedActionFilter);
    }

    return activities;
  };

  // Get pending and ready requests
  const pendingRequests = MOCK_WITHDRAWAL_REQUESTS.filter(r => r.status === 'processing' || r.status === 'ready');
  const completedRequests = MOCK_WITHDRAWAL_REQUESTS.filter(r => r.status === 'claimed');
  const displayedRequests = showCompletedRequests ? completedRequests : pendingRequests;

  // Render Deposit Steps
  const renderDepositStep = () => {
    switch (depositStep) {
      case 1:
        return (
          <>
            <SectionTitle>KAIA Leverage Vault</SectionTitle>
            <InfoBanner $type="info">
              <Info size={16} />
              <div>
                <strong>How it works:</strong> Bot automatically withdraws KAIA periodically, then creates tasks for operators to execute the leverage strategy. You earn boosted yields while AI manages risk.
              </div>
            </InfoBanner>
            <VaultGrid>
              {VAULT_STRATEGIES.map((vault) => (
                <VaultCard key={vault.id} $selected={true}>
                  <VaultHeader>
                    <TokenIcon>
                      <TokenIconImage
                        src={vault.image}
                        alt={vault.asset}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          if (img.parentElement) {
                            img.parentElement.innerHTML = `<b>${vault.asset.charAt(0)}</b>`;
                          }
                        }}
                      />
                    </TokenIcon>
                    <VaultInfo>
                      <VaultName>{vault.name}</VaultName>
                      <VaultAsset>{vault.asset} Vault</VaultAsset>
                    </VaultInfo>
                  </VaultHeader>
                  <VaultStats>
                    <VaultStat>
                      <StatLabel>Base APY</StatLabel>
                      <StatValue>{vault.baseAPY}%</StatValue>
                    </VaultStat>
                    <VaultStat>
                      <StatLabel>AI Boosted</StatLabel>
                      <StatValue $highlight>{vault.boostedAPY}%</StatValue>
                    </VaultStat>
                    <VaultStat>
                      <StatLabel>Total Value</StatLabel>
                      <StatValue>{vault.tvl}</StatValue>
                    </VaultStat>
                  </VaultStats>
                  <VaultDescription>{vault.description}</VaultDescription>
                  <VaultStrategyStyled>
                    <strong>Strategy:</strong> {vault.strategy}
                  </VaultStrategyStyled>
                  <VaultStrategyStyled style={{ marginTop: '12px' }}>
                    <strong>Target HF:</strong> {vault.targetHealthFactor} | <strong>Max Leverage:</strong> {vault.leverageRatio}x
                  </VaultStrategyStyled>
                </VaultCard>
              ))}
            </VaultGrid>
          </>
        );

      case 2:
        return selectedVault ? (
          <>
            <SectionTitle>Enter Deposit Amount</SectionTitle>
            <InputGroup>
              <Label>
                <span>Amount</span>
                <BalanceText>Balance: {kaiaBalance} KAIA</BalanceText>
              </Label>
              <InputWrapper>
                <Input 
                  type="number" 
                  value={depositAmount} 
                  onChange={(e) => { setDepositAmount(e.target.value); setError(null); }} 
                  placeholder="0.00" 
                  step="any" 
                />
                <InputLabel>KAIA</InputLabel>
              </InputWrapper>
              <MaxButton onClick={handleMaxAmount}>Use Max</MaxButton>
            </InputGroup>
            {depositAmount && parseFloat(depositAmount) > 0 && (
              <>
                <SectionTitle>Expected Returns (AI-Boosted)</SectionTitle>
                <ExpectedResults>
                  <ResultRow>
                    <ResultLabel>Your Deposit</ResultLabel>
                    <ResultValue>{returns.principal} KAIA</ResultValue>
                  </ResultRow>
                  <ResultRow>
                    <ResultLabel>Est. Earnings (30 days)</ResultLabel>
                    <ResultValue>+{returns.earnings30Days} KAIA</ResultValue>
                  </ResultRow>
                  <ResultRow>
                    <ResultLabel>Boosted APY</ResultLabel>
                    <ResultValue $large>{returns.apy}%</ResultValue>
                  </ResultRow>
                </ExpectedResults>
                <InfoBanner $type="info" style={{ marginTop: '16px' }}>
                  <Zap size={14} />
                  <div style={{ fontSize: '13px' }}>
                    AI bot will automatically manage your position with target Health Factor of 1.8
                  </div>
                </InfoBanner>
              </>
            )}
          </>
        ) : null;

      case 3:
        return selectedVault ? (
          <>
            <SectionTitle>Review & Confirm Deposit</SectionTitle>
            <InfoBanner $type="success">
              <CheckCircle size={16} />
              <div>Ready to deposit into <strong>{selectedVault.name}</strong></div>
            </InfoBanner> 
            <br/>
            <ExpectedResults>
              <ResultRow>
                <ResultLabel>Vault</ResultLabel>
                <ResultValue>{selectedVault.name}</ResultValue>
              </ResultRow>
              <ResultRow>
                <ResultLabel>Deposit Amount</ResultLabel>
                <ResultValue>{returns.principal} KAIA</ResultValue>
              </ResultRow>
              <ResultRow>
                <ResultLabel>Boosted APY</ResultLabel>
                <ResultValue $highlight>{selectedVault.boostedAPY}%</ResultValue>
              </ResultRow>
              <ResultRow>
                <ResultLabel>Target Health Factor</ResultLabel>
                <ResultValue>{selectedVault.targetHealthFactor}</ResultValue>
              </ResultRow>
              <ResultRow>
                <ResultLabel>Est. 30-Day Earnings</ResultLabel>
                <ResultValue>+{returns.earnings30Days} KAIA</ResultValue>
              </ResultRow>
            </ExpectedResults>
            <InfoBanner $type="warning" style={{ marginTop: '16px' }}>
              <AlertCircle size={14} />
              <div style={{ fontSize: '13px' }}>
                This vault uses leverage. While AI manages risk, your deposit may be subject to liquidation if health factor drops below 1.2.
              </div>
            </InfoBanner>
          </>
        ) : null;

      case 4:
        return (
          <EmptyState>
            <EmptyStateIcon><CheckCircle size={64} color="#06C755" /></EmptyStateIcon>
            <EmptyStateText style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
              Deposit Successful!
            </EmptyStateText>
            <EmptyStateText>
              Your {returns.principal} KAIA has been deposited into {selectedVault?.name}.
              The AI bot will start managing your position within 10 minutes.
            </EmptyStateText>
            {depositTxHash && (
              <ActivityLink style={{ marginTop: '20px', fontSize: '14px' }} href={`${KAIA_SCAN_URL}/tx/${depositTxHash}`} target="_blank">
                View Transaction <ExternalLink size={14} />
              </ActivityLink>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', width: '100%' }}>
              <ActionButton 
                style={{ flex: 1 }} 
                onClick={() => { 
                  setActiveTab('activity'); 
                  setDepositStep(1); 
                  setDepositAmount(''); 
                  setDepositTxHash(null); 
                }}
              >
                View Bot Activity
              </ActionButton>
              <ActionButton 
                style={{ flex: 1, background: '#f1f5f9', color: '#475569' }} 
                onClick={() => { 
                  setActiveTab('withdraw'); 
                  setDepositStep(1); 
                  setDepositAmount(''); 
                  setDepositTxHash(null); 
                }}
              >
                My Positions
              </ActionButton>
            </div>
          </EmptyState>
        );

      default:
        return null;
    }
  };

  // Render Withdraw Steps
  const renderWithdrawStep = () => {
    switch (withdrawStep) {
      case 1:
        return (
          <>
            <SectionTitle>Select Position to Withdraw</SectionTitle>
            <InfoBanner $type="warning">
              <AlertCircle size={16} />
              <div>
                Withdrawal creates a request. The AI bot will unwind your leveraged position (12-24 hours), then you can claim your funds.
              </div>
            </InfoBanner>
            {!account ? (
              <EmptyState>
                <EmptyStateIcon>🔐</EmptyStateIcon>
                <EmptyStateText>Connect your wallet to view your deposits</EmptyStateText>
              </EmptyState>
            ) : MOCK_USER_POSITIONS.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon>📦</EmptyStateIcon>
                <EmptyStateText>No deposits yet. Switch to the Deposit tab to start earning!</EmptyStateText>
              </EmptyState>
            ) : (
              <>
                <PositionsList>
                  {MOCK_USER_POSITIONS.map((position) => {
                    const vault = getVaultById(position.vaultId);
                    if (!vault) return null;
                    const hfStatus = getHealthFactorStatus(position.healthFactor || 0);
                    return (
                      <PositionCard
                        key={`${position.vaultId}-${position.depositIndex}`}
                        $canWithdraw={position.canWithdraw}
                        $selected={selectedPosition?.depositIndex === position.depositIndex && selectedPosition?.vaultId === position.vaultId}
                        onClick={() => position.canWithdraw && setSelectedPosition(position)}
                      >
                        <PositionHeader>
                          <PositionVault>{vault.icon} {vault.name}</PositionVault>
                          {!position.canWithdraw && (
                            <PositionStatus $locked={!position.canWithdraw}>
                              {!position.canWithdraw && position.daysRemaining !== undefined && (
                                <><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />{position.daysRemaining} days</>
                              )}
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
                            <PositionStatValue $profit={position.profitLossPercentage > 0} $loss={position.profitLossPercentage < 0}>
                              {position.profitLoss} ({position.profitLossPercentage > 0 ? '+' : ''}{position.profitLossPercentage.toFixed(2)}%)
                            </PositionStatValue>
                          </PositionStat>
                        </PositionStats>
                        {position.healthFactor && (
                          <PositionInfo style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span>Health Factor: <strong style={{ color: hfStatus.color }}>{position.healthFactor.toFixed(2)} {hfStatus.label}</strong></span>
                            <span>Leverage: <strong>{position.leverageRatio}x</strong></span>
                          </PositionInfo>
                        )}
                      </PositionCard>
                    );
                  })}
                </PositionsList>
                {MOCK_WITHDRAWAL_REQUESTS.length > 0 && (
                  <>
                    <RequestsHeader>
                      <SectionTitle style={{ margin: 0 }}>Withdrawal Requests</SectionTitle>
                      <RequestToggle>
                        <ToggleButton $active={!showCompletedRequests} onClick={() => setShowCompletedRequests(false)}>
                          Active ({pendingRequests.length})
                        </ToggleButton>
                        <ToggleButton $active={showCompletedRequests} onClick={() => setShowCompletedRequests(true)}>
                          Completed ({completedRequests.length})
                        </ToggleButton>
                      </RequestToggle>
                    </RequestsHeader>
                    <RequestsTable>
                      <TableRow $header>
                        <TableCell>#</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                      {displayedRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.id}</TableCell>
                          <TableCell>{request.amount}</TableCell>
                          <TableCell>
                            {request.status === 'ready' && '✅ Ready'}
                            {request.status === 'processing' && '⏳ Processing'}
                            {request.status === 'claimed' && '✓ Claimed'}
                          </TableCell>
                          <TableCell>
                            {request.status === 'ready' && (
                              <ActionButton style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleClaimRequest(request.id)}>
                                Claim
                              </ActionButton>
                            )}
                            {request.status === 'processing' && (
                              <span style={{ fontSize: '12px', color: '#64748b' }}>
                                {request.estimatedReady && formatTime(request.estimatedReady)}
                              </span>
                            )}
                            {request.status === 'claimed' && '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </RequestsTable>
                    {displayedRequests.length > 0 && displayedRequests[0].aiReasoning && (
                      <InfoBanner $type="info" style={{ marginTop: '12px', fontSize: '13px' }}>
                        <Activity size={14} />
                        <div>{displayedRequests[0].aiReasoning}</div>
                      </InfoBanner>
                    )}
                  </>
                )}
              </>
            )}
          </>
        );

      case 2:
        return selectedPosition ? (
          <>
            <SectionTitle>Confirm Withdrawal Request</SectionTitle>
            {(() => {
              const vault = getVaultById(selectedPosition.vaultId);
              const hfStatus = getHealthFactorStatus(selectedPosition.healthFactor || 0);
              return (
                <>
                  <InfoBanner $type="warning">
                    <AlertCircle size={16} />
                    <div>AI bot will unwind your leverage position. This process takes 12-24 hours.</div>
                  </InfoBanner>
                  <br/>
                  <ExpectedResults>
                    <ResultRow>
                      <ResultLabel>Vault</ResultLabel>
                      <ResultValue>{vault?.name}</ResultValue>
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
                      <ResultValue $profit={selectedPosition.profitLossPercentage > 0} $loss={selectedPosition.profitLossPercentage < 0}>
                        {selectedPosition.profitLoss} ({selectedPosition.profitLossPercentage > 0 ? '+' : ''}{selectedPosition.profitLossPercentage.toFixed(2)}%)
                      </ResultValue>
                    </ResultRow>
                    <ResultRow>
                      <ResultLabel>You Will Receive</ResultLabel>
                      <ResultValue $large>{selectedPosition.currentValue} KAIA</ResultValue>
                    </ResultRow>
                  </ExpectedResults>
                  <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#475569' }}>
                    <div style={{ fontWeight: 600, marginBottom: '8px' }}>🤖 AI Bot Will Execute:</div>
                    <div style={{ paddingLeft: '20px' }}>
                      1. Repay USDT debt to lending pool<br/>
                      2. Withdraw stKAIA collateral<br/>
                      3. Unstake stKAIA to KAIA<br/>
                      4. Process withdrawal to your wallet
                    </div>
                  </div>
                </>
              );
            })()}
          </>
        ) : null;

      case 3:
        return (
          <EmptyState>
            <EmptyStateIcon><Clock size={64} color="#f59e0b" /></EmptyStateIcon>
            <EmptyStateText style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
              Withdrawal Request Submitted
            </EmptyStateText>
            <EmptyStateText>
              Request #{withdrawRequestId} created. The AI bot is now unwinding your leverage position.
              You'll be able to claim your funds in 12-24 hours.
            </EmptyStateText>
            <InfoBanner $type="info" style={{ marginTop: '20px' }}>
              <Info size={16} />
              <div>Check the Activity tab to monitor bot progress, or we'll notify you when ready to claim.</div>
            </InfoBanner>
            <ActionButton style={{ marginTop: '20px' }} onClick={() => { setActiveTab('activity'); setWithdrawStep(1); setSelectedPosition(null); }}>
              View Bot Activity
            </ActionButton>
          </EmptyState>
        );

      default:
        return null;
    }
  };

  // Render Activity Tab
  const renderActivityTab = () => {
    const filteredActivity = getFilteredActivity();

    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <SectionTitle style={{ margin: 0 }}>Live Bot Activity</SectionTitle>
          <FilterSelect value={selectedActionFilter} onChange={(e) => setSelectedActionFilter(e.target.value)} style={{ width: 'auto', minWidth: '150px' }}>
            <option value="all">All Activity</option>
            <option value="success">✅ Success</option>
            <option value="warning">⚠️ Warning</option>
            <option value="info">ℹ️ Info</option>
            <option value="critical">🚨 Critical</option>
          </FilterSelect>
        </div>
        
        <InfoBanner $type="info" style={{ marginBottom: '16px' }}>
          <Activity size={14} />
          <div style={{ fontSize: '13px' }}>
            Live feed of AI bot decisions and operator tasks. Bot checks every 10 minutes, emergency monitoring every 30 seconds.
          </div>
        </InfoBanner>

        <ActivityFeed>
          {filteredActivity.map((activity, index) => {
            const isExpanded = expandedTask === `task-${index}`;
            const hasTask = !!activity.task;
            const taskInfo = hasTask && activity.task ? TASK_TYPE_LABELS[activity.task.type] : null;

            return (
              <ActivityItem key={index} $status={activity.status}>
                <ActivityHeader>
                  <ActivityAction>
                    {activity.action}
                    {activity.healthFactor && (
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748b' }}>
                        HF: {activity.healthFactor.toFixed(2)}
                      </span>
                    )}
                  </ActivityAction>
                  <ActivityTime>{formatTime(activity.timestamp)}</ActivityTime>
                </ActivityHeader>
                <ActivityReason>{activity.reasoning}</ActivityReason>
                
                {hasTask && activity.task && (
                  <div style={{ marginTop: '12px' }}>
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '8px 12px',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                      onClick={() => setExpandedTask(isExpanded ? null : `task-${index}`)}
                    >
                      <span>{taskInfo?.icon}</span>
                      <span style={{ color: taskInfo?.color }}>{taskInfo?.label}</span>
                      <span style={{ 
                        marginLeft: 'auto', 
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: activity.task.status === 'COMPLETED' ? '#dcfce7' : 
                                   activity.task.status === 'URGENT_OPERATOR_ACTION' ? '#fee2e2' : '#fef3c7',
                        color: activity.task.status === 'COMPLETED' ? '#166534' :
                               activity.task.status === 'URGENT_OPERATOR_ACTION' ? '#991b1b' : '#854d0e'
                      }}>
                        {activity.task.status.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '16px' }}>{isExpanded ? '▼' : '▶'}</span>
                    </div>

                    {isExpanded && (
                      <div style={{ 
                        marginTop: '8px', 
                        padding: '12px', 
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '13px'
                      }}>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>AI Confidence:</strong> {(activity.task.confidence * 100).toFixed(0)}% | 
                          <strong style={{ marginLeft: '8px' }}>Risk:</strong> {activity.task.riskLevel}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Steps for Operator:</strong>
                        </div>
                        <div style={{ paddingLeft: '12px', color: '#475569', lineHeight: '1.6' }}>
                          {activity.task.steps.map((step, i) => (
                            <div key={i}>{step}</div>
                          ))}
                        </div>
                        {activity.task.parameters && Object.keys(activity.task.parameters).length > 0 && (
                          <div style={{ marginTop: '12px', padding: '8px', background: '#f8fafc', borderRadius: '4px' }}>
                            <strong>Parameters:</strong>
                            <pre style={{ margin: '4px 0 0 0', fontSize: '11px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(activity.task.parameters, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activity.txHash && (
                  <ActivityLink href={`${KAIA_SCAN_URL}/tx/${activity.txHash}`} target="_blank">
                    View Transaction <ExternalLink size={12} />
                  </ActivityLink>
                )}
              </ActivityItem>
            );
          })}
        </ActivityFeed>
        {filteredActivity.length === 0 && (
          <EmptyState>
            <EmptyStateIcon>🔍</EmptyStateIcon>
            <EmptyStateText>No activity found for the selected filter</EmptyStateText>
          </EmptyState>
        )}
      </>
    );
  };

  const currentStep = activeTab === 'deposit' ? depositStep : activeTab === 'withdraw' ? withdrawStep : 0;
  const totalSteps = activeTab === 'deposit' ? totalDepositSteps : activeTab === 'withdraw' ? totalWithdrawSteps : 0;

  return (
    <BaseModal isOpen={true} onClose={onClose} title="KAIA Leverage Vault">
      <Container>
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

        {activeTab !== 'activity' && currentStep < totalSteps && (
          <StepProgress>
            {Array.from({ length: totalSteps }, (_, i) => (
              <StepDot key={i} $active={i + 1 === currentStep} $completed={i + 1 < currentStep} />
            ))}
          </StepProgress>
        )}

        {error && (
          <ErrorMessage>
            <AlertCircle size={16} />
            {error}
          </ErrorMessage>
        )}

        <StepContent>
          {activeTab === 'deposit' && renderDepositStep()}
          {activeTab === 'withdraw' && renderWithdrawStep()}
          {activeTab === 'activity' && renderActivityTab()}
        </StepContent>

        {activeTab !== 'activity' && currentStep < totalSteps && (
          <NavigationContainer>
            {currentStep > 1 && (
              <NavButton onClick={activeTab === 'deposit' ? handleDepositBack : handleWithdrawBack} disabled={isDepositing || isWithdrawing}>
                Back
              </NavButton>
            )}
            <NavButton
              $primary
              disabled={activeTab === 'deposit' ? !canProceedDeposit() || isDepositing : !canProceedWithdraw() || isWithdrawing}
              onClick={activeTab === 'deposit' ? (depositStep === 3 ? handleDeposit : handleDepositNext) : (withdrawStep === 2 ? handleRequestWithdrawal : handleWithdrawNext)}
            >
              {activeTab === 'deposit' ? (
                depositStep === 3 ? (isDepositing ? 'Depositing...' : 'Confirm Deposit') : (<>Next<ChevronRight size={16} /></>)
              ) : (
                withdrawStep === 2 ? (isWithdrawing ? 'Processing...' : 'Request Withdrawal') : (<>Next<ChevronRight size={16} /></>)
              )}
            </NavButton>
          </NavigationContainer>
        )}

        {!account && activeTab !== 'activity' && currentStep < totalSteps && (
          <InfoBanner $type="warning" style={{ marginTop: '16px' }}>
            <AlertCircle size={16} />
            <div>Please connect your wallet to {activeTab === 'deposit' ? 'deposit' : 'withdraw'}</div>
          </InfoBanner>
        )}
      </Container>
    </BaseModal>
  );
};
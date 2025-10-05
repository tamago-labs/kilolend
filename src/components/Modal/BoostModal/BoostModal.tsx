'use client';

import React, { useState } from 'react';
import { BaseModal } from '../BaseModal';
import { ChevronRight, AlertCircle, Info, Clock, Lock, Unlock, CheckCircle, ExternalLink } from 'react-feather';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { KAIA_SCAN_URL } from '@/utils/tokenConfig';
import {
  VAULT_STRATEGIES,
  getVaultActivity,
  getVaultById,
  MOCK_USER_POSITIONS,
  MOCK_WITHDRAWAL_REQUESTS,
  KAIA_VAULT_ACTIVITY,
  USDT_VAULT_ACTIVITY,
  JPYC_VAULT_ACTIVITY,
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
  VaultIcon,
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
  FilterContainer,
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
  const [selectedVault, setSelectedVault] = useState<VaultStrategy | null>(null);
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
  const [selectedVaultFilter, setSelectedVaultFilter] = useState<string>('all');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  
  const [error, setError] = useState<string | null>(null);

  const { account } = useWalletAccountStore();

  // Mock balances
  const mockBalances: Record<string, string> = {
    'KAIA': '1,234.56',
    'USDT': '500.00',
    'JPYC': '100,000'
  };

  const totalDepositSteps = 4;
  const totalWithdrawSteps = 3;

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleMaxAmount = () => {
    if (selectedVault) {
      const balance = mockBalances[selectedVault.asset] || '0';
      setDepositAmount(balance.replace(/[,¥$]/g, ''));
    }
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
        const cleanBalance = mockBalances[selectedVault?.asset || '']?.replace(/[,¥$]/g, '') || '0';
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

  // Get all activity combined
  const getAllActivity = (): BotActivity[] => {
    return [...KAIA_VAULT_ACTIVITY, ...USDT_VAULT_ACTIVITY, ...JPYC_VAULT_ACTIVITY]
      .sort((a, b) => b.timestamp - a.timestamp);
  };

  // Filter activity
  const getFilteredActivity = (): BotActivity[] => {
    let activities = selectedVaultFilter === 'all' ? getAllActivity() : getVaultActivity(selectedVaultFilter);

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
            <SectionTitle>Select Vault Strategy</SectionTitle>
            <VaultGrid>
              {VAULT_STRATEGIES.map((vault) => (
                <VaultCard key={vault.id} $selected={selectedVault?.id === vault.id} onClick={() => setSelectedVault(vault)}>
                  <VaultHeader>
                    {/* <VaultIcon>{vault.icon}</VaultIcon> */}
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
                <BalanceText>Balance: {mockBalances[selectedVault.asset] || '0'} {selectedVault.asset}</BalanceText>
              </Label>
              <InputWrapper>
                <Input type="number" value={depositAmount} onChange={(e) => { setDepositAmount(e.target.value); setError(null); }} placeholder="0.00" step="any" />
                <InputLabel>{selectedVault.asset}</InputLabel>
              </InputWrapper>
              <MaxButton onClick={handleMaxAmount}>Use Max</MaxButton>
            </InputGroup>
            {depositAmount && parseFloat(depositAmount) > 0 && (
              <>
                <SectionTitle>Expected Returns</SectionTitle>
                <ExpectedResults>
                  <ResultRow>
                    <ResultLabel>Your Deposit</ResultLabel>
                    <ResultValue>{returns.principal} {selectedVault.asset}</ResultValue>
                  </ResultRow>
                  <ResultRow>
                    <ResultLabel>Est. Earnings (30 days)</ResultLabel>
                    <ResultValue>+{returns.earnings30Days} {selectedVault.asset}</ResultValue>
                  </ResultRow>
                  <ResultRow>
                    <ResultLabel>APY</ResultLabel>
                    <ResultValue $large>{returns.apy}%</ResultValue>
                  </ResultRow>
                </ExpectedResults>
              </>
            )}
          </>
        ) : null;

      case 3:
        return selectedVault ? (
          <>
            <SectionTitle>Review & Confirm</SectionTitle>
            <InfoBanner $type="success">
              <CheckCircle size={16} />
              <div>You're depositing into <strong>{selectedVault.name}</strong></div>
            </InfoBanner> 
            <br/>
            <ExpectedResults>
              <ResultRow>
                <ResultLabel>Vault</ResultLabel>
                <ResultValue>{selectedVault.name}</ResultValue>
              </ResultRow>
              <ResultRow>
                <ResultLabel>Deposit Amount</ResultLabel>
                <ResultValue>{returns.principal} {selectedVault.asset}</ResultValue>
              </ResultRow>
              <ResultRow>
                <ResultLabel>Boosted APY</ResultLabel>
                <ResultValue $highlight>{selectedVault.boostedAPY}%</ResultValue>
              </ResultRow>
              <ResultRow>
                <ResultLabel>Est. 30-Day Earnings</ResultLabel>
                <ResultValue>+{returns.earnings30Days} {selectedVault.asset}</ResultValue>
              </ResultRow>
            </ExpectedResults>
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
              Your {returns.principal} {selectedVault?.asset} has been deposited into {selectedVault?.name}.
              The AI bot will start optimizing your position immediately.
            </EmptyStateText>
            {depositTxHash && (
              <ActivityLink style={{ marginTop: '20px', fontSize: '14px' }} href={`${KAIA_SCAN_URL}/tx/${depositTxHash}`} target="_blank">
                View Transaction <ExternalLink size={14} />
              </ActivityLink>
            )}
            <ActionButton style={{ marginTop: '20px' }} onClick={() => { setActiveTab('withdraw'); setDepositStep(1); setSelectedVault(null); setDepositAmount(''); setDepositTxHash(null); }}>
              View My Positions
            </ActionButton>
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
            {/* <InfoBanner $type="warning">
              <AlertCircle size={16} />
              <div>Withdrawal creates a request. The bot will unwind your position, then you can claim your funds.</div>
            </InfoBanner> */}
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
                    return (
                      <PositionCard
                        key={`${position.vaultId}-${position.depositIndex}`}
                        $canWithdraw={position.canWithdraw}
                        $selected={selectedPosition?.depositIndex === position.depositIndex && selectedPosition?.vaultId === position.vaultId}
                        onClick={() => position.canWithdraw && setSelectedPosition(position)}
                      >
                        <PositionHeader>
                          <PositionVault>{vault.icon} {vault.name}</PositionVault>
                          { !position.canWithdraw && (
                            <PositionStatus $locked={!position.canWithdraw}>
                            {position.canWithdraw ? (<>
                            <Unlock size={12} />Unlocked
                            </>) : (<>
                            {/* <Lock size={12} />Locked */}
                            {!position.canWithdraw && position.daysRemaining !== undefined && (
                            <><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />{position.daysRemaining} days remaining</>
                          )}
                            </>)}

                          </PositionStatus>
                          ) }
                          
                        </PositionHeader>
                        <PositionStats>
                          <PositionStat>
                            <PositionStatLabel>Deposited</PositionStatLabel>
                            <PositionStatValue>{position.deposited} {vault.asset}</PositionStatValue>
                          </PositionStat>
                          <PositionStat>
                            <PositionStatLabel>Current Value</PositionStatLabel>
                            <PositionStatValue>{position.currentValue} {vault.asset}</PositionStatValue>
                          </PositionStat>
                          <PositionStat>
                            <PositionStatLabel>Profit/Loss</PositionStatLabel>
                            <PositionStatValue $profit={position.profitLossPercentage > 0} $loss={position.profitLossPercentage < 0}>
                              {position.profitLoss} ({position.profitLossPercentage > 0 ? '+' : ''}{position.profitLossPercentage.toFixed(2)}%)
                            </PositionStatValue>
                          </PositionStat>
                        </PositionStats>
                        {/* <PositionInfo>
                          {!position.canWithdraw && position.daysRemaining !== undefined && (
                            <><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />{position.daysRemaining} days remaining</>
                          )}
                        </PositionInfo> */}
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
                          Pending ({pendingRequests.length})
                        </ToggleButton>
                        <ToggleButton $active={showCompletedRequests} onClick={() => setShowCompletedRequests(true)}>
                          Completed ({completedRequests.length})
                        </ToggleButton>
                      </RequestToggle>
                    </RequestsHeader>
                    <RequestsTable>
                      <TableRow $header>
                        <TableCell>#</TableCell>
                        <TableCell>Vault</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                      {displayedRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.id}</TableCell>
                          <TableCell>{request.vaultName.split(' ')[0]}</TableCell>
                          <TableCell>{request.amount}</TableCell>
                          <TableCell>
                            {request.status === 'ready' && '✅ Ready'}
                            {request.status === 'processing' && '⏳ Proc.'}
                            {request.status === 'claimed' && '✓ Claimed'}
                          </TableCell>
                          <TableCell>
                            {request.status === 'ready' && (
                              <ActionButton style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleClaimRequest(request.id)}>
                                Claim
                              </ActionButton>
                            )}
                            {request.status === 'processing' && '-'}
                            {request.status === 'claimed' && '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </RequestsTable>
                  </>
                )}
              </>
            )}
          </>
        );

      case 2:
        return selectedPosition ? (
          <>
            <SectionTitle>Confirm Withdrawal</SectionTitle>
            {(() => {
              const vault = getVaultById(selectedPosition.vaultId);
              return (
                <>
                  <InfoBanner $type="warning">
                    <AlertCircle size={16} />
                    <div>This will create a withdrawal request. The bot will unwind your position within 12-24 hours.</div>
                  </InfoBanner>
                  <br/>
                  <ExpectedResults>
                    <ResultRow>
                      <ResultLabel>Vault</ResultLabel>
                      <ResultValue>{vault?.name}</ResultValue>
                    </ResultRow>
                    <ResultRow>
                      <ResultLabel>Current Value</ResultLabel>
                      <ResultValue>{selectedPosition.currentValue} {vault?.asset}</ResultValue>
                    </ResultRow>
                    <ResultRow>
                      <ResultLabel>Profit/Loss</ResultLabel>
                      <ResultValue $profit={selectedPosition.profitLossPercentage > 0} $loss={selectedPosition.profitLossPercentage < 0}>
                        {selectedPosition.profitLoss} ({selectedPosition.profitLossPercentage > 0 ? '+' : ''}{selectedPosition.profitLossPercentage.toFixed(2)}%)
                      </ResultValue>
                    </ResultRow>
                    <ResultRow>
                      <ResultLabel>You Will Receive</ResultLabel>
                      <ResultValue $large>{selectedPosition.currentValue} {vault?.asset}</ResultValue>
                    </ResultRow>
                  </ExpectedResults>
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
              Request #{withdrawRequestId} created. The AI bot is now unwinding your position.
              You'll be able to claim your funds in 12-24 hours.
            </EmptyStateText>
            <InfoBanner $type="info" style={{ marginTop: '20px' }}>
              <Info size={16} />
              <div>Check back later or we'll notify you when your withdrawal is ready to claim.</div>
            </InfoBanner>
            <ActionButton style={{ marginTop: '20px' }} onClick={onClose}>Close</ActionButton>
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
        <SectionTitle>Live Bot Activity</SectionTitle>
        <FilterContainer>
          <FilterSelect value={selectedVaultFilter} onChange={(e) => setSelectedVaultFilter(e.target.value)}>
            <option value="all">All Vaults</option>
            <option value="kaia-leverage">KAIA Leverage</option>
            <option value="usdt-treasury">USDT Stability</option>
            <option value="jpyc-nikkei">JPYC Japan</option>
          </FilterSelect>
          <FilterSelect value={selectedActionFilter} onChange={(e) => setSelectedActionFilter(e.target.value)}>
            <option value="all">All Actions</option>
            <option value="success">✅ Success</option>
            <option value="warning">⚠️ Warning</option>
            <option value="info">ℹ️ Info</option>
          </FilterSelect>
        </FilterContainer>
        <ActivityFeed>
          {filteredActivity.map((activity, index) => (
            <ActivityItem key={index} $status={activity.status}>
              <ActivityHeader>
                <ActivityAction>{activity.action}</ActivityAction>
                <ActivityTime>{formatTime(activity.timestamp)}</ActivityTime>
              </ActivityHeader>
              <ActivityReason>{activity.reasoning}</ActivityReason>
              {activity.txHash && (
                <ActivityLink href={`${KAIA_SCAN_URL}/tx/${activity.txHash}`} target="_blank">
                  View Transaction <ExternalLink size={12} />
                </ActivityLink>
              )}
            </ActivityItem>
          ))}
        </ActivityFeed>
        {filteredActivity.length === 0 && (
          <EmptyState>
            <EmptyStateIcon>🔍</EmptyStateIcon>
            <EmptyStateText>No activity found for the selected filters</EmptyStateText>
          </EmptyState>
        )}
      </>
    );
  };

  const currentStep = activeTab === 'deposit' ? depositStep : activeTab === 'withdraw' ? withdrawStep : 0;
  const totalSteps = activeTab === 'deposit' ? totalDepositSteps : activeTab === 'withdraw' ? totalWithdrawSteps : 0;

  return (
    <BaseModal isOpen={true} onClose={onClose} title="AI-Managed Vaults">
      <Container>
        <TabContainer>
          <Tab $active={activeTab === 'deposit'} onClick={() => setActiveTab('deposit')}>Deposit</Tab>
          <Tab $active={activeTab === 'withdraw'} onClick={() => setActiveTab('withdraw')}>Withdraw</Tab>
          <Tab $active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>Activity</Tab>
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

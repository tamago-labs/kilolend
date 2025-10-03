'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { MOCK_VAULT_DATA, MOCK_BOT_ACTIVITY } from './mockData';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 28px;
  color: white;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 28px;
  font-weight: bold;
`;

const Subtitle = styled.p`
  margin: 8px 0 0;
  opacity: 0.95;
  font-size: 15px;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.25);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

const APYBanner = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
`;

const APYItem = styled.div`
  text-align: center;
`;

const APYLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
`;

const APYValue = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

const VaultStats = styled.div`
  background: linear-gradient(135deg, #f0f4ff, #e0e7ff);
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
`;

const StatItem = styled.div``;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const StatValue = styled.div<{ color?: string }>`
  font-size: 20px;
  font-weight: bold;
  color: ${props => props.color || '#111827'};
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  background: #f9fafb;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 16px;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#667eea' : '#6b7280'};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 15px;
  cursor: pointer;
  border-bottom: ${props => props.$active ? '3px solid #667eea' : 'none'};
  margin-bottom: -2px;
  transition: all 0.2s;

  &:hover {
    color: #667eea;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow: auto;
  padding: 24px;
`;

const InfoBanner = styled.div<{ type: 'info' | 'warning' }>`
  background: ${props => props.type === 'warning' ? '#fef3c7' : '#f0f9ff'};
  border: 1px solid ${props => props.type === 'warning' ? '#fcd34d' : '#bae6fd'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  font-size: 13px;
  color: ${props => props.type === 'warning' ? '#92400e' : '#075985'};
  line-height: 1.6;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 80px 16px 16px;
  font-size: 18px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: #667eea;
  }
`;

const InputLabel = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
`;

const MaxButton = styled.button`
  margin-top: 8px;
  background: none;
  border: none;
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const ExpectedResults = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #075985;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  width: 100%;
  background: ${props => props.variant === 'danger' 
    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
    : 'linear-gradient(135deg, #667eea, #764ba2)'};
  color: white;
  border: none;
  padding: 18px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${props => props.variant === 'danger'
    ? '0 4px 12px rgba(239, 68, 68, 0.4)'
    : '0 4px 12px rgba(102, 126, 234, 0.4)'};
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'danger'
      ? '0 8px 20px rgba(239, 68, 68, 0.5)'
      : '0 8px 20px rgba(102, 126, 234, 0.5)'};
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ActivityItem = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const ActivityIcon = styled.div`
  font-size: 24px;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTop = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ActivityAction = styled.div<{ color: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.color};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const ActivityReasoning = styled.div`
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 8px;
`;

const ActivityLink = styled.a`
  font-size: 12px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

type TabType = 'deposit' | 'withdraw' | 'activity';

interface BoostModalProps {
  onClose: () => void;
}

export const BoostModal: React.FC<BoostModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('deposit');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');

  const vaultData = MOCK_VAULT_DATA;
  const botActivity = MOCK_BOT_ACTIVITY;

  const getActionIcon = (action: string) => {
    const icons: { [key: string]: string } = {
      'startup': '🤖',
      'health_check': '💓',
      'leverage_pending': '⏳',
      'leverage_success': '✅',
      'leverage_failed': '❌',
      'emergency_unwind': '🚨',
      'unwind_complete': '✅',
      'monitor': '👁️',
      'caution': '⚠️',
      'skip': '⏭️'
    };
    return icons[action] || '📝';
  };

  const getActionColor = (action: string) => {
    if (action.includes('success') || action === 'startup') return '#10b981';
    if (action.includes('failed') || action.includes('emergency')) return '#ef4444';
    if (action.includes('caution') || action === 'skip') return '#f59e0b';
    return '#6b7280';
  };

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

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderTop>
            <div>
              <Title>🚀 AI Boost Vault</Title>
              <Subtitle>Autonomous leverage for maximum yield</Subtitle>
            </div>
            <CloseButton onClick={onClose}>×</CloseButton>
          </HeaderTop>

          <APYBanner>
            <APYItem>
              <APYLabel>Base APY</APYLabel>
              <APYValue>{vaultData.stakingAPY.toFixed(1)}%</APYValue>
            </APYItem>
            <APYItem>
              <APYLabel>Boosted APY</APYLabel>
              <APYValue style={{ color: '#10b981' }}>
                {vaultData.netAPY.toFixed(1)}%
              </APYValue>
            </APYItem>
            <APYItem>
              <APYLabel>Boost</APYLabel>
              <APYValue>{vaultData.boostMultiplier.toFixed(2)}x</APYValue>
            </APYItem>
          </APYBanner>
        </Header>

        <VaultStats>
          <StatsGrid>
            <StatItem>
              <StatLabel>Total Value Locked</StatLabel>
              <StatValue>{vaultData.totalValueLocked}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Users</StatLabel>
              <StatValue color="#667eea">{vaultData.totalUsers}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Health Factor</StatLabel>
              <StatValue color="#10b981">
                {vaultData.avgHealthFactor.toFixed(2)}
              </StatValue>
            </StatItem>
          </StatsGrid>
        </VaultStats>

        <Tabs>
          <Tab 
            $active={activeTab === 'deposit'}
            onClick={() => setActiveTab('deposit')}
          >
            💰 Deposit
          </Tab>
          <Tab 
            $active={activeTab === 'withdraw'}
            onClick={() => setActiveTab('withdraw')}
          >
            💸 Withdraw
          </Tab>
          <Tab 
            $active={activeTab === 'activity'}
            onClick={() => setActiveTab('activity')}
          >
            📊 Activity
          </Tab>
        </Tabs>

        <Content>
          {activeTab === 'deposit' && (
            <>
              <InfoBanner type="info">
                <strong>📌 How it works:</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                  <li>Deposit KAIA → Auto-convert to stKAIA (liquid staking)</li>
                  <li>Bot supplies stKAIA → Borrows USDT → Swaps to stKAIA</li>
                  <li>Repeats until {vaultData.leverageRatio}x leverage at HF {vaultData.targetHealthFactor}</li>
                  <li>Earn {vaultData.netAPY.toFixed(1)}% APY ({vaultData.boostMultiplier.toFixed(2)}x boost)</li>
                  <li>Withdraw anytime - bot auto-unwinds</li>
                </ul>
              </InfoBanner>

              <InputGroup>
                <Label>Your Balance: 1,234.56 KAIA</Label>
                <InputWrapper>
                  <Input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  <InputLabel>KAIA</InputLabel>
                </InputWrapper>
                <MaxButton onClick={() => setDepositAmount('1234.46')}>
                  Use Max
                </MaxButton>
              </InputGroup>

              {depositAmount && parseFloat(depositAmount) > 0 && (
                <ExpectedResults>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                    You will receive:
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0369a1' }}>
                    ≈ {parseFloat(depositAmount).toFixed(2)} kKAIA shares
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '12px', opacity: 0.8 }}>
                    • Total exposure: ~{(parseFloat(depositAmount) * vaultData.leverageRatio).toFixed(0)} stKAIA<br/>
                    • Expected APY: {vaultData.netAPY.toFixed(1)}%<br/>
                    • Health Factor: {vaultData.targetHealthFactor}
                  </div>
                </ExpectedResults>
              )}

              <ActionButton>
                🚀 Deposit & Activate Bot
              </ActionButton>
            </>
          )}

          {activeTab === 'withdraw' && (
            <>
              <InfoBanner type="warning">
                <strong>⚠️ Withdrawal Process:</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                  <li>Burn your kKAIA shares to receive KAIA</li>
                  <li>Bot automatically unwinds leverage position</li>
                  <li>May take 1-2 minutes to complete</li>
                  <li>Amount includes your share of profits/losses</li>
                </ul>
              </InfoBanner>

              <InputGroup>
                <Label>Your kKAIA Balance: 0.00</Label>
                <InputWrapper>
                  <Input
                    type="number"
                    value={withdrawShares}
                    onChange={(e) => setWithdrawShares(e.target.value)}
                    placeholder="0.00"
                  />
                  <InputLabel>kKAIA</InputLabel>
                </InputWrapper>
                <MaxButton onClick={() => setWithdrawShares('0')}>
                  Withdraw All
                </MaxButton>
              </InputGroup>

              <ExpectedResults>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                  First deposit to see your position
                </div>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>
                  Your kKAIA shares will appear here after depositing
                </div>
              </ExpectedResults>

              <ActionButton variant="danger" disabled>
                💸 Withdraw KAIA
              </ActionButton>
            </>
          )}

          {activeTab === 'activity' && (
            <>
              <InfoBanner type="info">
                <strong>🤖 Live Bot Activity</strong>
                <div style={{ marginTop: '8px', opacity: 0.9 }}>
                  Watch the autonomous AI bot make decisions in real-time. 
                  The bot analyzes health factors and executes leverage loops automatically.
                </div>
              </InfoBanner>

              <div>
                {botActivity.map((activity, index) => (
                  <ActivityItem key={index}>
                    <ActivityHeader>
                      <ActivityIcon>
                        {getActionIcon(activity.action)}
                      </ActivityIcon>
                      <ActivityContent>
                        <ActivityTop>
                          <ActivityAction color={getActionColor(activity.action)}>
                            {activity.action.replace(/_/g, ' ')}
                          </ActivityAction>
                          <ActivityTime>
                            {formatTime(activity.timestamp)}
                          </ActivityTime>
                        </ActivityTop>
                        <ActivityReasoning>
                          {activity.reasoning}
                        </ActivityReasoning>
                        {activity.txHash !== 'N/A' && (
                          <ActivityLink
                            href={`https://kaiascan.io/tx/${activity.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Transaction →
                          </ActivityLink>
                        )}
                      </ActivityContent>
                    </ActivityHeader>
                  </ActivityItem>
                ))}
              </div>
            </>
          )}
        </Content>
      </ModalContainer>
    </ModalOverlay>
  );
};

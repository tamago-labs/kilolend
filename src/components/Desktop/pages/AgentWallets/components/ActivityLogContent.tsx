"use client";

import React, { useState } from 'react';
import { AIWalletStatus } from '@/services/aiWalletService';
import {
  ContentCard,
  CardHeader,
  CardTitle,
  ActivityItem,
  ActivityInfo,
  ActivityType,
  ActivityDetails,
  ActivityDate,
} from '../DesktopAgentWalletsV2Page.styles';

interface ActivityLogContentProps {
  aiWalletData: AIWalletStatus | null;
  isLoadingAIWallet: boolean;
}

const MOCK_ACTIVITIES = [
  {
    id: 1,
    type: 'deposit' as const,
    title: 'Deposit USDT',
    amount: '1,000.00 USDT',
    timestamp: '2024-02-19 10:30 AM',
    status: 'completed',
  },
  {
    id: 2,
    type: 'trade' as const,
    title: 'KAIA/USDT Trade',
    amount: '500.00 KAIA',
    timestamp: '2024-02-19 09:45 AM',
    status: 'completed',
  },
  {
    id: 3,
    type: 'withdraw' as const,
    title: 'Withdraw MBX',
    amount: '250.00 MBX',
    timestamp: '2024-02-19 08:15 AM',
    status: 'completed',
  },
  {
    id: 4,
    type: 'trade' as const,
    title: 'STAKED_KAIA/USDT Trade',
    amount: '750.00 STAKED_KAIA',
    timestamp: '2024-02-18 11:30 PM',
    status: 'completed',
  },
  {
    id: 5,
    type: 'error' as const,
    title: 'Failed Transaction',
    amount: 'N/A',
    timestamp: '2024-02-18 08:20 PM',
    status: 'failed',
  },
];

export const ActivityLogContent: React.FC<ActivityLogContentProps> = ({ aiWalletData, isLoadingAIWallet }) => {
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw' | 'trade'>('all');

  const filteredActivities = filter === 'all'
    ? MOCK_ACTIVITIES
    : MOCK_ACTIVITIES.filter(activity => activity.type === filter);

  return (
    <>
      <ContentCard>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['all', 'deposit', 'withdraw', 'trade'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: filter === filterType ? '#06C755' : '#f1f5f9',
                  color: filter === filterType ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {filterType}
              </button>
            ))}
          </div>
        </CardHeader>
        <p style={{ color: '#64748b', lineHeight: 1.6 }}>
          Track all activities including deposits, withdrawals, trades, and other operations performed by your AI agent.
        </p>
      </ContentCard>

      {filteredActivities.length === 0 ? (
        <ContentCard>
          <div style={{
            textAlign: 'center',
            padding: '40px 24px',
            color: '#64748b',
          }}>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>No activities found</div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>
              Activities matching your filters will appear here
            </div>
          </div>
        </ContentCard>
      ) : (
        filteredActivities.map((activity) => (
          <ActivityItem key={activity.id}>
            <ActivityInfo>
              <ActivityType $type={activity.type}>
                {activity.type === 'error' ? activity.status : activity.type}
              </ActivityType>
              <ActivityDetails>
                <strong>{activity.title}</strong>
                <span> • {activity.amount}</span>
              </ActivityDetails>
            </ActivityInfo>
            <ActivityDate>{activity.timestamp}</ActivityDate>
          </ActivityItem>
        ))
      )}

      <ContentCard style={{ marginTop: '24px' }}>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Total Transactions</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>
              {MOCK_ACTIVITIES.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Successful</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#06C755' }}>
              {MOCK_ACTIVITIES.filter(a => a.status !== 'failed').length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Failed</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#dc2626' }}>
              {MOCK_ACTIVITIES.filter(a => a.status === 'failed').length}
            </div>
          </div>
        </div>
      </ContentCard>
    </>
  );
};
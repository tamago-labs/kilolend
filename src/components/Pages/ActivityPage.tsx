'use client';

import styled from 'styled-components';
import { useUserStore } from '@/stores/userStore';
import { useMarketStore } from '@/stores/marketStore';

const PageContainer = styled.div`
  flex: 1;
  padding: 20px 16px;
  padding-bottom: 80px;
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

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TransactionCard = styled.div<{ type: 'supply' | 'withdraw' | 'borrow' | 'repay' }>`
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'supply': return '#00C300';
      case 'withdraw': return '#f59e0b';
      case 'borrow': return '#3b82f6';
      case 'repay': return '#8b5cf6';
      default: return '#e2e8f0';
    }
  }};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TransactionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const TransactionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TransactionAmount = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

const TransactionTime = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

const TransactionStatus = styled.div<{ status: 'pending' | 'confirmed' | 'failed' }>`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => {
    switch (props.status) {
      case 'confirmed': return '#dcfce7';
      case 'pending': return '#fef3c7';
      case 'failed': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'confirmed': return '#166534';
      case 'pending': return '#92400e';
      case 'failed': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #00C300, #00A000);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 195, 0, 0.3);
  }
`;

export const ActivityPage = () => {
  const { transactions } = useUserStore();
  const { markets } = useMarketStore();

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hr ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const getMarketInfo = (marketId: string) => {
    return markets.find(m => m.id === marketId);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'supply': return '💰';
      case 'withdraw': return '💸';
      case 'borrow': return '📈';
      case 'repay': return '💳';
      default: return '📄';
    }
  };

  const getTransactionAction = (type: string) => {
    switch (type) {
      case 'supply': return 'Supplied';
      case 'withdraw': return 'Withdrew';
      case 'borrow': return 'Borrowed';
      case 'repay': return 'Repaid';
      default: return 'Transaction';
    }
  };

  const handleStartTrading = () => {
    alert('Navigate to Home > AI Deal Finder to start trading!');
  };

  if (transactions.length === 0) {
    return (
      <PageContainer>
        <PageTitle>Activity</PageTitle>
        <PageSubtitle>
          View your transaction history
        </PageSubtitle>
        
        <EmptyState>
          <EmptyIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
            </svg>
          </EmptyIcon>
          <h3 style={{ marginBottom: '8px', color: '#1e293b' }}>No activity yet</h3>
          <p style={{ marginBottom: '16px' }}>Your transactions will appear here</p>
          <ActionButton onClick={handleStartTrading}>
            Start Trading
          </ActionButton>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Activity</PageTitle>
      <PageSubtitle>
        View your transaction history
      </PageSubtitle>
      
      <TransactionsList>
        {transactions.map(transaction => {
          const market = getMarketInfo(transaction.marketId);
          return (
            <TransactionCard key={transaction.id} type={transaction.type}>
              <TransactionHeader>
                <TransactionInfo>
                  <TransactionTitle>
                    {getTransactionIcon(transaction.type)}
                    {getTransactionAction(transaction.type)} {market?.symbol || transaction.marketId.toUpperCase()}
                  </TransactionTitle>
                  <TransactionAmount>
                    {transaction.amount.toFixed(2)} {market?.symbol} ({formatValue(transaction.usdValue)})
                  </TransactionAmount>
                  <TransactionTime>
                    {formatTime(transaction.timestamp)}
                  </TransactionTime>
                </TransactionInfo>
                <TransactionStatus status={transaction.status}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </TransactionStatus>
              </TransactionHeader>
              
              {transaction.txHash && (
                <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                  TX: {transaction.txHash.slice(0, 8)}...{transaction.txHash.slice(-6)}
                </div>
              )}
            </TransactionCard>
          );
        })}
      </TransactionsList>
    </PageContainer>
  );
};

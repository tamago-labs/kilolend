'use client';

import styled from 'styled-components';

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

export const ActivityPage = () => {
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
        <p>Your transactions will appear here</p>
      </EmptyState>
    </PageContainer>
  );
};

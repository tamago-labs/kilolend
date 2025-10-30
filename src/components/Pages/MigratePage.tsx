'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useUserPositions } from '@/hooks/useUserPositions';
import { MigrationProvider } from '@/contexts/MigrationContext';

const PageContainer = styled.div`
  flex: 1;
  padding: 20px 16px;
  padding-bottom: 80px;
  background: #f8fafc;
  min-height: 100vh;

  @media (max-width: 480px) {
    padding: 16px 12px;
    padding-bottom: 80px;
  }
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

const AlertBanner = styled.div`
  background: linear-gradient(135deg, #06C755, #05a547);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(6, 199, 85, 0.2);
`;

const AlertTitle = styled.div`
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 12px;
`;

const AlertItem = styled.div`
  font-size: 14px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
`;

const ConnectWalletMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
`;

const EmptyTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  line-height: 1.5;
  max-width: 280px;
  margin: 0 auto;
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
  font-size: 24px;
`;

export const MigratePage = () => {
  const { account } = useWalletAccountStore();
  const { positions, isLoading } = useUserPositions();

  if (!account) {
    return (
      <PageContainer>
        <PageTitle>Migration</PageTitle>
        <PageSubtitle>
          Upgrade to our improved protocol
        </PageSubtitle>
        
        <ContentCard>
          <ConnectWalletMessage>
            <EmptyIcon>👤</EmptyIcon>
            <EmptyTitle>Wallet Not Connected</EmptyTitle>
            <EmptyDescription>Please connect your wallet to access migration features</EmptyDescription>
          </ConnectWalletMessage>
        </ContentCard>
      </PageContainer>
    );
  }

  return (
    <MigrationProvider>
      <PageContainer>
        <PageTitle>Migration</PageTitle>
        <PageSubtitle>
          Upgrade to our improved protocol with enhanced security
        </PageSubtitle>

        <AlertBanner>
          <AlertTitle>Limited Time Offer</AlertTitle>
          <AlertItem>Higher APY rates</AlertItem>
          <AlertItem>Earn bonus KILO tokens</AlertItem>
          <AlertItem>Early migrators get 2x KILO bonus</AlertItem>
        </AlertBanner>

        <ContentCard>
          <CardTitle>Your V1 Positions</CardTitle>
          {isLoading ? (
            <div>Loading your positions...</div>
          ) : positions && positions.length > 0 ? (
            <div>
              {positions.map((position: any, index: number) => (
                <div key={index}>
                  {position.symbol}: {position.supplyBalance}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>
              <EmptyIcon>📊</EmptyIcon>
              <EmptyTitle>No V1 Positions Found</EmptyTitle>
              <EmptyDescription>You don't have any positions in V1 that need migration</EmptyDescription>
            </EmptyState>
          )}
        </ContentCard>

        <ContentCard>
          <CardTitle>Migration Benefits</CardTitle>
          <div>• Enhanced security features</div>
          <div>• Improved interest rates</div>
          <div>• Bonus KILO token rewards</div>
          <div>• Better user experience</div>
        </ContentCard>
      </PageContainer>
    </MigrationProvider>
  );
};

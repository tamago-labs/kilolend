'use client';

import styled from 'styled-components';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';

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

const WalletCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
`;

const WalletAddress = styled.div`
  font-family: monospace;
  font-size: 14px;
  color: #64748b;
  word-break: break-all;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
`;

const SettingsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
`;

export const ProfilePage = () => {
  const { account } = useWalletAccountStore();

  return (
    <PageContainer>
      <PageTitle>Profile</PageTitle>
      <PageSubtitle>
        Manage your wallet and settings
      </PageSubtitle>
      
      {account && (
        <WalletCard>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Connected Wallet</h3>
          <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>
            Your wallet is connected and ready to use
          </p>
          <WalletAddress>
            {account.address}
          </WalletAddress>
        </WalletCard>
      )}

      <SettingsSection>
        <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Settings</h3>
        
        <SettingItem>
          <span>Network</span>
          <span style={{ color: '#64748b' }}>KAIA Mainnet</span>
        </SettingItem>
        
        <SettingItem>
          <span>Theme</span>
          <span style={{ color: '#64748b' }}>Light</span>
        </SettingItem>
        
        <SettingItem>
          <span>Version</span>
          <span style={{ color: '#64748b' }}>v1.0.0</span>
        </SettingItem>
      </SettingsSection>
    </PageContainer>
  );
};

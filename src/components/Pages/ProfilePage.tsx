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

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
`;

const SettingsSection = styled.div``;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
`;

const SettingValue = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const NetworkBadge = styled.div`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: #fef3c7;
  color: #92400e;
`;

const HelpSection = styled.div`
  margin-top: 16px;
`;

const HelpButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.2s;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;

const HelpIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const HelpText = styled.div`
  flex: 1;
`;

const HelpTitle = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
`;

const HelpDescription = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

const ConnectPrompt = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
`;

const ConnectIcon = styled.div`
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

const WalletInfoNote = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 24px;
`;

const WalletInfoText = styled.p`
  font-size: 14px;
  color: #166534;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ProfilePage = () => {
  const { account } = useWalletAccountStore();

  const handleHelpClick = (section: string) => {
    alert(`${section} help coming soon!\n\nFor now, check our documentation or contact support.`);
  };

  if (!account) {
    return (
      <PageContainer>
        <PageTitle>Profile</PageTitle>
        <PageSubtitle>
          Connect your wallet to manage settings
        </PageSubtitle>
        
        <ConnectPrompt>
          <ConnectIcon>👤</ConnectIcon>
          <h3 style={{ marginBottom: '8px', color: '#1e293b' }}>Wallet Not Connected</h3>
          <p>Please connect your wallet to access profile settings</p>
        </ConnectPrompt>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Profile</PageTitle>
      <PageSubtitle>
        Manage your app settings and preferences
      </PageSubtitle>
       
      
      {/* App Settings */}
      <Card>
        <CardTitle>⚙️ Settings</CardTitle>
        <SettingsSection>
          <SettingItem>
            <SettingLabel>Network</SettingLabel>
            <NetworkBadge>KAIA Testnet</NetworkBadge>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>Currency Display</SettingLabel>
            <SettingValue>USD</SettingValue>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>Transaction Slippage</SettingLabel>
            <SettingValue>0.5%</SettingValue>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>App Version</SettingLabel>
            <SettingValue>v1.0.0-beta</SettingValue>
          </SettingItem>
        </SettingsSection>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardTitle>🆘 Help & Support</CardTitle>
        <HelpSection>
          <HelpButton onClick={() => handleHelpClick('How to Use KiloLend')}>
            <HelpIcon>📖</HelpIcon>
            <HelpText>
              <HelpTitle>How to Use KiloLend</HelpTitle>
              <HelpDescription>Learn the basics of AI-powered lending</HelpDescription>
            </HelpText>
          </HelpButton>

          <HelpButton onClick={() => handleHelpClick('Understanding Risks')}>
            <HelpIcon>⚠️</HelpIcon>
            <HelpText>
              <HelpTitle>Understanding Risks</HelpTitle>
              <HelpDescription>Learn about DeFi lending risks and safety</HelpDescription>
            </HelpText>
          </HelpButton>

          <HelpButton onClick={() => handleHelpClick('FAQ')}>
            <HelpIcon>❓</HelpIcon>
            <HelpText>
              <HelpTitle>Frequently Asked Questions</HelpTitle>
              <HelpDescription>Common questions and answers</HelpDescription>
            </HelpText>
          </HelpButton>

          <HelpButton onClick={() => handleHelpClick('Contact Support')}>
            <HelpIcon>💬</HelpIcon>
            <HelpText>
              <HelpTitle>Contact Support</HelpTitle>
              <HelpDescription>Get help from our support team</HelpDescription>
            </HelpText>
          </HelpButton>

          <HelpButton onClick={() => handleHelpClick('Smart Contract')}>
            <HelpIcon>🔗</HelpIcon>
            <HelpText>
              <HelpTitle>Smart Contract Info</HelpTitle>
              <HelpDescription>View contract addresses and verification</HelpDescription>
            </HelpText>
          </HelpButton>
        </HelpSection>
      </Card>

      {/* App Info */}
      <Card>
        <CardTitle>ℹ️ About</CardTitle>
        <SettingsSection>
          <SettingItem>
            <SettingLabel>Built for</SettingLabel>
            <SettingValue>KAIA Blockchain</SettingValue>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>Powered by</SettingLabel>
            <SettingValue>AI + DeFi</SettingValue>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>License</SettingLabel>
            <SettingValue>Open Source</SettingValue>
          </SettingItem>
        </SettingsSection>
      </Card>
    </PageContainer>
  );
};

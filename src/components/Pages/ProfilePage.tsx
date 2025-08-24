'use client';

import styled from 'styled-components';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import useTokenBalances from '@/hooks/useTokenBalances';
import TokenFaucet from '@/components/Wallet/TokenFaucet';
import TokenIcon from '@/components/Wallet/TokenIcon';

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
 

const BalanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const BalanceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const BalanceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TokenIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TokenDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const TokenSymbol = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1;
`;

const TokenBalance = styled.span`
  font-size: 11px;
  color: #64748b;
  line-height: 1;
  margin-top: 2px;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LastUpdate = styled.div`
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
  margin-bottom: 16px;
`;

const FaucetSection = styled.div`
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
`;

const FaucetTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FaucetDescription = styled.p`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
  line-height: 1.4;
`;

export const ProfilePage = () => {
  const { account } = useWalletAccountStore();
  const { balances, isLoading, lastUpdate, refreshBalances } = useTokenBalances();

  const handleHelpClick = (section: string) => {
    alert(`${section} help coming soon!\n\nFor now, check our documentation or contact support.`);
  };

  const handleRefreshBalances = () => {
    refreshBalances();
  };

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  if (!account) {
    return (
      <PageContainer>
        <PageTitle>Profile</PageTitle>
        <PageSubtitle>
          View and manage your account details
        </PageSubtitle>

        <ConnectPrompt>
          <ConnectIcon>👤</ConnectIcon>
          <h3 style={{ marginBottom: '8px', color: '#1e293b' }}>Wallet Not Connected</h3>
          <p>Please connect your wallet to access this section</p>
        </ConnectPrompt>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Profile</PageTitle>
      <PageSubtitle>
        View and manage your account details
      </PageSubtitle>


      {/* Token Balances */}
      <Card>
        <CardTitle>💰 Token Balances</CardTitle>

        {/* <RefreshButton onClick={handleRefreshBalances} disabled={isLoading}>
          {isLoading ? '⟳' : '🔄'} {isLoading ? 'Refreshing...' : 'Refresh Balances'}
        </RefreshButton> */}

        <BalanceGrid>
          {balances.map((balance) => (
            <BalanceItem key={balance.symbol}>
              <BalanceInfo>
                <TokenIconContainer>
                  <TokenIcon
                    icon={balance.icon}
                    iconType={balance.iconType}
                    alt={balance.name}
                    size={20}
                  />
                </TokenIconContainer>
                <TokenDetails>
                  <TokenSymbol>{balance.symbol}</TokenSymbol>
                  <TokenBalance>
                    {balance.isLoading ? 'Loading...' : balance.formattedBalance}
                  </TokenBalance>
                </TokenDetails>
              </BalanceInfo>
            </BalanceItem>
          ))}
        </BalanceGrid>

        <LastUpdate>
          Last updated: {formatLastUpdate(lastUpdate)}
        </LastUpdate>

        <FaucetSection>
          <FaucetTitle>
            🚰 Test Token Faucet
          </FaucetTitle>
          <FaucetDescription>
          We're on Testnet with mock tokens. Use this faucet to get tokens for evaluation.
          </FaucetDescription>

          <TokenFaucet onSuccess={handleRefreshBalances} />
        </FaucetSection>
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
 
    </PageContainer>
  );
};

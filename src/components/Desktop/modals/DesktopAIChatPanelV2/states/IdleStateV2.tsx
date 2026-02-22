import React from 'react';
import styled from 'styled-components';
import { Star, Shield, ArrowRight, Zap, User } from 'react-feather';

interface IdleStateV2Props {
  onCreateWallet: () => void;
  isLoading: boolean;
  onToggle: () => void;
  account: any;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const AIIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #06C755, #059212);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 8px 32px rgba(6, 199, 85, 0.3);
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

const AIIconInner = styled.img`
  width: 48px;
  height: 48px;
  filter: brightness(0) invert(1);
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
   

const ActionSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  text-align: center;
`;

const ActionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px;
`;

const ActionDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px;
  line-height: 1.4;
`;

const CreateButton = styled.button<{ $isLoading?: boolean }>`
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #06C755, #059212);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(6, 199, 85, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SkipButton = styled.button`
  margin-top: 12px;
  padding: 8px 16px;
  background: transparent;
  color: #64748b;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #1e293b;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// No Account State Components
const WalletStatusIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #06C755, #059212);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 8px 32px rgba(6, 199, 85, 0.3);
  color: white;
`;

const WalletStatusMessage = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.4;
`;

const ConnectButton = styled.button`
  width: 100%;
  padding: 14px 20px;
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const IdleStateV2: React.FC<IdleStateV2Props> = ({
  onCreateWallet,
  isLoading,
  onToggle,
  account
}) => {
  // If no account is connected, show wallet connection prompt
  if (!account) {
    return (
      <Container>
        <Header>
          <AIIcon>
            <AIIconInner src="/images/icon-robot.png" alt="Agent Playground" />
          </AIIcon>
          <Title>Agent Playground</Title>
          <Subtitle>You can use this environment to evaluate AI agent capabilities</Subtitle>
        </Header>

        <Content> 
          <ActionSection>
            <WalletStatusIcon>
              <User size={32} />
            </WalletStatusIcon>
            <WalletStatusMessage>
              Please connect your wallet first to continue
            </WalletStatusMessage>
            <ConnectButton onClick={onToggle}>
              Close
            </ConnectButton>
          </ActionSection>
        </Content>
      </Container>
    );
  }

  // Show the original create wallet flow when account is connected
  return (
    <Container>
      <Header>
        <AIIcon>
          <AIIconInner src="/images/icon-robot.png" alt="Agent Playground" />
        </AIIcon>
        <Title>Agent Playground</Title>
        <Subtitle>You can use this environment to evaluate AI agent capabilities</Subtitle>
      </Header>

      <Content> 
        <ActionSection>
          <ActionTitle>Get Started with AI Chat</ActionTitle>
          <ActionDescription>
            Create your Agent Wallet to start interacting with your AI agent (limited to 3 messages per day)
          </ActionDescription>
          <CreateButton onClick={onCreateWallet} disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner />
                Creating Agent Wallet...
              </>
            ) : (
              <>
                Create Agent Wallet
                <ArrowRight size={18} />
              </>
            )}
          </CreateButton>
          
          <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
              <strong>Use OpenClaw to unlock 24/7 automation, continuous execution, and no message limits</strong>
            </p>
          </div>
          
          <SkipButton onClick={onToggle}>
            Maybe later
          </SkipButton>
        </ActionSection>
      </Content>
    </Container>
  );
};

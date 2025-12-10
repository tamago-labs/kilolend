import styled from 'styled-components';
import { Info, Plus } from 'react-feather';
import { KAIA_MAINNET_TOKENS } from '@/utils/tokenConfig';
import { AIWalletStatus } from '@/services/aiWalletService';

// Styled components for AI wallet section
const PortfolioSection = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  padding: 20px 32px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const AssetList = styled.div`
  padding: 16px 0;
`;

const AssetItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AssetIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
`;

const TokenIconImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: contain;
`;

const AssetDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AssetName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const AssetSymbol = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const AssetStats = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
`;

const AssetValue = styled.div`
  text-align: right;
`;

const ValueLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
`;

const ValueAmount = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

const StatusSection = styled.div`
  background: linear-gradient(135deg, #fef3c7, #fef9e7);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 0 32px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusIcon = styled.div`
  color: #f59e0b;
  flex-shrink: 0;
`;

const StatusContent = styled.div`
  flex: 1;
`;

const StatusTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 4px;
`;

const StatusText = styled.div`
  font-size: 13px;
  color: #78350f;
  line-height: 1.4;
`;

const CreateWalletSection = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin: 0 32px 32px;
`;

const CreateWalletIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #06C755, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
`;

const CreateWalletTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const CreateWalletDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 20px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
`;

const CreateWalletButton = styled.button<{ $loading?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #06C755, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 auto;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #64748b;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyStateText = styled.div`
  font-size: 16px;
  margin-bottom: 24px;
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(6, 199, 85, 0.3);
  }
`;

const WithdrawNote = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  margin: 0 32px 20px;
  color: #92400e;
  font-size: 14px;
`;

interface AIWalletSectionProps {
  aiWalletData: AIWalletStatus | null;
  aiBalances: any[];
  prices: Record<string, any>;
  isCreatingAIWallet: boolean;
  onCreateAIWallet: () => void;
}

export const AIWalletSection = ({ 
  aiWalletData, 
  aiBalances, 
  prices, 
  isCreatingAIWallet, 
  onCreateAIWallet 
}: AIWalletSectionProps) => {
  const getTokenIcon = (symbol: string) => {
    if (symbol === 'KAIA') {
      return 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png';
    }
    const tokenConfig = KAIA_MAINNET_TOKENS[symbol as keyof typeof KAIA_MAINNET_TOKENS];
    return tokenConfig?.icon || 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png';
  };

  const formatBalance = (balance: string, symbol: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const getTokenValue = (token: any) => {
    const priceKey = token.symbol === 'MBX' ? 'MARBLEX' : token.symbol;
    const price = prices[priceKey];
    const balance = parseFloat(token.balance || '0');
    return price ? balance * price.price : 0;
  };

  return (
    <PortfolioSection>
      <SectionHeader>
        <SectionTitle>AI Wallet</SectionTitle>
      </SectionHeader>
      
      {!aiWalletData?.aiWalletAddress ? (
        <>
          {aiWalletData?.status && (
            <StatusSection>
              <StatusIcon>
                <Info size={20} />
              </StatusIcon>
              <StatusContent>
                <StatusTitle>Early Access</StatusTitle>
                <StatusText>
                  AI Wallet is currently in beta phase with {aiWalletData.status.usedWallets}/{aiWalletData.status.totalWallets} slots available
                  {aiWalletData.status.usedWallets >= aiWalletData.status.totalWallets && (
                    <div style={{ marginTop: '8px', fontWeight: '600', color: '#dc2626' }}>
                      All slots are currently taken. Please check back later.
                    </div>
                  )}
                </StatusText>
              </StatusContent>
            </StatusSection>
          )}

          <CreateWalletSection>
            <CreateWalletIcon>
              <Plus size={32} />
            </CreateWalletIcon>
            <CreateWalletTitle>Create Your AI Wallet</CreateWalletTitle>
            <CreateWalletDescription>
              Enable your AI agent to trade autonomously with advanced strategies across multiple DeFi protocols
            </CreateWalletDescription>
            <CreateWalletButton 
              onClick={onCreateAIWallet} 
              $loading={isCreatingAIWallet} 
              disabled={isCreatingAIWallet || (aiWalletData?.status && aiWalletData.status.usedWallets >= aiWalletData.status.totalWallets)}
            >
              <Plus size={16} />
              {(aiWalletData?.status && aiWalletData.status.usedWallets >= aiWalletData.status.totalWallets) ? 'Capacity Full' : isCreatingAIWallet ? 'Creating...' : 'Create AI Wallet'}
            </CreateWalletButton>
          </CreateWalletSection>
        </>
      ) : (
        <>
          <AssetList>
            {aiBalances.map((token: any) => (
              <AssetItem key={token.symbol}>
                <AssetInfo>
                  <AssetIcon>
                    <TokenIconImage 
                      src={getTokenIcon(token.symbol)} 
                      alt={token.symbol}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        if (img.parentElement) {
                          img.parentElement.innerHTML = `<span style="font-size: 14px; font-weight: 700;">${token.symbol.charAt(0)}</span>`;
                        }
                      }}
                    />
                  </AssetIcon>
                  <AssetDetails>
                    <AssetName>{token.name}</AssetName>
                    <AssetSymbol>{token.symbol}</AssetSymbol>
                  </AssetDetails>
                </AssetInfo>
                <AssetStats>
                  <AssetValue>
                    <ValueLabel>Balance</ValueLabel>
                    <ValueAmount>{formatBalance(token.balance, token.symbol)} {token.symbol}</ValueAmount>
                  </AssetValue>
                  <AssetValue>
                    <ValueLabel>Value</ValueLabel>
                    <ValueAmount>${getTokenValue(token).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ValueAmount>
                  </AssetValue>
                </AssetStats>
              </AssetItem>
            ))}
          </AssetList>
          
        </>
      )}
    </PortfolioSection>
  );
};
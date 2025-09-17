'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';
import { useModalStore } from '@/stores/modalStore';
import { PRICE_API_CONFIG, KAIA_MAINNET_TOKENS } from '@/utils/tokenConfig';
import Blockies from 'react-blockies';
import { AlertCircle, RefreshCw, HelpCircle, MessageCircle, Settings } from 'react-feather';
import { liff } from "@/utils/liff";
import { ExternalLink } from 'react-feather';

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

const ProfileSection = styled.div<{ $clickable?: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 24px; 
  margin-bottom: 24px;
  margin-top: -8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: all 0.2s;

  ${({ $clickable }) => $clickable && `
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      border-color: #cbd5e1;
    }
  `}

  @media (max-width: 480px) {
    padding: 20px;
    margin-bottom: 20px;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px; 

  @media (max-width: 480px) {
    gap: 12px; 
  }
`;

const ProfileAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00C300, #00A000);

  @media (max-width: 480px) {
    width: 56px;
    height: 56px;
  }
`;

const LineProfilePicture = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const OverviewContainer = styled.div`
  display: flex;
  gap: 12px; 

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftSection = styled.div`
  
  
   width: 320px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const RightSection = styled.div`
 flex: 1;
  min-width: 0;
`;

const WalletAddress = styled.div<{ $clickable?: boolean }>`
  font-family: monospace;
  font-size: 14px;
  color: #64748b;
  word-break: break-all;
  display: flex;
  align-items: center;
  gap: 8px;

   

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const TotalBalanceSection = styled.div`
  text-align: center;
  padding-bottom: 3px;
`;

const TotalBalanceLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
`;

const TotalBalanceValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const TokensSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;

  @media (max-width: 480px) {
    padding: 20px;
    margin-bottom: 20px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const SectionTitle2 = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 16px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const RefreshButton = styled.button<{ $loading?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  svg {
    animation: ${({ $loading }) => $loading ? 'spin 1s linear infinite' : 'none'};
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const FaucetButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
 
`;

const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TokenRow = styled.div<{ $hasBalance?: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px;
  background: ${({ $hasBalance }) => $hasBalance ? '#f8fafc' : '#fafbfc'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${({ $hasBalance }) => $hasBalance ? 'transparent' : '#f1f5f9'};
  opacity: ${({ $hasBalance }) => $hasBalance ? 1 : 0.7};

  &:hover {
    background: #f1f5f9;
    border-color: #e2e8f0;
    transform: translateY(-1px);
    opacity: 1;
  }

  @media (max-width: 480px) {
    padding: 14px;
  }
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

const TokenIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    margin-right: 10px;
  }
`;

const TokenIconImage = styled.img`
  width: 75%;
  height: 75%;
  object-fit: contain;
`;

const TokenInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TokenName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
  margin-bottom: 2px;

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const TokenPrice = styled.div<{ $positive?: boolean }>`
  font-size: 13px;
  color: ${({ $positive }) => $positive ? '#06C755' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const TokenBalance = styled.div`
  text-align: right;
`;

const TokenBalanceAmount = styled.div<{ $hasBalance?: boolean }>`
  font-weight: 600;
  color: ${({ $hasBalance }) => $hasBalance ? '#1e293b' : '#94a3b8'};
  font-size: 16px;
  margin-bottom: 2px;

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const TokenBalanceValue = styled.div<{ $hasBalance?: boolean }>`
  font-size: 13px;
  color: ${({ $hasBalance }) => $hasBalance ? '#64748b' : '#cbd5e1'};

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
`;

const SupportSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const SupportButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const SupportButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;

  ${({ $primary }) => $primary
    ? `
      background: linear-gradient(135deg, #00C300, #00A000);
      color: white;
      border-color: transparent;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 195, 0, 0.3);
      }
    `
    : `
      background: white;
      color: #64748b;
      border-color: #e2e8f0;
      
      &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
    `
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #64748b;
`;

const ZeroBalanceText = styled.span`
  color: #94a3b8;
  font-style: italic;
`;

const InfoMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #dbeafe;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const MessageText = styled.span`
  font-size: 14px;
`;

// External Links Section Styles
const ExternalLinksSection = styled.div`
  margin-bottom: 32px;
`;

const LinksContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`;

const LinkItem = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
  }
`;


const LinkTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const LinkDescription = styled.div`
  font-size: 12px;
  color: #64748b;
  text-align: center;
  line-height: 1.3;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const ExternalLinkIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  color: #94a3b8;
`;

interface LineProfile {
  displayName: string;
  pictureUrl: string;
  userId: string;
}

export const ProfilePage = () => {
  const { account } = useWalletAccountStore();
  const { balances, isLoading, refreshBalances } = useTokenBalances();
  const { openModal } = useModalStore();

  const [lineProfile, setLineProfile] = useState<LineProfile | null>(null);
  const [totalUSDValue, setTotalUSDValue] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Get prices for tokens we have API data for
  const apiTokens = PRICE_API_CONFIG.supportedTokens;
  const { prices, getFormattedPrice, getFormattedChange, isLoading: pricesLoading } = usePriceUpdates({
    symbols: ["MBX", ...apiTokens]
  });

  useEffect(() => {
    if (liff.isInClient()) {
      liff.getProfile().then(
        ({ userId, displayName, pictureUrl }) => {
          setLineProfile({
            userId,
            displayName,
            pictureUrl: pictureUrl || "https://kilolend.xyz/images/kilo-icon.png"
          })
        })
    }
  }, []);

  // Calculate total USD value using only real price data
  useEffect(() => {
    let total = 0;

    balances.forEach(balance => {
      // Handle MBX -> MARBLEX mapping for price lookup
      const priceKey = balance.symbol === 'MBX' ? 'MBX' : balance.symbol;
      const price = prices[priceKey];

      if (price && parseFloat(balance.balance) > 0) {
        total += parseFloat(balance.balance) * price.price;
      }
    });

    setTotalUSDValue(total);
  }, [balances, prices]);

  // Create a comprehensive list of all supported tokens (with and without balances)
  const getAllSupportedTokens = () => {
    const supportedTokenSymbols = ['KAIA', 'USDT', 'MBX', 'BORA', 'SIX'];
    const tokensList: any = [];

    supportedTokenSymbols.forEach(symbol => {
      // Find existing balance
      const existingBalance = balances.find(b => b.symbol === symbol);

      if (existingBalance) {
        // Use existing balance data
        tokensList.push(existingBalance);
      } else {
        // Create placeholder for tokens with zero balance
        const tokenConfig = symbol === 'KAIA' ?
          {
            symbol: 'KAIA',
            name: 'KAIA',
            balance: '0',
            formattedBalance: '0',
            decimals: 18,
            icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
            iconType: 'image' as const,
            isLoading: false,
            error: null
          } :
          KAIA_MAINNET_TOKENS[symbol as keyof typeof KAIA_MAINNET_TOKENS] ?
            {
              symbol,
              name: KAIA_MAINNET_TOKENS[symbol as keyof typeof KAIA_MAINNET_TOKENS].name,
              balance: '0',
              formattedBalance: '0',
              decimals: KAIA_MAINNET_TOKENS[symbol as keyof typeof KAIA_MAINNET_TOKENS].decimals,
              icon: KAIA_MAINNET_TOKENS[symbol as keyof typeof KAIA_MAINNET_TOKENS].icon,
              iconType: KAIA_MAINNET_TOKENS[symbol as keyof typeof KAIA_MAINNET_TOKENS].iconType,
              isLoading: false,
              error: null
            } : null;

        if (tokenConfig) {
          tokensList.push(tokenConfig);
        }
      }
    });

    return tokensList;
  };

  const displayTokens = getAllSupportedTokens();

  const handleTokenClick = (tokenSymbol: string) => {
    // Handle MBX -> MARBLEX mapping for price lookup
    const priceKey = tokenSymbol === 'MBX' ? 'MBX' : tokenSymbol;

    const tokenData = {
      symbol: tokenSymbol,
      balance: balances.find(b => b.symbol === tokenSymbol) || {
        symbol: tokenSymbol,
        balance: '0',
        formattedBalance: '0'
      },
      price: prices[priceKey]
    };

    openModal('token-details', tokenData);
  };

  const handleRefresh = () => {
    refreshBalances();
  };

  const handleOpenFaucet = () => {
    openModal('faucet');
  };

  const handleProfileClick = () => {
    if (account) {
      openModal('wallet-address', { walletAddress: account });
    }
  };

  const handleExternalLink = (url: string, name: string) => {
    if (liff.isInClient()) {
      liff.openWindow({
        url: url,
        external: true,
      });
    } else {
      window.open(url, '_blank');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <PageContainer>
      <PageTitle>Profile</PageTitle>
      <PageSubtitle>
        View and manage your account details
      </PageSubtitle>

      {/* Profile Section */}

      <OverviewContainer>
        <LeftSection>
          {(lineProfile || account) && (
            <ProfileSection
              $clickable={!!account}
              onClick={handleProfileClick}
              title={account ? "Click to view wallet address and QR code" : ""}
            >
              <ProfileHeader>
                <ProfileAvatar>
                  {lineProfile?.pictureUrl ? (
                    <LineProfilePicture src={lineProfile.pictureUrl} alt="Profile" />
                  ) : (
                    <Blockies seed={account || "1234"} size={8} scale={8} />
                  )}
                </ProfileAvatar>
                <ProfileInfo>
                  <ProfileName>
                    {lineProfile?.displayName || "Wallet User"}
                  </ProfileName>
                  <WalletAddress>
                    Click to open details
                  </WalletAddress>
                </ProfileInfo>
              </ProfileHeader>
            </ProfileSection>
          )}

        </LeftSection>
        {account && (
          <RightSection>
            <ProfileSection>
              <TotalBalanceSection>
                <TotalBalanceLabel>Total Value</TotalBalanceLabel>
                <TotalBalanceValue>
                  ${totalUSDValue.toFixed(2)}
                </TotalBalanceValue>
              </TotalBalanceSection>
            </ProfileSection>
          </RightSection>
        )}
      </OverviewContainer>
      {!account && (
        <InfoMessage>
          <AlertCircle size={16} color="#3b82f6" />
          <MessageText style={{ color: '#1e40af' }}>Please connect your wallet to access full function</MessageText>
        </InfoMessage>
      )}

      {/* Tokens Section */}
      <TokensSection>
        <SectionHeader>
          <SectionTitle>Available Tokens</SectionTitle>
          <HeaderActions>
            {/* <FaucetButton onClick={handleOpenFaucet}>
              Get Test Tokens
            </FaucetButton> */}
            <RefreshButton onClick={handleRefresh} $loading={isLoading}>
              <RefreshCw size={16} />
              Refresh
            </RefreshButton>
          </HeaderActions>
        </SectionHeader>

        {isLoading && balances.length === 0 ? (
          <LoadingSpinner>Loading balances...</LoadingSpinner>
        ) : (
          <TokenList>
            {displayTokens.map((token: any) => {
              const priceKey = token.symbol === 'MBX' ? 'MBX' : token.symbol;

              const priceData = prices[priceKey];
              const change = getFormattedChange(priceKey);
              const currentPrice = getFormattedPrice(priceKey);
              const hasBalance = parseFloat(token.balance) > 0;
              const usdValue = priceData && hasBalance ? parseFloat(token.balance) * priceData.price : 0;

              return (
                <TokenRow
                  key={token.symbol}
                  $hasBalance={hasBalance}
                  onClick={() => account && handleTokenClick(token.symbol)}
                >
                  <TokenIcon>
                    <TokenIconImage
                      src={token.icon}
                      alt={token.symbol}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        if (img.parentElement) {
                          img.parentElement.innerHTML = `<b>${token.symbol.charAt(0)}</b>`;
                        }
                      }}
                    />
                  </TokenIcon>

                  <TokenInfo>
                    <TokenName>{token.name}</TokenName>
                    {priceData ? (
                      <TokenPrice $positive={change.isPositive}>
                        {currentPrice}
                        <span>{change.text}</span>
                      </TokenPrice>
                    ) : (
                      <TokenPrice $positive={true}>
                        {pricesLoading ? 'Loading...' : 'Price unavailable'}
                      </TokenPrice>
                    )}
                  </TokenInfo>

                  <TokenBalance>
                    <TokenBalanceAmount $hasBalance={hasBalance}>
                      {hasBalance ?
                        `${parseFloat(token.formattedBalance).toFixed(4)} ${token.symbol}` :
                        <ZeroBalanceText>0 {token.symbol}</ZeroBalanceText>
                      }
                    </TokenBalanceAmount>
                    <TokenBalanceValue $hasBalance={hasBalance}>
                      {hasBalance ? `$${usdValue.toFixed(2)}` : <ZeroBalanceText>$0.00</ZeroBalanceText>}
                    </TokenBalanceValue>
                  </TokenBalance>
                </TokenRow>
              );
            })}
          </TokenList>
        )}
      </TokensSection>

      {/* Support Section */}
      {/* <SupportSection>
        <SectionTitle>Need Help?</SectionTitle>
        <SupportButtons>
          <SupportButton $primary onClick={() => openModal('faq')}>
            <HelpCircle size={16} />
            Get Support
          </SupportButton>
          <SupportButton onClick={() => alert('Email to support@tamagolabs.com')}>
            <MessageCircle size={16} />
            Send Feedback
          </SupportButton>
        </SupportButtons>
      </SupportSection> */}

      {/* External Links Section */}
      <ExternalLinksSection>
        <SectionTitle2>Resources</SectionTitle2>
        <LinksContainer>
          <LinksGrid>
            <LinkItem
              as="div"
              onClick={() => handleExternalLink('https://github.com/tamago-labs/kilolend', 'GitHub')}
              style={{ position: 'relative' }}
            >
              <ExternalLinkIndicator>
                <ExternalLink size={16} />
              </ExternalLinkIndicator>
              <LinkTitle>GitHub</LinkTitle>
              <LinkDescription>
                View source code and all contract addresses
              </LinkDescription>
            </LinkItem>

            <LinkItem
              as="div"
              onClick={() => handleExternalLink('https://dune.com/pisuthd/kilolend-protocol-analytics', 'Dune Analytics')}
              style={{ position: 'relative' }}
            >
              <ExternalLinkIndicator>
                <ExternalLink size={16} />
              </ExternalLinkIndicator>
              <LinkTitle>Dashboard</LinkTitle>
              <LinkDescription>
                Explore metrics and analytics on Dune
              </LinkDescription>
            </LinkItem>

            <LinkItem
        as="div"
        onClick={() => handleExternalLink('https://docs.kilolend.xyz', 'Documentation')}
        style={{ position: 'relative' }}
      >
        <ExternalLinkIndicator>
          <ExternalLink size={16} />
        </ExternalLinkIndicator>
        <LinkTitle>Documentation</LinkTitle>
        <LinkDescription>
          Complete protocol guide and technical docs
        </LinkDescription>
      </LinkItem>

      <LinkItem
        as="div"
        onClick={() => handleExternalLink('https://lin.ee/r8bOhDU', 'LINE Official')}
        style={{ position: 'relative' }}
      >
        <ExternalLinkIndicator>
          <ExternalLink size={16} />
        </ExternalLinkIndicator>
        <LinkTitle>LINE Official</LinkTitle>
        <LinkDescription>
          Follow our official LINE account for updates
        </LinkDescription>
      </LinkItem>

          </LinksGrid>
        </LinksContainer>
      </ExternalLinksSection>
    </PageContainer>
  );
};
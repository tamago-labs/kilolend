'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useModalStore } from '@/stores/modalStore';
import { useContractMarketData } from '@/hooks/useContractMarketData';
import { AILoading } from '@/components/AIDeals/AILoading';
import { useAIDealsStore } from '@/stores/aiDealsStore';
import TokenIcon from "../Wallet/TokenIcon"

const PageContainer = styled.div`
  flex: 1;
  padding: 20px 16px;
  padding-bottom: 80px;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const BrandLogo = styled.img`
  width: 240px; /* larger for miniapp visibility */
  height: auto;
  margin-bottom: 12px;
  animation: fadeInScale 0.8s ease-out;

  @keyframes fadeInScale {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const HeroSubtitle = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.4;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const SectionSubtitle = styled.p`
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
`;

const ChatContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ChatTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BotIcon = styled.div`
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #00C300, #00A000);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

const ChatDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
  cursor: pointer;
`;

const ChatInput = styled.div`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.5;
  min-height: 80px;
  outline: none;
  transition: border-color 0.2s;
  background: #f8fafc;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #94a3b8;

  &:hover {
    border-color: #00C300;
    background: #f1f5f9;
  }
`;

const AskButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #00C300, #00A000);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 195, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ExampleQuestions = styled.div`
  margin-top: 20px;
`;

const ExampleTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
`;

const ExampleCard = styled.button`
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;

  &:hover {
    background: #f1f5f9;
    border-color: #00C300;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ExampleText = styled.span`
  color: #475569;
  font-size: 14px;
  line-height: 1.4;
`;

// Cards Section
const CardsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
`;

const CardDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
`;

// Market Summary Card
const MarketGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const MarketStat = styled.div`
  text-align: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const StatChange = styled.span<{ $positive?: boolean }>`
  font-size: 12px;
  color: ${props => props.$positive ? '#00C300' : '#ef4444'};
  font-weight: 500;
`;

// Quick Actions Card
const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const ActionIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  font-size: 16px;
`;

const ActionLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const ActionRate = styled.div`
  font-size: 12px;
  color: #00C300;
  font-weight: 500;
`;

const MarketRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  transition: all 0.2s;

  &:hover {
    border-color: #00C300;
    box-shadow: 0 4px 12px rgba(0, 195, 0, 0.1);
  }
`;

const MarketInfo = styled.div`
  display: flex;
  align-items: center;
`;

const MarketIcon = styled.div`
  width: 24px;
  height: 24px;
  overflow: hidden;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
`;

const MarketDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const MarketName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const MarketRates = styled.div`
  display: flex;
  gap: 12px;
`;

const RateLabel = styled.div`
  font-size: 12px;
  color: #475569;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $supply?: boolean; $borrow?: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  ${({ $supply }) =>
    $supply &&
    `
    background: #00C300;
    color: white;
    &:hover { background: #00a000; }
  `}

  ${({ $borrow }) =>
    $borrow &&
    `
    background: #f3f4f6;
    color: #1e293b;
    &:hover { background: #e2e8f0; }
  `}
`;

// Educational Card
const EducationalContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const EducationalIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #00C300, #00A000);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4px;
`;

const EducationalText = styled.div`
  flex: 1;
`;


const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: #f0fdf4;
  border: 1px solid #00C300;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const LoadingText = styled.span`
  color: #166534;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
`;

const LearnButton = styled.button`
  background: linear-gradient(135deg, #00C300, #00A000);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 195, 0, 0.3);
  }
`;

// Quick Action Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalForm = styled.div`
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #00C300;
  }
`;

const InfoBox = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const InfoValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ModalButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #00C300, #00A000);
    color: white;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 195, 0, 0.3);
    }
  ` : `
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #f8fafc;
    }
  `}
`;

// AI Chat Modal Styles
const AIModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const AIModalInput = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  min-height: 100px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;

  &:focus {
    border-color: #00C300;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const AIModalExamples = styled.div`
  margin-top: 16px;
  max-height: 200px;
  overflow-y: auto;
`;

const AIModalButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

interface HomePageProps {
  onAIDealsGenerated?: (userQuery: string) => void;
}

export const HomePage = ({ onAIDealsGenerated }: HomePageProps) => {
  const [userQuery, setUserQuery] = useState('I want to earn 5% on my USDT with low risk');

  const { isGenerating } = useAIDealsStore();
  const { openModal } = useModalStore();

  // Use contract-based market data
  const {
    markets,
    // totalTVL,
    // bestSupplyAPY,
    // bestBorrowAPR,
    // avgUtilization,
    // getBestSupplyMarket,
    // getBestBorrowMarket,
    isLoading: marketsLoading
  } = useContractMarketStore();

  // Initialize contract data fetching
  useContractMarketData();

  // const bestSupplyMarket = getBestSupplyMarket();
  // const bestBorrowMarket = getBestBorrowMarket();
  const activeMarkets = markets.filter(m => m.isActive && !m.isCollateralOnly);


  const handleOpenAIModal = () => {
    openModal('ai-chat', { userQuery });
  };

  const handleQuickAction = (marketId: string, action: 'supply' | 'borrow') => {
    openModal(action, { marketId, action });
  };

  const formatTVL = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return `${value.toFixed(0)}`;
  };

  // Show loading state if AI is generating
  if (isGenerating) {
    return (
      <PageContainer>
        <AILoading query={userQuery} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>

      {/* Loading Indicator */}
      {/* {marketsLoading && (
        <LoadingIndicator>
          🔄
          <LoadingText>Loading market data from contracts...</LoadingText>
        </LoadingIndicator>
      )} */}

      <HeroSection>
        <BrandLogo src="images/kilolend-logo.png" alt="KiloLend" />
        <HeroSubtitle>
          🎉 Now Live on Kaia Kairos Testnet
        </HeroSubtitle>
      </HeroSection>

      <Card>
        <EducationalContent>
          <CardTitle>👋</CardTitle>
          <EducationalText>
            <CardTitle style={{ marginBottom: '8px' }}>Welcome to KiloLend</CardTitle>
            <CardDescription style={{ marginBottom: '0' }}>
              Lend and borrow a wide range of stablecoins on Kaia. AI guides you to earn yield or unlock crypto-backed loans in one click.
            </CardDescription>
            <LearnButton>
              Video Tutorial
            </LearnButton>
          </EducationalText>
        </EducationalContent>
      </Card>
      <br />

      <ChatContainer>
        <ChatTitle>
          <BotIcon>AI</BotIcon>
          KiloBot Assistant
        </ChatTitle>

        <ChatDescription>
          Describe your lending or borrowing needs in natural language. Our AI will analyze the markets and create personalized deals just for you.
        </ChatDescription>

        <InputContainer onClick={handleOpenAIModal}>
          <ChatInput>
            {userQuery}
          </ChatInput>
        </InputContainer>

        <AskButton
          onClick={handleOpenAIModal}
        >
          Ask AI for Deals 🤖
        </AskButton>
      </ChatContainer>

      <CardsSection>


        {/* Market Actions Card */}
        <Card>
          <CardTitle>⚡ Quick Actions</CardTitle>
          <CardDescription>
            Start earning or borrowing stablecoins with ease
          </CardDescription>

          {activeMarkets.map((market: any) => (
            <MarketRow key={market.id}>
              <MarketInfo>
                <MarketIcon>
                <TokenIcon 
                      icon={market.icon} 
                      iconType={market.iconType}
                      alt={market.name}
                      size={24}
                    />
                </MarketIcon>
                <MarketDetails>
                  <MarketName>{market.symbol}</MarketName>
                  <MarketRates>
                    <RateLabel>Supply: {market.supplyAPY.toFixed(1)}% APY</RateLabel>
                    <RateLabel>Borrow: {market.borrowAPR.toFixed(1)}% APR</RateLabel>
                  </MarketRates>
                </MarketDetails>
              </MarketInfo>

              <ActionButtons>
                <ActionButton onClick={() => handleQuickAction(market.id, 'supply')} $supply>
                  Supply
                </ActionButton>
                <ActionButton onClick={() => handleQuickAction(market.id, 'borrow')} $borrow>
                  Borrow
                </ActionButton>
              </ActionButtons>
            </MarketRow>
          ))}
        </Card>

        {/* Educational Card */}
        <Card>
          <EducationalContent>
            <EducationalIcon>
              🎓
            </EducationalIcon>
            <EducationalText>
              <CardTitle style={{ marginBottom: '8px' }}>New to DeFi?</CardTitle>
              <CardDescription style={{ marginBottom: '0' }}>
                Learn how decentralized lending works and start earning passive income with your crypto assets safely.
              </CardDescription>
              <LearnButton>
                Learn the Basics
              </LearnButton>
            </EducationalText>
          </EducationalContent>
        </Card>
      </CardsSection>
    </PageContainer>
  );
};

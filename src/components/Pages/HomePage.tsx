'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useModalStore } from '@/stores/modalStore';

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

const TopCardsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 24px;
  }
`;

const Card = styled.div<{ $gradient?: boolean }>`
  border-radius: 8px;
  
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  ${({ $gradient }) =>
    $gradient
      ? `
    background: linear-gradient(135deg, #1e293b, #06C755);
    color: white; 
    min-height: 180px;
    
    &::before {
      content: '';
      position: absolute;
      top: -30%;
      right: -30%;
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      z-index: 0;
    }
  `
      : `
    background: white;
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 10px;
  }
`;

const CardContent = styled.div`
  position: relative;
  z-index: 1;
`;

const CardIcon = styled.div<{ $white?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $white }) =>
    $white
      ? 'rgba(255, 255, 255, 0.2)'
      : 'linear-gradient(135deg, #06C755, #04A94A)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 16px;

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 14px;
    margin-bottom: 10px;
  }
`;

const CardTitle = styled.h3<{ $white?: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: ${({ $white }) => ($white ? 'white' : '#1e293b')};
  margin-bottom: 6px;
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 4px;
  }
`;

const CardValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #06C755;
  margin-bottom: 4px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const CardSubtext = styled.div<{ $white?: boolean }>`
  font-size: 12px;
  color: ${({ $white }) => ($white ? 'rgba(255, 255, 255, 0.8)' : '#64748b')};
  line-height: 1.3;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const IconImage = styled.img`
  width: 80%;
  height: 80%;
  object-fit: contain;
  
  @media (max-width: 480px) {
    width: 65%;
    height: 65%;
  }
`;

const ActionsSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
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

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
  max-width: 400px; /* cap width */
  margin: 0 auto; /* center horizontally */
`;

const IconButton = styled.div<{ $primary?: boolean; $secondary?: boolean; $accent?: boolean; $warning?: boolean; $info?: boolean }>`
  display: flex;
  flex-direction: column; 
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 12px 8px;
  border-radius: 12px;
  

  @media (max-width: 480px) {
    padding: 4px 6px;
    border-radius: 8px;
  }
`;

const gradients = [
  "linear-gradient(135deg, #06C755, #04A94A)", // green
  "linear-gradient(135deg, #3b82f6, #1d4ed8)", // blue
  "linear-gradient(135deg, #8b5cf6, #7c3aed)", // purple
  "linear-gradient(135deg, #f59e0b, #d97706)", // orange
  "linear-gradient(135deg, #06b6d4, #0891b2)", // cyan
  "linear-gradient(135deg, #ec4899, #db2777)", // pink
  "linear-gradient(135deg, #9ca3af, #6b7280)", // gray
  "linear-gradient(135deg, #1f2937, #111827)", // black/dark 
];

const IconCircle = styled.div<{ $primary?: boolean; $secondary?: boolean; $accent?: boolean; $warning?: boolean; $info?: boolean }>`
  width: 100%;
  aspect-ratio: 1 / 1; /* keep perfect square */
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(24px, 4vw, 40px); /* scale with screen size */
  margin-bottom: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  background: ${({ $index }) => gradients[Number($index)! % gradients.length]};
 

  @media (max-width: 480px) {
    font-size: clamp(18px, 6vw, 28px);
    margin-bottom: 6px;
    border-radius: 8px;
  }
`;

const IconLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  line-height: 1.2;
  margin-top: 4px;
  min-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
    font-size: 13px;
    min-height: 14px;
  }
`;


const EducationalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  @media (max-width: 480px) {
    gap: 10px;
  }
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

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;

const CardDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;

  @media (max-width: 480px) {
    font-size: 13px;
    margin-bottom: 14px;
  }
`;

const EducationalText = styled.div`
  flex: 1;
  min-width: 0;
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

  @media (max-width: 480px) {
    padding: 7px 14px;
    font-size: 13px;
    margin-top: 10px;
  }
`;

interface HomePageProps {
  onAIDealsGenerated?: (userQuery: string) => void;
}

export const HomePage = ({ onAIDealsGenerated }: HomePageProps) => {
  const [kaiaPrice, setKaiaPrice] = useState<string>('$0.1245');
  const [priceChange, setPriceChange] = useState<string>('+2.34%');
  const { openModal } = useModalStore();

  // Mock KAIA price (in real app, fetch from API)
  useEffect(() => {
    // Simulate price updates
    const interval = setInterval(() => {
      const prices = ['$0.1245', '$0.1247', '$0.1243', '$0.1246', '$0.1244'];
      const changes = ['+2.34%', '+2.41%', '+2.28%', '+2.37%', '+2.31%'];
      const randomIndex = Math.floor(Math.random() * prices.length);
      setKaiaPrice(prices[randomIndex]);
      setPriceChange(changes[randomIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAskAI = () => {
    openModal('ai-chat');
  };

  const handleSupply = () => {
    openModal('supply');
  };

  const handleBorrow = () => {
    openModal('borrow');
  };

  const handlePortfolio = () => {
    openModal('portfolio');
  };

  const handleAnalytics = () => {
    openModal('analytics');
  };

  const handleLearn = () => {
    openModal('learn');
  };

  const handleInvite = () => {
    openModal('invite');
  };

  const handleKilo = () => {
    openModal('kilo');
  };

  const handleContacts = () => {
    openModal('contacts');
  }; 

  return (
    <PageContainer>
      {/* Top Cards Section */}
      <TopCardsContainer>
        {/* AI Assistant Card */}
        <Card $gradient onClick={handleAskAI}>
          <CardContent>
            <CardIcon>
              <b>K</b> 
            </CardIcon>
            <CardTitle $white>
              KiloLend
            </CardTitle>
            <CardSubtext $white>
              The first stablecoin-focused decentralized lending with AI on LINE Mini Dapp
            </CardSubtext>
           {/* <a href="https://youtu.be/Lq4lOqcQn8Q" target="_blank">
              <LearnButton>
                Video Tutorial
              </LearnButton>
            </a>*/}
          </CardContent>
        </Card>

        {/* KAIA Price Card */}
        <Card>
          <CardContent>
            <CardIcon>
              <img
                src="https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png"
                alt="KAIA Logo"
                style={{ width: "100%", height: "100%" }}
              />
            </CardIcon>
            <CardTitle>KAIA price</CardTitle>
            <CardValue>{kaiaPrice}</CardValue>
            <CardSubtext style={{ color: '#06C755' }}>{priceChange}</CardSubtext>
          </CardContent>
        </Card>
      </TopCardsContainer>

      {/* Actions Section */}
      <ActionsSection>
        <SectionTitle>Quick Actions</SectionTitle>
        <IconGrid>
          <IconButton onClick={handleAskAI}>
            <IconCircle $index="1">
              <IconImage 
    src="./images/icon-ai.png"
    alt="ASK-AI"
  />
            </IconCircle>
            <IconLabel>AI Advisor</IconLabel>
          </IconButton>

          <IconButton onClick={handleSupply}>
            <IconCircle $index="3">
              <IconImage 
    src="./images/icon-supply.png"
    alt="SUPPLY"
  />
            </IconCircle>
            <IconLabel>Supply</IconLabel>
          </IconButton>

          <IconButton onClick={handleBorrow}>
            <IconCircle $index="2">
              <IconImage 
    src="./images/icon-borrow.png"
    alt="BORROW"
  />
            </IconCircle>
            <IconLabel>Borrow</IconLabel>
          </IconButton> 
          <IconButton onClick={handleLearn}>
            <IconCircle $index="6">
              <IconImage 
    src="./images/icon-learn.png"
    alt="LEARN"
  />
            </IconCircle>
            <IconLabel>Learn</IconLabel>
          </IconButton>
          <IconButton onClick={handleInvite}>
            <IconCircle $index="0"><IconImage 
   src="./images/icon-invites.png"
    alt="INVITE"
  /></IconCircle>
            <IconLabel>Invite</IconLabel>
          </IconButton>
          <IconButton onClick={handleKilo}>
            <IconCircle $index="7"><IconImage 
    src="./images/icon-kilo.png"
    alt="KILO"
  /></IconCircle>
            <IconLabel>KILO</IconLabel>
          </IconButton>
          <IconButton onClick={handleContacts}>
            <IconCircle $index="4">
              <IconImage 
    src="./images/icon-contact.png" 
    alt="CONTACT"
  />
            </IconCircle>
            <IconLabel>Contacts</IconLabel>
          </IconButton>
        </IconGrid>
      </ActionsSection>
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
              <a href="https://github.com/tamago-labs/kilolend" target="_blank">
                <LearnButton>
                  Learn the Basics
                </LearnButton>
              </a> 
            </EducationalText>
          </EducationalContent>
        </Card>
    </PageContainer>
  );
};
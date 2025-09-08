'use client';

import styled from 'styled-components';
import { useModalStore } from '@/stores/modalStore';
import { useMarketDataWithPrices } from '@/hooks/useMarketDataWithPrices';
import { TokenPriceSwiper, WelcomeSwiper } from '@/components/Swiper';

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
  min-height: 180px;

  ${({ $gradient }) =>
    $gradient
      ? `
    background: linear-gradient(135deg, #1e293b, #06C755);
    color: white; 
    
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

const IconButton = styled.div`
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
  "linear-gradient(135deg, #ff6363, #ff3d3d)", // red
  "linear-gradient(135deg, #ffb347, #ffcc33)", // yellow-orange
  "linear-gradient(135deg, #6a5acd, #483d8b)", // slate purple
  "linear-gradient(135deg, #20c997, #17a2b8)", // teal
  "linear-gradient(135deg, #ff6f91, #ff4477)", // rose
  "linear-gradient(135deg, #ffa07a, #ff6347)", // coral
  "linear-gradient(135deg, #d3d3d3, #a9a9a9)", // light-gray
  "linear-gradient(135deg, #2c2c54, #1e1e3f)", // dark-blue
];

const IconCircle = styled.div<{ $index?: any; }>`
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

  background: ${({ $index }: any) => gradients[Number($index)! % gradients.length]};

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

const IconImage = styled.img`
  width: 80%;
  height: 80%;
  object-fit: contain;
  
  @media (max-width: 480px) {
    width: 65%;
    height: 65%;
  }
`;

interface HomePageProps {
  onAIDealsGenerated?: (userQuery: string) => void;
}

export const HomePage = ({ onAIDealsGenerated }: HomePageProps) => {
  const { openModal } = useModalStore();
  
  // Initialize market data and real-time prices
  useMarketDataWithPrices();

  const handleAskAI = () => {
    openModal('ai-recommendations');
  };

  const handleSupply = () => {
    openModal('supply');
  };

  const handleBorrow = () => {
    openModal('borrow');
  };

  const handleLearn = () => {
    openModal('faq');
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
        {/* AI Assistant Welcome Card with Swiper */}
        <Card $gradient onClick={handleAskAI}>
          <WelcomeSwiper />
        </Card>

        {/* Token Price Card with Swiper */}
        <Card>
          <TokenPriceSwiper />
        </Card>
      </TopCardsContainer>

      {/* Actions Section */}
      <ActionsSection>
        <SectionTitle>Quick Actions</SectionTitle>
        <IconGrid>


          {/* <IconButton onClick={handleAskAI}>
            <IconCircle $index="5">
              <IconImage
                src="./images/icon-robot.png"
                alt="ASK-AI"
              />
            </IconCircle>
            <IconLabel>Ask AI</IconLabel>
          </IconButton> */}

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

          <IconButton onClick={handleAskAI}>
            <IconCircle $index="5">
              <IconImage
                src="./images/icon-robot.png"
                alt="ASK-AI"
              />
            </IconCircle>
            <IconLabel>Ask AI</IconLabel>
          </IconButton> 

          <IconButton onClick={handleLearn}>
            <IconCircle $index="6">
              <IconImage
                src="./images/icon-faq.png"
                alt="LEARN"
              />
            </IconCircle>
            <IconLabel>FAQ</IconLabel>
          </IconButton>

          <IconButton onClick={handleKilo}>
            <IconCircle $index="7">
              <IconImage
                src="./images/icon-rewards.png"
                alt="KILO"
              />
            </IconCircle>
            <IconLabel>KILO</IconLabel>
          </IconButton>

          <IconButton onClick={handleInvite}>
            <IconCircle $index="0">
              <IconImage
                src="./images/icon-invites.png"
                alt="INVITE"
              />
            </IconCircle>
            <IconLabel>Invite</IconLabel>
          </IconButton>

          <IconButton onClick={handleContacts}>
            <IconCircle $index="1">
              <IconImage
                src="./images/icon-contact.png"
                alt="CONTACT"
              />
            </IconCircle>
            <IconLabel>Leaderboard</IconLabel>
          </IconButton>

          <IconButton onClick={handleContacts}>
            <IconCircle $index="4">
              <IconImage
                src="./images/icon-send.png"
                alt="SEND"
              />
            </IconCircle>
            <IconLabel>Send</IconLabel>
          </IconButton>
        </IconGrid>
      </ActionsSection> 
    </PageContainer>
  );
};
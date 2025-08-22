'use client';

import styled from 'styled-components';
import { useAIDealsStore } from '@/stores/aiDealsStore';
import { useUserStore } from '@/stores/userStore';
import { DealCard } from './DealCard';

const Container = styled.div`
  padding: 20px 16px;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 600px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
`;

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
`;

const ProgressDot = styled.div<{ $active?: boolean; $completed?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    if (props.$completed) return '#00C300';
    if (props.$active) return '#3b82f6';
    return '#e2e8f0';
  }};
  transition: background 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-left: 8px;
`;

const CardArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  position: relative;
`;

const CompletionScreen = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const CompletionIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #00C300, #00A000);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 32px;
`;

const CompletionTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
`;

const CompletionText = styled.p`
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
`;

const AcceptedDealsCount = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const CountText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #00C300, #00A000);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 195, 0, 0.3);
  }
`;

const BackButton = styled.button`
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
`;

interface SwipeDealsProps {
  onBack: () => void;
  onExecuteDeals: (dealIds: string[]) => void;
}

export const SwipeDeals = ({ onBack, onExecuteDeals }: SwipeDealsProps) => {
  const { 
    currentDeals, 
    currentDealIndex, 
    swipedDeals,
    acceptedDeals,
    swipeDeal,
    getCurrentDeal,
    resetDeals
  } = useAIDealsStore();

  const addTransaction = useUserStore(state => state.addTransaction);
  const addPosition = useUserStore(state => state.addPosition);

  const currentDeal = getCurrentDeal();
  const isComplete = currentDealIndex >= currentDeals.length;

  const handleSwipe = (action: 'accept' | 'reject') => {
    if (!currentDeal) return;
    swipeDeal(currentDeal.id, action);
  };

  const handleExecuteDeals = () => {
    // Add accepted deals to user's portfolio and transactions
    acceptedDeals.forEach(deal => {
      // Add position
      addPosition({
        marketId: deal.marketId,
        type: deal.type,
        amount: deal.amount,
        apy: deal.apy,
        usdValue: deal.amount
      });

      // Add transaction
      addTransaction({
        type: deal.type,
        marketId: deal.marketId,
        amount: deal.amount,
        status: 'confirmed',
        usdValue: deal.amount,
        txHash: `0x${Math.random().toString(16).substring(2, 64).padStart(64, '0')}`
      });
    });

    onExecuteDeals(acceptedDeals.map(d => d.id));
    resetDeals();
    onBack();
  };

  const handleStartOver = () => {
    resetDeals();
    onBack();
  };

  if (currentDeals.length === 0) {
    return (
      <Container>
        <EmptyState>
          <h3>No deals available</h3>
          <p>Please generate deals first</p>
          <BackButton onClick={onBack}>Go Back</BackButton>
        </EmptyState>
      </Container>
    );
  }

  if (isComplete) {
    return (
      <Container>
        <CompletionScreen>
          <CompletionIcon>🎉</CompletionIcon>
          <CompletionTitle>All Done!</CompletionTitle>
          <CompletionText>
            You've reviewed all the AI-generated deals. Here's what you selected:
          </CompletionText>

          <AcceptedDealsCount>
            <CountText>
              {acceptedDeals.length} deal{acceptedDeals.length !== 1 ? 's' : ''} accepted
            </CountText>
          </AcceptedDealsCount>

          {acceptedDeals.length > 0 ? (
            <>
              <ActionButton onClick={handleExecuteDeals}>
                Execute Deals 🚀
              </ActionButton>
              <CompletionText style={{ marginTop: '16px', fontSize: '12px' }}>
                This will add positions to your portfolio
              </CompletionText>
            </>
          ) : (
            <ActionButton onClick={handleStartOver}>
              Try Again
            </ActionButton>
          )}

          <BackButton onClick={onBack}>
            Back to Home
          </BackButton>
        </CompletionScreen>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>AI Deal Recommendations</Title>
        <Subtitle>Swipe right to accept, left to pass</Subtitle>
      </Header>

      <ProgressIndicator>
        {currentDeals.map((_, index) => (
          <ProgressDot
            key={index}
            $active={index === currentDealIndex}
            $completed={index < currentDealIndex}
          />
        ))}
        <ProgressText>
          {currentDealIndex + 1} of {currentDeals.length}
        </ProgressText>
      </ProgressIndicator>

      <CardArea>
        {currentDeal && (
          <DealCard 
            deal={currentDeal} 
            onSwipe={handleSwipe}
          />
        )}
      </CardArea>

      <BackButton onClick={onBack}>
        Back to Home
      </BackButton>
    </Container>
  );
};

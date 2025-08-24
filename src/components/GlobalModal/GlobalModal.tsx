'use client';

import styled from 'styled-components';
import { useModalStore } from '@/stores/modalStore';
import { useMarketStore } from '@/stores/marketStore';
import { useUserStore } from '@/stores/userStore';
import { useAIDealsStore } from '@/stores/aiDealsStore';
import { useState } from 'react';

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

const ChatDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const AIModalExamples = styled.div`
  margin-top: 16px;
  max-height: 200px;
  overflow-y: auto;
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

interface GlobalModalProps {
  onAIDealsGenerated?: (userQuery: string) => void;
}

export const GlobalModal = ({ onAIDealsGenerated }: GlobalModalProps) => {
  const { isOpen, type, data, closeModal } = useModalStore();
  const { markets } = useMarketStore();
  const { addPosition, addTransaction } = useUserStore();
  const [amount, setAmount] = useState('');
  const [userQuery, setUserQuery] = useState(data?.userQuery || '');

  if (!isOpen || !type) return null;

  const currentMarket = data?.marketId ? markets.find(m => m.id === data.marketId) : null;

  const exampleQuestions = [
    "I want safe returns around 4-5% APY with my stablecoins",
    "안전한 스테이블코인으로 4-5% 수익률을 원해요",
    "Help me borrow against my KAIA tokens with low risk",
    "KAIA 토큰을 담보로 낮은 리스크로 대출받고 싶어요",
    "What's the best lending strategy for $1000 USDT?",
    "1000달러 USDT로 최적의 렌딩 전략이 뭔가요?",
    "I need to borrow KRW with minimal collateral requirements",
    "최소한의 담보로 KRW를 빌리고 싶습니다"
  ];

  const handleQuickActionSubmit = () => {
    if (!data || !currentMarket || !amount) return;

    const numAmount = parseFloat(amount);
    const rate = data.action === 'supply' ? currentMarket.supplyAPY : currentMarket.borrowAPR;

    addPosition({
      marketId: data.marketId!,
      type: data.action!,
      amount: numAmount,
      apy: rate,
      usdValue: numAmount
    });

    addTransaction({
      type: data.action!,
      marketId: data.marketId!,
      amount: numAmount,
      status: 'confirmed',
      usdValue: numAmount,
      txHash: `0x${Math.random().toString(16).substring(2, 64).padStart(64, '0')}`
    });

    closeModal();
    setAmount('');
    alert(`Successfully ${data.action === 'supply' ? 'supplied' : 'borrowed'} ${amount} ${currentMarket.symbol}!\n\nCheck your Portfolio to see the new position.`);
  };

  const handleAISubmit = () => {
    if (!userQuery.trim()) return;
    
    closeModal();
    onAIDealsGenerated?.(userQuery);
    setUserQuery('');
  };

  const handleExampleClick = (example: string) => {
    setUserQuery(example);
  };

  const currentRate = currentMarket && data?.action ?
    (data.action === 'supply' ? currentMarket.supplyAPY : currentMarket.borrowAPR) : 0;

  const renderModalContent = () => {
    switch (type) {
      case 'supply':
      case 'borrow':
        if (!currentMarket || !data) return null;
        
        return (
          <>
            <ModalTitle>
              {currentMarket.icon} {type === 'supply' ? 'Supply' : 'Borrow'} {currentMarket.symbol}
            </ModalTitle>

            <ModalForm>
              <FormGroup>
                <Label>Amount ({currentMarket.symbol})</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </FormGroup>

              {amount && (
                <InfoBox>
                  <InfoRow>
                    <InfoLabel>{type === 'supply' ? 'APY' : 'APR'}:</InfoLabel>
                    <InfoValue>{currentRate.toFixed(2)}%</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Est. Monthly {type === 'supply' ? 'Earnings' : 'Cost'}:</InfoLabel>
                    <InfoValue>${((parseFloat(amount) || 0) * currentRate / 100 / 12).toFixed(2)}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>USD Value:</InfoLabel>
                    <InfoValue>${(parseFloat(amount) || 0).toFixed(2)}</InfoValue>
                  </InfoRow>
                </InfoBox>
              )}
            </ModalForm>

            <ModalButtons>
              <ModalButton $variant="secondary" onClick={closeModal}>
                Cancel
              </ModalButton>
              <ModalButton
                $variant="primary"
                onClick={handleQuickActionSubmit}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                {type === 'supply' ? 'Supply' : 'Borrow'}
              </ModalButton>
            </ModalButtons>
          </>
        );

      case 'ai-chat':
        return (
          <>
            <ModalTitle>
              <BotIcon>AI</BotIcon>
              Ask KiloBot Assistant
            </ModalTitle>

            <ChatDescription>
              Describe your lending or borrowing needs in natural language. Our AI will analyze the markets and create personalized deals just for you.
            </ChatDescription>

            <FormGroup>
              <AIModalInput
                placeholder="e.g., I want to earn 5% on my USDT with low risk..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                maxLength={500}
                autoFocus
              />
            </FormGroup>

            <AIModalExamples>
              <ExampleTitle>Try these examples:</ExampleTitle>
              {exampleQuestions.map((example, index) => (
                <ExampleCard key={index} onClick={() => handleExampleClick(example)}>
                  <ExampleText>"{example}"</ExampleText>
                </ExampleCard>
              ))}
            </AIModalExamples>

            <ModalButtons>
              <ModalButton $variant="secondary" onClick={closeModal}>
                Cancel
              </ModalButton>
              <ModalButton
                $variant="primary"
                onClick={handleAISubmit}
                disabled={!userQuery.trim()}
              >
                Ask AI for Deals 🤖
              </ModalButton>
            </ModalButtons>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <ModalOverlay onClick={closeModal}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {renderModalContent()}
      </ModalContent>
    </ModalOverlay>
  );
};

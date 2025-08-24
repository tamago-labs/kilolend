import React from 'react';
import styled from 'styled-components';
import {
  ModalTitle,
  BotIcon,
  ChatDescription,
  FormGroup,
  ModalButtons,
  ModalButton
} from '../styles';

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

interface AIModalProps {
  userQuery: string;
  setUserQuery: (query: string) => void;
  handleExampleClick: (example: string) => void;
  handleAISubmit: () => void;
  closeModal: () => void;
}

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

export const AIModal: React.FC<AIModalProps> = ({
  userQuery,
  setUserQuery,
  handleExampleClick,
  handleAISubmit,
  closeModal
}) => {
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
};

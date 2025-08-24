'use client';

import styled from 'styled-components';
import { useModalStore } from '@/stores/modalStore';

const AIButton = styled.button`
  display: flex;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #00C300, #00A000);
  color: white;
  border: none;
  border-radius: 12px;
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
`;

const BotIcon = styled.div`
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
`;

interface AIButtonProps {
  userQuery?: string;
  buttonText?: string;
  fullWidth?: boolean;
}

export const AIModalButton = ({ 
  userQuery = "I want to earn 5% on my USDT with low risk",
  buttonText = "Ask AI for Deals 🤖",
  fullWidth = false 
}: AIButtonProps) => {
  const { openModal } = useModalStore();

  const handleClick = () => {
    openModal('ai-chat', { userQuery });
  };

  return (
    <AIButton 
      onClick={handleClick}
      style={{ width: fullWidth ? '100%' : 'auto' }}
    >
      {/* <BotIcon>AI</BotIcon> */}
      {buttonText}
    </AIButton>
  );
};

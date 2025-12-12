import React, { useState } from 'react';
import styled from 'styled-components';
import { useModalStore } from '@/stores/modalStore';

const PanelContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${props => props.$isOpen ? '380px' : '56px'};
  height: ${props => props.$isOpen ? '600px' : '56px'};
`;

const FloatingButton = styled.div<{ $isHidden: boolean }>`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #06C755, #059212);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  opacity: ${props => props.$isHidden ? 0 : 1};
  visibility: ${props => props.$isHidden ? 'hidden' : 'visible'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(6, 199, 85, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ChatPanel = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 380px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(20px)'};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const PanelHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #06C755, #059212);
  color: white;
  border-radius: 16px 16px 0 0;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const PanelContent = styled.div`
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const AIIcon = styled.img`
  width: 28px;
  height: 28px;
  filter: brightness(0) invert(1);
`;

const LargeAIIcon = styled.img`
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  opacity: 0.6;
`;

const NotAvailableTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
`;

const NotAvailableMessage = styled.p`
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
  max-width: 280px;
`;

const MiniDappButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #06C755, #059212);
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  }
`;

interface DesktopAIChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const DesktopAIChatPanel: React.FC<DesktopAIChatPanelProps> = ({ isOpen, onToggle }) => {
  const { openModal } = useModalStore();

  const handleOpenMiniDapp = () => {
    // Open the same modal as "Get Started on LINE" button
    openModal('lineMiniDApp');
  };

  return (
    <PanelContainer $isOpen={isOpen}>
      <FloatingButton $isHidden={isOpen} onClick={onToggle}>
        <AIIcon src="/images/icon-robot.png" alt="AI Agent" />
      </FloatingButton>
      
      <ChatPanel $isOpen={isOpen}>
        <PanelHeader>
          <HeaderTitle>
            <AIIcon src="/images/icon-robot.png" alt="AI Agent" />
            AI Agent
          </HeaderTitle>
          <CloseButton onClick={onToggle}>
            ×
          </CloseButton>
        </PanelHeader>
        
        <PanelContent>
          <LargeAIIcon src="/images/icon-robot.png" alt="AI Agent" />
          <NotAvailableTitle>Available Only on Mini dapp</NotAvailableTitle>
          <NotAvailableMessage>
            Will be available on web version soon, 
            follow X for updates. Experience AI-powered lending, borrowing, and 
            token swapping.
          </NotAvailableMessage>
          <MiniDappButton onClick={handleOpenMiniDapp}>
            Open LINE Mini Dapp
          </MiniDappButton>
        </PanelContent>
      </ChatPanel>
    </PanelContainer>
  );
};

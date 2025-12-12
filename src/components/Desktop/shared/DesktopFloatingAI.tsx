import React, { useState } from 'react';
import styled from 'styled-components';

const FloatingAIContainer = styled.div`
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 1000;
  cursor: pointer;
`;

const AIButton = styled.div`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #06C755, #059212);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(6, 199, 85, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const AIIcon = styled.img`
  width: 28px;
  height: 28px;
  filter: brightness(0) invert(1);
`;

interface DesktopFloatingAIProps {
  onClick: () => void;
}

export const DesktopFloatingAI: React.FC<DesktopFloatingAIProps> = ({ onClick }) => {
  return (
    <FloatingAIContainer onClick={onClick}>
      <AIButton>
        <AIIcon src="/images/icon-robot.png" alt="AI Agent" />
      </AIButton>
    </FloatingAIContainer>
  );
};

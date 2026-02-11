'use client';

import styled from 'styled-components';
import { DesktopBaseModal, DesktopBaseModalProps } from './shared/DesktopBaseModal';
import { Cpu, Info } from 'react-feather';

const ModalContent = styled.div`
  text-align: center;
  padding: 20px;
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #06C755, #05b648);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(6, 199, 85, 0.2);
`;

const CpuIcon = styled(Info)`
  color: white;
  width: 40px;
  height: 40px;
`;

const Message = styled.p`
  font-size: 18px;
  color: #1e293b;
  line-height: 1.6;
  margin: 0;
  text-align: center;
`;

const HighlightText = styled.span`
  color: #06C755;
  font-weight: 600;
`;

export interface DesktopAIAgentModalProps extends Omit<DesktopBaseModalProps, 'title' | 'children'> {}

export const DesktopAIAgentModal = ({ isOpen, onClose }: DesktopAIAgentModalProps) => {
  return (
    <DesktopBaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Agent Access"
      width="480px"
    >
      <ModalContent>
        <IconContainer>
          <CpuIcon />
        </IconContainer>
        <Message>
          You can use your personal agent by clicking the button at the <HighlightText>bottom right</HighlightText> of the screen. 
          Interface for OpenClaw coming soon.
        </Message>
      </ModalContent>
    </DesktopBaseModal>
  );
};
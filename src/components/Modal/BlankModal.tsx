'use client';

import { BaseModal, BaseModalProps } from './BaseModal';
import styled from 'styled-components';

const BlankContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
`;

const PlaceholderIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 16px;
  color: #64748b;

  @media (max-width: 480px) {
    width: 64px;
    height: 64px;
    font-size: 28px;
    margin-bottom: 12px;
  }
`;

const PlaceholderTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const PlaceholderText = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

interface BlankModalProps extends Omit<BaseModalProps, 'children'> {
  icon?: string;
  placeholderTitle?: string;
  placeholderText?: string;
}

export const BlankModal = ({ 
  isOpen, 
  onClose, 
  title,
  icon = '📝',
  placeholderTitle = 'Coming Soon',
  placeholderText = 'This feature is under development and will be available soon.'
}: BlankModalProps) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <BlankContent>
        <PlaceholderIcon>{icon}</PlaceholderIcon>
        <PlaceholderTitle>{placeholderTitle}</PlaceholderTitle>
        <PlaceholderText>{placeholderText}</PlaceholderText>
      </BlankContent>
    </BaseModal>
  );
};
'use client';

import styled from 'styled-components';
import { ReactNode, useEffect } from 'react';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.2s ease, visibility 0.2s ease;
  backdrop-filter: blur(4px);
`;

const DialogContainer = styled.div<{ $isOpen: boolean }>`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transform: scale(1); /* no scaling animation */
  transition: opacity 0.2s ease;
`;

const DialogHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DialogTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
`;

const CloseButton = styled.button`
  border: none;
  background: #f1f5f9;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 16px;

  &:hover {
    background: #e2e8f0;
  }
`;

const DialogContent = styled.div`
  padding: 20px 24px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
`;

export interface DialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const DialogModal = ({ isOpen, onClose, title, children }: DialogModalProps) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';

    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <DialogContainer $isOpen={isOpen}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </DialogHeader>
        <DialogContent>{children}</DialogContent>
      </DialogContainer>
    </ModalOverlay>
  );
};

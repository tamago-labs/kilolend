'use client';

import { create } from 'zustand';

export type ModalType = 
  | 'supply' 
  | 'borrow' 
  | 'withdraw'
  | 'repay'
  | 'portfolio' 
  | 'analytics' 
  | 'ai-chat' 
  | 'ai-chat-new'
  | 'ai-recommendations'
  | 'settings'
  | 'activities'
  | 'faq'
  | 'invite'
  | 'kilo'
  | 'contacts'
  | 'leaderboard'
  | 'token-details'
  | 'wallet-address'
  | 'support'
  | 'feedback'
  | 'faucet'
  | 'send'
  | 'boost'      // NEW
  | 'swap'       // NEW
  | null;

interface ModalData {
  [key: string]: any;
}

interface ModalState {
  activeModal: ModalType;
  modalData: ModalData;
  isOpen: boolean;
}

interface ModalActions {
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
  setModalData: (data: ModalData) => void;
}

export const useModalStore = create<ModalState & ModalActions>((set) => ({
  activeModal: null,
  modalData: {},
  isOpen: false,

  openModal: (type: ModalType, data: ModalData = {}) => {
    set({
      activeModal: type,
      modalData: data,
      isOpen: true,
    });
  },

  closeModal: () => {
    set({
      activeModal: null,
      modalData: {},
      isOpen: false,
    });
  },

  setModalData: (data: ModalData) => {
    set((state) => ({
      modalData: { ...state.modalData, ...data },
    }));
  },
}));

import { create } from 'zustand';

export type ModalType = 'supply' | 'borrow' | 'withdraw' | 'repay' | 'ai-chat' | 'deposit-collateral' | 'withdraw-collateral';

export interface ModalData {
  marketId?: string;
  action?: 'supply' | 'borrow';
  userQuery?: string;
  collateralType?: 'wkaia' | 'stkaia';
  collateralAction?: 'deposit' | 'withdraw';
}

export interface ModalState {
  isOpen: boolean;
  type: ModalType | null;
  data: ModalData | null;
  
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
  updateData: (data: Partial<ModalData>) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  type: null,
  data: null,

  openModal: (type, data = {}) => set({
    isOpen: true,
    type,
    data
  }),

  closeModal: () => set({
    isOpen: false,
    type: null,
    data: null
  }),

  updateData: (newData) => set((state) => ({
    data: { ...state.data, ...newData }
  }))
}));

import { create } from 'zustand';

export interface AppState {
  activeTab: 'home' | 'portfolio' | 'activity' | 'profile';
  isLoading: boolean;
  lastUpdated: number;
  priceUpdateInterval: number;
  gasLimit: number;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setLoading: (loading: boolean) => void;
  updateLastUpdated: () => void;
  setGasLimit: (gasLimit: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'home',
  isLoading: false,
  lastUpdated: Date.now(),
  priceUpdateInterval: 5000, // 5 seconds
  gasLimit: 600000, // Default gas limit

  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  updateLastUpdated: () => set({ lastUpdated: Date.now() }),
  
  setGasLimit: (gasLimit) => set({ gasLimit })
}));

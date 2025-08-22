import { create } from 'zustand';

export interface AppState {
  activeTab: 'home' | 'portfolio' | 'activity' | 'profile';
  isLoading: boolean;
  lastUpdated: number;
  priceUpdateInterval: number;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setLoading: (loading: boolean) => void;
  updateLastUpdated: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'home',
  isLoading: false,
  lastUpdated: Date.now(),
  priceUpdateInterval: 5000, // 5 seconds

  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  updateLastUpdated: () => set({ lastUpdated: Date.now() })
}));

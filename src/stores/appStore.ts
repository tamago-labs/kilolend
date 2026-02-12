import { create } from 'zustand';

export interface AppState {
  activeTab: 'home' | 'portfolio' | 'activity' | 'profile' | 'migrate';
  isLoading: boolean;
  lastUpdated: number;
  priceUpdateInterval: number;
  gasLimit: number;
  isMobile: boolean;
  deviceDetected: boolean;
  showSplash: boolean;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setLoading: (loading: boolean) => void;
  updateLastUpdated: () => void;
  setGasLimit: (gasLimit: number) => void;
  setIsMobile: (isMobile: boolean) => void;
  setDeviceDetected: (detected: boolean) => void;
  setShowSplash: (isShow: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'home',
  isLoading: false,
  showSplash: true,
  lastUpdated: Date.now(),
  priceUpdateInterval: 5000, // 5 seconds
  gasLimit: 600000, // Default gas limit
  isMobile: false, // Default to desktop
  deviceDetected: false, // Device not detected yet

  setActiveTab: (tab) => set({ activeTab: tab }),

  setLoading: (loading) => set({ isLoading: loading }),

  updateLastUpdated: () => set({ lastUpdated: Date.now() }),

  setGasLimit: (gasLimit) => set({ gasLimit }),

  setIsMobile: (isMobile) => set({ isMobile }),

  setDeviceDetected: (deviceDetected) => set({ deviceDetected }),

  setShowSplash: (showSplash) => set({ showSplash })
}));

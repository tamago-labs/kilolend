'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ChainType = 'kaia' | 'kub';

interface ChainContextType {
  selectedChain: ChainType;
  setSelectedChain: (chain: ChainType) => void;
  isChainConnected: boolean;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export const useChain = () => {
  const context = useContext(ChainContext);
  if (!context) {
    throw new Error('useChain must be used within a ChainProvider');
  }
  return context;
};

interface ChainProviderProps {
  children: ReactNode;
}

export const ChainProvider = ({ children }: ChainProviderProps) => {
  const [selectedChain, setSelectedChainState] = useState<ChainType>('kaia');

  // Load selected chain from localStorage on mount
  useEffect(() => {
    const storedChain = localStorage.getItem('selectedChain') as ChainType;
    if (storedChain && (storedChain === 'kaia' || storedChain === 'kub')) {
      setSelectedChainState(storedChain);
    }
  }, []);

  // Save selected chain to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectedChain', selectedChain);
  }, [selectedChain]);

  const setSelectedChain = (chain: ChainType) => {
    setSelectedChainState(chain);
  };

  // For now, we'll consider chain "connected" when it's selected
  // Later this could be enhanced to check actual wallet connection status
  const isChainConnected = true;

  return (
    <ChainContext.Provider
      value={{
        selectedChain,
        setSelectedChain,
        isChainConnected,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};
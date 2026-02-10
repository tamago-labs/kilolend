'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AuthMethod = 'line_sdk' | 'web3_wallet';

interface AuthContextType {
  selectedAuthMethod: AuthMethod;
  setSelectedAuthMethod: (authMethod: AuthMethod) => void;
  isAuthConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Backward compatibility - keep the old hook name for now
export const useChain = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useChain must be used within an AuthProvider');
  }
  // Map old interface to new one for backward compatibility
  return {
    selectedChain: context.selectedAuthMethod,
    setSelectedChain: context.setSelectedAuthMethod,
    isChainConnected: context.isAuthConnected,
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [selectedAuthMethod, setSelectedAuthMethodState] = useState<AuthMethod>('line_sdk');

  // Load selected auth method from localStorage on mount
  useEffect(() => {
    // Check for old key first for migration
    const oldStoredChain = localStorage.getItem('selectedChain');
    if (oldStoredChain) {
      // Migrate old values to new ones
      if (oldStoredChain === 'kaia') {
        setSelectedAuthMethodState('line_sdk');
        localStorage.setItem('selectedAuthMethod', 'line_sdk');
        localStorage.removeItem('selectedChain');
      } else if (oldStoredChain === 'kub') {
        setSelectedAuthMethodState('web3_wallet');
        localStorage.setItem('selectedAuthMethod', 'web3_wallet');
        localStorage.removeItem('selectedChain');
      }
    } else {
      const storedAuthMethod = localStorage.getItem('selectedAuthMethod') as AuthMethod;
      if (storedAuthMethod && (storedAuthMethod === 'line_sdk' || storedAuthMethod === 'web3_wallet')) {
        setSelectedAuthMethodState(storedAuthMethod);
      }
    }
  }, []);

  // Save selected auth method to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectedAuthMethod', selectedAuthMethod);
  }, [selectedAuthMethod]);

  const setSelectedAuthMethod = (authMethod: AuthMethod) => {
    setSelectedAuthMethodState(authMethod);
  };

  // For now, we'll consider auth "connected" when it's selected
  // Later this could be enhanced to check actual wallet connection status
  const isAuthConnected = true;

  return (
    <AuthContext.Provider
      value={{
        selectedAuthMethod,
        setSelectedAuthMethod,
        isAuthConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Keep the old ChainProvider name for backward compatibility
export const ChainProvider = AuthProvider;
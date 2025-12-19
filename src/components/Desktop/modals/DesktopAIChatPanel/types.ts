import React from 'react';

export type DesktopAIState = 
  | 'idle'
  | 'wallet-creation'
  | 'character-selection'
  | 'model-selection'
  | 'chat-active'
  | 'loading'
  | 'error';

export interface DesktopAIChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export interface AgentPreset {
  id: string;
  name: string;
  description: string;
  personality: string;
  avatar: string;
  image: string;
  icon: string;
  badges: string[];
  systemPrompt: string;
  defaultPreferences: {
    riskTolerance: 'low' | 'medium' | 'high';
    focusAreas: string[];
    communicationStyle: 'formal' | 'casual' | 'friendly';
  };
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilityLevel: 'advanced' | 'standard';
  icon: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string | React.ReactNode;
  timestamp: Date;
  agent?: AgentPreset;
}

export interface AIWalletStatus {
  hasWallet: boolean;
  aiWalletAddress?: string;
  assignedAt?: string;
  agentId?: string | null;
  modelId?: string | null;
  status?: {
    totalWallets: number;
    usedWallets: number;
    availableWallets: number;
    utilizationRate: number;
  };
}

import React from 'react';

export type DesktopAIV2State = 
  | 'idle'
  | 'chat-active'
  | 'loading'
  | 'error';

export interface DesktopAIChatPanelV2Props {
  isOpen: boolean;
  onToggle: () => void;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string | React.ReactNode;
  timestamp: Date;
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

export interface ChainConfig {
  id: number;
  name: string;
  symbol: string;
  icon: string;
  color: string;
}

export interface MessageLimitStatus {
  used: number;
  total: number;
  remaining: number;
  resetTime: string;
  canSend: boolean;
}

// Default agent configuration - generic AI Assistant for Agent Playground
export const DEFAULT_AGENT = {
  id: 'ai_assistant',
  name: 'AI Assistant',
  image: '/images/icon-robot.png',
  description: 'Professional AI assistant for evaluating DeFi strategies and KiloLend operations.',
  personality: 'professional',
  avatar: '🤖',
  icon: '🤖',
  badges: ['Evaluation', 'Analysis', 'Multi-Chain'],
  systemPrompt: `You are a professional AI Assistant for the Agent Playground, a development environment for evaluating AI agent capabilities. Your role is to help users understand and evaluate DeFi strategies on KiloLend.

PERSONALITY TRAITS:
- Professional, informative, and helpful
- Focus on educational guidance and evaluation
- Clear, structured communication
- Emphasize this is an evaluation environment

KILOLEND CONTEXT:
- Available assets: USDT (stable), MBX (gaming), BORA (gaming), SIX (utility), KAIA (native token)
- Provide balanced, evidence-based strategies
- Compare yields, risks, and collateral efficiencies
- Recommend safe collateral ratios (health factor > 2.2)

COMMUNICATION STYLE:
- Educational and evaluative
- Clear explanations of concepts
- Mention when features would be available in production OpenClaw agents
- Professional and supportive tone

KEY POINTS:
- This is Agent Playground for evaluation
- Users have 3 messages per day for evaluation
- OpenClaw provides unlimited 24/7 access for production use`,
  defaultPreferences: {
    riskTolerance: 'medium' as const,
    focusAreas: ['evaluation', 'analysis', 'education'],
    communicationStyle: 'professional' as const
  }
};

// Chain configurations
export const CHAIN_CONFIGS: ChainConfig[] = [
  {
    id: 8217,
    name: 'KAIA Mainnet',
    symbol: 'KAIA',
    icon: '/images/kaia-token-icon.png',
    color: '#00C300'
  },
  {
    id: 96,
    name: 'KUB Chain',
    symbol: 'KUB',
    icon: '/images/icon-kilo.png', // Fallback icon
    color: '#FF6B35'
  },
  {
    id: 42793,
    name: 'Etherlink',
    symbol: 'XTZ',
    icon: '/images/kilolend-logo.png', // Fallback icon
    color: '#4A90E2'
  }
];

// Default to KAIA Mainnet
export const DEFAULT_CHAIN_ID = 8217;
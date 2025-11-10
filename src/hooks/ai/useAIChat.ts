'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useContractUserStore } from '@/stores/contractUserStore';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useModalStore } from '@/stores/modalStore';
import {
  AIChatService,
  injectKiloLendData,
  type ChatMessage,
  type StreamChunk
} from '@/services/AIChatService';
import { actionIntegration } from '@/services/actionIntegration';
import { conversationMemory } from '@/services/memory/conversationMemory';
import { type AIAgent } from '@/types/aiAgent';

export interface UseAIChatConfig {
  isExecutionMode?: boolean;
  maxMessages?: number;
}

export interface UseAIChatResult {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
  stopStreaming: () => void;
  canSendMessage: boolean;
  messageCount: number;
  needsClear: boolean;
}

export const useAIChat = (agent: AIAgent, config: UseAIChatConfig = {}): UseAIChatResult => {
  const { isExecutionMode = false, maxMessages = 10 } = config;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const streamControllerRef = useRef<AbortController | null>(null);

  // Get KiloLend data
  const { markets } = useContractMarketStore();
  const userStore = useContractUserStore();
  const { account } = useWalletAccountStore();
  const modalStore = useModalStore();

  // Initialize action integration with stores
  useEffect(() => {
    actionIntegration.setStores(modalStore, { getMarketById: (id: string) => markets.find(m => m.id === id) });
  }, [modalStore, markets]);

  // Inject data into AI service on mount and when data changes
  useEffect(() => {
    const portfolioData = {
      totalSupplied: userStore.totalSupplied,
      totalBorrowed: userStore.totalBorrowed,
      totalCollateralValue: userStore.totalCollateralValue,
      healthFactor: userStore.healthFactor,
      netAPY: userStore.netAPY,
      positions: userStore.positions
    };

    injectKiloLendData(markets, portfolioData, account || undefined);

    // Initialize session if we have a user address
    if (account && !sessionId) {
      const newSessionId = AIChatService.initializeSession(account, agent);
      setSessionId(newSessionId);
    }
  }, [markets, userStore, account, agent, sessionId]);

  // Initialize with greeting message
  useEffect(() => {
    if (agent && messages.length === 0) {
      const greetingMessage: ChatMessage = {
        id: `greeting_${Date.now()}`,
        content: getAgentGreeting(agent, isExecutionMode),
        sender: 'agent',
        timestamp: Date.now()
      };
      setMessages([greetingMessage]);
    }
  }, [agent, isExecutionMode]);

  const getAgentGreeting = (agent: AIAgent, isExecution: boolean): string => {
    if (isExecution) {
      return `🤖 Hello! I'm Secured D, your precise and secure AI assistant. I'm ready to guide you through KiloLend and help execute transactions safely. How would you like to proceed today?`;
    }

    const greetings = {
      conservative: `👨‍💼 Good day! I'm ${agent.name}, your professional DeFi advisor. I focus on stable, secure returns perfect for those who prioritize capital preservation. How may I assist you with your KiloLend strategy today?`,
      aggressive: `🧑‍🚀 Ready for liftoff! I'm ${agent.name}, your mission commander for maximum returns in the DeFi universe. Let's explore stellar yield opportunities on KiloLend together! What's our destination?`,
      balanced: `🧙 Greetings, traveler! I am ${agent.name}, keeper of ancient DeFi wisdom. I shall help you navigate the mystical balance between risk and reward on KiloLend. What path shall we explore together?`,
      educational: `🧑‍🏫 Welcome, my eager student! I am ${agent.name}, your patient teacher in the art of decentralized finance. Together we shall master the ways of KiloLend. What would you like to learn today, grasshopper?`,
      tiger: `🐅 Roar! I'm ${agent.name}, your fierce strategist here on KiloLend. I'm ready to help you pounce on bold opportunities and hunt for higher yields. What prize shall we chase today?`,
      snake: `🐍 Sss... Greetings, I'm ${agent.name}, your smooth and calculating DeFi guide. I'll help you slither into optimal positions and strike with precision. What strategy shall we refine first?`,
      penguin: `🐧 Waddle waddle! I'm ${agent.name}, your friendly guardian on KiloLend. I'll help you stay cool, safe, and step confidently into DeFi. What would you like to explore together today?`,
      custom: `🤖 Hello! I'm ${agent.name}, your custom AI assistant, ready to help you with KiloLend based on the specific guidance you've provided. How can I assist you today?`
    };

    return greetings[agent.personality as keyof typeof greetings] || greetings.custom;
  };

  // Computed values
  const userMessageCount = messages.filter(m => m.sender === 'user').length;
  const needsClear = userMessageCount >= maxMessages;
  const canSendMessage = !isLoading && !needsClear;

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || needsClear) return;

    // Create abort controller for this stream
    const controller = new AbortController();
    streamControllerRef.current = controller;

    setError(null);
    setIsLoading(true);
    setIsStreaming(true);
    setLastUserMessage(content);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);

    // Start agent response
    let agentMessageContent = '';
    const agentMessage: ChatMessage = {
      id: `agent_${Date.now()}`,
      content: '',
      sender: 'agent',
      timestamp: Date.now()
    };

    try {
      const chatHistory = messages.filter(m => m.sender !== 'agent' || m.content.trim() !== '');

      // Check if AWS credentials are available  
      const hasAWSCredentials = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID

      if (hasAWSCredentials) {
        // Use real AI service
        const streamGenerator = AIChatService.streamChat(
          agent,
          chatHistory,
          content,
          account || undefined
        );

        for await (const chunk of streamGenerator) {
          // Check if streaming was stopped
          if (controller.signal.aborted) {
            break;
          }

          if (chunk.type === 'text') {
            agentMessageContent += chunk.content;

            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.id === agentMessage.id) {
                lastMessage.content = agentMessageContent;
              } else {
                newMessages.push({ ...agentMessage, content: agentMessageContent });
              }
              return newMessages;
            });
          } else if (chunk.type === 'tool_start') {
            agentMessageContent += chunk.content;
          } else if (chunk.type === 'tool_complete') {
            agentMessageContent += chunk.content;
          }
        }
      } else {
        // Enhanced fallback message with clear data availability status
        const fallbackMessage = `🚫 **AI Service Unavailable**

I'm unable to connect to the AI service at the moment. This means:

❌ **No real-time market data**
❌ **No portfolio analysis** 
❌ **No personalized recommendations**

**What you can do:**
• Try refreshing the page and reconnecting your wallet
• Contact the KILOLend team for assistance
• Use the manual interface for transactions

*I never provide fake or estimated data - I prefer to be honest about limitations rather than guess.*`;

        agentMessageContent = fallbackMessage;

        // Add the complete message immediately
        setMessages(prev => {
          const existingIndex = prev.findIndex(m => m.id === agentMessage.id);
          if (existingIndex >= 0) {
            const newMessages = [...prev];
            newMessages[existingIndex].content = fallbackMessage;
            return newMessages;
          } else {
            return [...prev, { ...agentMessage, content: fallbackMessage }];
          }
        });
      }

      // Ensure final message is added
      setMessages(prev => {
        const existingIndex = prev.findIndex(m => m.id === agentMessage.id);
        if (existingIndex >= 0) {
          const newMessages = [...prev];
          newMessages[existingIndex].content = agentMessageContent;
          return newMessages;
        } else {
          return [...prev, { ...agentMessage, content: agentMessageContent }];
        }
      });

    } catch (err: any) {
      console.error('AI Chat Error:', err);
      setError(err.message || 'Failed to get AI response');

      // Enhanced error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: `🚨 **Connection Error**

I apologize, but I encountered an error while trying to process your request. This could be due to:

• Network connectivity issues
• Temporary service unavailability  
• High demand on the AI service

**Please try:**
1. Sending your message again
2. Refreshing the page
3. Contacting support if the issue persists

*I never provide fake data - I'll always be transparent about service limitations.*`,
        sender: 'agent',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      streamControllerRef.current = null;
    }
  }, [agent, messages, account, isLoading, needsClear]);

  const stopStreaming = useCallback(() => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
      streamControllerRef.current = null;
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);

    // Clean up old session and create new one
    if (account) {
      conversationMemory.cleanupOldSessions();
      const newSessionId = AIChatService.initializeSession(account, agent);
      setSessionId(newSessionId);
    }

    // Re-add greeting
    if (agent) {
      const greetingMessage: ChatMessage = {
        id: `greeting_${Date.now()}`,
        content: getAgentGreeting(agent, isExecutionMode),
        sender: 'agent',
        timestamp: Date.now()
      };
      setMessages([greetingMessage]);
    }
  }, [agent, account, isExecutionMode]);

  const retryLastMessage = useCallback(async () => {
    if (lastUserMessage) {
      await sendMessage(lastUserMessage);
    }
  }, [lastUserMessage, sendMessage]);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    stopStreaming,
    canSendMessage,
    messageCount: userMessageCount,
    needsClear
  };
};

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useContractUserStore } from '@/stores/contractUserStore';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useModalStore } from '@/stores/modalStore';
import {
  enhancedAIChatService,
  injectKiloLendData,
  type ChatMessage,
  type StreamChunk
} from '@/services/enhancedAIChatService';
import { actionIntegration } from '@/services/actionIntegration';
import { conversationMemory } from '@/services/memory/conversationMemory';
import { type AIAgent } from '@/types/aiAgent';

export interface UseEnhancedAIChatResult {
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

export const useEnhancedAIChat = (agent: AIAgent): UseEnhancedAIChatResult => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const streamControllerRef = useRef<AbortController | null>(null);

  // Constants
  const MAX_MESSAGES = 10; // Maximum user messages before requiring clear

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
      const newSessionId = enhancedAIChatService.initializeSession(account, agent);
      setSessionId(newSessionId);
    }
  }, [markets, userStore, account, agent, sessionId]);

  // Initialize with greeting message
  useEffect(() => {
    if (agent && messages.length === 0) {
      const greetingMessage: ChatMessage = {
        id: `greeting_${Date.now()}`,
        content: getAgentGreeting(agent),
        sender: 'agent',
        timestamp: Date.now()
      };
      setMessages([greetingMessage]);
    }
  }, [agent]);

  const getAgentGreeting = (agent: AIAgent): string => {
    const greetings = {
      conservative: `👨‍💼 Good day! I'm ${agent.name}, your professional DeFi advisor. I focus on stable, secure returns perfect for those who prioritize capital preservation. How may I assist you with your KiloLend strategy today?`,
      aggressive: `🧑‍🚀 Ready for liftoff! I'm ${agent.name}, your mission commander for maximum returns in the DeFi universe. Let's explore stellar yield opportunities on KiloLend together! What's our destination?`,
      balanced: `🧙 Greetings, traveler! I am ${agent.name}, keeper of ancient DeFi wisdom. I shall help you navigate the mystical balance between risk and reward on KiloLend. What path shall we explore together?`,
      educational: `🧑‍🏫 Welcome, my eager student! I am ${agent.name}, your patient teacher in the art of decentralized finance. Together we shall master the ways of KiloLend. What would you like to learn today, grasshopper?`,
      tiger: `🐅 Roar! I'm ${agent.name}, your fierce strategist here on KiloLend. I’m ready to help you pounce on bold opportunities and hunt for higher yields. What prize shall we chase today?`,
      snake: `🐍 Sss... Greetings, I’m ${agent.name}, your smooth and calculating DeFi guide. I’ll help you slither into optimal positions and strike with precision. What strategy shall we refine first?`,
      penguin: `🐧 Waddle waddle! I'm ${agent.name}, your friendly guardian on KiloLend. I’ll help you stay cool, safe, and step confidently into DeFi. What would you like to explore together today?`,
      custom: `🤖 Hello! I'm ${agent.name}, your custom AI assistant, ready to help you with KiloLend based on the specific guidance you've provided. How can I assist you today?`
    };

    return greetings[agent.personality as keyof typeof greetings] || greetings.custom;
  };

  // Computed values
  const userMessageCount = messages.filter(m => m.sender === 'user').length;
  const needsClear = userMessageCount >= MAX_MESSAGES;
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

      // Check if AWS credentials are available for real AI
      const hasAWSCredentials = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID &&
        process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;

      if (hasAWSCredentials) {
        // Use real AI service
        const streamGenerator = enhancedAIChatService.streamChat(
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
        // Fallback to simulated responses
        const simulatedResponse = await getSimulatedResponse(content, agent);
        agentMessageContent = simulatedResponse;

        // Simulate streaming for better UX
        const words = simulatedResponse.split(' ');
        for (let i = 0; i < words.length; i++) {
          // Check if streaming was stopped
          if (controller.signal.aborted) {
            break;
          }

          await new Promise(resolve => setTimeout(resolve, 50));
          const partialContent = words.slice(0, i + 1).join(' ');

          setMessages(prev => {
            const newMessages = [...prev];
            const existingIndex = newMessages.findIndex(m => m.id === agentMessage.id);
            if (existingIndex >= 0) {
              newMessages[existingIndex].content = partialContent;
            } else {
              newMessages.push({ ...agentMessage, content: partialContent });
            }
            return newMessages;
          });
        }
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

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
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

  const getSimulatedResponse = async (userInput: string, agent: AIAgent): Promise<string> => {
    const input = userInput.toLowerCase();

    // Basic keyword-based responses based on agent personality
    if (input.includes('supply') || input.includes('lend')) {
      return getSupplyResponse(agent.personality);
    } else if (input.includes('borrow')) {
      return getBorrowResponse(agent.personality);
    } else if (input.includes('apy') || input.includes('rate')) {
      return getRateResponse(agent.personality);
    } else if (input.includes('risk')) {
      return getRiskResponse(agent.personality);
    } else if (input.includes('portfolio')) {
      return getPortfolioResponse(agent.personality);
    } else {
      return getDefaultResponse(agent.personality);
    }
  };

  const getSupplyResponse = (personality: string): string => {
    const responses = {
      conservative: "👨‍💼 I recommend beginning with USDT for maximum stability at 5.2% APY. This provides predictable returns with minimal risk. Once you're comfortable, you might consider allocating a small portion to SIX token for modest diversification. Prudent risk management is essential.",
      aggressive: "🧑‍🚀 Time to blast off with stellar yields! SIX token is offering 8.1% APY - that's rocket fuel! BORA at 7.8% is another stellar opportunity. For stable fuel, USDT gives you 5.2%. Ready to launch your capital into orbit?",
      balanced: "🧙 The ancient wisdom suggests diversification, traveler. Cast your spell with 60% USDT for stability (5.2% APY) and 40% between SIX and BORA for enchanted growth. This magical balance protects while allowing prosperity to flourish.",
      educational: "🧑‍🏫 Let me teach you about supply strategies, grasshopper. APY means Annual Percentage Yield - your earnings per year. USDT offers 5.2% (stable), SIX gives 8.1% (moderate risk), BORA provides 7.8% (gaming sector). Start small to learn the lessons of each market.",
      custom: "Based on current market data, here are your supply opportunities: USDT (5.2% APY), MBX (6.9% APY), BORA (7.8% APY), and SIX (8.1% APY). Which aligns with your risk preference?"
    };
    return responses[personality as keyof typeof responses] || responses.custom;
  };

  const getBorrowResponse = (personality: string): string => {
    const responses = {
      conservative: "👨‍💼 Borrowing requires careful consideration and proper collateralization. I recommend maintaining a health factor above 2.5 for maximum safety. Use KAIA as collateral to borrow USDT at 6.1% APR only if you have a clear repayment strategy and understand liquidation risks thoroughly.",
      aggressive: "🧑‍🚀 Ready to leverage your way to the moon! Use your KAIA as rocket fuel to borrow and amplify your positions. Keep your health factor above 2.0 for safe orbit. USDT borrowing at 6.1% APR can fuel your next stellar mission!",
      balanced: "🧙 The art of borrowing requires wisdom and balance. Your KAIA collateral must be strong enough to weather market storms. I counsel maintaining a health factor above 2.2 - this ancient practice protects against the chaos of price volatility.",
      educational: "🧑‍🏫 Borrowing lesson time! You need KAIA as collateral to borrow other assets. Health factor = your collateral value / borrowed amount. Keep it above 2.0 or face liquidation. Start with small amounts to understand the mechanics, grasshopper.",
      custom: "For borrowing on KiloLend, you'll need KAIA as collateral. Current rates: USDT 6.1% APR, gaming tokens 7-9% APR. Always maintain a healthy collateral ratio to avoid liquidation."
    };
    return responses[personality as keyof typeof responses] || responses.custom;
  };

  const getRateResponse = (personality: string): string => {
    const responses = {
      conservative: "👨‍💼 Current market rates are as follows: USDT supply offers 5.2% APY with excellent stability. For modest growth, SIX provides 8.1% APY. I recommend focusing on the USDT rate for your initial allocation, as it provides reliable returns with minimal volatility risk.",
      aggressive: "🧑‍🚀 Stellar rates detected! SIX is blazing at 8.1% APY, BORA rockets to 7.8%, MBX cruises at 6.9%, and USDT provides stable fuel at 5.2%. Time to launch your capital to maximum yield orbit!",
      balanced: "🧙 The cosmic rates reveal themselves: SIX channels 8.1% mystical energy, BORA flows at 7.8%, MBX resonates at 6.9%, while USDT provides grounding at 5.2%. Choose the path that harmonizes with your risk spirit, traveler.",
      educational: "🧑‍🏫 Time for a rates lesson! Supply APY means your annual earnings: SIX (8.1% - highest but gaming sector risk), BORA (7.8% - gaming ecosystem), MBX (6.9% - gaming platform), USDT (5.2% - stable, predictable). Higher rates often mean higher risk, grasshopper.",
      custom: "Current KiloLend rates: Supply APY - SIX (8.1%), BORA (7.8%), MBX (6.9%), USDT (5.2%). Borrow APR varies by asset. Which specific rate information do you need?"
    };
    return responses[personality as keyof typeof responses] || responses.custom;
  };

  const getRiskResponse = (personality: string): string => {
    const responses = {
      conservative: "👨‍💼 Risk management is paramount in DeFi. Primary risks include asset price volatility, smart contract risks, and liquidation for borrowers. I recommend diversification, conservative position sizing, and maintaining health factors well above minimum requirements. Never invest more than you can afford to lose.",
      aggressive: "🧑‍🚀 Every mission to the moon has risks! Gaming tokens have higher volatility but stellar potential. Liquidation risk exists when borrowing - keep that health factor above 2.0! Smart contract risks are minimal but present. Risk equals reward in the DeFi universe!",
      balanced: "🧙 The wise understand that with great power comes great responsibility. Market volatility, liquidation risks, and smart contract vulnerabilities all dwell in this realm. Balance your forces - diversify your holdings and maintain strong health factors to weather any storm.",
      educational: "🧑‍🏫 Let's learn about DeFi risks, student. Market risk: prices go up and down. Liquidation risk: if you borrow too much, your collateral gets sold. Smart contract risk: code bugs (rare but possible). Mitigation: diversify, use stop-losses, and never use leverage you don't understand.",
      custom: "KiloLend risks include: Price volatility (especially gaming tokens), liquidation risk for borrowers, smart contract risk, and market liquidity risk. How can I help you assess your specific risk tolerance?"
    };
    return responses[personality as keyof typeof responses] || responses.custom;
  };

  const getPortfolioResponse = (personality: string): string => {
    const responses = {
      conservative: "👨‍💼 A well-structured portfolio prioritizes capital preservation with steady growth. I recommend 70-80% in stable assets like USDT, with careful allocation to higher-yield opportunities only after establishing a solid foundation. Regular monitoring and rebalancing are essential.",
      aggressive: "🧑‍🚀 Time to build a stellar portfolio for maximum gains! Diversify across multiple yield opportunities - SIX, BORA, MBX for growth, with some USDT for stability. Use KAIA collateral strategically to amplify positions. Shoot for the stars!",
      balanced: "🧙 The art of portfolio alchemy requires careful balance of elements. Combine stable foundations (USDT) with growth catalysts (gaming tokens). The golden ratio suggests 60% stability, 40% growth. Monitor your health factor like a precious crystal.",
      educational: "🧑‍🏫 Portfolio lesson time! Diversification reduces risk - don't put all eggs in one basket. Asset allocation depends on your goals: conservative (mostly USDT), balanced (mix of stable and growth), aggressive (more gaming tokens). Start simple, learn as you grow.",
      custom: "Portfolio optimization depends on your goals and risk tolerance. I can help analyze your current positions and suggest improvements based on market data and your preferences. What's your current portfolio status?"
    };
    return responses[personality as keyof typeof responses] || responses.custom;
  };

  const getDefaultResponse = (personality: string): string => {
    const responses = {
      conservative: "👨‍💼 I'm here to provide professional guidance on KiloLend strategies. I can assist with market analysis, risk assessment, portfolio planning, or answer any questions about our lending protocol. How may I help you achieve your financial objectives today?",
      aggressive: "🧑‍🚀 Ready to explore the DeFi universe! I can help you discover stellar yield opportunities, analyze market data, plan leveraged strategies, or answer any questions about maximizing returns on KiloLend. What's our mission today?",
      balanced: "🧙 I am here to guide you through the mystical realms of DeFi. Whether you seek market wisdom, portfolio balance, risk insights, or strategies for growth, I shall help you navigate these waters. What knowledge do you seek, traveler?",
      educational: "🧑‍🏫 I'm here to teach you the ways of DeFi! I can explain concepts, analyze markets, help with strategies, or answer any questions about KiloLend. Learning is a journey - what would you like to explore today, grasshopper?",
      custom: "I'm here to help with all your KiloLend questions! I can assist with market analysis, portfolio strategies, risk assessment, and more. What would you like to know?"
    };
    return responses[personality as keyof typeof responses] || responses.custom;
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);

    // Clean up old session and create new one
    if (account) {
      conversationMemory.cleanupOldSessions();
      const newSessionId = enhancedAIChatService.initializeSession(account, agent);
      setSessionId(newSessionId);
    }

    // Re-add greeting
    if (agent) {
      const greetingMessage: ChatMessage = {
        id: `greeting_${Date.now()}`,
        content: getAgentGreeting(agent),
        sender: 'agent',
        timestamp: Date.now()
      };
      setMessages([greetingMessage]);
    }
  }, [agent, account]);

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
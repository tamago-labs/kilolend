export interface ConversationContext {
  userAddress: string;
  sessionId: string;
  agentId: string;
  startTime: number;
  lastActivity: number;
  
  // User behavior patterns
  patterns: {
    preferredTopics: string[];
    commonQuestions: string[];
    riskBehavior: 'conservative' | 'moderate' | 'aggressive';
    engagementLevel: number; // 0-1
    responsePreference: 'detailed' | 'concise' | 'educational';
  };
  
  // Market context when conversation started
  marketSnapshot: {
    bestAPY: number;
    totalTVL: number;
    userPortfolioValue: number;
    marketCondition: 'bullish' | 'bearish' | 'sideways';
  };
  
  // Conversation goals and outcomes
  goals: {
    stated: string[]; // What user explicitly said they want
    inferred: string[]; // What we think they're trying to achieve
    achieved: string[]; // Goals that have been met
  };
  
  // Action context
  actions: {
    considered: ActionConsideration[];
    completed: CompletedAction[];
    recommended: RecommendedAction[];
  };
}

export interface ActionConsideration {
  action: 'supply' | 'borrow' | 'withdraw' | 'repay';
  asset: string;
  amount: number;
  timestamp: number;
  reasoning: string;
  outcome: 'proceeded' | 'declined' | 'postponed';
}

export interface CompletedAction {
  action: 'supply' | 'borrow' | 'withdraw' | 'repay';
  asset: string;
  amount: number;
  timestamp: number;
  txHash?: string;
  result: 'success' | 'failed';
  impactOnPortfolio: {
    healthFactorChange?: number;
    netWorthChange?: number;
    newAPY?: number;
  };
}

export interface RecommendedAction {
  id: string;
  action: 'supply' | 'borrow' | 'withdraw' | 'repay';
  asset: string;
  amount: number;
  reasoning: string;
  expectedOutcome: string;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: number;
  priority: number; // 1-10
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface ConversationMemory {
  shortTerm: {
    recentTopics: string[];
    currentGoal?: string;
    pendingQuestions: string[];
    contextualInfo: Record<string, any>;
  };
  
  longTerm: {
    userPreferences: {
      preferredAssets: string[];
      riskTolerance: 'low' | 'medium' | 'high';
      investmentStyle: 'conservative' | 'balanced' | 'aggressive';
      learningStyle: 'explain-first' | 'action-first' | 'visual';
      communicationStyle: 'formal' | 'casual' | 'friendly';
    };
    
    historicalActions: CompletedAction[];
    successfulStrategies: string[];
    avoidedMistakes: string[];
    keyLearnings: string[];
  };
  
  sessionContext: {
    entryPoint: string; // How they started the conversation
    deviceType: 'mobile' | 'desktop';
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    marketCondition: string;
    urgencyLevel: 'low' | 'medium' | 'high';
  };
}

export class ConversationMemoryService {
  private static instance: ConversationMemoryService;
  private contexts: Map<string, ConversationContext> = new Map();
  private memories: Map<string, ConversationMemory> = new Map();
  
  private constructor() {
    // this.loadFromStorage();
  }
  
  static getInstance(): ConversationMemoryService {
    if (!ConversationMemoryService.instance) {
      ConversationMemoryService.instance = new ConversationMemoryService();
    }
    return ConversationMemoryService.instance;
  }
  
  initializeSession(userAddress: string, agentId: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const context: ConversationContext = {
      userAddress,
      sessionId,
      agentId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      patterns: {
        preferredTopics: [],
        commonQuestions: [],
        riskBehavior: 'moderate',
        engagementLevel: 0.5,
        responsePreference: 'detailed'
      },
      marketSnapshot: {
        bestAPY: 0,
        totalTVL: 0,
        userPortfolioValue: 0,
        marketCondition: 'sideways'
      },
      goals: {
        stated: [],
        inferred: [],
        achieved: []
      },
      actions: {
        considered: [],
        completed: [],
        recommended: []
      }
    };
    
    this.contexts.set(sessionId, context);
    this.ensureMemoryExists(userAddress);
    
    return sessionId;
  }
  
  updateActivity(sessionId: string): void {
    const context = this.contexts.get(sessionId);
    if (context) {
      context.lastActivity = Date.now();
    }
  }
  
  addTopicToConversation(sessionId: string, topic: string): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    const memory = this.memories.get(context.userAddress);
    if (!memory) return;
    
    // Add to short-term memory
    memory.shortTerm.recentTopics.unshift(topic);
    memory.shortTerm.recentTopics = memory.shortTerm.recentTopics.slice(0, 10);
    
    // Update patterns
    if (!context.patterns.preferredTopics.includes(topic)) {
      context.patterns.preferredTopics.push(topic);
    }
    
    this.saveToStorage();
  }
  
  recordActionConsideration(sessionId: string, consideration: ActionConsideration): void {
    const context = this.contexts.get(sessionId);
    if (context) {
      context.actions.considered.push(consideration);
      this.saveToStorage();
    }
  }
  
  recordCompletedAction(sessionId: string, action: CompletedAction): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    context.actions.completed.push(action);
    
    const memory = this.memories.get(context.userAddress);
    if (memory) {
      memory.longTerm.historicalActions.push(action);
      
      // Update successful strategies if action was successful
      if (action.result === 'success' && action.impactOnPortfolio.netWorthChange && action.impactOnPortfolio.netWorthChange > 0) {
        const strategy = `${action.action}_${action.asset}`;
        if (!memory.longTerm.successfulStrategies.includes(strategy)) {
          memory.longTerm.successfulStrategies.push(strategy);
        }
      }
    }
    
    this.saveToStorage();
  }
  
  addRecommendation(sessionId: string, recommendation: RecommendedAction): void {
    const context = this.contexts.get(sessionId);
    if (context) {
      context.actions.recommended.push(recommendation);
      this.saveToStorage();
    }
  }
  
  updateRecommendationStatus(sessionId: string, recommendationId: string, status: RecommendedAction['status']): void {
    const context = this.contexts.get(sessionId);
    if (context) {
      const rec = context.actions.recommended.find(r => r.id === recommendationId);
      if (rec) {
        rec.status = status;
        this.saveToStorage();
      }
    }
  }
  
  inferUserGoals(sessionId: string, messageContent: string): void {
    const context = this.contexts.get(sessionId);
    if (!context) return;
    
    const lowerContent = messageContent.toLowerCase();
    
    // Infer goals from message content
    if (lowerContent.includes('yield') || lowerContent.includes('earn') || lowerContent.includes('apy')) {
      this.addInferredGoal(context, 'maximize_yield');
    }
    
    if (lowerContent.includes('safe') || lowerContent.includes('secure') || lowerContent.includes('low risk')) {
      this.addInferredGoal(context, 'preserve_capital');
    }
    
    if (lowerContent.includes('borrow') || lowerContent.includes('leverage')) {
      this.addInferredGoal(context, 'access_liquidity');
    }
    
    if (lowerContent.includes('diversif') || lowerContent.includes('spread') || lowerContent.includes('balance')) {
      this.addInferredGoal(context, 'diversify_portfolio');
    }
    
    if (lowerContent.includes('learn') || lowerContent.includes('understand') || lowerContent.includes('explain')) {
      this.addInferredGoal(context, 'understand_defi');
    }
  }
  
  private addInferredGoal(context: ConversationContext, goal: string): void {
    if (!context.goals.inferred.includes(goal)) {
      context.goals.inferred.push(goal);
    }
  }
  
  getConversationContext(sessionId: string): ConversationContext | null {
    return this.contexts.get(sessionId) || null;
  }
  
  getUserMemory(userAddress: string): ConversationMemory | null {
    return this.memories.get(userAddress) || null;
  }
  
  generateContextualPrompt(sessionId: string): string {
    const context = this.contexts.get(sessionId);
    if (!context) return '';
    
    const memory = this.memories.get(context.userAddress);
    if (!memory) return '';
    
    let prompt = '\\n\\nCONVERSATION CONTEXT:\\n';
    
    // Add user preferences
    if (memory.longTerm.userPreferences.preferredAssets.length > 0) {
      prompt += `User typically prefers: ${memory.longTerm.userPreferences.preferredAssets.join(', ')}\\n`;
    }
    
    prompt += `Risk tolerance: ${memory.longTerm.userPreferences.riskTolerance}\\n`;
    prompt += `Communication style: ${memory.longTerm.userPreferences.communicationStyle}\\n`;
    
    // Add recent topics
    if (memory.shortTerm.recentTopics.length > 0) {
      prompt += `Recent topics discussed: ${memory.shortTerm.recentTopics.slice(0, 3).join(', ')}\\n`;
    }
    
    // Add current goals
    if (context.goals.inferred.length > 0) {
      prompt += `User goals: ${context.goals.inferred.join(', ')}\\n`;
    }
    
    // Add successful strategies
    if (memory.longTerm.successfulStrategies.length > 0) {
      prompt += `Previously successful: ${memory.longTerm.successfulStrategies.slice(0, 3).join(', ')}\\n`;
    }
    
    // Add pending recommendations
    const pendingRecs = context.actions.recommended.filter(r => r.status === 'pending');
    if (pendingRecs.length > 0) {
      prompt += `Pending recommendations: ${pendingRecs.length} actions awaiting decision\\n`;
    }
    
    return prompt;
  }
  
  updateMarketSnapshot(sessionId: string, marketData: any): void {
    const context = this.contexts.get(sessionId);
    if (context && marketData) {
      context.marketSnapshot = {
        bestAPY: marketData.bestAPY || 0,
        totalTVL: marketData.totalTVL || 0,
        userPortfolioValue: marketData.userPortfolioValue || 0,
        marketCondition: this.determineMarketCondition(marketData)
      };
    }
  }
  
  private determineMarketCondition(marketData: any): 'bullish' | 'bearish' | 'sideways' {
    // Simple heuristic - can be enhanced with more sophisticated analysis
    const avgAPY = marketData.avgSupplyAPY || 0;
    if (avgAPY > 8) return 'bullish';
    if (avgAPY < 4) return 'bearish';
    return 'sideways';
  }
  
  private ensureMemoryExists(userAddress: string): void {
    if (!this.memories.has(userAddress)) {
      const memory: ConversationMemory = {
        shortTerm: {
          recentTopics: [],
          currentGoal: undefined,
          pendingQuestions: [],
          contextualInfo: {}
        },
        longTerm: {
          userPreferences: {
            preferredAssets: [],
            riskTolerance: 'medium',
            investmentStyle: 'balanced',
            learningStyle: 'explain-first',
            communicationStyle: 'friendly'
          },
          historicalActions: [],
          successfulStrategies: [],
          avoidedMistakes: [],
          keyLearnings: []
        },
        sessionContext: {
          entryPoint: 'ai-chat',
          deviceType: 'mobile',
          timeOfDay: this.getTimeOfDay(),
          marketCondition: 'sideways',
          urgencyLevel: 'low'
        }
      };
      
      this.memories.set(userAddress, memory);
    }
  }
  
  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }
  
  // private loadFromStorage(): void {
  //   try {
  //     const contextData = localStorage.getItem('kilolend_conversation_contexts');
  //     const memoryData = localStorage.getItem('kilolend_conversation_memories');
      
  //     if (contextData) {
  //       const contexts = JSON.parse(contextData);
  //       Object.entries(contexts).forEach(([key, value]) => {
  //         this.contexts.set(key, value as ConversationContext);
  //       });
  //     }
      
  //     if (memoryData) {
  //       const memories = JSON.parse(memoryData);
  //       Object.entries(memories).forEach(([key, value]) => {
  //         this.memories.set(key, value as ConversationMemory);
  //       });
  //     }
  //   } catch (error) {
  //     console.warn('Failed to load conversation memory from storage:', error);
  //   }
  // }
  
  private saveToStorage(): void {
    try {
      const contextData = Object.fromEntries(this.contexts.entries());
      const memoryData = Object.fromEntries(this.memories.entries());
      
      localStorage.setItem('kilolend_conversation_contexts', JSON.stringify(contextData));
      localStorage.setItem('kilolend_conversation_memories', JSON.stringify(memoryData));
    } catch (error) {
      console.warn('Failed to save conversation memory to storage:', error);
    }
  }
  
  cleanupOldSessions(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    for (const [sessionId, context] of this.contexts.entries()) {
      if (context.lastActivity < cutoffTime) {
        this.contexts.delete(sessionId);
      }
    }
    
    this.saveToStorage();
  }
}

export const conversationMemory = ConversationMemoryService.getInstance();
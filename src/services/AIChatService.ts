import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { AIAgent } from '@/types/aiAgent';
import { kilolendToolsService } from './kilolendTools';
import { extensionKiloLendToolsService } from './extensionKiloLendToolsService';
import { conversationMemory } from './memory/conversationMemory'; 

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: number;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  input: any;
  status: 'pending' | 'success' | 'error';
  startTime: number;
  result?: any;
  error?: string;
}

export interface StreamChunk {
  type: 'text' | 'tool_start' | 'tool_progress' | 'tool_complete' | 'tool_error';
  content: string;
  toolCall?: ToolCall;
}

interface ToolUse {
  id: string;
  name: string;
  input: any;
  inputJson?: string;
}

let globalMarketData: any[] = [];
let globalPortfolioData: any = null;
let globalUserAddress: string | null = null;

export const injectKiloLendData = (markets: any[], portfolio?: any, userAddress?: string) => {
  globalMarketData = markets;
  globalPortfolioData = portfolio;
  globalUserAddress = userAddress || null;
  
  // Inject data into all tool services
  kilolendToolsService.setKiloLendData(markets, portfolio, userAddress);
  extensionKiloLendToolsService.setKiloLendData(markets, portfolio, userAddress);
  
  // Initialize action integration with stores (will be done in the hook)
};

export class NewAIChatService {
  private client: BedrockRuntimeClient;
  private sessionId: string | null = null;

  constructor() {
    const awsConfig = this.getAwsConfig();

    this.client = new BedrockRuntimeClient({
      region: awsConfig.awsRegion,
      credentials: {
        accessKeyId: awsConfig.awsAccessKey,
        secretAccessKey: awsConfig.awsSecretKey,
      }
    });
  }

  initializeSession(userAddress: string, agent: AIAgent): string {
    this.sessionId = conversationMemory.initializeSession(userAddress, agent.id);
    return this.sessionId;
  }

  private getAwsConfig(): { awsAccessKey: string; awsSecretKey: string; awsRegion: string } {
    return {
      awsAccessKey: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
      awsSecretKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
      awsRegion: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1'
    };
  }

  async *streamChat(
    agent: AIAgent,
    chatHistory: ChatMessage[],
    currentMessage: string,
    userAddress?: string
  ): AsyncGenerator<StreamChunk, { stopReason?: string }, unknown> {
    
    // Initialize or get session
    let sessionId = this.sessionId;
    if (!sessionId && userAddress) {
      sessionId = this.initializeSession(userAddress, agent);
    }
    
    // Update conversation memory
    if (sessionId) {
      conversationMemory.updateActivity(sessionId);
      conversationMemory.inferUserGoals(sessionId, currentMessage);
      conversationMemory.addTopicToConversation(sessionId, this.extractTopicFromMessage(currentMessage));
    }
    
    let messages = this.buildConversationMessages(agent, chatHistory, currentMessage, userAddress);
    let finalStopReason: string | undefined;
    
    // Combine all available tools
    const basicTools = kilolendToolsService.getClaudeToolsFormat();
    const moreTools = extensionKiloLendToolsService.getClaudeToolsFormat();
    const availableTools = [...basicTools, ...moreTools];

    try {
      while (true) {
        const payload = {
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 4000,
          messages: messages,
          tools: availableTools.length > 0 ? availableTools : undefined,
        };

        const command = new InvokeModelWithResponseStreamCommand({
          contentType: "application/json",
          body: JSON.stringify(payload),
          modelId: "apac.anthropic.claude-sonnet-4-20250514-v1:0",
        });

        const apiResponse: any = await this.client.send(command);

        let pendingToolUses: ToolUse[] = [];
        let hasToolUse = false;
        let streamedText = '';

        // Process the response stream
        for await (const item of apiResponse.body) {
          if (item.chunk?.bytes) {
            try {
              const chunk = JSON.parse(new TextDecoder().decode(item.chunk.bytes));
              const chunkType = chunk.type;

              if (chunkType === "message_delta" && chunk.delta?.stop_reason) {
                finalStopReason = chunk.delta.stop_reason;
              } else if (chunkType === "content_block_start") {
                if (chunk.content_block?.type === 'tool_use') {
                  hasToolUse = true;
                  const toolCall: ToolCall = {
                    id: chunk.content_block.id,
                    name: chunk.content_block.name,
                    input: {},
                    status: 'pending',
                    startTime: Date.now()
                  };
                  
                  pendingToolUses.push({
                    id: chunk.content_block.id,
                    name: chunk.content_block.name,
                    input: {},
                  });
                  
                  yield {
                    type: 'tool_start',
                    content: `\n\n🔧 Using ${chunk.content_block.name}...\n`,
                    toolCall: toolCall
                  };
                }
              } else if (chunkType === "content_block_delta") {
                if (chunk.delta?.type === 'text_delta' && chunk.delta?.text) {
                  yield {
                    type: 'text',
                    content: chunk.delta.text
                  };
                  streamedText += chunk.delta.text;
                } else if (chunk.delta?.type === 'input_json_delta' && chunk.delta?.partial_json) {
                  // Collect tool input
                  const lastTool: any = pendingToolUses[pendingToolUses.length - 1];
                  if (lastTool) {
                    if (!lastTool.inputJson) lastTool.inputJson = '';
                    lastTool.inputJson += chunk.delta.partial_json;
                  }
                }
              } else if (chunkType === "content_block_stop") {
                const lastTool: any = pendingToolUses[pendingToolUses.length - 1];
                if (lastTool && lastTool.inputJson) {
                  try {
                    lastTool.input = JSON.parse(lastTool.inputJson);
                  } catch (parseError) {
                    console.error('Failed to parse tool input JSON:', parseError);
                    lastTool.input = {};
                  }
                }
              }
            } catch (parseError) {
              console.error('Failed to parse chunk:', parseError);
            }
          }
        }

        // If no tools were used, complete
        if (!hasToolUse || pendingToolUses.length === 0) {
          break;
        }

        // Build assistant message content
        const assistantContent: any[] = [];
        if (streamedText.trim()) {
          assistantContent.push({
            type: 'text',
            text: streamedText.trim()
          });
        }

        // Add tool use blocks
        for (const toolUse of pendingToolUses) {
          assistantContent.push({
            type: 'tool_use',
            id: toolUse.id,
            name: toolUse.name,
            input: toolUse.input
          });
        }

        // Add assistant message
        if (assistantContent.length > 0) {
          messages.push({
            role: 'assistant',
            content: assistantContent
          });
        }

        // Execute tools and add results
        const toolResults: any[] = [];
        for (const toolUse of pendingToolUses) {
          try {
            yield {
              type: 'tool_progress',
              content: `\n🔄 Executing ${toolUse.name}...\n`,
            };

            // Execute tool from appropriate service
            let result;
            if (basicTools.some(t => t.name === toolUse.name)) {
              result = await kilolendToolsService.executeTool(toolUse.name, toolUse.input);
            } else {
              result = await extensionKiloLendToolsService.executeTool(toolUse.name, toolUse.input, sessionId || "");
            }

            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
            });

            yield {
              type: 'tool_complete',
              content: `✅ ${toolUse.name} completed\n`,
            };
          } catch (error) {
            console.error(`Tool execution error for ${toolUse.name}:`, error);
            
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: [{
                type: 'text',
                text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
              }],
              is_error: true
            });

            yield {
              type: 'tool_error',
              content: `❌ ${toolUse.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`,
            };
          }
        }

        // Add tool results message
        if (toolResults.length > 0) {
          messages.push({
            role: 'user',
            content: toolResults
          });
        }
      }

    } catch (error: any) {
      console.error('AI Chat Service: API error:', error);
      throw new Error(`Claude API error: ${error.message}`);
    }

    return { stopReason: finalStopReason };
  }

  private buildConversationMessages(
    agent: AIAgent, 
    chatHistory: ChatMessage[], 
    currentMessage: string,
    userAddress?: string
  ): any[] {
    const messages: any[] = [];

    // Add system message with agent's system prompt
    const systemPrompt = this.buildSystemPrompt(agent, userAddress);
    
    // Add previous conversation history
    for (const msg of chatHistory) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: [{ type: 'text', text: msg.content }]
      });
    }

    // Add current message with system context
    const userContent = userAddress 
      ? `${currentMessage}\n\n[User wallet: ${userAddress}]`
      : currentMessage;

    messages.push({
      role: 'user',
      content: [{ type: 'text', text: userContent }]
    });

    // Insert system prompt as first message
    messages.unshift({
      role: 'user',
      content: [{ type: 'text', text: systemPrompt }]
    });

    return messages;
  }

  private buildSystemPrompt(agent: AIAgent, userAddress?: string, sessionId?: string | null): string {
    let systemPrompt = agent.systemPrompt;

    // Add KiloLend-specific context
    systemPrompt += this.getKiloLendContext();
    systemPrompt += this.getToolsContext();

    // Add conversation memory context
    if (sessionId) {
      systemPrompt += conversationMemory.generateContextualPrompt(sessionId);
    }

    // Add user context if available
    if (userAddress && globalPortfolioData) {
      systemPrompt += this.getUserContext(userAddress);
    }

    return systemPrompt;
  }

  private getKiloLendContext(): string {
    return `\n\nKILOLEND PROTOCOL CONTEXT:
You are an AI assistant for KiloLend, a decentralized lending protocol on the Kaia blockchain.

AVAILABLE MARKETS:
- USDT: Stablecoin for secure lending (5.2% APY supply)
- MBX: MARBLEX gaming token (6.9% APY supply)
- BORA: Gaming ecosystem token (7.8% APY supply)  
- SIX: SIX Network utility token (8.1% APY supply)
- KAIA: Native Kaia token (native token)

CURRENT MARKET CONDITIONS:
${globalMarketData.length > 0 ? this.formatMarketData() : 'Market data loading...'}

PROTOCOL FEATURES:
- Supply assets to earn APY
- Borrow against KAIA collateral
- Health factor monitoring for liquidation protection
- Real-time interest rate updates
- AI-powered portfolio optimization`;
  }

  private formatMarketData(): string {
    return globalMarketData.map(market => 
      `- ${market.symbol}: Supply ${market.supplyAPY?.toFixed(2)}% APY, Utilization ${market.utilization?.toFixed(1)}%`
    ).join('\n');
  }

  private getToolsContext(): string {
    return `\n\nAVAILABLE TOOLS:
Basic Tools:
- get_market_data: Get current market rates and statistics
- get_user_portfolio: Get user's positions and portfolio health
- find_yield_opportunities: Discover best yield strategies
- analyze_portfolio_risk: Assess liquidation risk and recommendations
- simulate_positions: Model potential position changes
- get_kilo_points: Get user's KILO points and leaderboard data

Advanced Tools:
- analyze_market_trends: Deep market analysis with timing insights
- generate_personalized_strategy: Comprehensive strategy based on goals
- execute_recommended_action: Execute supply/borrow/withdraw/repay actions

When users ask about current data, portfolio, market analysis, or want to execute actions, use the appropriate tools.
Always provide actionable insights based on real data from tools.
For action execution, use execute_recommended_action tool which will open the appropriate modal for the user.`;
  }

  private getUserContext(userAddress: string): string {
    if (!globalPortfolioData) return '';
    
    return `\n\nUSER PORTFOLIO CONTEXT:
- Wallet: ${userAddress}
- Total Supplied: $${globalPortfolioData.totalSupplied?.toFixed(2) || '0.00'}
- Total Borrowed: $${globalPortfolioData.totalBorrowed?.toFixed(2) || '0.00'}
- Health Factor: ${globalPortfolioData.healthFactor?.toFixed(2) || 'N/A'}
- Net APY: ${globalPortfolioData.netAPY?.toFixed(2) || '0.00'}%

Personalize recommendations based on their current positions and risk profile.`;
  }
  
  private extractTopicFromMessage(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('supply') || lowerMessage.includes('lend')) {
      return 'supply_strategy';
    }
    if (lowerMessage.includes('borrow')) {
      return 'borrowing';
    }
    if (lowerMessage.includes('apy') || lowerMessage.includes('rate') || lowerMessage.includes('yield')) {
      return 'yield_analysis';
    }
    if (lowerMessage.includes('risk') || lowerMessage.includes('safe') || lowerMessage.includes('liquidation')) {
      return 'risk_management';
    }
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('position')) {
      return 'portfolio_management';
    }
    if (lowerMessage.includes('market') || lowerMessage.includes('trend')) {
      return 'market_analysis';
    }
    if (lowerMessage.includes('strategy') || lowerMessage.includes('plan')) {
      return 'strategy_planning';
    }
    
    return 'general_inquiry';
  }
}

export const AIChatService = new NewAIChatService();
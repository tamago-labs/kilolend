import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { ContractMarket } from '@/stores/contractMarketStore';
import { ContractUserPosition } from '@/stores/contractUserStore';

export interface PoolRecommendation {
    id: string;
    type: 'supply' | 'borrow';
    poolId: string;
    name: string;
    symbol: string;
    reason: string;
    score: number; // 0-100, AI confidence/relevance score
    suggestedAmount?: number;
    estimatedEarnings?: number;
    estimatedCosts?: number;
    duration: string;
    riskWarnings: string[];
    benefits: string[];
    apy: number;
    collateralRequired?: number;
    liquidationPrice?: number;
}

export interface UserContext {
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
    investmentAmount?: number;
    preferredAssets?: string[];
    timeHorizon?: string;
    currentPositions?: ContractUserPosition[];
    totalCollateral?: number;
    totalSupplied?: number;
    totalBorrowed?: number;
    healthFactor?: number;
    netAPY?: number;
}

export class LendingAIService {
    private client: BedrockRuntimeClient;

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

    private getAwsConfig(): { awsAccessKey: string; awsSecretKey: string; awsRegion: string } {
        return {
            awsAccessKey: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
            awsSecretKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
            awsRegion: process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1",
        };
    }

    /**
     * Analyze user query to extract context and preferences
     */
    private extractUserContext(userPrompt: string): UserContext {
        const prompt = userPrompt.toLowerCase();
        let context: UserContext = {};

        // Extract risk tolerance
        if (prompt.includes('safe') || prompt.includes('low risk') || prompt.includes('conservative')) {
            context.riskTolerance = 'conservative';
        } else if (prompt.includes('high yield') || prompt.includes('aggressive') || prompt.includes('risky')) {
            context.riskTolerance = 'aggressive';
        } else {
            context.riskTolerance = 'moderate';
        }

        // Extract investment amount
        const amountMatches = prompt.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/g);
        if (amountMatches) {
            const amount = parseFloat(amountMatches[0].replace(/[$,]/g, ''));
            if (amount > 0) {
                context.investmentAmount = amount;
            }
        }

        // Extract preferred assets
        const assets = [];
        if (prompt.includes('usdt') || prompt.includes('tether') || prompt.includes('stablecoin')) assets.push('USDT');
        if (prompt.includes('kaia') || prompt.includes('native')) assets.push('KAIA');
        if (prompt.includes('mbx') || prompt.includes('marblex') || prompt.includes('gaming')) assets.push('MBX');
        if (prompt.includes('bora') || prompt.includes('gaming')) assets.push('BORA');
        if (prompt.includes('six') || prompt.includes('network')) assets.push('SIX');
        if (assets.length > 0) {
            context.preferredAssets = assets;
        }

        return context;
    }

    /**
     * Calculate risk level for a pool based on various factors
     */
    private calculatePoolRisk(pool: ContractMarket): 'low' | 'medium' | 'high' {
        let riskScore = 0;

        // High utilization increases risk
        if (pool.utilization > 90) riskScore += 3;
        else if (pool.utilization > 70) riskScore += 2;
        else if (pool.utilization > 50) riskScore += 1;

        // Low TVL (total supply + borrow) increases risk
        const tvl = pool.totalSupply + pool.totalBorrow;
        if (tvl < 100000) riskScore += 3;
        else if (tvl < 500000) riskScore += 2;
        else if (tvl < 1000000) riskScore += 1;

        // High price volatility increases risk
        if (Math.abs(pool.priceChange24h) > 5) riskScore += 3;
        else if (Math.abs(pool.priceChange24h) > 2) riskScore += 2;
        else if (Math.abs(pool.priceChange24h) > 1) riskScore += 1;

        // High APY differential may indicate risk
        const apyDiff = pool.borrowAPR - pool.supplyAPY;
        if (apyDiff > 5) riskScore += 2;
        else if (apyDiff > 3) riskScore += 1;

        // Stablecoins (USDT) are generally lower risk
        if (pool.symbol === 'USDT') riskScore = Math.max(0, riskScore - 2);

        // Native token (KAIA) used as collateral is lower risk
        if (pool.symbol === 'KAIA' && pool.isCollateralOnly) riskScore = Math.max(0, riskScore - 1);

        if (riskScore >= 6) return 'high';
        if (riskScore >= 3) return 'medium';
        return 'low';
    }

    /**
     * Generate comprehensive system prompt for AI analysis
     */
    private generateSystemPrompt(): string {
        return `You are KiloBot, an expert DeFi advisor for KiloLend on the Kaia blockchain. You analyze user preferences and current market data to recommend optimal lending strategies.

AVAILABLE MARKETS:
- USDT: Stablecoin lending with stable returns
- MBX: MARBLEX gaming token with medium volatility
- BORA: Gaming ecosystem token with growth potential
- SIX: SIX Network utility token
- KAIA: Native Kaia token

ANALYSIS FRAMEWORK:
1. Risk Assessment: Match user risk tolerance with appropriate pools
2. Yield Optimization: Maximize returns within user's risk parameters  
3. Portfolio Diversification: Recommend asset allocation across pools
4. Market Timing: Consider current APYs, utilization, and trends
5. Capital Efficiency: Optimize for user's investment amount
6. Health Factor: Ensure borrowing positions remain healthy (>1.5)

POOL EVALUATION CRITERIA:
- Supply APY and Borrow APR rates
- Total Supply and Borrow amounts as liquidity indicators
- Utilization rate (higher = more risky but potentially more rewards)
- 24h price changes for volatility assessment
- Pool health and sustainability
- Collateral requirements for borrowing

RECOMMENDATION TYPES:
- SUPPLY: Lend assets to earn APY (lower risk)
- BORROW: Take loans using collateral (higher risk, requires KAIA collateral)
- COLLATERAL: Deposit KAIA for borrowing power

USER CONTEXT ANALYSIS:
- Current positions and portfolio balance
- Health factor for existing borrows
- Net APY across all positions
- Available collateral for new borrows

RESPONSE FORMAT:
Return a JSON array of 3-5 personalized recommendations:
[{
  "id": "rec_1",
  "type": "supply" | "borrow",
  "poolId": "pool_id_from_data",
  "name": "Strategy Name",
  "symbol": "ASSET",
  "reason": "Why this recommendation fits user needs",
  "score": 85,
  "suggestedAmount": 1000,
  "estimatedEarnings": 52.0,
  "estimatedCosts": 0,
  "duration": "30 days",
  "riskWarnings": ["Market volatility risk", "Smart contract risk"],
  "benefits": ["Stable returns", "High liquidity"],
  "apy": 5.2,
  "collateralRequired": 0,
  "liquidationPrice": 0
}]

IMPORTANT: 
- Only recommend pools that are marked as "isActive": true
- For borrow recommendations, ensure user has sufficient collateral
- Consider user's existing positions to avoid over-concentration
- Always provide realistic numbers and clear explanations
- Factor in gas costs for small amounts
- Prioritize portfolio health and diversification`;
    }

    /**
     * Generate pool recommendations using AI analysis
     */
    async getPoolRecommendations(
        userPrompt: string,
        pools: ContractMarket[],
        userContext?: UserContext
    ): Promise<PoolRecommendation[]> {

        // Extract user context from prompt and merge with provided context
        const extractedContext = this.extractUserContext(userPrompt);
        const finalContext = { ...extractedContext, ...userContext };

        // Filter and enhance pool data
        const activePools = pools.filter(pool => pool.isActive).map(pool => ({
            ...pool,
            riskLevel: this.calculatePoolRisk(pool),
            tvl: pool.totalSupply + pool.totalBorrow // Calculate TVL for AI analysis
        }));

        // Create comprehensive input for AI
        const analysisInput = {
            user_request: userPrompt,
            user_context: finalContext,
            available_pools: activePools,
            market_summary: {
                total_pools: activePools.length,
                avg_supply_apy: activePools.reduce((sum, p) => sum + p.supplyAPY, 0) / activePools.length,
                avg_borrow_apr: activePools.reduce((sum, p) => sum + p.borrowAPR, 0) / activePools.length,
                total_tvl: activePools.reduce((sum, p) => sum + p.totalSupply + p.totalBorrow, 0),
                highest_apy_pool: activePools.sort((a, b) => b.supplyAPY - a.supplyAPY)[0]?.symbol,
                lowest_risk_pools: activePools.filter(p => this.calculatePoolRisk(p) === 'low').map(p => p.symbol),
                user_portfolio: {
                    total_supplied: finalContext.totalSupplied || 0,
                    total_borrowed: finalContext.totalBorrowed || 0,
                    health_factor: finalContext.healthFactor || 999,
                    net_apy: finalContext.netAPY || 0,
                    position_count: finalContext.currentPositions?.length || 0
                }
            }
        };

        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 2000,
            system: this.generateSystemPrompt(),
            messages: [
                { 
                    role: "user", 
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify(analysisInput, null, 2) 
                    }] 
                }
            ]
        };

        const command = new InvokeModelCommand({
            modelId: "apac.anthropic.claude-sonnet-4-20250514-v1:0",
            body: JSON.stringify(payload),
            accept: "application/json",
            contentType: "application/json",
        });

        try {
            const response = await this.client.send(command);
            const body = JSON.parse(Buffer.from(response.body).toString("utf-8"));
            const outputText = body.content[0].text;

            // Parse JSON from AI response
            const jsonMatch = outputText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const recommendations: PoolRecommendation[] = JSON.parse(jsonMatch[0]);
                
                // Validate and enhance recommendations
                return this.validateRecommendations(recommendations, activePools);
            }

            throw new Error("No valid recommendations received from AI");

        } catch (error: any) {
            console.error("AI Recommendation Error:", error);
            
            // Fallback to rule-based recommendations
            return this.generateFallbackRecommendations(userPrompt, activePools, userContext);
        }
    }

    /**
     * Validate AI recommendations and ensure data consistency
     */
    private validateRecommendations(
        recommendations: PoolRecommendation[], 
        pools: ContractMarket[]
    ): PoolRecommendation[] {
        return recommendations
            .filter(rec => {
                // Ensure poolId exists in available pools
                const poolExists = pools.find(p => p.id === rec.poolId);
                return poolExists && rec.score >= 50; // Minimum confidence threshold
            })
            .map(rec => {
                // Enhance with actual pool data
                const pool = pools.find(p => p.id === rec.poolId)!;
                return {
                    ...rec,
                    apy: rec.type === 'supply' ? pool.supplyAPY : pool.borrowAPR,
                    symbol: pool.symbol,
                    name: rec.name || `${pool.symbol} ${rec.type === 'supply' ? 'Supply' : 'Borrow'}`
                };
            })
            .sort((a, b) => b.score - a.score) // Sort by confidence
            .slice(0, 5); // Limit to top 5 recommendations
    }

    /**
     * Generate fallback recommendations if AI fails
     */
    private generateFallbackRecommendations(
        userPrompt: string,
        pools: ContractMarket[],
        userContext: any
    ): PoolRecommendation[] {
        
        const prompt = userPrompt.toLowerCase();
        const riskTolerance = userContext.riskTolerance || 'moderate';
        
        // Filter pools based on risk tolerance and exclude collateral-only pools for supply/borrow
        let suitablePools = pools.filter(pool => {
            if (pool.isCollateralOnly) return false; // Skip KAIA for basic recommendations
            
            const poolRisk = this.calculatePoolRisk(pool);
            if (riskTolerance === 'conservative') return poolRisk === 'low';
            if (riskTolerance === 'aggressive') return poolRisk !== 'low';
            return true; // moderate accepts all
        });

        // Prioritize by APY
        suitablePools.sort((a, b) => b.supplyAPY - a.supplyAPY);

        // Generate basic recommendations
        return suitablePools.slice(0, 3).map((pool, index) => ({
            id: `fallback_${pool.id}_${index}`,
            type: 'supply' as const,
            poolId: pool.id,
            name: `${pool.symbol} Supply Strategy`,
            symbol: pool.symbol,
            reason: `${pool.symbol} offers ${pool.supplyAPY.toFixed(1)}% APY with ${this.calculatePoolRisk(pool)} risk level`,
            score: 80 - (index * 10),
            suggestedAmount: userContext.investmentAmount || 1000,
            estimatedEarnings: ((userContext.investmentAmount || 1000) * pool.supplyAPY) / 100 / 12,
            estimatedCosts: 0,
            duration: '30 days',
            riskWarnings: ['Smart contract risk', 'Market volatility'],
            benefits: ['Earn passive income', 'Maintain liquidity'],
            apy: pool.supplyAPY,
            collateralRequired: 0,
            liquidationPrice: 0
        }));
    }
}
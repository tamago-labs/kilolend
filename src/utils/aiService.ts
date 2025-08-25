import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export interface PoolInfo {
    id: string;
    name: string;
    symbol: string;
    apy: number;
    borrowAPR: number;
    tvl: number;
    totalSupply: number;
    totalBorrow: number;
    utilization: number;
    riskLevel: 'low' | 'medium' | 'high';
    asset: string;
    price: number;
    priceChange24h: number;
    isActive: boolean;
    description?: string;
}

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
    currentPositions?: any[];
    totalCollateral?: number;
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
        if (prompt.includes('usdt') || prompt.includes('tether')) assets.push('USDT');
        if (prompt.includes('krw') || prompt.includes('korean')) assets.push('KRW');
        if (prompt.includes('jpy') || prompt.includes('yen')) assets.push('JPY');
        if (prompt.includes('thb') || prompt.includes('baht')) assets.push('THB');
        if (assets.length > 0) {
            context.preferredAssets = assets;
        }

        return context;
    }

    /**
     * Calculate risk level for a pool based on various factors
     */
    private calculatePoolRisk(pool: PoolInfo): 'low' | 'medium' | 'high' {
        let riskScore = 0;

        // High utilization increases risk
        if (pool.utilization > 90) riskScore += 3;
        else if (pool.utilization > 70) riskScore += 2;
        else if (pool.utilization > 50) riskScore += 1;

        // Low TVL increases risk
        if (pool.tvl < 100000) riskScore += 3;
        else if (pool.tvl < 500000) riskScore += 2;
        else if (pool.tvl < 1000000) riskScore += 1;

        // High price volatility increases risk
        if (Math.abs(pool.priceChange24h) > 5) riskScore += 3;
        else if (Math.abs(pool.priceChange24h) > 2) riskScore += 2;
        else if (Math.abs(pool.priceChange24h) > 1) riskScore += 1;

        // High APY differential may indicate risk
        const apyDiff = pool.borrowAPR - pool.apy;
        if (apyDiff > 5) riskScore += 2;
        else if (apyDiff > 3) riskScore += 1;

        if (riskScore >= 6) return 'high';
        if (riskScore >= 3) return 'medium';
        return 'low';
    }

    /**
     * Generate comprehensive system prompt for AI analysis
     */
    private generateSystemPrompt(): string {
        return `You are KiloBot, an expert DeFi advisor for KiloLend on the Kaia blockchain. You analyze user preferences and current market data to recommend optimal lending strategies.

ANALYSIS FRAMEWORK:
1. Risk Assessment: Match user risk tolerance with appropriate pools
2. Yield Optimization: Maximize returns within user's risk parameters  
3. Portfolio Diversification: Recommend asset allocation across pools
4. Market Timing: Consider current APYs, utilization, and trends
5. Capital Efficiency: Optimize for user's investment amount

POOL EVALUATION CRITERIA:
- APY/APR rates and stability
- Total Value Locked (TVL) as liquidity indicator
- Utilization rate (higher = more risky but potentially more rewards)
- 24h price changes for volatility assessment
- Pool health and sustainability

RECOMMENDATION TYPES:
- SUPPLY: Lend assets to earn APY (lower risk)
- BORROW: Take loans using collateral (higher risk, requires collateral)

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

IMPORTANT: Only recommend pools that are marked as "isActive": true. Always provide realistic numbers and clear explanations.`;
    }

    /**
     * Generate pool recommendations using AI analysis
     */
    async getPoolRecommendations(
        userPrompt: string,
        pools: PoolInfo[]
    ): Promise<PoolRecommendation[]> {

        // Extract user context from prompt
        const userContext = this.extractUserContext(userPrompt);

        // Filter and enhance pool data
        const activePools = pools.filter(pool => pool.isActive).map(pool => ({
            ...pool,
            riskLevel: this.calculatePoolRisk(pool)
        }));

        // Create comprehensive input for AI
        const analysisInput = {
            user_request: userPrompt,
            user_context: userContext,
            available_pools: activePools,
            market_summary: {
                total_pools: activePools.length,
                avg_supply_apy: activePools.reduce((sum, p) => sum + p.apy, 0) / activePools.length,
                avg_borrow_apr: activePools.reduce((sum, p) => sum + p.borrowAPR, 0) / activePools.length,
                total_tvl: activePools.reduce((sum, p) => sum + p.tvl, 0),
                highest_apy_pool: activePools.sort((a, b) => b.apy - a.apy)[0]?.symbol,
                lowest_risk_pools: activePools.filter(p => p.riskLevel === 'low').map(p => p.symbol)
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
        pools: PoolInfo[]
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
                    apy: rec.type === 'supply' ? pool.apy : pool.borrowAPR,
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
        pools: PoolInfo[],
        userContext: UserContext
    ): PoolRecommendation[] {
        
        const prompt = userPrompt.toLowerCase();
        const riskTolerance = userContext.riskTolerance || 'moderate';
        
        // Filter pools based on risk tolerance
        let suitablePools = pools.filter(pool => {
            const poolRisk = this.calculatePoolRisk(pool);
            if (riskTolerance === 'conservative') return poolRisk === 'low';
            if (riskTolerance === 'aggressive') return poolRisk !== 'low';
            return true; // moderate accepts all
        });

        // Prioritize by APY
        suitablePools.sort((a, b) => b.apy - a.apy);

        // Generate basic recommendations
        return suitablePools.slice(0, 3).map((pool, index) => ({
            id: `fallback_${pool.id}_${index}`,
            type: 'supply' as const,
            poolId: pool.id,
            name: `${pool.symbol} Supply Strategy`,
            symbol: pool.symbol,
            reason: `${pool.symbol} offers ${pool.apy.toFixed(1)}% APY with ${this.calculatePoolRisk(pool)} risk level`,
            score: 80 - (index * 10),
            suggestedAmount: userContext.investmentAmount || 1000,
            estimatedEarnings: ((userContext.investmentAmount || 1000) * pool.apy) / 100 / 12,
            estimatedCosts: 0,
            duration: '30 days',
            riskWarnings: ['Smart contract risk', 'Market volatility'],
            benefits: ['Earn passive income', 'Maintain liquidity'],
            apy: pool.apy,
            collateralRequired: 0,
            liquidationPrice: 0
        }));
    }
}
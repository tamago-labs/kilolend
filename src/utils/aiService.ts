import {
    BedrockRuntimeClient,
    InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

export interface PoolInfo {
    id: string;
    name: string;
    apy: number;
    tvl: number;
    riskLevel: 'low' | 'medium' | 'high';
    asset: string; // e.g., "USDT", "ETH"
}

export interface PoolRecommendation {
    id: string;
    name: string;
    reason: string;
    score: number; // 0-100, AI confidence/relevance score
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

    async getPoolRecommendations(
        userPrompt: string,
        pools: PoolInfo[]
    ): Promise<PoolRecommendation[]> {

        const systemPrompt = `You are an AI DeFi advisor. Given user preferences and a list of pools, 
analyze and recommend the best pools. Return a JSON array of objects:
[{id, name, reason, score}] sorted by relevance.`;

        const userInput = {
            user_request: userPrompt,
            available_pools: pools
        };

        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1000,
            messages: [
                { role: "system", content: [{ type: "text", text: systemPrompt }] },
                { role: "user", content: [{ type: "text", text: JSON.stringify(userInput) }] }
            ]
        };

        const command = new InvokeModelWithResponseStreamCommand({
            contentType: "application/json",
            body: JSON.stringify(payload),
            modelId: "apac.anthropic.claude-sonnet-4-20250514-v1:0",
        });

        try {
            const response: any = await this.client.send(command);

            let resultText = '';
            for await (const item of response.body) {
                if (item.chunk?.bytes) {
                    resultText += new TextDecoder().decode(item.chunk.bytes);
                }
            }

            // Extract final JSON (Claude might include text before/after)
            const jsonMatch = resultText.match(/\[.*\]/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]) as PoolRecommendation[];
            }

            throw new Error("No valid recommendations received");
        } catch (error: any) {
            console.error("AI Recommendation Error:", error);
            throw new Error(`AI failed to generate recommendations: ${error.message}`);
        }
    }
}

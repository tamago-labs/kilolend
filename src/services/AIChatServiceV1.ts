export interface StreamResponse {
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export class TextProcessor {
  static cleanThinkingTags(text: string): string {
    // Remove <thinking>...</thinking> tags and their content
    return text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
  }

  static processChunk(chunk: string, accumulatedText: string): string {
    const fullText = accumulatedText + chunk;
    // Only clean thinking tags when we have a complete response or at chunk boundaries
    // This prevents breaking partial responses during streaming
    return this.cleanThinkingTags(fullText);
  }
}

export class AIChatServiceV1 {
  private readonly STREAM_ENDPOINT = 'https://unaenv7eet.ap-southeast-1.awsapprunner.com/stream';
  private readonly TIMEOUT_MS = 30000; // 30 seconds timeout
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_API_KEY || '';
  }

  async streamChat(prompt: string, userAddress: string, response: StreamResponse): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const fetchResponse = await fetch(this.STREAM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify({
          prompt,
          user_address: userAddress,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!fetchResponse.ok) {
        throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
      }

      if (!fetchResponse.body) {
        throw new Error('Response body is null');
      }

      const reader = fetchResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          
          // Process complete chunks
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim()) {
              response.onChunk(line);
            }
          }
        }

        // Process any remaining content
        if (buffer.trim()) {
          response.onChunk(buffer);
        }

        response.onComplete();
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          response.onError(new Error('Request timeout. Please try again.'));
        } else {
          response.onError(error);
        }
      } else {
        response.onError(new Error('Unknown error occurred during streaming'));
      }
    }
  }

  // Utility method to test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.STREAM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify({
          prompt: 'test',
          user_address: '0x0000000000000000000000000000000000000000',
        }),
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const aiChatServiceV1 = new AIChatServiceV1();

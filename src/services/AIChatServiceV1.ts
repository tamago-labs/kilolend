export interface StreamResponse {
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export interface MessageResponse {
  message_id: number;
  role: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MessagesListResponse {
  user_address: string;
  session_id: number;
  messages: MessageResponse[];
  total_count: number;
}

export class TextProcessor {
  static cleanThinkingTags(text: string): string {
    // Remove <thinking>...</thinking> tags and their content
    return text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
  }

  static normalizeLineBreaks(text: string): string {

    // Replace multiple consecutive newlines with maximum 2 newlines
    // This prevents excessive spacing while preserving paragraph breaks
    return text
      .replace(/\n{3,}/g, '\n\n') // 3+ newlines -> 2 newlines 
      .replace(/[ \t]+\n/g, '\n') // Remove trailing spaces before newlines
      .replace(/\n[ \t]+/g, '\n') // Remove leading spaces after newlines
      .trim();
  }

  static processChunk(chunk: string, accumulatedText: string): string {
    const fullText = accumulatedText + chunk;
    // Only clean thinking tags when we have a complete response or at chunk boundaries
    // This prevents breaking partial responses during streaming
    const cleanedText = this.cleanThinkingTags(fullText);
    
    // During streaming, be more conservative with line break normalization
    // to avoid breaking partial sentences. Only normalize obvious excess.
    return cleanedText.replace(/\n{4,}/g, '\n\n\n');
  }

  static finalizeText(text: string): string {
    // Apply full normalization when streaming is complete
    const cleanedText = this.cleanThinkingTags(text);
    return cleanedText;
  }
}

export class AIChatServiceV1 {
  private readonly STREAM_ENDPOINT = 'https://unaenv7eet.ap-southeast-1.awsapprunner.com/stream';
  private readonly MESSAGES_ENDPOINT = 'https://unaenv7eet.ap-southeast-1.awsapprunner.com/messages';
  private readonly TIMEOUT_MS = 30000; // 30 seconds timeout
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_API_KEY || '';
  }

  async streamChat(prompt: string, userAddress: string, sessionId: number, response: StreamResponse): Promise<void> {
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
          session_id: sessionId,
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

  async getMessages(userAddress: string, sessionId: number): Promise<MessagesListResponse> {
    try {
      const response = await fetch(`${this.MESSAGES_ENDPOINT}/${userAddress}/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to retrieve messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteMessages(userAddress: string, sessionId: number): Promise<{ message: string; deleted_count: number }> {
    try {
      const response = await fetch(`${this.MESSAGES_ENDPOINT}/${userAddress}/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        message: result.message,
        deleted_count: result.deleted_count
      };
    } catch (error) {
      throw new Error(`Failed to delete messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          session_id: 1,
        }),
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const aiChatServiceV1 = new AIChatServiceV1();

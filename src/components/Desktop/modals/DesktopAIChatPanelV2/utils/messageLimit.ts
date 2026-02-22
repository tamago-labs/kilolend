/**
 * Message Limit Utility
 * Handles client-side message limiting with localStorage
 */

import type { ChatMessage } from '../types';

interface MessageLimitData {
  date: string; // YYYY-MM-DD format
  messageCount: number;
  selectedChain?: number;
}

const MESSAGES_PER_DAY = 3;
const STORAGE_KEY = 'ai-chat-message-limit';

export const MessageLimitUtil = {
  /**
   * Get current message limit data from localStorage
   */
  getData(): MessageLimitData {
    if (typeof window === 'undefined') {
      return { date: this.getTodayDate(), messageCount: 0 };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as MessageLimitData;
        
        // Reset if it's a new day
        if (data.date !== this.getTodayDate()) {
          return { date: this.getTodayDate(), messageCount: 0 };
        }
        
        return data;
      }
    } catch (error) {
      console.error('Failed to read message limit data:', error);
    }

    return { date: this.getTodayDate(), messageCount: 0 };
  },

  /**
   * Save message limit data to localStorage
   */
  saveData(data: MessageLimitData): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save message limit data:', error);
    }
  },

  /**
   * Get today's date in YYYY-MM-DD format
   */
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Get tomorrow's date for reset time display
   */
  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Check if user can send more messages
   */
  canSendMessage(): boolean {
    const data = this.getData();
    return data.messageCount < MESSAGES_PER_DAY;
  },

  /**
   * Get remaining messages for today
   */
  getRemainingMessages(): number {
    const data = this.getData(); 
    return Math.max(0, MESSAGES_PER_DAY - data.messageCount);
  },

  /**
   * Increment message count
   */
  incrementMessageCount(): void {
    const data = this.getData();
    data.messageCount += 1;
    this.saveData(data);
  },

  /**
   * Reset message count (for testing or manual reset)
   */
  resetMessageCount(): void {
    const data: MessageLimitData = {
      date: this.getTodayDate(),
      messageCount: 0
    };
    this.saveData(data);
  },

  /**
   * Get message limit status for UI display
   */
  getStatus(): {
    used: number;
    total: number;
    remaining: number;
    resetTime: string;
    canSend: boolean;
  } {
    const data = this.getData();
    const remaining = this.getRemainingMessages();

    return {
      used: data.messageCount,
      total: MESSAGES_PER_DAY,
      remaining,
      resetTime: this.getTomorrowDate(),
      canSend: remaining > 0
    };
  },

  /**
   * Save selected chain with message data
   */
  saveSelectedChain(chainId: number): void {
    const data = this.getData();
    data.selectedChain = chainId;
    this.saveData(data);
  },

  /**
   * Get selected chain from localStorage
   */
  getSelectedChain(): number | null {
    const data = this.getData();
    return data.selectedChain || null;
  },

  // Message persistence methods
  loadMessages(userAddress: string): ChatMessage[] {
    try { 
      const key = `ai-chat-messages-${userAddress}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveMessages(userAddress: string, messages: ChatMessage[]): void {
    try {
      const key = `ai-chat-messages-${userAddress}`;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  },

  clearMessages(userAddress: string): void {
    try {
      const key = `ai-chat-messages-${userAddress}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear messages:', error);
    }
  }
};

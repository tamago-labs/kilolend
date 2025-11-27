/**
 * AI Wallet Service
 * Handles API calls for AI wallet functionality
 */

interface AIWalletStatus {
  hasWallet: boolean;
  aiWalletAddress?: string;
  assignedAt?: string;
  status?: {
    totalWallets: number;
    usedWallets: number;
    availableWallets: number;
    utilizationRate: number;
  };
}

interface CreateAIWalletResponse {
  success: boolean;
  userAddress: string;
  aiWalletAddress: string;
  assignedAt: string;
  walletIndex: number;
  status: {
    totalWallets: number;
    usedWallets: number;
    availableWallets: number;
    utilizationRate: number;
  };
}

interface APIError {
  error: string;
  statusCode?: number;
}

class AIWalletService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    // These should be environment variables in production
    this.baseURL = 'https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod';
    this.apiKey = process.env.NEXT_PUBLIC_API_KEY || '';
  }

  /**
   * Get AI wallet status for a user
   */
  async getAIWalletStatus(userAddress: string): Promise<AIWalletStatus> {
    try {
 
      const url = new URL(`${this.baseURL}/ai-wallet`);
      url.searchParams.append('userAddress', userAddress);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
 

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI wallet status');
      }

      return data;
    } catch (error) {
      console.error('Error getting AI wallet status:', error);
      throw error;
    }
  }

  /**
   * Create a new AI wallet for a user
   */
  async createAIWallet(userAddress: string): Promise<CreateAIWalletResponse> {
    try {
      const response = await fetch(`${this.baseURL}/ai-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify({ userAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create AI wallet');
      }

      return data;
    } catch (error) {
      console.error('Error creating AI wallet:', error);
      throw error;
    }
  }

  /**
   * Get token balances for an AI wallet address
   * This would typically call your existing balance API
   */
  async getAIWalletBalances(aiWalletAddress: string): Promise<any[]> {
    try {
      // Use existing token balance logic
      // This is a placeholder - you'd integrate with your existing balance fetching
      const response = await fetch(`/api/balances?address=${aiWalletAddress}`);
      
      if (!response.ok) {
        throw new Error('Failed to get AI wallet balances');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting AI wallet balances:', error);
      throw error;
    }
  }

  /**
   * Transfer tokens from main wallet to AI wallet
   */
  async transferToAIWallet(
    fromAddress: string,
    toAddress: string,
    token: string,
    amount: string
  ): Promise<string> {
    try {
      // This would integrate with your existing transaction system
      // For now, this is a placeholder implementation
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: toAddress,
          token,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transfer failed');
      }

      return data.transactionHash;
    } catch (error) {
      console.error('Error transferring to AI wallet:', error);
      throw error;
    }
  }

  /**
   * Transfer tokens from AI wallet to main wallet
   */
  async transferFromAIWallet(
    fromAddress: string,
    toAddress: string,
    token: string,
    amount: string
  ): Promise<string> {
    try {
      // This would integrate with your existing transaction system
      // For AI wallet transactions, you might need to sign with the AI wallet private key
      // This would typically be handled on the backend for security
      const response = await fetch('/api/transfer-from-ai-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: toAddress,
          token,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transfer failed');
      }

      return data.transactionHash;
    } catch (error) {
      console.error('Error transferring from AI wallet:', error);
      throw error;
    }
  }

  /**
   * Validate Ethereum address format
   */
  isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Format address for display
   */
  formatAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Calculate USD value of token amount
   */
  calculateUSDValue(amount: string, price: number): number {
    const parsedAmount = parseFloat(amount);
    return isNaN(parsedAmount) ? 0 : parsedAmount * price;
  }
 
}

export const aiWalletService = new AIWalletService();
export type { AIWalletStatus, CreateAIWalletResponse, APIError };

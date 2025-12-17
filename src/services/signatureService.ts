import { ethers } from 'ethers';
import { useKaiaWalletSdkStore } from '@/components/Wallet/Sdk/walletSdk.hooks';

export interface HealthResponse {
  status: string;
  signing_message: string;
}

export interface SignatureVerifyRequest {
  wallet_address: string;
  signature: string;
}

export interface SignatureVerifyResponse {
  valid: boolean;
  message: string;
  wallet_address: string;
  timestamp: string;
}

class SignatureService {
  private readonly HEALTH_ENDPOINT = 'https://unaenv7eet.ap-southeast-1.awsapprunner.com/health';
  private readonly VERIFY_ENDPOINT = 'https://unaenv7eet.ap-southeast-1.awsapprunner.com/verify-signature';

  /**
   * Get current signing message from health endpoint
   */
  async getSigningMessage(): Promise<HealthResponse> {
    try {
      const response = await fetch(this.HEALTH_ENDPOINT);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch signing message: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching signing message:', error);
      throw new Error('Unable to fetch signing message. Please try again.');
    }
  }

  /**
   * Sign a message using Kaia Wallet SDK
   */
  async signMessage(message: string, walletAddress: string): Promise<string> {
    try {
      // Get wallet provider from Kaia SDK store
      const store = useKaiaWalletSdkStore.getState();
      const { sdk } = store;
      if (!sdk) {
        throw new Error('KaiaWalletSdk is not initialized');
      }

      const walletProvider = sdk.getWalletProvider();
      
      // Use connectAndSign method from the SDK
      const [connectedAddress, signature] = await walletProvider.request({
        method: 'kaia_connectAndSign',
        params: [message],
      }) as string[];

      // Verify the connected address matches the expected address
      const normalizedConnectedAddress = ethers.getAddress(connectedAddress);
      const normalizedExpectedAddress = ethers.getAddress(walletAddress);

      if (normalizedConnectedAddress !== normalizedExpectedAddress) {
        throw new Error('Connected wallet address does not match the expected address.');
      }

      // console.log("normalizedConnectedAddress:", normalizedConnectedAddress)
      // console.log("normalizedExpectedAddress:", normalizedExpectedAddress)
      // console.log("signature:", signature)

      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to sign message. Please try again.');
    }
  }

  /**
   * Verify a signature against the backend
   */
  async verifySignature(walletAddress: string, signature: string): Promise<SignatureVerifyResponse> {
    try {
      const request: SignatureVerifyRequest = {
        wallet_address: ethers.getAddress(walletAddress),
        signature
      };

      const response = await fetch(this.VERIFY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Verification failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying signature:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Signature verification failed. Please try again.');
    }
  }

  /**
   * Complete flow: get message, sign it, and verify
   */
  async completeSignatureFlow(walletAddress: string): Promise<SignatureVerifyResponse> {
    try {
      // Step 1: Get signing message
      const healthData = await this.getSigningMessage();
      
      // Step 2: Sign the message using Kaia SDK
      const signature = await this.signMessage(healthData.signing_message, walletAddress);
      
      // Step 3: Verify the signature
      const verificationResult = await this.verifySignature(walletAddress, signature);
      
      // Step 4: Store the signature if verification is successful
      if (verificationResult.valid) {
        this.storeSignatureState(walletAddress, signature);
      }
      
      return verificationResult;
    } catch (error) {
      console.error('Complete signature flow failed:', error);
      throw error;
    }
  }

  /**
   * Check if a signature is still valid by verifying with backend
   * Rely entirely on backend verification for validity determination
   */
  async isSignatureValid(walletAddress: string): Promise<boolean> {
    try {
      const storedData = this.getStoredSignature(walletAddress);
      if (!storedData) {
        return false;
      }

      const { signature } = storedData;
      
      // Verify stored signature with backend - backend determines validity
      try {
        const verificationResult = await this.verifySignature(walletAddress, signature);
        return verificationResult.valid;
      } catch (error) {
        console.error('Backend verification failed:', error);
        // If backend verification fails, clear stored signature
        this.clearSignatureState(walletAddress);
        return false;
      }
    } catch (error) {
      console.error('Error checking signature validity:', error);
      return false;
    }
  }

  /**
   * Store signature state for reuse
   */
  storeSignatureState(walletAddress: string, signature: string): void {
    try {
      const data = {
        timestamp: Date.now(),
        signature: signature
      };
      localStorage.setItem(`signature_${walletAddress}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing signature state:', error);
    }
  }

  /**
   * Get stored signature if available
   */
  getStoredSignature(walletAddress: string): { signature: string; timestamp: number } | null {
    try {
      const storedData = localStorage.getItem(`signature_${walletAddress}`);
      if (!storedData) {
        return null;
      }

      const { timestamp, signature } = JSON.parse(storedData);
      return { signature, timestamp };
    } catch (error) {
      console.error('Error getting stored signature:', error);
      return null;
    }
  }

  /**
   * Clear signature state (for logout or manual refresh)
   */
  clearSignatureState(walletAddress: string): void {
    try {
      localStorage.removeItem(`signature_${walletAddress}`);
    } catch (error) {
      console.error('Error clearing signature state:', error);
    }
  }
}

export const signatureService = new SignatureService();
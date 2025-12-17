import { useState, useEffect, useCallback } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { signatureService } from '@/services/signatureService';

export type SigningStatus = 'loading' | 'signing-required' | 'online' | 'error';

interface UseModalSigningStateReturn {
  isSignedIn: boolean;
  isCheckingSignature: boolean;
  signingStatus: SigningStatus;
  signatureError: string | null;
  checkSignatureStatus: () => Promise<void>;
  handleSignMessage: () => Promise<void>;
  clearError: () => void;
}

export const useModalSigningState = (): UseModalSigningStateReturn => {
  const { account } = useWalletAccountStore();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isCheckingSignature, setIsCheckingSignature] = useState(false);
  const [signingStatus, setSigningStatus] = useState<SigningStatus>('loading');
  const [signatureError, setSignatureError] = useState<string | null>(null);

  const checkSignatureStatus = useCallback(async () => {
    if (!account) {
      setIsSignedIn(false);
      setSigningStatus('signing-required');
      return;
    }

    setIsCheckingSignature(true);
    setSignatureError(null);
    setSigningStatus('loading');

    try {
      const isValid = await signatureService.isSignatureValid(account);
      setIsSignedIn(isValid);
      setSigningStatus(isValid ? 'online' : 'signing-required');
    } catch (error) {
      console.error('Error checking signature status:', error);
      setIsSignedIn(false);
      setSigningStatus('error');
      setSignatureError(error instanceof Error ? error.message : 'Failed to check signature status');
    } finally {
      setIsCheckingSignature(false);
    }
  }, [account]);

  const handleSignMessage = useCallback(async () => {
    if (!account) {
      setSignatureError('No wallet connected');
      return;
    }

    setIsCheckingSignature(true);
    setSignatureError(null);
    setSigningStatus('loading');

    try {
      await signatureService.completeSignatureFlow(account);
      setIsSignedIn(true);
      setSigningStatus('online');
    } catch (error) {
      console.error('Error signing message:', error);
      setIsSignedIn(false);
      setSigningStatus('error');
      setSignatureError(error instanceof Error ? error.message : 'Failed to sign message');
    } finally {
      setIsCheckingSignature(false);
    }
  }, [account]);

  const clearError = useCallback(() => {
    setSignatureError(null);
    if (signingStatus === 'error') {
      setSigningStatus('signing-required');
    }
  }, [signingStatus]);

  // Check signature status on mount and when account changes
  useEffect(() => {
    checkSignatureStatus();
  }, [checkSignatureStatus]);

  return {
    isSignedIn,
    isCheckingSignature,
    signingStatus,
    signatureError,
    checkSignatureStatus,
    handleSignMessage,
    clearError
  };
};

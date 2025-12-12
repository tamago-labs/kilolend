import { useState, useCallback, useRef, useEffect } from 'react';
import { eventTrackingService, TrackedEvent, EventTrackingOptions } from '@/services/eventTrackingService';
import { MarketId } from '@/utils/contractConfig';

interface UseEventTrackingState {
  isTracking: boolean;
  trackedEvent: TrackedEvent | null;
  error: string | null;
  hasTimedOut: boolean;
}

interface UseEventTrackingReturn extends UseEventTrackingState {
  startTracking: (marketId: MarketId, eventType: 'mint' | 'borrow' | 'redeem' | 'repay') => void;
  stopTracking: () => void;
  reset: () => void;
}

export const useEventTracking = (userAddress: string | null): UseEventTrackingReturn => {
  const [state, setState] = useState<UseEventTrackingState>({
    isTracking: false,
    trackedEvent: null,
    error: null,
    hasTimedOut: false,
  });

  const trackingIdRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    if (trackingIdRef.current) {
      eventTrackingService.stopTracking(trackingIdRef.current);
      trackingIdRef.current = null;
    }
    setState({
      isTracking: false,
      trackedEvent: null,
      error: null,
      hasTimedOut: false,
    });
  }, []);

  const startTracking = useCallback((marketId: MarketId, eventType: 'mint' | 'borrow' | 'redeem' | 'repay') => {
    if (!userAddress) {
      setState(prev => ({
        ...prev,
        error: 'User address not available',
      }));
      return;
    }

    // Reset any existing tracking
    reset();

    // Set tracking state
    setState(prev => ({
      ...prev,
      isTracking: true,
      error: null,
      hasTimedOut: false,
    }));

    const options: EventTrackingOptions = {
      userAddress,
      marketId,
      eventType,
      timeoutMs: 120000, // 2 minutes
      onEventFound: (event: TrackedEvent) => {
        setState(prev => ({
          ...prev,
          isTracking: false,
          trackedEvent: event,
          error: null,
        }));
      },
      onTimeout: () => {
        setState(prev => ({
          ...prev,
          isTracking: false,
          hasTimedOut: true,
          error: 'Transaction tracking timed out. Please check your wallet and try again.',
        }));
      },
      onError: (error: Error) => {
        setState(prev => ({
          ...prev,
          isTracking: false,
          error: error.message,
        }));
      },
    };

    trackingIdRef.current = eventTrackingService.startTracking(options);
  }, [userAddress, reset]);

  const stopTracking = useCallback(() => {
    if (trackingIdRef.current) {
      eventTrackingService.stopTracking(trackingIdRef.current);
      trackingIdRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isTracking: false,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackingIdRef.current) {
        eventTrackingService.stopTracking(trackingIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    reset,
  };
};

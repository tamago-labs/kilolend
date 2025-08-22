// Mock data generator for testing purposes
import { useUserStore } from '../stores/userStore';
import { useMarketStore } from '../stores/marketStore';

export const generateMockData = () => {
  const userStore = useUserStore.getState();
  const marketStore = useMarketStore.getState();

  // Add mock user positions
  userStore.addPosition({
    marketId: 'usdt',
    type: 'supply',
    amount: 1000,
    apy: 5.2,
    usdValue: 1000
  });

  userStore.addPosition({
    marketId: 'krw',
    type: 'borrow',
    amount: 500000, // 500,000 KRW
    apy: 3.8,
    usdValue: 375 // ~500k KRW in USD
  });

  // Add mock transactions
  userStore.addTransaction({
    type: 'supply',
    marketId: 'usdt',
    amount: 1000,
    status: 'confirmed',
    usdValue: 1000,
    txHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
  });

  userStore.addTransaction({
    type: 'borrow',
    marketId: 'krw',
    amount: 500000,
    status: 'confirmed',
    usdValue: 375,
    txHash: '0xf6e5d4c3b2a1098765432109876543210987654321fedcba9876543210fedcba'
  });

  userStore.addTransaction({
    type: 'supply',
    marketId: 'usdt',
    amount: 500,
    status: 'pending',
    usdValue: 500
  });
};

// Development helper to add mock data
if (typeof window !== 'undefined') {
  (window as any).generateMockData = generateMockData;
}

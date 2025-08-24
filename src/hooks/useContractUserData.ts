import { useEffect, useCallback } from 'react';
import { useMarketContract } from '@/hooks/useMarketContract';
import { useContractUserStore } from '@/stores/contractUserStore';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';

/**
 * Hook to fetch and update user positions from smart contracts
 */
export const useContractUserData = () => {
  const { account } = useWalletAccountStore();
  const marketContract = useMarketContract();

  const {
    updateUserPosition,
    setLoading,
    calculatePortfolioStats,
    clearUserData,
    // setLastUpdate,
    lastUpdate,
  } = useContractUserStore();

  const { markets } = useContractMarketStore();

  // Fetch user position for a specific market
  const fetchUserPosition = useCallback(
    async (marketId: MarketId) => {
      if (!account) return;

      try {
        const positionData = await marketContract.getUserPosition(marketId, account);
        if (!positionData) return;

        const market = markets.find((m) => m.id === marketId);
        if (!market) return;

        const now = Date.now();

        // Supply position
        if (parseFloat(positionData.supplyBalance) > 0) {
          updateUserPosition(marketId, {
            id: `supply_${marketId}`,
            marketId,
            type: 'supply',
            amount: positionData.supplyBalance,
            usdValue: parseFloat(positionData.supplyBalance) * market.price,
            apy: market.supplyAPY,
            supplyBalance: positionData.supplyBalance,
            collateralValue: positionData.collateralValue,
            wkaiaCollateral: positionData.wkaiaCollateral,
            stkaiaCollateral: positionData.stkaiaCollateral,
            timestamp: now,
            isHealthy: positionData.isHealthy,
          } as any);
        }

        // Borrow position
        if (parseFloat(positionData.borrowBalance) > 0) {
          updateUserPosition(marketId, {
            id: `borrow_${marketId}`,
            marketId,
            type: 'borrow',
            amount: positionData.borrowBalance,
            usdValue: parseFloat(positionData.borrowBalance) * market.price,
            apy: market.borrowAPR,
            borrowBalance: positionData.borrowBalance,
            collateralValue: positionData.collateralValue,
            wkaiaCollateral: positionData.wkaiaCollateral,
            stkaiaCollateral: positionData.stkaiaCollateral,
            timestamp: now,
            isHealthy: positionData.isHealthy,
          } as any);
        }
      } catch (error) {
        console.error(`Error fetching user position for ${marketId}:`, error);
      }
    },
    [account, marketContract, updateUserPosition, markets]
  );

  // Fetch all user positions
  const fetchAllUserPositions = useCallback(
    async () => {
      if (!account) {
        clearUserData();
        return;
      }

      setLoading(true);

      try {
        const lendingMarkets = Object.keys(MARKET_CONFIG).filter(
          (id) => MARKET_CONFIG[id as MarketId].marketAddress !== null
        ) as MarketId[];

        await Promise.all(lendingMarkets.map(fetchUserPosition));

        calculatePortfolioStats();
        // setLastUpdate(Date.now());
      } catch (error) {
        console.error('Error fetching user positions:', error);
      } finally {
        setLoading(false);
      }
    },
    [account, fetchUserPosition, setLoading, calculatePortfolioStats, clearUserData]
  );

  // Auto-refresh when account changes or every 45 seconds
  useEffect(() => {
    if (account) {
      fetchAllUserPositions();

      const interval = setInterval(fetchAllUserPositions, 45000);
      return () => clearInterval(interval);
    } else {
      clearUserData();
    }
  }, [account, fetchAllUserPositions, clearUserData]);

  // Manual refresh
  const refreshData = useCallback(fetchAllUserPositions, [fetchAllUserPositions]);

  return {
    refreshData,
    fetchUserPosition,
    lastUpdate,
  };
};

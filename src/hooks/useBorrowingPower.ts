import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { useMarketContract } from './useMarketContract';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';

export interface BorrowingPowerData {
  totalCollateralValue: string;
  totalBorrowValue: string;
  borrowingPowerUsed: string;
  borrowingPowerRemaining: string;
  healthFactor: string;
  liquidationThreshold: string;
}

export interface MarketBorrowingData {
  maxBorrowAmount: string;
  currentDebt: string;
  collateralFactor: number;
}

export const useBorrowingPower = () => {
  const { getUserPosition } = useMarketContract();
  const { markets } = useContractMarketStore();

  /**
   * Calculate borrowing power for a user across all markets
   */
  const calculateBorrowingPower = useCallback(
    async (userAddress: string): Promise<BorrowingPowerData> => {
      try {
        let totalCollateralValue = new BigNumber(0);
        let totalBorrowValue = new BigNumber(0);

        // Get user positions for all markets
        for (const market of markets) {
          if (!market.isActive) continue;

          const position = await getUserPosition(market.id, userAddress);
          if (!position) continue;

          const supplyBalance = new BigNumber(position.supplyBalance || '0');
          const borrowBalance = new BigNumber(position.borrowBalance || '0');
          const marketPrice = new BigNumber(market.price || '0');

          // Calculate collateral value (supply * price * collateral factor)
          if (supplyBalance.isGreaterThan(0)) {
            const collateralFactor = getCollateralFactor(market.id);
            const collateralValue = supplyBalance
              .multipliedBy(marketPrice)
              .multipliedBy(collateralFactor);
            totalCollateralValue = totalCollateralValue.plus(collateralValue);
          }

          // Calculate borrow value
          if (borrowBalance.isGreaterThan(0)) {
            const borrowValue = borrowBalance.multipliedBy(marketPrice);
            totalBorrowValue = totalBorrowValue.plus(borrowValue);
          }
        }

        // Calculate borrowing power remaining
        const borrowingPowerRemaining =
          totalCollateralValue.minus(totalBorrowValue);

        // Calculate utilization percentage
        const borrowingPowerUsed = totalCollateralValue.isGreaterThan(0)
          ? totalBorrowValue.dividedBy(totalCollateralValue).multipliedBy(100)
          : new BigNumber(0);

        // Calculate health factor (simplified)
        const healthFactor = totalBorrowValue.isGreaterThan(0)
          ? totalCollateralValue.dividedBy(totalBorrowValue)
          : new BigNumber(999); // Very high if no debt

        return {
          totalCollateralValue: totalCollateralValue.toFixed(2),
          totalBorrowValue: totalBorrowValue.toFixed(2),
          borrowingPowerUsed: borrowingPowerUsed.toFixed(2),
          borrowingPowerRemaining: borrowingPowerRemaining.toFixed(2),
          healthFactor: healthFactor.toFixed(2),
          liquidationThreshold: '80', // 80% threshold for most assets
        };
      } catch (error) {
        console.error('Error calculating borrowing power:', error);
        return {
          totalCollateralValue: '0',
          totalBorrowValue: '0',
          borrowingPowerUsed: '0',
          borrowingPowerRemaining: '0',
          healthFactor: '0',
          liquidationThreshold: '80',
        };
      }
    },
    [getUserPosition, markets]
  );

  /**
   * Calculate maximum borrow amount for a specific asset
   */
  const calculateMaxBorrowAmount = useCallback(
    async (
      marketId: MarketId,
      userAddress: string
    ): Promise<MarketBorrowingData> => {
      try {
        const borrowingPower = await calculateBorrowingPower(userAddress);
        const market = markets.find((m) => m.id === marketId);

        if (!market) {
          throw new Error('Market not found');
        }

        const position = await getUserPosition(marketId, userAddress);
        const currentDebt = position?.borrowBalance || '0';

        // Calculate max borrow amount based on remaining borrowing power
        const remainingPower = new BigNumber(
          borrowingPower.borrowingPowerRemaining
        );
        const assetPrice = new BigNumber(market.price || '1');

        // Apply safety margin (e.g., 95% of available power)
        const safetyMargin = new BigNumber(0.95);
        const maxBorrowAmount = remainingPower
          .multipliedBy(safetyMargin)
          .dividedBy(assetPrice);

        return {
          maxBorrowAmount: maxBorrowAmount.toFixed(6),
          currentDebt,
          collateralFactor: getCollateralFactor(marketId),
        };
      } catch (error) {
        console.error('Error calculating max borrow amount:', error);
        return {
          maxBorrowAmount: '0',
          currentDebt: '0',
          collateralFactor: 0,
        };
      }
    },
    [calculateBorrowingPower, getUserPosition, markets]
  );

  return {
    calculateBorrowingPower,
    calculateMaxBorrowAmount,
  };
};


// FIXME: fetch from smart contract
function getCollateralFactor(marketId: any): number { 
  const collateralFactors: Record<any, number> = {
    usdt: 0.85, // 85% collateral factor
    six: 0.7, // 70% collateral factor
    bora: 0.7, // 70% collateral factor
    mbx: 0.7, // 70% collateral factor
    kaia: 0.75, // 75% collateral factor
  };

  return collateralFactors[marketId] || 0.7; // Default 70%
}

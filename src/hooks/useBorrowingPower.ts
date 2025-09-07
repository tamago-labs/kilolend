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
  availableLiquidity?: string;
  isLiquidityLimited?: boolean;
  maxFromCollateral?: string;
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
          
          const m: any = market
          const position = await getUserPosition(m.id, userAddress);
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

        // Calculate max borrow based on remaining borrowing power
        const remainingPower = new BigNumber(
          borrowingPower.borrowingPowerRemaining
        );
        const assetPrice = new BigNumber(market.price || '1');

        // Apply safety margin (e.g., 95% of available power)
        const safetyMargin = new BigNumber(0.95);
        const maxBorrowFromPower = remainingPower
          .multipliedBy(safetyMargin)
          .dividedBy(assetPrice);

        // Get available liquidity from market
        // Calculate available liquidity more accurately
        const totalSupplyUSD = new BigNumber(market.totalSupply || '0');
        const totalBorrowUSD = new BigNumber(market.totalBorrow || '0');
        const availableLiquidityUSD = totalSupplyUSD.minus(totalBorrowUSD);
        const availableLiquidity = availableLiquidityUSD.dividedBy(assetPrice);
        
        // Ensure liquidity is positive
        const safeLiquidity = BigNumber.max(availableLiquidity, 0);

        // The actual max borrow is the minimum of:
        // 1. What the user can borrow based on collateral
        // 2. What's available in the market (with small buffer for interest)
        const liquidityBuffer = new BigNumber(0.98); // 2% buffer for accrued interest
        const availableWithBuffer = safeLiquidity.multipliedBy(liquidityBuffer);
        const maxBorrowAmount = BigNumber.min(maxBorrowFromPower, availableWithBuffer);
        
        const isLiquidityLimited = maxBorrowFromPower.isGreaterThan(availableWithBuffer);

        console.log(`Max borrow calculation for ${marketId}:`, {
          remainingPower: `${remainingPower.toFixed(2)}`,
          assetPrice: `${assetPrice.toFixed(6)}`,
          maxBorrowFromPower: `${maxBorrowFromPower.toFixed(6)} ${market.symbol}`,
          availableLiquidityUSD: `${availableLiquidityUSD.toFixed(2)}`,
          availableLiquidity: `${safeLiquidity.toFixed(6)} ${market.symbol}`,
          availableWithBuffer: `${availableWithBuffer.toFixed(6)} ${market.symbol}`,
          finalMaxBorrow: `${maxBorrowAmount.toFixed(6)} ${market.symbol}`,
          isLiquidityLimited,
          limitingFactor: isLiquidityLimited ? 'Market Liquidity' : 'User Collateral'
        });

        return {
          maxBorrowAmount: maxBorrowAmount.toFixed(6),
          currentDebt,
          collateralFactor: getCollateralFactor(marketId),
          // Additional info for UI
          availableLiquidity: safeLiquidity.toFixed(6),
          isLiquidityLimited,
          maxFromCollateral: maxBorrowFromPower.toFixed(6)
        };
      } catch (error) {
        console.error('Error calculating max borrow amount:', error);
        return {
          maxBorrowAmount: '0',
          currentDebt: '0',
          collateralFactor: 0,
          availableLiquidity: '0',
          isLiquidityLimited: false,
          maxFromCollateral: '0'
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

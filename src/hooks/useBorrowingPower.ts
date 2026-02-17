import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { useMarketContract } from './useMarketContract';
import { useComptrollerContract } from './v1/useComptrollerContract';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { MarketId } from '@/utils/contractConfig';

// Helper function to map Kaia market ID to cToken address
const getKaiaCTokenAddress = (marketId: string): string | undefined => {
  const cTokenMapping: Record<string, string> = {
    'usdt': '0x20A2Cbc68fbee094754b2F03d15B1F5466f1F649',
    'six': '0x287770f1236AdbE3F4dA4f29D0f1a776f303C966',
    'bora': '0xA7247a6f5EaC85354642e0E90B515E2dC027d5F4',
    'mbx': '0xa024B1DE3a6022FB552C2ED9a8050926Fb22d7b6',
    'kaia': '0x2029f3E3C667EBd68b1D29dbd61dc383BdbB56e5',
    'staked-kaia': '0x8A424cCf2D2B7D85F1DFb756307411D2BBc73e07',
    'stkaia': '0x8A424cCf2D2B7D85F1DFb756307411D2BBc73e07'
  };
  return cTokenMapping[marketId.toLowerCase()];
};

export interface BorrowingPowerData {
  totalCollateralValue: string;
  totalBorrowValue: string;
  borrowingPowerUsed: string;
  borrowingPowerRemaining: string;
  healthFactor: string;
  liquidationThreshold: string;
  enteredMarkets: string[]; // cToken addresses
  enteredMarketIds: MarketId[]; // market IDs
}

export interface MarketBorrowingData {
  maxBorrowAmount: string;
  currentDebt: string;
  collateralFactor: number;
  availableLiquidity?: string;
  isLiquidityLimited?: boolean;
  maxFromCollateral?: string;
  isUserInMarket?: boolean;
}

export const useBorrowingPower = () => {
  const { getUserPosition } = useMarketContract();
  const { getAccountLiquidity, getAssetsIn, getEnteredMarketIds, getMarketInfo } = useComptrollerContract();
  const { markets } = useContractMarketStore();

  /**
   * Calculate borrowing power for a user using Comptroller
   */
  const calculateBorrowingPower = useCallback(
    async (userAddress: string): Promise<BorrowingPowerData> => {
      try {

        // Get account liquidity from comptroller (this gives us real borrowing power)
        const accountLiquidity = await getAccountLiquidity(userAddress);
        
        // Get entered markets (assets being used as collateral)
        const enteredMarkets = await getAssetsIn(userAddress);
        const enteredMarketIds = await getEnteredMarketIds(userAddress);

        let totalCollateralValue = new BigNumber(0);
        let totalBorrowValue = new BigNumber(0);

        const filtered = markets.filter( item => item.id.indexOf("kaia") !== -1)

        // Calculate totals by checking all user positions
        for (const market of filtered) {
  
          if (!market.isActive) continue; 
          
          const m: any = market; 
          let marketId = m.id.split("kaia-")[1]
          if (marketId === "stkaia") {
            marketId = "staked-kaia"
          }
 
          const position = await getUserPosition(marketId, userAddress);

          if (!position) continue;

          const supplyBalance = new BigNumber(position.supplyBalance || '0');
          const borrowBalance = new BigNumber(position.borrowBalance || '0');
          const marketPrice = new BigNumber(market.price || '0');

          // Get cToken address from marketId
          const cTokenAddress = getKaiaCTokenAddress(marketId);

          // Add to collateral value if market is entered
          if (cTokenAddress && supplyBalance.isGreaterThan(0) && enteredMarkets.includes(cTokenAddress)) {
            // Get real collateral factor from comptroller
            const marketInfo = await getMarketInfo(cTokenAddress);
            const collateralValue = supplyBalance
              .multipliedBy(marketPrice)
              .multipliedBy(marketInfo.collateralFactor / 100);
            totalCollateralValue = totalCollateralValue.plus(collateralValue);
          }

          // Add to borrow value
          if (borrowBalance.isGreaterThan(0)) {
            const borrowValue = borrowBalance.multipliedBy(marketPrice);
            totalBorrowValue = totalBorrowValue.plus(borrowValue);
          }
        }

        // Use comptroller's liquidity calculation as the source of truth
        const borrowingPowerRemaining = new BigNumber(accountLiquidity.liquidity);
        const borrowingPowerUsed = totalCollateralValue.isGreaterThan(0)
          ? totalBorrowValue.dividedBy(totalCollateralValue).multipliedBy(100)
          : new BigNumber(0);

        // Health factor calculation
        const healthFactor = totalBorrowValue.isGreaterThan(0)
          ? totalCollateralValue.dividedBy(totalBorrowValue)
          : new BigNumber(999);

        console.log('Borrowing power calculation:', {
          totalCollateralValue: totalCollateralValue.toFixed(2),
          totalBorrowValue: totalBorrowValue.toFixed(2),
          borrowingPowerRemaining: borrowingPowerRemaining.toFixed(2),
          enteredMarkets: enteredMarkets.length,
          healthFactor: healthFactor.toFixed(2),
          accountLiquidityFromComptroller: accountLiquidity.liquidity
        });

        return {
          totalCollateralValue: totalCollateralValue.toFixed(2),
          totalBorrowValue: totalBorrowValue.toFixed(2),
          borrowingPowerUsed: borrowingPowerUsed.toFixed(2),
          borrowingPowerRemaining: borrowingPowerRemaining.toFixed(2),
          healthFactor: healthFactor.toFixed(2),
          liquidationThreshold: '80', // Can be made dynamic from comptroller if needed
          enteredMarkets,
          enteredMarketIds
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
          enteredMarkets: [],
          enteredMarketIds: []
        };
      }
    },
    [getUserPosition, markets, getAccountLiquidity, getAssetsIn, getEnteredMarketIds, getMarketInfo]
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

        // Extract market key from marketId (e.g., 'kaia-usdt' -> 'usdt')
        const marketKey = marketId.split('kaia-')[1];
        const cTokenAddress = getKaiaCTokenAddress(marketKey);
        
        if (!cTokenAddress) {
          throw new Error('cToken address not found for market');
        }

        // Get real collateral factor from comptroller
        const marketInfo = await getMarketInfo(cTokenAddress);
        
        // Check if user is in this market (has supplied and entered)
        const isUserInMarket = borrowingPower.enteredMarketIds.includes(marketId);

        // Calculate max borrow based on remaining borrowing power from comptroller
        const remainingPower = new BigNumber(borrowingPower.borrowingPowerRemaining);
        const assetPrice = new BigNumber(market.price || '1');

        // Apply safety margin (e.g., 95% of available power to account for price fluctuations)
        const safetyMargin = new BigNumber(0.95);
        const maxBorrowFromPower = remainingPower
          .multipliedBy(safetyMargin)
          .dividedBy(assetPrice);

        // Calculate available liquidity more accurately
        const totalSupplyUSD = new BigNumber(market.totalSupply || '0');
        const totalBorrowUSD = new BigNumber(market.totalBorrow || '0');
        const availableLiquidityUSD = totalSupplyUSD.minus(totalBorrowUSD);
        const availableLiquidity = availableLiquidityUSD.dividedBy(assetPrice);
        
        // Ensure liquidity is positive
        const safeLiquidity = BigNumber.max(availableLiquidity, 0);

        // Apply liquidity buffer for accrued interest
        const liquidityBuffer = new BigNumber(0.98); // 2% buffer
        const availableWithBuffer = safeLiquidity.multipliedBy(liquidityBuffer);
        
        // Final max borrow is the minimum of borrowing power and available liquidity
        const maxBorrowAmount = BigNumber.min(maxBorrowFromPower, availableWithBuffer);
        const isLiquidityLimited = maxBorrowFromPower.isGreaterThan(availableWithBuffer);

        console.log(`Max borrow calculation for ${marketId}:`, {
          remainingPowerUSD: `$${remainingPower.toFixed(2)}`,
          assetPrice: `$${assetPrice.toFixed(6)}`,
          maxBorrowFromPower: `${maxBorrowFromPower.toFixed(6)} ${market.symbol}`,
          availableLiquidityUSD: `$${availableLiquidityUSD.toFixed(2)}`,
          availableLiquidity: `${safeLiquidity.toFixed(6)} ${market.symbol}`,
          finalMaxBorrow: `${maxBorrowAmount.toFixed(6)} ${market.symbol}`,
          isLiquidityLimited,
          isUserInMarket,
          collateralFactor: `${marketInfo.collateralFactor}%`,
          limitingFactor: isLiquidityLimited ? 'Market Liquidity' : 'User Collateral'
        });

        return {
          maxBorrowAmount: maxBorrowAmount.toFixed(6),
          currentDebt,
          collateralFactor: marketInfo.collateralFactor,
          availableLiquidity: safeLiquidity.toFixed(6),
          isLiquidityLimited,
          maxFromCollateral: maxBorrowFromPower.toFixed(6),
          isUserInMarket
        };
      } catch (error) {
        console.error('Error calculating max borrow amount:', error);
        return {
          maxBorrowAmount: '0',
          currentDebt: '0',
          collateralFactor: 0,
          availableLiquidity: '0',
          isLiquidityLimited: false,
          maxFromCollateral: '0',
          isUserInMarket: false
        };
      }
    },
    [calculateBorrowingPower, getUserPosition, markets, getMarketInfo]
  );

  return {
    calculateBorrowingPower,
    calculateMaxBorrowAmount,
  };
};
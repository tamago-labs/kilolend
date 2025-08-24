import { useCallback } from 'react';
import { ethers } from 'ethers';
import { BASE_LENDING_MARKET_ABI, USDT_MARKET_ABI } from '@/utils/contractABIs';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';
import {
  getContract,
  parseTokenAmount,
  sendTransaction,
  TransactionResult,
  formatTokenAmount,
} from '@/utils/contractUtils';

export interface MarketInfo {
  totalSupply: string;
  totalBorrow: string;
  supplyAPY: number;
  borrowAPR: number;
  utilizationRate: number;
  exchangeRate: string;
}

export interface UserPosition {
  supplyBalance: string;
  borrowBalance: string;
  collateralValue: string;
  maxBorrowAmount: string;
  isHealthy: boolean;
  wkaiaCollateral: string;
  stkaiaCollateral: string;
}

interface MarketContractHook {
  getMarketInfo: (marketId: MarketId) => Promise<MarketInfo | null>;
  getUserPosition: (marketId: MarketId, userAddress: string) => Promise<UserPosition | null>;
  supply: (marketId: MarketId, amount: string) => Promise<TransactionResult>;
  withdraw: (marketId: MarketId, amount: string) => Promise<TransactionResult>;
  borrow: (marketId: MarketId, amount: string) => Promise<TransactionResult>;
  repay: (marketId: MarketId, amount: string) => Promise<TransactionResult>;
  depositCollateral: (
    marketId: MarketId,
    collateralType: 'wkaia' | 'stkaia',
    amount: string
  ) => Promise<TransactionResult>;
  withdrawCollateral: (
    marketId: MarketId,
    collateralType: 'wkaia' | 'stkaia',
    amount: string
  ) => Promise<TransactionResult>;
  accrueInterest: (marketId: MarketId) => Promise<TransactionResult>;
}

export const useMarketContract = (): MarketContractHook => {
  const getAbi = useCallback(
    (marketId: MarketId) => (marketId === 'usdt' ? USDT_MARKET_ABI : BASE_LENDING_MARKET_ABI),
    []
  );

  const getMarketInfo = useCallback(async (marketId: MarketId): Promise<MarketInfo | null> => {
    try {
      const marketConfig = MARKET_CONFIG[marketId];
      if (!marketConfig.marketAddress) {
        console.warn(`Market ${marketId} is collateral-only`);
        return null;
      }

      const abi: any = getAbi(marketId);
      const contract = await getContract(marketConfig.marketAddress, abi, false);
      if (!contract) throw new Error('Failed to create contract instance');

      await contract.accrueInterest.staticCall();

      if (marketId === 'usdt' && 'getMarketInfo' in contract) {
        const marketInfo = await contract.getMarketInfo();
        return {
          totalSupply: formatTokenAmount(marketInfo.totalSupply, marketConfig.decimals),
          totalBorrow: formatTokenAmount(marketInfo.totalBorrow, marketConfig.decimals),
          supplyAPY: Number(marketInfo.supplyAPY) / 100,
          borrowAPR: Number(marketInfo.borrowAPR) / 100,
          utilizationRate: (Number(marketInfo.utilizationRate) / 1e18) * 100,
          exchangeRate: formatTokenAmount(marketInfo.exchangeRate, marketConfig.decimals),
        };
      }

      const [totalSupply, totalBorrow, utilizationRate] = await Promise.all([
        contract.totalStablecoinSupplied(),
        contract.totalStablecoinBorrowed(),
        contract.getUtilizationRate(),
      ]);

      const utilization = Number(utilizationRate) / 1e18;
      const baseRate = 0.02;
      const slope1 = 0.08;
      const slope2 = 0.5;
      const optimal = 0.8;

      const borrowRate =
        utilization <= optimal
          ? baseRate + (utilization / optimal) * slope1
          : baseRate + slope1 + ((utilization - optimal) / (1 - optimal)) * slope2;

      const supplyRate = borrowRate * utilization * 0.95;

      return {
        totalSupply: formatTokenAmount(totalSupply, marketConfig.decimals),
        totalBorrow: formatTokenAmount(totalBorrow, marketConfig.decimals),
        supplyAPY: supplyRate * 100,
        borrowAPR: borrowRate * 100,
        utilizationRate: utilization * 100,
        exchangeRate: '1.0',
      };
    } catch (error) {
      console.error(`Error getting market info for ${marketId}:`, error);
      return null;
    }
  }, [getAbi]);

  const getUserPosition = useCallback(
    async (marketId: MarketId, userAddress: string): Promise<UserPosition | null> => {
      try {
        const marketConfig = MARKET_CONFIG[marketId];
        if (!marketConfig.marketAddress) return null;

        const abi: any = getAbi(marketId);
        const contract = await getContract(marketConfig.marketAddress, abi, false);
        if (!contract) throw new Error('Failed to create contract instance');

        const [supplyBalance, borrowBalance, collateralValue, maxBorrowAmount, isHealthy, userCollateral] =
          await Promise.all([
            contract.getUserSupplyBalance(userAddress),
            contract.getBorrowBalance(userAddress),
            contract.getCollateralValue(userAddress),
            contract.getMaxBorrowAmount(userAddress),
            contract.isHealthy(userAddress),
            contract.userCollateral(userAddress),
          ]);

        return {
          supplyBalance: formatTokenAmount(supplyBalance, marketConfig.decimals),
          borrowBalance: formatTokenAmount(borrowBalance, marketConfig.decimals),
          collateralValue: ethers.formatEther(collateralValue),
          maxBorrowAmount: formatTokenAmount(maxBorrowAmount, marketConfig.decimals),
          isHealthy,
          wkaiaCollateral: ethers.formatEther(userCollateral.wkaiaAmount),
          stkaiaCollateral: ethers.formatEther(userCollateral.stKaiaAmount),
        };
      } catch (error) {
        console.error(`Error getting user position for ${marketId}:`, error);
        return null;
      }
    },
    [getAbi]
  );

  const createTxMethod = useCallback(
    (methodName: string) =>
      async (marketId: MarketId, ...args: any[]): Promise<TransactionResult> => {
        try {
          const marketConfig = MARKET_CONFIG[marketId];
          if (!marketConfig.marketAddress) throw new Error(`Market not available for ${methodName}`);

          const abi: any = getAbi(marketId);
          const contract = await getContract(marketConfig.marketAddress, abi, true);
          if (!contract) throw new Error('Failed to create contract instance with signer');

          return await sendTransaction(contract, methodName, args);
        } catch (error: any) {
          console.error(`Error during ${methodName} on ${marketId}:`, error);
          return { hash: '', status: 'failed', error: error.message || `${methodName} failed` } as any;
        }
      },
    [getAbi]
  );

  const supply = useCallback(
    async (marketId: MarketId, amount: string) =>
      createTxMethod('supplyStablecoin')(marketId, parseTokenAmount(amount, MARKET_CONFIG[marketId].decimals)),
    [createTxMethod]
  );

  const withdraw = useCallback(
    async (marketId: MarketId, amount: string) =>
      createTxMethod('withdrawStablecoin')(marketId, parseTokenAmount(amount, MARKET_CONFIG[marketId].decimals)),
    [createTxMethod]
  );

  const borrow = useCallback(
    async (marketId: MarketId, amount: string) =>
      createTxMethod('borrowStablecoin')(marketId, parseTokenAmount(amount, MARKET_CONFIG[marketId].decimals)),
    [createTxMethod]
  );

  const repay = useCallback(
    async (marketId: MarketId, amount: string) =>
      createTxMethod('repayStablecoin')(marketId, parseTokenAmount(amount, MARKET_CONFIG[marketId].decimals)),
    [createTxMethod]
  );

  const depositCollateral = useCallback(
    async (marketId: MarketId, collateralType: 'wkaia' | 'stkaia', amount: string) =>
      createTxMethod(
        collateralType === 'wkaia' ? 'depositWKaiaCollateral' : 'depositStKaiaCollateral'
      )(marketId, parseTokenAmount(amount, 18)),
    [createTxMethod]
  );

  const withdrawCollateral = useCallback(
    async (marketId: MarketId, collateralType: 'wkaia' | 'stkaia', amount: string) =>
      createTxMethod(
        collateralType === 'wkaia' ? 'withdrawWKaiaCollateral' : 'withdrawStKaiaCollateral'
      )(marketId, parseTokenAmount(amount, 18)),
    [createTxMethod]
  );

  const accrueInterest = useCallback(
    async (marketId: MarketId) => createTxMethod('accrueInterest')(marketId),
    [createTxMethod]
  );

  return {
    getMarketInfo,
    getUserPosition,
    supply,
    withdraw,
    borrow,
    repay,
    depositCollateral,
    withdrawCollateral,
    accrueInterest,
  };
};

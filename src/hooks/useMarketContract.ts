import { useCallback } from 'react';
import { ethers } from 'ethers';
import { BASE_LENDING_MARKET_ABI, USDT_MARKET_ABI } from '@/utils/contractABIs';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';
import {
  getContract,
  parseTokenAmount,
  formatTokenAmount,
} from '@/utils/contractUtils';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';

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
 
export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
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
  const { sendTransaction } = useKaiaWalletSdk();
  const { account } = useWalletAccountStore();

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
        
        // Debug logging
        console.log(`USDT Market Debug:`, {
          rawSupplyAPY: marketInfo.supplyAPY.toString(),
          rawBorrowAPR: marketInfo.borrowAPR.toString(),
          rawUtilization: marketInfo.utilizationRate.toString(),
          totalSupply: marketInfo.totalSupply.toString(),
          totalBorrow: marketInfo.totalBorrow.toString()
        });
        
        // Try different conversion approaches based on the raw values
        const rawSupplyAPY = Number(marketInfo.supplyAPY);
        const rawBorrowAPR = Number(marketInfo.borrowAPR);
        
        // If the raw values are extremely large, they're likely in wei
        // If they're reasonable numbers, they might be in basis points
        let supplyAPY: number;
        let borrowAPR: number;
        
        // Handle edge case: if no supply or borrow, set reasonable defaults
        if (Number(marketInfo.totalSupply) === 0 || Number(marketInfo.totalBorrow) === 0) {
          supplyAPY = 0;
          borrowAPR = 5; // Default 5% APR when market is empty
        } else if (rawSupplyAPY > 1e18) {
          // Values are in wei (18 decimals)
          supplyAPY = rawSupplyAPY / 1e18;
          borrowAPR = rawBorrowAPR / 1e18;
        } else if (rawSupplyAPY > 10000) {
          // Values might be in basis points * 1e14 or similar
          supplyAPY = rawSupplyAPY / 1e16;
          borrowAPR = rawBorrowAPR / 1e16;
        } else if (rawSupplyAPY > 100) {
          // Values are in basis points (10000 = 100%)
          supplyAPY = rawSupplyAPY / 100;
          borrowAPR = rawBorrowAPR / 100;
        } else {
          // Values are already in percentage
          supplyAPY = rawSupplyAPY;
          borrowAPR = rawBorrowAPR;
        }
        
        // Cap rates at reasonable maximums to prevent UI issues
        supplyAPY = Math.min(supplyAPY, 1000); // Max 1000% APY
        borrowAPR = Math.min(borrowAPR, 1000); // Max 1000% APR
        
        console.log(`USDT Market Converted:`, {
          supplyAPY,
          borrowAPR
        });
        
        return {
          totalSupply: formatTokenAmount(marketInfo.totalSupply, marketConfig.decimals),
          totalBorrow: formatTokenAmount(marketInfo.totalBorrow, marketConfig.decimals),
          supplyAPY,
          borrowAPR,
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
      
      // Return fallback data for UI stability
      return {
        totalSupply: '0',
        totalBorrow: '0',
        supplyAPY: 0,
        borrowAPR: 5, // Default 5% APR
        utilizationRate: 0,
        exchangeRate: '1.0',
      };
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
 
  const sendContractTransaction = useCallback(
    async (marketId: MarketId, methodName: string, args: any[]): Promise<TransactionResult> => {
      try {
        if (!account) {
          throw new Error('Wallet not connected');
        }

        const marketConfig = MARKET_CONFIG[marketId];
        if (!marketConfig.marketAddress) {
          throw new Error(`Market not available for ${methodName}`);
        }

        const abi: any = getAbi(marketId);
        
        // Create contract interface for encoding transaction data
        const iface = new ethers.Interface(abi);
        const data = iface.encodeFunctionData(methodName, args);

        // Prepare transaction for LINE MiniDapp
        const transaction = {
          from: account,
          to: marketConfig.marketAddress,
          value: '0x0', // No ETH value for most market operations
          gas: '0x927C0', // 600000 gas limit - adjust as needed
          data: data
        };

        console.log(`Sending ${methodName} transaction for ${marketId}:`, {
          to: marketConfig.marketAddress,
          methodName,
          args,
          data
        });

        // Send transaction through Kaia Wallet SDK
        await sendTransaction([transaction]);
        
        return {
          hash: '', // Hash not immediately available in LINE MiniDapp
          status: 'pending'
        };

      } catch (error: any) {
        console.error(`Error during ${methodName} on ${marketId}:`, error);
        return {
          hash: '',
          status: 'failed',
          error: error.message || `${methodName} failed`
        };
      }
    },
    [account, sendTransaction, getAbi]
  );

  const supply = useCallback(
    async (marketId: MarketId, amount: string): Promise<TransactionResult> => {
      const parsedAmount = parseTokenAmount(amount, MARKET_CONFIG[marketId].decimals);
      return sendContractTransaction(marketId, 'supplyStablecoin', [parsedAmount]);
    },
    [sendContractTransaction]
  );

  const withdraw = useCallback(
    async (marketId: MarketId, amount: string): Promise<TransactionResult> => {
      const parsedAmount = parseTokenAmount(amount, MARKET_CONFIG[marketId].decimals);
      return sendContractTransaction(marketId, 'withdrawStablecoin', [parsedAmount]);
    },
    [sendContractTransaction]
  );

  const borrow = useCallback(
    async (marketId: MarketId, amount: string): Promise<TransactionResult> => {
      const parsedAmount = parseTokenAmount(amount, MARKET_CONFIG[marketId].decimals);
      return sendContractTransaction(marketId, 'borrowStablecoin', [parsedAmount]);
    },
    [sendContractTransaction]
  );

  const repay = useCallback(
    async (marketId: MarketId, amount: string): Promise<TransactionResult> => {
      const parsedAmount = parseTokenAmount(amount, MARKET_CONFIG[marketId].decimals);
      return sendContractTransaction(marketId, 'repayStablecoin', [parsedAmount]);
    },
    [sendContractTransaction]
  );

  const depositCollateral = useCallback(
    async (marketId: MarketId, collateralType: 'wkaia' | 'stkaia', amount: string): Promise<TransactionResult> => {
      const methodName = collateralType === 'wkaia' ? 'depositWKaiaCollateral' : 'depositStKaiaCollateral';
      const parsedAmount = parseTokenAmount(amount, 18); // Collateral always uses 18 decimals
      return sendContractTransaction(marketId, methodName, [parsedAmount]);
    },
    [sendContractTransaction]
  );

  const withdrawCollateral = useCallback(
    async (marketId: MarketId, collateralType: 'wkaia' | 'stkaia', amount: string): Promise<TransactionResult> => {
      const methodName = collateralType === 'wkaia' ? 'withdrawWKaiaCollateral' : 'withdrawStKaiaCollateral';
      const parsedAmount = parseTokenAmount(amount, 18); // Collateral always uses 18 decimals
      return sendContractTransaction(marketId, methodName, [parsedAmount]);
    },
    [sendContractTransaction]
  );

  const accrueInterest = useCallback(
    async (marketId: MarketId): Promise<TransactionResult> => {
      return sendContractTransaction(marketId, 'accrueInterest', []);
    },
    [sendContractTransaction]
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
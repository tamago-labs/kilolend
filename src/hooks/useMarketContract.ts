import { useCallback } from 'react';
import { ethers } from 'ethers';
import { CTOKEN_ABI } from '@/utils/contractABIs';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';
import {
  getContract,
  parseTokenAmount,
  formatTokenAmount,
} from '@/utils/contractUtils';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import BigNumber from "bignumber.js";

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
  cTokenBalance: string;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
}

interface MarketContractHook {
  getMarketInfo: (marketId: MarketId) => Promise<MarketInfo | null>;
  getUserPosition: (marketId: any, userAddress: string) => Promise<UserPosition | null>;
  supply: (marketId: MarketId, amount: string) => Promise<TransactionResult>;
  withdraw: (marketId: MarketId, amount: string) => Promise<TransactionResult>;
  borrow: (marketId: MarketId, amount: string) => Promise<TransactionResult>;
  repay: (marketId: MarketId, amount: string) => Promise<TransactionResult>;
  accrueInterest: (marketId: MarketId) => Promise<TransactionResult>;
}

export const useMarketContract = (): MarketContractHook => {
  const { sendTransaction } = useKaiaWalletSdk();
  const { account } = useWalletAccountStore();

  const getMarketInfo = useCallback(async (marketId: MarketId): Promise<MarketInfo | null> => {
    try {
      const marketConfig = MARKET_CONFIG[marketId];
      if (!marketConfig.marketAddress) {
        console.warn(`Market ${marketId} is collateral-only`);
        return null;
      }

      const contract = await getContract(marketConfig.marketAddress, CTOKEN_ABI, false);
      if (!contract) throw new Error('Failed to create contract instance');

      // Get current block data
      const [
        totalSupply,
        totalBorrows,
        getCash,
        supplyRatePerBlock,
        borrowRatePerBlock,
        exchangeRate
      ] = await Promise.all([
        contract.totalSupply(),
        contract.totalBorrows(),
        contract.getCash(),
        contract.supplyRatePerBlock(),
        contract.borrowRatePerBlock(),
        contract.exchangeRateStored(),
      ]);

      console.log("Market data for", marketId, {
        totalSupply: totalSupply.toString(),
        totalBorrows: totalBorrows.toString(),
        getCash: getCash.toString(),
        supplyRatePerBlock: supplyRatePerBlock.toString(),
        borrowRatePerBlock: borrowRatePerBlock.toString(),
      });

      // Calculate utilization rate using BigNumber for precision
      const totalLiquidityBN = new BigNumber(getCash.toString()).plus(totalBorrows.toString());
      const utilizationBN = totalLiquidityBN.isGreaterThan(0) 
        ? new BigNumber(totalBorrows.toString()).dividedBy(totalLiquidityBN).multipliedBy(100)
        : new BigNumber(0);

      // Convert per-block rates to APY using BigNumber (assuming ~2 seconds per block on Kaia)
      const blocksPerYear = new BigNumber(365).multipliedBy(24).multipliedBy(60).multipliedBy(60).dividedBy(2);
      const supplyAPYBN = new BigNumber(supplyRatePerBlock.toString())
        .multipliedBy(blocksPerYear)
        .dividedBy(new BigNumber(10).pow(18))
        .multipliedBy(100);
      const borrowAPRBN = new BigNumber(borrowRatePerBlock.toString())
        .multipliedBy(blocksPerYear)
        .dividedBy(new BigNumber(10).pow(18))
        .multipliedBy(100);

      console.log(`Real rates for ${marketId}:`, {
        utilization: utilizationBN.toString(),
        supplyAPY: supplyAPYBN.toString(),
        borrowAPR: borrowAPRBN.toString(),
        totalLiquidity: totalLiquidityBN.toString()
      });

      return {
        totalSupply: ethers.formatUnits(totalSupply, 8), // cTokens have 8 decimals
        totalBorrow: formatTokenAmount(totalBorrows, marketConfig.decimals),
        supplyAPY: supplyAPYBN.toNumber(),
        borrowAPR: borrowAPRBN.toNumber(),
        utilizationRate: utilizationBN.toNumber(),
        exchangeRate: ethers.formatUnits(exchangeRate, 18),
      };
    } catch (error) {
    console.error(`Error getting market info for ${marketId}:`, error);
    
    // Return null if contract calls fail
    return null;
    }
  }, []);

  const getUserPosition = useCallback(
    async (marketId: any, userAddress: string): Promise<UserPosition | null> => {
      try {
        const CONFIG: any = MARKET_CONFIG
        const marketConfig = CONFIG[marketId];
        if (!marketConfig.marketAddress) return null;

        const contract = await getContract(marketConfig.marketAddress, CTOKEN_ABI, false);
        if (!contract) throw new Error('Failed to create contract instance');

        const [accountSnapshot, cTokenBalance] = await Promise.all([
          contract.getAccountSnapshot(userAddress),
          contract.balanceOf(userAddress),
        ]);

        // accountSnapshot returns: [error, cTokenBalance, borrowBalance, exchangeRateMantissa]
        const [error, , borrowBalance, exchangeRateMantissa] = accountSnapshot;

        if (Number(error) !== 0) {
          console.error('Error getting account snapshot:', error);
          return null;
        }
  
        // Calculate supply balance from cToken balance and exchange rate using BigNumber
        const supplyBalanceBN = new BigNumber(cTokenBalance.toString())
          .multipliedBy(new BigNumber(exchangeRateMantissa.toString()))
          .dividedBy(new BigNumber(10).pow(18));

        return {
          supplyBalance: formatTokenAmount(BigInt(supplyBalanceBN.toString()), marketConfig.decimals),
          borrowBalance: formatTokenAmount(borrowBalance, marketConfig.decimals),
          collateralValue: '0', // This would come from comptroller
          maxBorrowAmount: '0', // This would come from comptroller
          isHealthy: true, // This would come from comptroller
          cTokenBalance: ethers.formatUnits(cTokenBalance, 8),
        };
      } catch (error) {
        console.error(`Error getting user position for ${marketId}:`, error);
        return null;
      }
    },
    []
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

        // Create contract interface for encoding transaction data
        const iface = new ethers.Interface(CTOKEN_ABI);
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
          status: 'confirmed'
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
    [account, sendTransaction]
  );

  const supply = useCallback(
    async (marketId: MarketId, amount: string): Promise<TransactionResult> => {
      const parsedAmount = parseTokenAmount(amount, MARKET_CONFIG[marketId].decimals);
      return sendContractTransaction(marketId, 'mint', [parsedAmount]);
    },
    [sendContractTransaction]
  );

  const withdraw = useCallback(
    async (marketId: MarketId, amount: string): Promise<TransactionResult> => {
      const parsedAmount = parseTokenAmount(amount, MARKET_CONFIG[marketId].decimals);
      return sendContractTransaction(marketId, 'redeemUnderlying', [parsedAmount]);
    },
    [sendContractTransaction]
  );

  const borrow = useCallback(
    async (marketId: MarketId, amount: string): Promise<TransactionResult> => {
      const parsedAmount = parseTokenAmount(amount, MARKET_CONFIG[marketId].decimals);
      return sendContractTransaction(marketId, 'borrow', [parsedAmount]);
    },
    [sendContractTransaction]
  );

  const repay = useCallback(
    async (marketId: MarketId, amount: string): Promise<TransactionResult> => {
      const parsedAmount = parseTokenAmount(amount, MARKET_CONFIG[marketId].decimals);
      return sendContractTransaction(marketId, 'repayBorrow', [parsedAmount]);
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
    accrueInterest,
  };
};

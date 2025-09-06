import { useCallback } from 'react';
import { ethers } from 'ethers';
import { CTOKEN_ABI } from '@/utils/contractABIs';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';
import { getContract, parseTokenAmount } from '@/utils/contractUtils';
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

      // Utilization = borrows / (cash + borrows)
      const totalLiquidity = getCash + totalBorrows;
      const utilizationRate =
        totalLiquidity > BigInt(0)
          ? Number((totalBorrows * BigInt(10000)) / totalLiquidity) / 100
          : 0;

      // Blocks per year (~2s block time on Kaia)
      const blocksPerYear = BigInt(365 * 24 * 60 * 60 / 2);

      // APY calculations
      const scale = BigInt(10) ** BigInt(18);

      // Calculate supply APY
      const supplyAPY = Number(
        (supplyRatePerBlock * blocksPerYear * BigInt(10000)) / scale
      ) / 100;

      // Calculate borrow APR
      const borrowAPR = Number(
        (borrowRatePerBlock * blocksPerYear * BigInt(10000)) / scale
      ) / 100;

      return {
        totalSupply: ethers.formatUnits(totalSupply, 8), // cTokens = 8 decimals
        totalBorrow: ethers.formatUnits(totalBorrows, marketConfig.decimals),
        supplyAPY,
        borrowAPR,
        utilizationRate,
        exchangeRate: ethers.formatUnits(exchangeRate, 18),
      };
    } catch (error) {
      console.error(`Error getting market info for ${marketId}:`, error);
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
 
        // accountSnapshot = [error, cTokenBal, borrowBal, exchangeRateMantissa]
        const [error, , borrowBalance, exchangeRateMantissa] = accountSnapshot;

        if (Number(error) !== 0) {
          console.error('Error getting account snapshot:', error);
          return null;
        }

        // supplyBalance = cTokenBalance * exchangeRate / 1e18
        const supplyBalance = (BigInt(cTokenBalance) * BigInt(exchangeRateMantissa)) / (BigInt(10) ** BigInt(18));


        return {
          supplyBalance: ethers.formatUnits(supplyBalance, marketConfig.decimals),
          borrowBalance: ethers.formatUnits(borrowBalance, marketConfig.decimals),
          collateralValue: '0', // TODO: from comptroller
          maxBorrowAmount: '0', // TODO: from comptroller
          isHealthy: true, // TODO: from comptroller
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
        if (!account) throw new Error('Wallet not connected');

        const marketConfig = MARKET_CONFIG[marketId];
        if (!marketConfig.marketAddress) {
          throw new Error(`Market not available for ${methodName}`);
        }

        const iface = new ethers.Interface(CTOKEN_ABI);
        const data = iface.encodeFunctionData(methodName, args);

        const transaction = {
          from: account,
          to: marketConfig.marketAddress,
          value: '0x0',
          gas: '0x927C0',
          data
        };

        console.log(`Sending ${methodName} transaction for ${marketId}:`, {
          to: marketConfig.marketAddress,
          methodName,
          args,
          data
        });

        await sendTransaction([transaction]);

        return { hash: '', status: 'confirmed' };
      } catch (error: any) {
        console.error(`Error during ${methodName} on ${marketId}:`, error);
        return { hash: '', status: 'failed', error: error.message || `${methodName} failed` };
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

import { useCallback } from 'react';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { CTOKEN_ABI } from '@/utils/contractABIs';
import { MARKET_CONFIG, MarketId } from '@/utils/contractConfig';
import {
  getContract,
  parseTokenAmount,
  formatTokenAmount,
} from '@/utils/contractUtils';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useAppStore } from '@/stores/appStore';

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
  getUserPosition: (marketId: MarketId, userAddress: string) => Promise<UserPosition | null>;
  supply: (marketId: MarketId, amount: string) => Promise<TransactionResult>;
  withdraw: (marketId: MarketId, amount: string) => Promise<TransactionResult>;
  borrow: (marketId: MarketId, amount: string) => Promise<TransactionResult>;
  repay: (marketId: MarketId, amount: string) => Promise<TransactionResult>;
  accrueInterest: (marketId: MarketId) => Promise<TransactionResult>;
}

export const useMarketContract = (): MarketContractHook => {
  const { sendTransaction } = useKaiaWalletSdk();
  const { account } = useWalletAccountStore();
  const { getMarketById } = useContractMarketStore();
  const { gasLimit } = useAppStore();

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

      console.log("Raw market data for", marketId, {
        totalSupply: totalSupply.toString(),
        totalBorrows: totalBorrows.toString(),
        getCash: getCash.toString(),
        supplyRatePerBlock: supplyRatePerBlock.toString(),
        borrowRatePerBlock: borrowRatePerBlock.toString(),
        exchangeRate: exchangeRate.toString(),
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

      // Calculate total supply in underlying tokens
      // totalSupply (cTokens) * exchangeRate = total underlying supplied
      const totalSupplyUnderlying =
        (BigInt(totalSupply.toString()) * BigInt(exchangeRate.toString())) /
        BigInt(10 ** 18)
        
      // Convert to proper decimals for the underlying token
      const totalSupplyFormatted =
        totalSupplyUnderlying / BigInt(10 ** marketConfig.decimals);

      // Convert borrow amount to proper decimals
      const totalBorrowFormatted =
        BigInt(totalBorrows.toString()) / BigInt(10 ** marketConfig.decimals);

      // Get real token price from market store
      const market = getMarketById(marketId);
      const tokenPrice = market?.price
        ? BigInt(Math.floor(market.price * 1e6))
        : BigInt(1_000_000); // fallback to $1 (scaled 1e6)

      // Convert to USD using real prices
      const totalSupplyUSD =
        (totalSupplyFormatted * tokenPrice) / BigInt(1e6);
      const totalBorrowUSD =
        (totalBorrowFormatted * tokenPrice) / BigInt(1e6);

      // For logging, convert BigInt -> string or Number for readability
      console.log(`Calculated values for ${marketId}:`, {
        utilization: utilizationRate.toFixed(2), // keep BigNumber for ratios
        supplyAPY: supplyAPY.toFixed(2),
        borrowAPR: borrowAPR.toFixed(2),
        totalSupplyUnderlying: totalSupplyFormatted.toString(),
        totalBorrowUnderlying: totalBorrowFormatted.toString(),
        totalSupplyUSD: (Number(totalSupplyUSD) / 1e2).toFixed(2), // adjust scale as needed
        totalBorrowUSD: (Number(totalBorrowUSD) / 1e2).toFixed(2),
        tokenPrice: `$${Number(tokenPrice) / 1e6}`, // convert back to float
      });

      return {
        totalSupply: Number(totalSupplyUSD).toFixed(2),
        totalBorrow: Number(totalBorrowUSD).toFixed(2),
        supplyAPY: supplyAPY,
        borrowAPR: borrowAPR,
        utilizationRate: utilizationRate,
        exchangeRate: ethers.formatUnits(exchangeRate, 18),
      };
    } catch (error) {
      console.error(`Error getting market info for ${marketId}:`, error);

      // Return fallback data for UI stability
      return {
        totalSupply: '0.00',
        totalBorrow: '0.00',
        supplyAPY: 0,
        borrowAPR: 5, // Default 5% APR
        utilizationRate: 0,
        exchangeRate: '1.0',
      };
    }
  }, [getMarketById]);

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

        // supplyBalance = cTokenBalance * exchangeRate / 1e18
        const supplyBalance = (BigInt(cTokenBalance) * BigInt(exchangeRateMantissa)) / (BigInt(10) ** BigInt(18));

        return {
          supplyBalance: ethers.formatUnits(supplyBalance, marketConfig.decimals),
          borrowBalance: ethers.formatUnits(borrowBalance, marketConfig.decimals),
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
    async (marketId: MarketId, methodName: string, args: any[], value?: string): Promise<TransactionResult> => {
      try {
        if (!account) {
          throw new Error('Wallet not connected');
        }

        const marketConfig = MARKET_CONFIG[marketId];
        if (!marketConfig.marketAddress) {
          throw new Error(`Market not available for ${methodName}`);
        }

        console.log("value:", value)

        // Create contract interface for encoding transaction data
        const iface = new ethers.Interface(value ? [{
          "inputs": [],
          "name": "mint",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "payable",
          "type": "function"
        }] : CTOKEN_ABI);   
        const data = iface.encodeFunctionData(methodName, args);

        // For native KAIA, we need to send value with the transaction
        const transactionValue = value || '0x0';

        console.log("0xde0b6b3a7640000 : ",transactionValue )

        // Prepare transaction for LINE MiniDapp
        const transaction = {
          from: account,
          to: marketConfig.marketAddress, 
          value: transactionValue,
          gas: `0x${gasLimit.toString(16)}`, // Use gas limit from app store
          data: data
        };

        console.log(`Sending ${methodName} transaction for ${marketId}:`, {
          to: marketConfig.marketAddress,
          methodName,
          args,
          value: transactionValue,
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
    [account, sendTransaction, gasLimit]
  );

  const supply = useCallback(
    async (marketId: MarketId, amount: string): Promise<TransactionResult> => {
      const marketConfig = MARKET_CONFIG[marketId];
      
      // For native KAIA, we need to send the value with the transaction
      if (marketConfig.tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        // Native KAIA - send value with mint() call
        const parsedAmount = parseTokenAmount(amount, marketConfig.decimals);
        const hexValue = '0x' + parsedAmount.toString(16);
        return sendContractTransaction(marketId, 'mint', [], hexValue);
      } else {
        // ERC20 token - normal mint with amount parameter
        const parsedAmount = parseTokenAmount(amount, marketConfig.decimals);
        return sendContractTransaction(marketId, 'mint', [parsedAmount]);
      }
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

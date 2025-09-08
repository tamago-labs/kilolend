import { useCallback } from 'react';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { COMPTROLLER_ABI } from '@/utils/contractABIs';
import { CONTRACT_ADDRESSES, MarketId, MARKET_CONFIG } from '@/utils/contractConfig';
import { getContract } from '@/utils/contractUtils';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useAppStore } from '@/stores/appStore';

export interface AccountLiquidity {
  error: number;
  liquidity: string; // Available borrowing power in USD
  shortfall: string; // Amount user is short (for liquidation risk)
  isHealthy: boolean;
}

export interface MarketInfo {
  isListed: boolean;
  collateralFactorMantissa: string;
  collateralFactor: number; // Human readable percentage (e.g., 75 for 75%)
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
}

interface ComptrollerContractHook {
  // Market Management
  enterMarkets: (cTokens: string[]) => Promise<TransactionResult>;
  exitMarket: (cToken: string) => Promise<TransactionResult>;
  getAllMarkets: () => Promise<string[]>;
  getAssetsIn: (userAddress: string) => Promise<string[]>;
  
  // Account Liquidity
  getAccountLiquidity: (userAddress: string) => Promise<AccountLiquidity>;
  getHypotheticalAccountLiquidity: (
    userAddress: string,
    cTokenModify: string,
    redeemTokens: string,
    borrowAmount: string
  ) => Promise<AccountLiquidity>;
  
  // Market Information
  getMarketInfo: (cToken: string) => Promise<MarketInfo>;
  
  // Utility functions
  isMarketEntered: (userAddress: string, cToken: string) => Promise<boolean>;
  getEnteredMarketIds: (userAddress: string) => Promise<MarketId[]>;
}

export const useComptrollerContract = (): ComptrollerContractHook => {
  const { sendTransaction } = useKaiaWalletSdk();
  const { account } = useWalletAccountStore();
  const { gasLimit } = useAppStore();

  /**
   * Send a transaction to the Comptroller contract
   */
  const sendComptrollerTransaction = useCallback(
    async (methodName: string, args: any[]): Promise<TransactionResult> => {
      try {
        if (!account) {
          throw new Error('Wallet not connected');
        }

        // Create contract interface for encoding transaction data
        const iface = new ethers.Interface(COMPTROLLER_ABI);
        const data = iface.encodeFunctionData(methodName, args);

        // Prepare transaction
        const transaction = {
          from: account,
          to: CONTRACT_ADDRESSES.Comptroller,
          value: '0x0', // Comptroller functions don't require ETH
          gas: `0x${gasLimit.toString(16)}`,
          data: data
        };

        console.log(`Sending ${methodName} transaction to Comptroller:`, {
          to: CONTRACT_ADDRESSES.Comptroller,
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
        console.error(`Error during ${methodName}:`, error);
        return {
          hash: '',
          status: 'failed',
          error: error.message || `${methodName} failed`
        };
      }
    },
    [account, sendTransaction, gasLimit]
  );

  /**
   * Enter markets to enable them as collateral
   */
  const enterMarkets = useCallback(
    async (cTokens: string[]): Promise<TransactionResult> => {
      console.log('Entering markets:', cTokens);
      return sendComptrollerTransaction('enterMarkets', [cTokens]);
    },
    [sendComptrollerTransaction]
  );

  /**
   * Exit a market (disable as collateral)
   */
  const exitMarket = useCallback(
    async (cToken: string): Promise<TransactionResult> => {
      console.log('Exiting market:', cToken);
      return sendComptrollerTransaction('exitMarket', [cToken]);
    },
    [sendComptrollerTransaction]
  );

  /**
   * Get all supported markets
   */
  const getAllMarkets = useCallback(async (): Promise<string[]> => {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.Comptroller, COMPTROLLER_ABI, false);
      if (!contract) throw new Error('Failed to create comptroller contract instance');

      const markets = await contract.getAllMarkets();
      console.log('All markets from comptroller:', markets);
      return markets;
    } catch (error) {
      console.error('Error getting all markets:', error);
      return [];
    }
  }, []);

  /**
   * Get markets that user has entered (enabled as collateral)
   */
  const getAssetsIn = useCallback(
    async (userAddress: string): Promise<string[]> => {
      try {
        const contract = await getContract(CONTRACT_ADDRESSES.Comptroller, COMPTROLLER_ABI, false);
        if (!contract) throw new Error('Failed to create comptroller contract instance');

        const assetsIn = await contract.getAssetsIn(userAddress);
        console.log(`Assets in for ${userAddress}:`, assetsIn);
        return assetsIn;
      } catch (error) {
        console.error('Error getting assets in:', error);
        return [];
      }
    },
    []
  );

  /**
   * Get account liquidity (borrowing power)
   */
  const getAccountLiquidity = useCallback(
    async (userAddress: string): Promise<AccountLiquidity> => {
      try {
        const contract = await getContract(CONTRACT_ADDRESSES.Comptroller, COMPTROLLER_ABI, false);
        if (!contract) throw new Error('Failed to create comptroller contract instance');

        const [error, liquidity, shortfall] = await contract.getAccountLiquidity(userAddress);

        const liquidityUSD = ethers.formatUnits(liquidity, 18);
        const shortfallUSD = ethers.formatUnits(shortfall, 18);
        const isHealthy = Number(shortfall) === 0;

        console.log(`Account liquidity for ${userAddress}:`, {
          error: Number(error),
          liquidity: liquidityUSD,
          shortfall: shortfallUSD,
          isHealthy
        });

        return {
          error: Number(error),
          liquidity: liquidityUSD,
          shortfall: shortfallUSD,
          isHealthy
        };
      } catch (error) {
        console.error('Error getting account liquidity:', error);
        return {
          error: 1,
          liquidity: '0',
          shortfall: '0',
          isHealthy: false
        };
      }
    },
    []
  );

  /**
   * Get hypothetical account liquidity (for simulating transactions)
   */
  const getHypotheticalAccountLiquidity = useCallback(
    async (
      userAddress: string,
      cTokenModify: string,
      redeemTokens: string,
      borrowAmount: string
    ): Promise<AccountLiquidity> => {
      try {
        const contract = await getContract(CONTRACT_ADDRESSES.Comptroller, COMPTROLLER_ABI, false);
        if (!contract) throw new Error('Failed to create comptroller contract instance');

        const redeemTokensBN = ethers.parseUnits(redeemTokens, 8); // cTokens have 8 decimals
        const borrowAmountBN = ethers.parseUnits(borrowAmount, 18); // Assume 18 decimals for borrow

        const [error, liquidity, shortfall] = await contract.getHypotheticalAccountLiquidity(
          userAddress,
          cTokenModify,
          redeemTokensBN,
          borrowAmountBN
        );

        const liquidityUSD = ethers.formatUnits(liquidity, 18);
        const shortfallUSD = ethers.formatUnits(shortfall, 18);
        const isHealthy = Number(shortfall) === 0;

        return {
          error: Number(error),
          liquidity: liquidityUSD,
          shortfall: shortfallUSD,
          isHealthy
        };
      } catch (error) {
        console.error('Error getting hypothetical account liquidity:', error);
        return {
          error: 1,
          liquidity: '0',
          shortfall: '0',
          isHealthy: false
        };
      }
    },
    []
  );

  /**
   * Get market information including collateral factor
   */
  const getMarketInfo = useCallback(
    async (cToken: string): Promise<MarketInfo> => {
      try {
        const contract = await getContract(CONTRACT_ADDRESSES.Comptroller, COMPTROLLER_ABI, false);
        if (!contract) throw new Error('Failed to create comptroller contract instance');

        const [isListed, collateralFactorMantissa] = await contract.markets(cToken);

        // Convert mantissa to percentage (mantissa is scaled by 1e18)
        const collateralFactor = Number(ethers.formatUnits(collateralFactorMantissa, 18)) * 100;

        console.log(`Market info for ${cToken}:`, {
          isListed,
          collateralFactorMantissa: collateralFactorMantissa.toString(),
          collateralFactor: `${collateralFactor.toFixed(1)}%`
        });

        return {
          isListed,
          collateralFactorMantissa: collateralFactorMantissa.toString(),
          collateralFactor
        };
      } catch (error) {
        console.error('Error getting market info:', error);
        return {
          isListed: false,
          collateralFactorMantissa: '0',
          collateralFactor: 0
        };
      }
    },
    []
  );

  /**
   * Check if user has entered a specific market
   */
  const isMarketEntered = useCallback(
    async (userAddress: string, cToken: string): Promise<boolean> => {
      try {
        const assetsIn = await getAssetsIn(userAddress);
        return assetsIn.includes(cToken);
      } catch (error) {
        console.error('Error checking if market is entered:', error);
        return false;
      }
    },
    [getAssetsIn]
  );

  /**
   * Get entered market IDs (convert cToken addresses to market IDs)
   */
  const getEnteredMarketIds = useCallback(
    async (userAddress: string): Promise<MarketId[]> => {
      try {
        const assetsIn = await getAssetsIn(userAddress);
        const marketIds: MarketId[] = [];

        // Convert cToken addresses to market IDs
        for (const cTokenAddress of assetsIn) {
          const marketEntry = Object.entries(MARKET_CONFIG).find(
            ([_, config]) => config.marketAddress?.toLowerCase() === cTokenAddress.toLowerCase()
          );
          
          if (marketEntry) {
            marketIds.push(marketEntry[0] as MarketId);
          }
        }

        console.log('Entered market IDs:', marketIds);
        return marketIds;
      } catch (error) {
        console.error('Error getting entered market IDs:', error);
        return [];
      }
    },
    [getAssetsIn]
  );

  return {
    enterMarkets,
    exitMarket,
    getAllMarkets,
    getAssetsIn,
    getAccountLiquidity,
    getHypotheticalAccountLiquidity,
    getMarketInfo,
    isMarketEntered,
    getEnteredMarketIds
  };
};
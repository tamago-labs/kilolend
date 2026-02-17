import { useCallback } from 'react';
import { ethers } from 'ethers';
import { COMPTROLLER_ABI } from '@/utils/contractABIs';
import { CHAIN_CONTRACTS, ChainId } from '@/utils/chainConfig';
import { MARKET_CONFIG_V1, MarketId } from '@/utils/contractConfig';
import { useChainId, useReadContract, useWriteContract } from 'wagmi';

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

export interface ComptrollerContractHook {
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

/**
 * Helper function to get Comptroller address for current chain
 */
const getComptrollerAddress = (chainId: number): string => {
  const chainIdKey = chainId === 8217 ? 'kaia' : chainId === 96 ? 'kub' : chainId === 42793 ? 'etherlink' : 'kaia';
  return CHAIN_CONTRACTS[chainIdKey as ChainId]?.Comptroller || CHAIN_CONTRACTS.kaia.Comptroller;
};

/**
 * Web3-based Comptroller contract hook using wagmi
 */
export const useComptrollerContractWeb3 = (): ComptrollerContractHook => {
  const chainId = useChainId();
  const writeContract = useWriteContract();

  const comptrollerAddress = getComptrollerAddress(Number(chainId));

  /**
   * Enter markets to enable them as collateral
   */
  const enterMarkets = useCallback(
    async (cTokens: string[]): Promise<TransactionResult> => {
      try {
        console.log('Entering markets:', cTokens);

        const hash = await writeContract.mutateAsync({
          address: comptrollerAddress as `0x${string}`,
          abi: COMPTROLLER_ABI,
          functionName: 'enterMarkets',
          args: [cTokens]
        });

        console.log('Enter markets transaction sent:', hash);

        return {
          hash,
          status: 'pending'
        };
      } catch (error: any) {
        console.error('Error entering markets:', error);
        return {
          hash: '',
          status: 'failed',
          error: error.message || 'Enter markets failed'
        };
      }
    },
    [comptrollerAddress, writeContract]
  );

  /**
   * Exit a market (disable as collateral)
   */
  const exitMarket = useCallback(
    async (cToken: string): Promise<TransactionResult> => {
      try {
        console.log('Exiting market:', cToken);

        const hash = await writeContract.mutateAsync({
          address: comptrollerAddress as `0x${string}`,
          abi: COMPTROLLER_ABI,
          functionName: 'exitMarket',
          args: [cToken]
        });

        console.log('Exit market transaction sent:', hash);

        return {
          hash,
          status: 'pending'
        };
      } catch (error: any) {
        console.error('Error exiting market:', error);
        return {
          hash: '',
          status: 'failed',
          error: error.message || 'Exit market failed'
        };
      }
    },
    [comptrollerAddress, writeContract]
  );

  /**
   * Get all supported markets
   */
  const getAllMarkets = useCallback(async (): Promise<string[]> => {
    try {
      // Use wagmi's readContract pattern (would need to be called in a component)
      // For now, we'll use a direct read via ethers as a fallback
      const provider = new ethers.JsonRpcProvider(
        chainId === 8217 ? 'https://public-en.node.kaia.io' :
        chainId === 96 ? 'https://rpc.bitkubchain.io' :
        chainId === 42793 ? 'https://node.mainnet.etherlink.com' :
        'https://public-en.node.kaia.io'
      );

      const contract = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
      const markets = await contract.getAllMarkets();
      console.log('All markets from comptroller:', markets);
      return markets;
    } catch (error) {
      console.error('Error getting all markets:', error);
      return [];
    }
  }, [comptrollerAddress, chainId]);

  /**
   * Get markets that user has entered (enabled as collateral)
   */
  const getAssetsIn = useCallback(
    async (userAddress: string): Promise<string[]> => {
      try {
 
        const provider = new ethers.JsonRpcProvider(
          chainId === 8217 ? 'https://public-en.node.kaia.io' :
          chainId === 96 ? 'https://rpc.bitkubchain.io' :
          chainId === 42793 ? 'https://node.mainnet.etherlink.com' :
          'https://public-en.node.kaia.io'
        );

        const contract = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        const assetsIn = await contract.getAssetsIn(userAddress);
        console.log(`Assets in for ${userAddress}:`, assetsIn);
        return assetsIn;
      } catch (error) {
        console.error('Error getting assets in:', error);
        return [];
      }
    },
    [comptrollerAddress, chainId]
  );

  /**
   * Get account liquidity (borrowing power)
   */
  const getAccountLiquidity = useCallback(
    async (userAddress: string): Promise<AccountLiquidity> => {
      try {
        const provider = new ethers.JsonRpcProvider(
          chainId === 8217 ? 'https://public-en.node.kaia.io' :
          chainId === 96 ? 'https://rpc.bitkubchain.io' :
          chainId === 42793 ? 'https://node.mainnet.etherlink.com' :
          'https://public-en.node.kaia.io'
        );

        const contract = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
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
    [comptrollerAddress, chainId]
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
        const provider = new ethers.JsonRpcProvider(
          chainId === 8217 ? 'https://public-en.node.kaia.io' :
          chainId === 96 ? 'https://rpc.bitkubchain.io' :
          chainId === 42793 ? 'https://node.mainnet.etherlink.com' :
          'https://public-en.node.kaia.io'
        );

        const contract = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
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
    [comptrollerAddress, chainId]
  );

  /**
   * Get market information including collateral factor
   */
  const getMarketInfo = useCallback(
    async (cToken: string): Promise<MarketInfo> => {
      try {
        const provider = new ethers.JsonRpcProvider(
          chainId === 8217 ? 'https://public-en.node.kaia.io' :
          chainId === 96 ? 'https://rpc.bitkubchain.io' :
          chainId === 42793 ? 'https://node.mainnet.etherlink.com' :
          'https://public-en.node.kaia.io'
        );

        const contract = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        const [isListed, collateralFactorMantissa] = await contract.markets(cToken);

        // Convert mantissa to percentage (mantissa is scaled by 1e18)
        const collateralFactor = Number(ethers.formatUnits(collateralFactorMantissa, 18)) * 100;

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
    [comptrollerAddress, chainId]
  );

  /**
   * Check if user has entered a specific market
   */
  const isMarketEntered = useCallback(
    async (userAddress: string, cToken: string): Promise<boolean> => {
      try {
 

        const assetsIn = await getAssetsIn(userAddress);

 

        return assetsIn.includes(ethers.getAddress(cToken));



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

        // Convert cToken addresses to market IDs based on chain
        const chainIdKey = chainId === 8217 ? 'kaia' : chainId === 96 ? 'kub' : chainId === 42793 ? 'etherlink' : 'kaia';
        const contracts = CHAIN_CONTRACTS[chainIdKey as ChainId];

        // Create reverse mapping from cToken address to market ID
        const cTokenToMarketId: Record<string, MarketId> = {};

        if (chainIdKey === 'kaia') {
          cTokenToMarketId[(contracts as any).cUSDT?.toLowerCase()] = 'usdt';
          cTokenToMarketId[(contracts as any).cSIX?.toLowerCase()] = 'six';
          cTokenToMarketId[(contracts as any).cBORA?.toLowerCase()] = 'bora';
          cTokenToMarketId[(contracts as any).cMBX?.toLowerCase()] = 'mbx';
          cTokenToMarketId[(contracts as any).cKAIA?.toLowerCase()] = 'kaia';
          cTokenToMarketId[(contracts as any).cStKAIA?.toLowerCase()] = 'staked-kaia';
          cTokenToMarketId[(contracts as any).cstKAIA?.toLowerCase()] = 'staked-kaia';
        } else if (chainIdKey === 'kub') {
          // KUB chain has different market structure
        } else if (chainIdKey === 'etherlink') {
          // Etherlink chain has different market structure
        }

        // Convert assetsIn cToken addresses to market IDs
        assetsIn.forEach(cToken => {
          const marketId = cTokenToMarketId[cToken.toLowerCase()];
          if (marketId && !marketIds.includes(marketId)) {
            marketIds.push(marketId);
          }
        });
 
        return marketIds;
      } catch (error) {
        console.error('Error getting entered market IDs:', error);
        return [];
      }
    },
    [getAssetsIn, chainId]
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
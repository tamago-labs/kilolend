
import BigNumber from 'bignumber.js';
import { CTOKEN_ABI, COMPTROLLER_ABI } from '@/utils/contractABIs';
import { CHAIN_CONFIGS, CHAIN_CONTRACTS, CHAIN_MARKETS, ChainId, MarketKey } from '@/utils/chainConfig';
 
import { useCallback } from 'react';
import { useAuth } from '@/contexts/ChainContext';
import { useWeb3BorrowingPower } from "./useWeb3BorrowingPower"
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract } from "../v1/useMarketContract"
import { useComptrollerContract } from '../v1/useComptrollerContract';

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

// Helper function to get market address from chain config
const getMarketAddress = (chainId: ChainId, marketId: string): string => {
  const parts = marketId.split('-');
  const marketKey = parts[1] as MarketKey;
  const chainContracts = CHAIN_CONTRACTS[chainId] as any;

  if (chainId === 'kaia') {
    switch (marketKey) {
      case 'usdt': return chainContracts.cUSDT;
      case 'six': return chainContracts.cSIX;
      case 'bora': return chainContracts.cBORA;
      case 'mbx': return chainContracts.cMBX;
      case 'kaia': return chainContracts.cKAIA;
      case 'stkaia': return chainContracts.cStKAIA || chainContracts.cstKAIA;
      default: return '';
    }
  } else if (chainId === 'kub') {
    switch (marketKey) {
      case 'kusdt': return chainContracts.cKUSDT;
      case 'kub': return chainContracts.cKUB;
      default: return '';
    }
  } else if (chainId === 'etherlink') {
    switch (marketKey) {
      case 'usdt': return chainContracts.cUSDT;
      case 'xtz': return chainContracts.cXTZ;
      default: return '';
    }
  }
  return '';
};

// Helper function to get token address from chain config
const getTokenAddress = (chainId: ChainId, marketId: string): string => {
  const parts = marketId.split('-');
  const marketKey = parts[1] as MarketKey;
  const chainContracts = CHAIN_CONTRACTS[chainId] as any;

  if (chainId === 'kaia') {
    switch (marketKey) {
      case 'usdt': return chainContracts.USDT;
      case 'six': return chainContracts.SIX;
      case 'bora': return chainContracts.BORA;
      case 'mbx': return chainContracts.MBX;
      case 'kaia': return chainContracts.KAIA;
      case 'stkaia': return '0x42952b873ed6f7f0a7e4992e2a9818e3a9001995';
      default: return '';
    }
  } else if (chainId === 'kub') {
    switch (marketKey) {
      case 'kusdt': return chainContracts.KUSDT;
      case 'kub': return chainContracts.KUB;
      default: return '';
    }
  } else if (chainId === 'etherlink') {
    switch (marketKey) {
      case 'usdt': return chainContracts.USDT;
      case 'xtz': return chainContracts.XTZ;
      default: return '';
    }
  }
  return '';
};

// Type for market ID
type MarketId = string;


const useBorrowingPower = () => {
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

        const filtered = markets.filter(item => item.id.indexOf("kaia") !== -1)

        // Calculate totals by checking all user positions
        for (const market of filtered) {

          if (!market.isActive) continue;
 

          const position = await getUserPosition(market.id, userAddress);

          if (!position) continue;

          const supplyBalance = new BigNumber(position.supplyBalance || '0');
          const borrowBalance = new BigNumber(position.borrowBalance || '0');
          const marketPrice = new BigNumber(market.price || '0');

          // Get cToken address from marketId
          const cTokenAddress = market.marketAddress

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
 
        const cTokenAddress = market.marketAddress

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

/**
 * Unified borrowing power hook that supports both LINE SDK and Web3 Wallet modes
 * Similar to useTokenBalancesV2 pattern
 */
export const useBorrowingPowerV2 = () => {
  const { selectedAuthMethod } = useAuth();

  // Use LINE SDK borrowing power for line_sdk auth method
  const lineSdkBorrowingPower = useBorrowingPower();

  // Use Web3 borrowing power for web3_wallet auth method
  const web3BorrowingPower = useWeb3BorrowingPower();

  // Determine which hook to use based on auth method
  if (selectedAuthMethod === 'line_sdk') {
    // For LINE SDK, use existing hook
    return {
      calculateBorrowingPower: lineSdkBorrowingPower.calculateBorrowingPower,
      calculateMaxBorrowAmount: lineSdkBorrowingPower.calculateMaxBorrowAmount,
      getUserPosition: null, // LINE SDK uses useMarketContract for this
      isLoading: false,
      hasError: false,
      authMethod: 'line_sdk',
      isSupportedChain: true,
      isKAIAChain: true, // LINE SDK is always on KAIA
      isKUBChain: false,
      isEtherlinkChain: false,
    };
  } else {
    // For Web3 wallets, use new hook
    return {
      calculateBorrowingPower: async (address: string) => {
        if (!web3BorrowingPower.borrowingPower) {
          throw new Error('Borrowing power not available');
        }
        return web3BorrowingPower.borrowingPower;
      },
      calculateMaxBorrowAmount: web3BorrowingPower.calculateMaxBorrowAmount,
      getUserPosition: web3BorrowingPower.getUserPosition,
      isLoading: web3BorrowingPower.isLoading,
      hasError: web3BorrowingPower.hasError,
      authMethod: 'web3_wallet',
      isSupportedChain: web3BorrowingPower.isSupportedChain,
      chainId: web3BorrowingPower.chainId,
      isKAIAChain: web3BorrowingPower.chainId === 8217,
      isKUBChain: web3BorrowingPower.chainId === 96,
      isEtherlinkChain: web3BorrowingPower.chainId === 42793,
    };
  }
};
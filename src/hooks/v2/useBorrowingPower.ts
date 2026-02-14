import { useMemo, useCallback } from 'react';
import { useReadContract, useChainId, useConnection } from 'wagmi';
import { kaia } from 'wagmi/chains';
import { CTOKEN_ABI, COMPTROLLER_ABI } from '@/utils/contractABIs';
import { CONTRACT_ADDRESSES_V1, MARKET_CONFIG_V1, MarketId } from '@/utils/contractConfig';
import { formatUnits } from 'viem';
import { usePriceUpdates } from '../usePriceUpdates';
import { useBorrowingPower } from '../v1/useBorrowingPower';
import { useAuth } from '@/contexts/ChainContext';

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

/**
 * Web3-based borrowing power calculation using wagmi
 * Supports KAIA, KUB, and Etherlink chains (uses KAIA contracts for all)
 */
const useWeb3BorrowingPower = () => {
  const { address } = useConnection();
  const chainId = useChainId();
  const isKAIAChain = chainId === kaia.id;
  // For now, all chains use KAIA contract
  const isSupportedChain = isKAIAChain;

  // Get all markets
  const markets = useMemo(() => Object.values(MARKET_CONFIG_V1), []);

  // Get token prices
  const tokenSymbols = markets.map((m) => m.symbol);
  const { prices } = usePriceUpdates({ symbols: tokenSymbols });

  // Create queries for all market positions
  const marketPositionQueries = markets.map((market) => {
    return useReadContract({
      address: market.marketAddress as `0x${string}`,
      abi: CTOKEN_ABI,
      functionName: 'getAccountSnapshot',
      args: address ? [address] : undefined,
      chainId: isKAIAChain ? kaia.id : undefined,
      query: {
        enabled: !!address && isKAIAChain && !!market.marketAddress,
        refetchOnWindowFocus: false,
        staleTime: 30000,
      },
    });
  });

  const cTokenBalanceQueries = markets.map((market) => {
    return useReadContract({
      address: market.marketAddress as `0x${string}`,
      abi: CTOKEN_ABI,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
      chainId: isKAIAChain ? kaia.id : undefined,
      query: {
        enabled: !!address && isKAIAChain && !!market.marketAddress,
        refetchOnWindowFocus: false,
        staleTime: 30000,
      },
    });
  });

  const exchangeRateQueries = markets.map((market) => {
    return useReadContract({
      address: market.marketAddress as `0x${string}`,
      abi: CTOKEN_ABI,
      functionName: 'exchangeRateStored',
      chainId: isKAIAChain ? kaia.id : undefined,
      query: {
        enabled: isKAIAChain && !!market.marketAddress,
        refetchOnWindowFocus: false,
        staleTime: 60000,
      },
    });
  });

  // Comptroller queries
  const getAssetsInQuery = useReadContract({
    address: CONTRACT_ADDRESSES_V1.Comptroller as `0x${string}`,
    abi: COMPTROLLER_ABI,
    functionName: 'getAssetsIn',
    args: address ? [address] : undefined,
    chainId: isKAIAChain ? kaia.id : undefined,
    query: {
      enabled: !!address && isKAIAChain,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  });

  const getAccountLiquidityQuery = useReadContract({
    address: CONTRACT_ADDRESSES_V1.Comptroller as `0x${string}`,
    abi: COMPTROLLER_ABI,
    functionName: 'getAccountLiquidity',
    args: address ? [address] : undefined,
    chainId: isKAIAChain ? kaia.id : undefined,
    query: {
      enabled: !!address && isKAIAChain,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  });

  const getAllMarketsQuery = useReadContract({
    address: CONTRACT_ADDRESSES_V1.Comptroller as `0x${string}`,
    abi: COMPTROLLER_ABI,
    functionName: 'getAllMarkets',
    chainId: isKAIAChain ? kaia.id : undefined,
    query: {
      enabled: isKAIAChain,
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  });

  // Get market info (collateral factor) for all markets
  const marketInfoQueries = markets.map((market) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES_V1.Comptroller as `0x${string}`,
      abi: COMPTROLLER_ABI,
      functionName: 'markets',
      args: [market.marketAddress],
      chainId: isKAIAChain ? kaia.id : undefined,
      query: {
        enabled: isKAIAChain && !!market.marketAddress,
        refetchOnWindowFocus: false,
        staleTime: 60000,
      },
    });
  });

  // Get market liquidity (cash) for all markets
  const marketLiquidityQueries = markets.map((market) => {
    return useReadContract({
      address: market.marketAddress as `0x${string}`,
      abi: CTOKEN_ABI,
      functionName: 'getCash',
      chainId: isKAIAChain ? kaia.id : undefined,
      query: {
        enabled: isKAIAChain && !!market.marketAddress,
        refetchOnWindowFocus: false,
        staleTime: 30000,
      },
    });
  });

  // Combine all user positions
  const userPositions = useMemo<any[]>(() => {
    if (!address || !isSupportedChain) {
      return [];
    }

    const enteredMarkets = getAssetsInQuery.data as string[] || [];

    return markets.map((market, index) => {
      const snapshotQuery = marketPositionQueries[index];
      const cTokenBalanceQuery = cTokenBalanceQueries[index];
      const exchangeRateQuery = exchangeRateQueries[index];

      const snapshot = snapshotQuery.data as [bigint, bigint, bigint, bigint] | undefined;
      const cTokenBalance = (cTokenBalanceQuery.data as bigint) || BigInt(0);
      const exchangeRate = (exchangeRateQuery.data as bigint) || BigInt(10 ** 18);
      const borrowBalance = (snapshot?.[2] as bigint) || BigInt(0);

      const supplyBalance = (cTokenBalance * exchangeRate) / BigInt(10 ** 18);

      const isUserInMarket = enteredMarkets.includes(market.marketAddress || '') && supplyBalance > BigInt(0);

      const marketInfo = marketInfoQueries[index];
      const marketInfoData = marketInfo?.data as [boolean, bigint] | undefined;
      const collateralFactor = marketInfoData ? Number(marketInfoData[1]) / Number(BigInt(1e18)) : 0;

      return {
        supplyBalance: formatUnits(supplyBalance, market.decimals),
        borrowBalance: formatUnits(borrowBalance, market.decimals),
        collateralValue: '0',
        maxBorrowAmount: '0',
        isHealthy: true,
        cTokenBalance: formatUnits(cTokenBalance, 8),
        marketId: market.id,
        symbol: market.symbol,
        name: market.name,
        icon: market.icon,
        collateralFactor,
        isUserInMarket,
      };
    });
  }, [address, isSupportedChain, markets, marketPositionQueries, cTokenBalanceQueries, exchangeRateQueries, marketInfoQueries, getAssetsInQuery.data]);

  // Calculate borrowing power
  const borrowingPower = useMemo<BorrowingPowerData | null>(() => {
    if (!address || !isSupportedChain) {
      return null;
    }

    try {
      const enteredMarkets = getAssetsInQuery.data as string[] || [];
      const accountLiquidity = getAccountLiquidityQuery.data as [bigint, bigint, bigint] | undefined;

      const enteredMarketIds: MarketId[] = enteredMarkets
        .map((cTokenAddress) => {
          const market = markets.find((m) => m.marketAddress?.toLowerCase() === cTokenAddress.toLowerCase());
          return market?.id;
        })
        .filter((id): id is MarketId => !!id);

      const liquidity = accountLiquidity?.[1] || BigInt(0);
      const shortfall = accountLiquidity?.[2] || BigInt(0);

      let totalCollateralValue = 0;
      let totalBorrowValue = 0;

      userPositions.forEach((position) => {
        const market = markets.find((m) => m.id === position.marketId);
        if (!market) return;

        const supplyBalance = parseFloat(position.supplyBalance);
        const borrowBalance = parseFloat(position.borrowBalance);

        const priceData = prices[position.symbol];
        const price = priceData?.price || 0;

        if (supplyBalance > 0 && enteredMarkets.includes(market.marketAddress || '')) {
          const collateralValue = supplyBalance * price * position.collateralFactor;
          totalCollateralValue += collateralValue;
        }

        if (borrowBalance > 0) {
          totalBorrowValue += borrowBalance * price;
        }
      });

      const liquidityUSD = Number(liquidity) / 1e18;
      const borrowingPowerRemaining = shortfall > BigInt(0) ? 0 : liquidityUSD;
      const borrowingPowerUsed = totalCollateralValue > 0
        ? (totalBorrowValue / totalCollateralValue) * 100
        : 0;

      let weightedCollateralFactor = 0;
      let totalCollateralWeight = 0;

      userPositions.forEach((position) => {
        const market = markets.find((m) => m.id === position.marketId);
        if (!market) return;

        const supplyBalance = parseFloat(position.supplyBalance);
        const priceData = prices[position.symbol];
        const price = priceData?.price || 0;

        if (supplyBalance > 0 && enteredMarkets.includes(market.marketAddress || '')) {
          const collateralFactor = position.collateralFactor;
          const collateralValue = supplyBalance * price;
          weightedCollateralFactor += collateralFactor * collateralValue;
          totalCollateralWeight += collateralValue;
        }
      });

      const liquidationThreshold = totalCollateralWeight > 0
        ? (weightedCollateralFactor / totalCollateralWeight * 100).toFixed(2)
        : '0';

      const healthFactor = totalBorrowValue > 0
        ? totalCollateralValue / totalBorrowValue
        : 999;

      return {
        totalCollateralValue: totalCollateralValue.toFixed(2),
        totalBorrowValue: totalBorrowValue.toFixed(2),
        borrowingPowerUsed: borrowingPowerUsed.toFixed(2),
        borrowingPowerRemaining: borrowingPowerRemaining.toFixed(2),
        healthFactor: healthFactor.toFixed(2),
        liquidationThreshold,
        enteredMarkets,
        enteredMarketIds,
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
        enteredMarketIds: [],
      };
    }
  }, [address, isSupportedChain, userPositions, markets, getAssetsInQuery.data, getAccountLiquidityQuery.data, prices]);

  // Get user position for a specific market
  const getUserPosition = useCallback((marketId: any) => {
    return userPositions.find((p) => p.marketId === marketId) || null;
  }, [userPositions]);

  // Calculate max borrow amount for a specific market
  const calculateMaxBorrowAmount = useCallback(
    async (marketId: MarketId): Promise<MarketBorrowingData> => {
      if (!borrowingPower || !isSupportedChain) {
        return {
          maxBorrowAmount: '0',
          currentDebt: '0',
          collateralFactor: 0,
          availableLiquidity: '0',
          isLiquidityLimited: false,
          maxFromCollateral: '0',
          isUserInMarket: false,
        };
      }

      try {
        const market = markets.find((m) => m.id === marketId);
        if (!market) {
          throw new Error('Market not found');
        }

        const position = getUserPosition(marketId);
        const currentDebt = position?.borrowBalance || '0';

        const marketIndex = markets.findIndex((m) => m.id === marketId);
        const marketInfoQuery = marketInfoQueries[marketIndex];
        const marketInfo = marketInfoQuery?.data as [boolean, bigint] | undefined;
        const collateralFactor = marketInfo ? Number(marketInfo[1]) / Number(BigInt(1e18)) : 0;

        const isUserInMarket = borrowingPower.enteredMarketIds.includes(marketId);

        const liquidityQuery = marketLiquidityQueries[marketIndex];
        const liquidityRaw = liquidityQuery.data as bigint;
        const availableLiquidity = liquidityRaw
          ? formatUnits(liquidityRaw, market.decimals)
          : '0';

        const maxFromBorrowingPower = parseFloat(borrowingPower.borrowingPowerRemaining) * 0.95;
        const availableLiquidityNum = parseFloat(availableLiquidity);

        const maxBorrowAmount = Math.min(maxFromBorrowingPower, availableLiquidityNum);
        const isLiquidityLimited = maxBorrowAmount === availableLiquidityNum && availableLiquidityNum < maxFromBorrowingPower;

        return {
          maxBorrowAmount: maxBorrowAmount.toFixed(6),
          currentDebt,
          collateralFactor,
          availableLiquidity,
          isLiquidityLimited,
          maxFromCollateral: maxFromBorrowingPower.toFixed(6),
          isUserInMarket,
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
          isUserInMarket: false,
        };
      }
    },
    [borrowingPower, isSupportedChain, markets, getUserPosition, marketInfoQueries, marketLiquidityQueries]
  );

  const isLoading = marketPositionQueries.some((q) => q.isLoading) ||
                    getAssetsInQuery.isLoading ||
                    getAccountLiquidityQuery.isLoading;
  const hasError = marketPositionQueries.some((q) => q.error) ||
                   getAssetsInQuery.error ||
                   getAccountLiquidityQuery.error;

  return {
    borrowingPower,
    getUserPosition,
    calculateMaxBorrowAmount,
    isLoading,
    hasError,
    isSupportedChain,
    chainId,
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
      isKAIAChain: web3BorrowingPower.chainId === kaia.id,
      isKUBChain: false, // Not implemented yet
      isEtherlinkChain: false, // Not implemented yet
    };
  }
};
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CTOKEN_ABI } from '@/utils/contractABIs';
import { CHAIN_CONFIGS, CHAIN_MARKETS, CHAIN_CONTRACTS, getTokenIcon, ChainId } from '@/utils/chainConfig';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { PRICE_API_CONFIG } from '@/utils/tokenConfig';

export interface ChainMarketInfo {
  id: string;
  chainId: number;
  chainName: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
  isActive: boolean;
  isCollateralOnly: boolean;
  description: string;
  interestModel: string;
  totalSupply: string;
  totalBorrow: string;
  supplyAPY: number;
  borrowAPR: number;
  utilizationRate: number;
  exchangeRate: string;
  price?: number;
}

// Helper function to fetch prices from backend API
const fetchRealPrices = async (symbols: string[]): Promise<Record<string, { price: number }>> => {
  try {
    const response = await fetch(PRICE_API_CONFIG.endpoint);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const apiData = await response.json();
    
    if (!apiData.success || !apiData.data) {
      throw new Error('Invalid API response format');
    }

    // Convert API data to our format
    const priceMap: Record<string, { price: number }> = {};

    // Process API data and map symbols
    apiData.data.forEach((tokenData: any) => {
      let mappedSymbol = tokenData.symbol;
      
      // Handle symbol mapping (e.g., MARBLEX -> MBX)
      if (PRICE_API_CONFIG.symbolMapping[tokenData.symbol as keyof typeof PRICE_API_CONFIG.symbolMapping]) {
        mappedSymbol = PRICE_API_CONFIG.symbolMapping[tokenData.symbol as keyof typeof PRICE_API_CONFIG.symbolMapping];
      }

      if (symbols.includes(mappedSymbol)) {
        priceMap[mappedSymbol] = {
          price: tokenData.price
        };
      }
    });

    return priceMap;
  } catch (err) {
    console.error('Error fetching prices from API:', err);
    return {}; // Return empty on error
  }
};

export const useMultiChainMarketData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateMarketData, setLoading } = useContractMarketStore();

  // Create RPC providers for each chain (read-only)
  const createProviders = useCallback(() => {
    return {
      kaia: new ethers.JsonRpcProvider(CHAIN_CONFIGS.kaia.rpcUrl),
      kub: new ethers.JsonRpcProvider(CHAIN_CONFIGS.kub.rpcUrl),
      etherlink: new ethers.JsonRpcProvider(CHAIN_CONFIGS.etherlink.rpcUrl)
    };
  }, []);

  // Fetch market info for a specific chain
  const fetchChainMarkets = useCallback(async (
    chainId: ChainId,
    provider: ethers.JsonRpcProvider,
    prices: Record<string, { price: number }>
  ): Promise<ChainMarketInfo[]> => {
    const config = CHAIN_CONFIGS[chainId];
    const contracts = CHAIN_CONTRACTS[chainId];
    const markets = CHAIN_MARKETS[chainId];
    const results: ChainMarketInfo[] = [];

    console.log(`Fetching markets for ${chainId}...`);

    for (const [marketKey, marketConfig] of Object.entries(markets)) {
      try {
 
        // Get cToken address
        const cTokenKey = `c${marketConfig.symbol}`;
        const cTokenAddress = (contracts as any)[cTokenKey];
 
        if (!cTokenAddress) {
          console.log(`No cToken address found for ${chainId}-${marketKey}`);
          continue;
        }

        // Skip native tokens (they use special handling)
        if (cTokenAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'.toLowerCase()) {
          console.log(`Skipping native token ${chainId}-${marketKey}`);
          continue;
        }

        const contract = new ethers.Contract(cTokenAddress, CTOKEN_ABI, provider);

        // Fetch market data
        const [totalSupply, totalBorrows, getCash, supplyRatePerBlock, borrowRatePerBlock, exchangeRate] =
          await Promise.all([
            contract.totalSupply(),
            contract.totalBorrows(),
            contract.getCash(),
            contract.supplyRatePerBlock(),
            contract.borrowRatePerBlock(),
            contract.exchangeRateStored()
          ]);

        // Calculate utilization rate
        const totalLiquidity = getCash + totalBorrows;
        const utilizationRate = totalLiquidity > BigInt(0)
          ? Number((totalBorrows * BigInt(10000)) / totalLiquidity) / 100
          : 0;

        // Calculate APY using chain-specific blocks per year
        // Compound V2 formula: ratePerBlock is in Ray (1e18 precision)
        // APY = (ratePerBlock * blocksPerYear * 10000) / 1e18 / 100
        const blocksPerYear = BigInt(config.blocksPerYear);
        
        const scale = BigInt(10) ** BigInt(18);

        const supplyAPY = Number(
          (supplyRatePerBlock * blocksPerYear * BigInt(10000)) / scale
        ) / 100;


        const borrowAPR = Number(
          (borrowRatePerBlock * blocksPerYear * BigInt(10000)) / scale
        ) / 100;

        // Convert to underlying tokens
        const totalSupplyUnderlying = (BigInt(totalSupply.toString()) * BigInt(exchangeRate.toString())) / BigInt(10 ** 18)
        const totalSupplyFormatted = Number(totalSupplyUnderlying) / (10 ** marketConfig.decimals);
        const totalBorrowFormatted = Number(totalBorrows) / (10 ** marketConfig.decimals);

        // Get token price from price updates
        const priceData = prices[marketConfig.symbol];
        const tokenPrice = priceData?.price || 1; // Fallback to $1



        // Convert to USD using real prices
        const totalSupplyUSD = (totalSupplyFormatted * tokenPrice);
        const totalBorrowUSD = (totalBorrowFormatted * tokenPrice);

        results.push({
          id: marketConfig.id,
          chainId: config.chainId,
          chainName: config.chainName,
          name: marketConfig.name,
          symbol: marketConfig.symbol,
          icon: getTokenIcon(marketConfig.symbol),
          decimals: marketConfig.decimals,
          isActive: marketConfig.isActive,
          isCollateralOnly: marketConfig.isCollateralOnly,
          description: marketConfig.description,
          interestModel: marketConfig.interestModel,
          totalSupply: Number(totalSupplyUSD).toFixed(2),
          totalBorrow: Number(totalBorrowUSD).toFixed(2),
          supplyAPY,
          borrowAPR,
          utilizationRate,
          exchangeRate: ethers.formatUnits(exchangeRate, 18),
          price: tokenPrice
        });

        console.log(`✅ Fetched ${chainId}-${marketKey}:`, {
          supplyAPY: `${supplyAPY.toFixed(2)}%`,
          borrowAPR: `${borrowAPR.toFixed(2)}%`,
          utilization: `${utilizationRate.toFixed(2)}%`
        });

      } catch (error) {
        console.error(`❌ Error fetching ${chainId}-${marketKey}:`, error);
        // Continue with other markets even if one fails
      }
    }

    return results;
  }, []);

  // Fetch all chain markets
  const fetchAllMarkets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLoading(true);

    try {
      console.log('Starting multi-chain market data fetch...');
      
      // Collect all symbols from all chains
      const allSymbols = [
        ...Object.keys(CHAIN_MARKETS.kaia).map(k => CHAIN_MARKETS.kaia[k as keyof typeof CHAIN_MARKETS.kaia].symbol),
        ...Object.keys(CHAIN_MARKETS.kub).map(k => CHAIN_MARKETS.kub[k as keyof typeof CHAIN_MARKETS.kub].symbol),
        ...Object.keys(CHAIN_MARKETS.etherlink).map(k => CHAIN_MARKETS.etherlink[k as keyof typeof CHAIN_MARKETS.etherlink].symbol)
      ];
      
      console.log('Fetching token prices from API...');
      const prices = await fetchRealPrices(allSymbols);
      console.log(`✅ Fetched prices for ${Object.keys(prices).length} tokens`);

      const providers = createProviders();

      // Fetch from all chains in parallel
      const [kaiaMarkets, kubMarkets, etherlinkMarkets] = await Promise.all([
        fetchChainMarkets('kaia', providers.kaia, prices),
        fetchChainMarkets('kub', providers.kub, prices),
        fetchChainMarkets('etherlink', providers.etherlink, prices)
      ]);

      // Aggregate all markets
      const allMarkets = [...kaiaMarkets, ...kubMarkets, ...etherlinkMarkets];

      console.log(`✅ Fetched ${allMarkets.length} markets total from all chains`);

      // Update store with aggregated data
      allMarkets.forEach(market => {
        updateMarketData(market.id, market);
      });

      console.log('✅ Market data updated in store');

    } catch (error) {
      console.error('❌ Error fetching multi-chain market data:', error);
      setError('Failed to fetch market data from one or more chains');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [createProviders, fetchChainMarkets, updateMarketData, setLoading]);

  // Auto-fetch on mount and every 60 seconds
  useEffect(() => {
    fetchAllMarkets();
    const interval = setInterval(fetchAllMarkets, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    isLoading,
    error,
    fetchAllMarkets
  };
};
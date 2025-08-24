import { useCallback } from 'react';
import { ethers } from 'ethers';
import { PRICE_ORACLE_ABI } from '@/utils/contractABIs';
import { CONTRACT_ADDRESSES } from '@/utils/contractConfig';
import { getContract } from '@/utils/contractUtils';

export interface PriceData {
  wkaiaPrice: string; // Price in USD (18 decimals)
  stkaiaExchangeRate: string; // stKAIA to KAIA exchange rate (18 decimals)
  krwUsdRate: string; // KRW to USD rate (18 decimals)
  jpyUsdRate: string; // JPY to USD rate (18 decimals)
  thbUsdRate: string; // THB to USD rate (18 decimals)
}

interface PriceOracleHook {
  getTokenPrice: (tokenAddress: string) => Promise<string>;
  getAllPrices: () => Promise<PriceData | null>;
  getStKaiaExchangeRate: () => Promise<string>;
  convertToUSD: (tokenSymbol: string, amount: string) => Promise<string>;
}

export const usePriceOracle = (): PriceOracleHook => {
  /**
   * Get price of a specific token by address
   */
  const getTokenPrice = useCallback(async (tokenAddress: string): Promise<string> => {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.PriceOracle, PRICE_ORACLE_ABI, false);
      if (!contract) throw new Error('Failed to create price oracle contract');

      const price = await contract.getPrice(tokenAddress);
      return ethers.formatEther(price);
    } catch (error) {
      console.error('Error getting token price:', error);
      return '0';
    }
  }, []);

  /**
   * Get all relevant price data in one call
   */
  const getAllPrices = useCallback(async (): Promise<PriceData | null> => {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.PriceOracle, PRICE_ORACLE_ABI, false);
      if (!contract) throw new Error('Failed to create price oracle contract');

      const [wkaiaPrice, stkaiaRate, krwRate, jpyRate, thbRate] = await Promise.all([
        contract.getPrice(CONTRACT_ADDRESSES.wKAIA),
        contract.getStKaiaExchangeRate(),
        contract.getKRWUSDRate(),
        contract.getJPYUSDRate(),
        contract.getTHBUSDRate(),
      ]);

      return {
        wkaiaPrice: ethers.formatEther(wkaiaPrice),
        stkaiaExchangeRate: ethers.formatEther(stkaiaRate),
        krwUsdRate: ethers.formatEther(krwRate),
        jpyUsdRate: ethers.formatEther(jpyRate),
        thbUsdRate: ethers.formatEther(thbRate),
      };
    } catch (error) {
      console.error('Error getting all prices:', error);
      return null;
    }
  }, []);

  /**
   * Get stKAIA to KAIA exchange rate
   */
  const getStKaiaExchangeRate = useCallback(async (): Promise<string> => {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.PriceOracle, PRICE_ORACLE_ABI, false);
      if (!contract) throw new Error('Failed to create price oracle contract');

      const rate = await contract.getStKaiaExchangeRate();
      return ethers.formatEther(rate);
    } catch (error) {
      console.error('Error getting stKAIA exchange rate:', error);
      return '1.0'; // Fallback default
    }
  }, []);

  /**
   * Convert a given amount of token to its USD equivalent
   */
  const convertToUSD = useCallback(async (tokenSymbol: string, amount: string): Promise<string> => {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.PriceOracle, PRICE_ORACLE_ABI, false);
      if (!contract) throw new Error('Failed to create price oracle contract');

      let rate: bigint;

      switch (tokenSymbol.toLowerCase()) {
        case 'wkaia':
          rate = await contract.getPrice(CONTRACT_ADDRESSES.wKAIA);
          break;
        case 'stkaia':
          // stKAIA value = amount * stKAIA:KAIA rate * wKAIA price
          const stKaiaRate = await contract.getStKaiaExchangeRate();
          const wKaiaPrice = await contract.getPrice(CONTRACT_ADDRESSES.wKAIA);
          const stKaiaRateBigInt = BigInt(stKaiaRate.toString());
          const wKaiaPriceBigInt = BigInt(wKaiaPrice.toString()); 
          rate = (stKaiaRateBigInt * wKaiaPriceBigInt) / ethers.parseEther('1');
          break;
        case 'krw':
          rate = await contract.getKRWUSDRate();
          break;
        case 'jpy':
          rate = await contract.getJPYUSDRate();
          break;
        case 'thb':
          rate = await contract.getTHBUSDRate();
          break;
        case 'usdt':
          rate = ethers.parseEther('1'); // USDT pegged to USD
          break;
        default:
          throw new Error(`Unsupported token: ${tokenSymbol}`);
      }

      const amountBigInt = ethers.parseEther(amount);
      const usdValue = (amountBigInt * rate) / ethers.parseEther('1');

      return ethers.formatEther(usdValue);
    } catch (error) {
      console.error(`Error converting ${tokenSymbol} to USD:`, error);
      return '0';
    }
  }, []);

  return {
    getTokenPrice,
    getAllPrices,
    getStKaiaExchangeRate,
    convertToUSD,
  };
};

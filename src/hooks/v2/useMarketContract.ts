import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useReadContract, useWriteContract, useChainId, useConnection } from 'wagmi';
import { kaia } from 'wagmi/chains';
import { CTOKEN_ABI, COMPTROLLER_ABI } from '@/utils/contractABIs';
import { CHAIN_CONFIGS, CHAIN_CONTRACTS, CHAIN_MARKETS, ChainId, MarketKey } from '@/utils/chainConfig';
import { parseUnits, formatUnits } from 'viem';
import {
  getContract,
  parseTokenAmount,
} from '@/utils/contractUtils';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/ChainContext';
import { useMarketContract as useLineSdkMarketContract } from "../v1/useMarketContract"

export interface MarketInfo {
  totalSupply: string;
  totalBorrow: string;
  supplyAPY: number;
  borrowAPR: number;
  utilizationRate: number;
  exchangeRate: string;
  marketAddress?: string;
  tokenAddress?: string;
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
  getMarketInfo: (marketId: string) => Promise<MarketInfo | null>;
  getUserPosition: (marketId: string, userAddress: string) => Promise<UserPosition | null>;
  supply: (marketId: string, amount: string) => Promise<TransactionResult>;
  withdraw: (marketId: string, amount: string) => Promise<TransactionResult>;
  borrow: (marketId: string, amount: string) => Promise<TransactionResult>;
  repay: (marketId: string, amount: string) => Promise<TransactionResult>;
  accrueInterest: (marketId: string) => Promise<TransactionResult>;
}

// Helper function to parse marketId like "kaia-usdt" into chain and market key
const parseMarketId = (marketId: string): { chainId: ChainId; marketKey: MarketKey } | null => {
  const parts = marketId.split('-');
  if (parts.length !== 2) return null;

  const [chain, marketKey] = parts;
  if (!Object.keys(CHAIN_CONFIGS).includes(chain)) return null;

  return {
    chainId: chain as ChainId,
    marketKey: marketKey as MarketKey
  };
};

// Helper function to get market config for a specific chain
export const getMarketConfig = (marketId: string) => {
  let parsed = parseMarketId(marketId);
  if (!parsed) return null;

  if (parsed.marketKey === "stkaia") {
    parsed.marketKey = "staked-kaia" as MarketKey
  }

  const chainMarkets = CHAIN_MARKETS[parsed.chainId];
  if (!chainMarkets || !chainMarkets[parsed.marketKey]) return null;

  const chainContracts = CHAIN_CONTRACTS[parsed.chainId];
  if (!chainContracts) return null;

  // Map market keys to contract addresses with proper typing
  const contractMap: Record<string, string> = {};
  const tokenMap: Record<string, string> = {};

  if (parsed.chainId === 'kaia') {
    const kaiaContracts = CHAIN_CONTRACTS.kaia;
    contractMap.usdt = kaiaContracts.cUSDT;
    contractMap.six = kaiaContracts.cSIX;
    contractMap.bora = kaiaContracts.cBORA;
    contractMap.mbx = kaiaContracts.cMBX;
    contractMap.kaia = kaiaContracts.cKAIA;
    contractMap['staked-kaia'] = kaiaContracts.cStKAIA || kaiaContracts.cstKAIA;
    contractMap['st-kaia'] = kaiaContracts.cStKAIA || kaiaContracts.cstKAIA;

    tokenMap.usdt = kaiaContracts.USDT;
    tokenMap.six = kaiaContracts.SIX;
    tokenMap.bora = kaiaContracts.BORA;
    tokenMap.mbx = kaiaContracts.MBX;
    tokenMap.kaia = kaiaContracts.KAIA;
    tokenMap['staked-kaia'] = '0x42952b873ed6f7f0a7e4992e2a9818e3a9001995';
    tokenMap['stkaia'] = '0x42952b873ed6f7f0a7e4992e2a9818e3a9001995';
  } else if (parsed.chainId === 'kub') {
    const kubContracts = CHAIN_CONTRACTS.kub;
    contractMap.kusdt = kubContracts.cKUSDT;
    contractMap.kub = kubContracts.cKUB;

    tokenMap.kusdt = kubContracts.KUSDT;
    tokenMap.kub = kubContracts.KUB;
  } else if (parsed.chainId === 'etherlink') {
    const etherlinkContracts = CHAIN_CONTRACTS.etherlink;
    contractMap.usdt = etherlinkContracts.cUSDT;
    contractMap.xtz = etherlinkContracts.cXTZ;

    tokenMap.usdt = etherlinkContracts.USDT;
    tokenMap.xtz = etherlinkContracts.XTZ;
  }

  const marketData = chainMarkets[parsed.marketKey];
  const marketAddress = contractMap[parsed.marketKey];
  const tokenAddress = tokenMap[parsed.marketKey];

  if (!marketData) return null;

  // Type assertion to fix TypeScript inference
  const market = marketData as any;

  return {
    id: market.id,
    name: market.name,
    symbol: market.symbol,
    decimals: market.decimals,
    isActive: market.isActive,
    isCollateralOnly: market.isCollateralOnly,
    description: market.description,
    interestModel: market.interestModel,
    chainId: parsed.chainId,
    marketAddress,
    tokenAddress,
    blocksPerYear: CHAIN_CONFIGS[parsed.chainId].blocksPerYear
  };
};

/**
 * LINE SDK-based market contract hook
 */
// const useLineSdkMarketContract = (): MarketContractHook => {
//   const { sendTransaction } = useKaiaWalletSdk();
//   const { account } = useWalletAccountStore();
//   const { getMarketById } = useContractMarketStore();
//   const { gasLimit } = useAppStore();

//   const getMarketInfo = useCallback(async (marketId: string): Promise<MarketInfo | null> => {
//     try {
//       const marketConfig = getMarketConfig(marketId);
//       if (!marketConfig || !marketConfig.marketAddress) {
//         console.warn(`Market ${marketId} not found or is collateral-only`);
//         return null;
//       }

//       const contract = await getContract(marketConfig.marketAddress, CTOKEN_ABI, false);
//       if (!contract) throw new Error('Failed to create contract instance');

//       // Get current block data
//       const [
//         totalSupply,
//         totalBorrows,
//         getCash,
//         supplyRatePerBlock,
//         borrowRatePerBlock,
//         exchangeRate
//       ] = await Promise.all([
//         contract.totalSupply(),
//         contract.totalBorrows(),
//         contract.getCash(),
//         contract.supplyRatePerBlock(),
//         contract.borrowRatePerBlock(),
//         contract.exchangeRateStored(),
//       ]);

//       // Utilization = borrows / (cash + borrows)
//       const totalLiquidity = getCash + totalBorrows;
//       const utilizationRate =
//         totalLiquidity > BigInt(0)
//           ? Number((totalBorrows * BigInt(10000)) / totalLiquidity) / 100
//           : 0;

//       // Use chain-specific blocks per year
//       const blocksPerYear = BigInt(marketConfig.blocksPerYear);

//       // APY calculations
//       const scale = BigInt(10) ** BigInt(18);

//       // Calculate supply APY
//       const supplyAPY = Number(
//         (supplyRatePerBlock * blocksPerYear * BigInt(10000)) / scale
//       ) / 100;

//       // Calculate borrow APR
//       const borrowAPR = Number(
//         (borrowRatePerBlock * blocksPerYear * BigInt(10000)) / scale
//       ) / 100;

//       // Calculate total supply in underlying tokens
//       const totalSupplyUnderlying =
//         (BigInt(totalSupply.toString()) * BigInt(exchangeRate.toString())) /
//         BigInt(10 ** 18)

//       // Convert to proper decimals for the underlying token
//       const totalSupplyFormatted =
//         totalSupplyUnderlying / BigInt(10 ** marketConfig.decimals);

//       // Convert borrow amount to proper decimals
//       const totalBorrowFormatted =
//         BigInt(totalBorrows.toString()) / BigInt(10 ** marketConfig.decimals);

//       // Get real token price from market store
//       const market = getMarketById(marketId);
//       const tokenPrice = market?.price
//         ? BigInt(Math.floor(market.price * 1e6))
//         : BigInt(1_000_000); // fallback to $1 (scaled 1e6)

//       // Convert to USD using real prices
//       const totalSupplyUSD =
//         (totalSupplyFormatted * tokenPrice) / BigInt(1e6);
//       const totalBorrowUSD =
//         (totalBorrowFormatted * tokenPrice) / BigInt(1e6);

//       return {
//         totalSupply: Number(totalSupplyUSD).toFixed(2),
//         totalBorrow: Number(totalBorrowUSD).toFixed(2),
//         supplyAPY: supplyAPY,
//         borrowAPR: borrowAPR,
//         utilizationRate: utilizationRate,
//         exchangeRate: ethers.formatUnits(exchangeRate, 18),
//         marketAddress: marketConfig.marketAddress,
//         tokenAddress: marketConfig.tokenAddress,
//       };
//     } catch (error) {
//       console.error(`Error getting market info for ${marketId}:`, error);

//       // Return fallback data for UI stability
//       return {
//         totalSupply: '0.00',
//         totalBorrow: '0.00',
//         supplyAPY: 0,
//         borrowAPR: 5, // Default 5% APR
//         utilizationRate: 0,
//         exchangeRate: '1.0',
//       };
//     }
//   }, [getMarketById]);

//   const getUserPosition = useCallback(
//     async (marketId: string, userAddress: string): Promise<UserPosition | null> => {
//       try { 
//         const marketConfig = getMarketConfig(marketId);
//         if (!marketConfig) {
//           console.warn(`Market config not found for ${marketId}`);
//           return null;
//         }
//         if (!marketConfig.marketAddress) {
//           console.warn(`Market address not found for ${marketId}`);
//           return null;
//         }

//         // Skip if market is not for KAIA chain (LINE SDK only supports KAIA)
//         if (marketConfig.chainId !== 'kaia') {
//           console.warn(`Skipping ${marketId}: LINE SDK only supports KAIA chain, got ${marketConfig.chainId}`);
//           return null;
//         }

//         const contract = await getContract(marketConfig.marketAddress, CTOKEN_ABI, false);
//         if (!contract) throw new Error('Failed to create contract instance');

//         const [accountSnapshot, cTokenBalance] = await Promise.all([
//           contract.getAccountSnapshot(userAddress),
//           contract.balanceOf(userAddress),
//         ]);

//         // accountSnapshot returns: [error, cTokenBalance, borrowBalance, exchangeRateMantissa]
//         const [error, , borrowBalance, exchangeRateMantissa] = accountSnapshot;

//         if (Number(error) !== 0) {
//           console.error('Error getting account snapshot:', error);
//           return null;
//         }

//         // supplyBalance = cTokenBalance * exchangeRate / 1e18
//         const supplyBalance = (BigInt(cTokenBalance) * BigInt(exchangeRateMantissa)) / (BigInt(10) ** BigInt(18));

//         return {
//           supplyBalance: ethers.formatUnits(supplyBalance, marketConfig.decimals),
//           borrowBalance: ethers.formatUnits(borrowBalance, marketConfig.decimals),
//           collateralValue: '0', // This would come from comptroller
//           maxBorrowAmount: '0', // This would come from comptroller
//           isHealthy: true, // This would come from comptroller
//           cTokenBalance: ethers.formatUnits(cTokenBalance, 8),
//         };
//       } catch (error) {
//         console.error(`Error getting user position for ${marketId}:`, error);
//         return null;
//       }
//     },
//     []
//   );

//   const sendContractTransaction = useCallback(
//     async (marketId: string, methodName: string, args: any[], value?: string): Promise<TransactionResult> => {
//       try {
//         if (!account) {
//           throw new Error('Wallet not connected');
//         }

//         const marketConfig = getMarketConfig(marketId);
//         if (!marketConfig || !marketConfig.marketAddress) {
//           throw new Error(`Market not available for ${methodName}`);
//         }

//         // Create contract interface for encoding transaction data
//         // For payable functions (mint, repayBorrow), we need to correct ABI
//         let iface: ethers.Interface;
//         if (value && (methodName === 'mint' || methodName === 'repayBorrow')) {
//           // Use CEther ABI for payable functions
//           const payableAbi = [{
//             "inputs": [],
//             "name": methodName,
//             "outputs": methodName === 'mint' ? [{ "internalType": "uint256", "name": "", "type": "uint256" }] : [],
//             "stateMutability": "payable",
//             "type": "function"
//           }];
//           iface = new ethers.Interface(payableAbi);
//         } else {
//           iface = new ethers.Interface(CTOKEN_ABI);
//         }
//         const data = iface.encodeFunctionData(methodName, args);

//         // For native tokens, we need to send value with the transaction
//         const transactionValue = value || '0x0';

//         // Prepare transaction for LINE MiniDapp
//         const transaction = {
//           from: account,
//           to: marketConfig.marketAddress,
//           value: transactionValue,
//           gas: `0x${gasLimit.toString(16)}`, // Use gas limit from app store
//           data: data
//         };

//         console.log(`Sending ${methodName} transaction for ${marketId}:`, {
//           to: marketConfig.marketAddress,
//           methodName,
//           args,
//           value: transactionValue,
//           data
//         });

//         // Send transaction through Kaia Wallet SDK
//         await sendTransaction([transaction]);

//         return {
//           hash: '', // Hash not immediately available in LINE MiniDapp
//           status: 'confirmed'
//         };

//       } catch (error: any) {
//         console.error(`Error during ${methodName} on ${marketId}:`, error);
//         return {
//           hash: '',
//           status: 'failed',
//           error: error.message || `${methodName} failed`
//         };
//       }
//     },
//     [account, sendTransaction, gasLimit]
//   );

//   const supply = useCallback(
//     async (marketId: string, amount: string): Promise<TransactionResult> => {
//       const marketConfig = getMarketConfig(marketId);
//       if (!marketConfig) return { hash: '', status: 'failed', error: 'Market not found' };

//       // For native tokens, we need to send the value with the transaction
//       if (marketConfig.tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
//         // Native token - send value with mint() call
//         const parsedAmount = parseTokenAmount(amount, marketConfig.decimals);
//         const hexValue = '0x' + parsedAmount.toString(16);
//         return sendContractTransaction(marketId, 'mint', [], hexValue);
//       } else {
//         // ERC20 token - normal mint with amount parameter
//         const parsedAmount = parseTokenAmount(amount, marketConfig.decimals);
//         return sendContractTransaction(marketId, 'mint', [parsedAmount]);
//       }
//     },
//     [sendContractTransaction]
//   );

//   const withdraw = useCallback(
//     async (marketId: string, amount: string): Promise<TransactionResult> => {
//       const marketConfig = getMarketConfig(marketId);
//       if (!marketConfig) return { hash: '', status: 'failed', error: 'Market not found' };

//       const parsedAmount = parseTokenAmount(amount, marketConfig.decimals);
//       return sendContractTransaction(marketId, 'redeemUnderlying', [parsedAmount]);
//     },
//     [sendContractTransaction]
//   );

//   const borrow = useCallback(
//     async (marketId: string, amount: string): Promise<TransactionResult> => {
//       const marketConfig = getMarketConfig(marketId);
//       if (!marketConfig) return { hash: '', status: 'failed', error: 'Market not found' };

//       const parsedAmount = parseTokenAmount(amount, marketConfig.decimals);
//       return sendContractTransaction(marketId, 'borrow', [parsedAmount]);
//     },
//     [sendContractTransaction]
//   );

//   const repay = useCallback(
//     async (marketId: string, amount: string): Promise<TransactionResult> => {
//       const marketConfig = getMarketConfig(marketId);
//       if (!marketConfig) return { hash: '', status: 'failed', error: 'Market not found' };

//       // For native tokens, we need to send the value with the transaction
//       if (marketConfig.tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
//         // Native token - send value with repayBorrow() call (no parameters)
//         const parsedAmount = parseTokenAmount(amount, marketConfig.decimals);
//         const hexValue = '0x' + parsedAmount.toString(16);
//         return sendContractTransaction(marketId, 'repayBorrow', [], hexValue);
//       } else {
//         // ERC20 token - normal repayBorrow with amount parameter
//         const parsedAmount = parseTokenAmount(amount, marketConfig.decimals);
//         return sendContractTransaction(marketId, 'repayBorrow', [parsedAmount]);
//       }
//     },
//     [sendContractTransaction]
//   );

//   const accrueInterest = useCallback(
//     async (marketId: string): Promise<TransactionResult> => {
//       return sendContractTransaction(marketId, 'accrueInterest', []);
//     },
//     [sendContractTransaction]
//   );

//   return {
//     getMarketInfo,
//     getUserPosition,
//     supply,
//     withdraw,
//     borrow,
//     repay,
//     accrueInterest,
//   };
// };

/**
 * Web3-based market contract hook using wagmi
 */
const useWeb3MarketContract = (): MarketContractHook => {
  const { address } = useConnection();
  const chainId = useChainId();
  const isKAIAChain = chainId === kaia.id;
  const { getMarketById } = useContractMarketStore();

  // Write contracts for transactions
  const writeContract = useWriteContract();

  const getMarketInfo = useCallback(async (marketId: string): Promise<MarketInfo | null> => {
    try {
      const marketConfig = getMarketConfig(marketId);
      if (!marketConfig || !marketConfig.marketAddress) {
        console.warn(`Market ${marketId} not found or is collateral-only`);
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

      // Utilization = borrows / (cash + borrows)
      const totalLiquidity = getCash + totalBorrows;
      const utilizationRate =
        totalLiquidity > BigInt(0)
          ? Number((totalBorrows * BigInt(10000)) / totalLiquidity) / 100
          : 0;

      // Use chain-specific blocks per year
      const blocksPerYear = BigInt(marketConfig.blocksPerYear);

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
      const totalSupplyUnderlying =
        (BigInt(totalSupply.toString()) * BigInt(exchangeRate.toString())) /
        BigInt(10 ** 18)

      const totalSupplyFormatted =
        totalSupplyUnderlying / BigInt(10 ** marketConfig.decimals);

      const totalBorrowFormatted =
        BigInt(totalBorrows.toString()) / BigInt(10 ** marketConfig.decimals);

      // Get real token price from market store
      const market = getMarketById(marketId);
      const tokenPrice = market?.price
        ? BigInt(Math.floor(market.price * 1e6))
        : BigInt(1_000_000);

      const totalSupplyUSD =
        (totalSupplyFormatted * tokenPrice) / BigInt(1e6);
      const totalBorrowUSD =
        (totalBorrowFormatted * tokenPrice) / BigInt(1e6);

      return {
        totalSupply: Number(totalSupplyUSD).toFixed(2),
        totalBorrow: Number(totalBorrowUSD).toFixed(2),
        supplyAPY: supplyAPY,
        borrowAPR: borrowAPR,
        utilizationRate: utilizationRate,
        exchangeRate: ethers.formatUnits(exchangeRate, 18),
        marketAddress: marketConfig.marketAddress,
        tokenAddress: marketConfig.tokenAddress,
      };
    } catch (error) {
      console.error(`Error getting market info for ${marketId}:`, error);

      return {
        totalSupply: '0.00',
        totalBorrow: '0.00',
        supplyAPY: 0,
        borrowAPR: 5,
        utilizationRate: 0,
        exchangeRate: '1.0',
      };
    }
  }, [getMarketById]);

  const getUserPosition = useCallback(
    async (marketId: string, userAddress: string): Promise<UserPosition | null> => {
      try {

        const marketConfig = getMarketConfig(marketId);

        if (!marketConfig) {
          console.warn(`Market config not found for ${marketId}`);
          return null;
        }
        if (!marketConfig.marketAddress) {
          console.warn(`Market address not found for ${marketId}`);
          return null;
        }

        // Skip if market's chain doesn't match current chain (prevent cross-chain RPC calls)
        const currentChainId = chainId === 8217 ? 'kaia' : chainId === 96 ? 'kub' : chainId === 42793 ? 'etherlink' : null;
        if (currentChainId && marketConfig.chainId !== currentChainId) {
          console.warn(`Skipping ${marketId}: chain mismatch - market is on ${marketConfig.chainId}, current chain is ${currentChainId}`);
          return null;
        }

        const contract = await getContract(marketConfig.marketAddress, CTOKEN_ABI, false, chainId);
        if (!contract) throw new Error('Failed to create contract instance');

        const [accountSnapshot, cTokenBalance] = await Promise.all([
          contract.getAccountSnapshot(userAddress),
          contract.balanceOf(userAddress),
        ]);
        
        const [error, , borrowBalance, exchangeRateMantissa] = accountSnapshot;

        if (Number(error) !== 0) {
          console.error('Error getting account snapshot:', error);
          return null;
        }

        const supplyBalance = (BigInt(cTokenBalance) * BigInt(exchangeRateMantissa)) / (BigInt(10) ** BigInt(18));

        return {
          supplyBalance: ethers.formatUnits(supplyBalance, marketConfig.decimals),
          borrowBalance: ethers.formatUnits(borrowBalance, marketConfig.decimals),
          collateralValue: '0',
          maxBorrowAmount: '0',
          isHealthy: true,
          cTokenBalance: ethers.formatUnits(cTokenBalance, 8),
        };
      } catch (error) {
        console.error(`Error getting user position for ${marketId}:`, error);
        return null;
      }
    },
    [chainId]
  );

  const supply = useCallback(
    async (marketId: string, amount: string): Promise<TransactionResult> => {
      try {
        // Try to get market from store first, fallback to getMarketConfig
        let market = getMarketById(marketId);
        let marketAddress: string | undefined;
        let decimals: number;
        let tokenAddress: string | undefined;

        if (market && market.marketAddress) {
          marketAddress = market.marketAddress;
          decimals = market.decimals;
          tokenAddress = market.tokenAddress;
        } else {
          // Fallback to getMarketConfig if store data is incomplete
          const marketConfig = getMarketConfig(marketId);
          if (!marketConfig || !marketConfig.marketAddress) {
            throw new Error('Market not found or not properly configured');
          }
          marketAddress = marketConfig.marketAddress;
          decimals = marketConfig.decimals;
          tokenAddress = marketConfig.tokenAddress;
        }

        const isNativeToken = tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
        const parsedAmount = parseUnits(amount, decimals);

        // Execute transaction
        const hash = await writeContract.mutateAsync({
          address: marketAddress as `0x${string}`,
          abi: isNativeToken ? [{
            "inputs": [],
            "name": "mint",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "payable",
            "type": "function"
          }] : CTOKEN_ABI,
          functionName: 'mint',
          args: isNativeToken ? undefined : [parsedAmount],
          value: isNativeToken ? parsedAmount : undefined
        });

        return {
          hash,
          status: 'pending',
        };
      } catch (error: any) {
        console.error('Supply error:', error);
        return {
          hash: '',
          status: 'failed',
          error: error.message || 'Supply failed',
        };
      }
    },
    [isKAIAChain, writeContract, getMarketById]
  );

  const withdraw = useCallback(
    async (marketId: string, amount: string): Promise<TransactionResult> => {
      try {
        // Try to get market from store first, fallback to getMarketConfig
        let market = getMarketById(marketId);
        let marketAddress: string | undefined;
        let decimals: number;

        if (market && market.marketAddress) {
          marketAddress = market.marketAddress;
          decimals = market.decimals;
        } else {
          const marketConfig = getMarketConfig(marketId);
          if (!marketConfig || !marketConfig.marketAddress) {
            throw new Error('Market not found or not properly configured');
          }
          marketAddress = marketConfig.marketAddress;
          decimals = marketConfig.decimals;
        }

        const parsedAmount = parseUnits(amount, decimals);

        // Execute transaction
        const hash = await writeContract.mutateAsync({
          address: marketAddress as `0x${string}`,
          abi: CTOKEN_ABI,
          functionName: 'redeemUnderlying',
          args: [parsedAmount]
        });

        return {
          hash,
          status: 'pending',
        };
      } catch (error: any) {
        console.error('Withdraw error:', error);
        return {
          hash: '',
          status: 'failed',
          error: error.message || 'Withdraw failed',
        };
      }
    },
    [isKAIAChain, writeContract, getMarketById]
  );

  const borrow = useCallback(
    async (marketId: string, amount: string): Promise<TransactionResult> => {
      try {
        // Try to get market from store first, fallback to getMarketConfig
        let market = getMarketById(marketId);
        let marketAddress: string | undefined;
        let decimals: number;

        if (market && market.marketAddress) {
          marketAddress = market.marketAddress;
          decimals = market.decimals;
        } else {
          const marketConfig = getMarketConfig(marketId);
          if (!marketConfig || !marketConfig.marketAddress) {
            throw new Error('Market not found or not properly configured');
          }
          marketAddress = marketConfig.marketAddress;
          decimals = marketConfig.decimals;
        }

        const parsedAmount = parseUnits(amount, decimals);

        // Execute transaction
        const hash = await writeContract.mutateAsync({
          address: marketAddress as `0x${string}`,
          abi: CTOKEN_ABI,
          functionName: 'borrow',
          args: [parsedAmount]
        });

        return {
          hash,
          status: 'pending',
        };
      } catch (error: any) {
        console.error('Borrow error:', error);
        return {
          hash: '',
          status: 'failed',
          error: error.message || 'Borrow failed',
        };
      }
    },
    [isKAIAChain, writeContract, getMarketById]
  );

  const repay = useCallback(
    async (marketId: string, amount: string): Promise<TransactionResult> => {
      try {
        // Try to get market from store first, fallback to getMarketConfig
        let market = getMarketById(marketId);
        let marketAddress: string | undefined;
        let decimals: number;
        let tokenAddress: string | undefined;

        if (market && market.marketAddress) {
          marketAddress = market.marketAddress;
          decimals = market.decimals;
          tokenAddress = market.tokenAddress;
        } else {
          const marketConfig = getMarketConfig(marketId);
          if (!marketConfig || !marketConfig.marketAddress) {
            throw new Error('Market not found or not properly configured');
          }
          marketAddress = marketConfig.marketAddress;
          decimals = marketConfig.decimals;
          tokenAddress = marketConfig.tokenAddress;
        }

        const isNativeToken = tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
        const parsedAmount = parseUnits(amount, decimals);

        // Execute transaction
        const hash = await writeContract.mutateAsync({
          address: marketAddress as `0x${string}`,
          abi: isNativeToken ? [{
            "inputs": [],
            "name": "repayBorrow",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          }] : CTOKEN_ABI,
          functionName: 'repayBorrow',
          args: isNativeToken ? undefined : [parsedAmount],
          value: isNativeToken ? parsedAmount : undefined
        });

        return {
          hash,
          status: 'pending',
        };
      } catch (error: any) {
        console.error('Repay error:', error);
        return {
          hash: '',
          status: 'failed',
          error: error.message || 'Repay failed',
        };
      }
    },
    [isKAIAChain, writeContract, getMarketById]
  );

  const accrueInterest = useCallback(
    async (marketId: string): Promise<TransactionResult> => {
      // Placeholder for Web3 implementation
      return {
        hash: '',
        status: 'failed',
        error: 'Web3 transaction sending not implemented yet'
      };
    },
    []
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

/**
 * Unified market contract hook that supports both LINE SDK and Web3 Wallet modes
 * Similar to useBorrowingPowerV2 pattern
 */
export const useMarketContract = (): any => {
  const { selectedAuthMethod } = useAuth();

  // Use LINE SDK market contract for line_sdk auth method
  const lineSdkMarketContract = useLineSdkMarketContract();

  // Use Web3 market contract for web3_wallet auth method
  const web3MarketContract = useWeb3MarketContract();

  // Determine which hook to use based on auth method
  if (selectedAuthMethod === 'line_sdk') {
    // For LINE SDK, use existing hook
    return lineSdkMarketContract;
  } else {
    // For Web3 wallets, use new hook
    return web3MarketContract;
  }
};
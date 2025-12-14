// import { ethers } from 'ethers';
// import { getTokenBySymbol } from '@/utils/dragonSwapTokenAdapter';

// // DragonSwap contract addresses on KAIA Mainnet (ChainId: 8217)
// const DRAGONSWAP_CONFIG = {
//   V2_FACTORY: '0x224302153096E3ba16c4423d9Ba102D365a94B2B',
//   V2_ROUTER: '0x8203cBc504CE43c3Cad07Be0e057f25B1d4DB578',
//   V3_FACTORY: '0x7431A23897ecA6913D5c81666345D39F27d946A4',
//   V3_SMART_ROUTER: '0x5EA3e22C41B08DD7DC7217549939d987ED410354',
//   V3_SWAP_ROUTER: '0xA324880f884036E3d21a09B90269E1aC57c7EC8a',
//   WKAIA: '0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432',
//   QUOTER_V2: '0x673d88960D320909af24db6eE7665aF223fec060',
//   MULTICALL: '0x856B344c81f5bf5e6b7f84e1380ef7baC42B2542',
// };

// // KAIA Mainnet RPC
// const KAIA_RPC_URL = 'https://public-en.node.kaia.io';

// // ERC-20 ABI
// const ERC20_ABI = [
//   'function balanceOf(address owner) view returns (uint256)',
//   'function allowance(address owner, address spender) view returns (uint256)',
//   'function approve(address spender, uint256 amount) returns (bool)',
//   'function decimals() view returns (uint8)',
//   'function symbol() view returns (string)',
//   'function name() view returns (string)'
// ];

// // V2 Router ABI
// const V2_ROUTER_ABI = [
//   'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)',
//   'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
//   'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
//   'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
// ];

// // V3 Smart Router ABI
// const V3_SMART_ROUTER_ABI = [
//   'function exactInput(tuple(bytes path, address recipient, uint256 amountIn, uint256 amountOutMinimum) params) external payable returns (uint256 amountOut)',
//   'function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)',
//   'function exactOutput(tuple(bytes path, address recipient, uint256 amountOut, uint256 amountInMaximum) params) external payable returns (uint256 amountIn)',
//   'function exactOutputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountIn)',
//   'function unwrapWETH9(uint256 amountMinimum, address recipient) external payable',
//   'function refundETH() external payable',
// ];

// // V3 Quoter V2 ABI
// const V3_QUOTER_V2_ABI = [
//   'function quoteExactInputSingle(tuple(address tokenIn, address tokenOut, uint256 amountIn, uint24 fee) params) external returns (uint256 amountOut)',
//   'function quoteExactInput(tuple(bytes path, uint256 amountIn) params) external returns (uint256 amountOut)',
// ];

// // Multicall ABI for ETH -> ERC-20 swaps
// const MULTICALL_ABI = [
//   'function multicall(bytes[] calldata data) external payable returns (bytes[] memory results)',
//   'function multicall(uint256 deadline, bytes[] calldata data) external payable returns (bytes[] memory results)',
// ];

// export interface Pool {
//   id: string;
//   address: string;
//   token0: {
//     id: string;
//     symbol: string;
//     name: string;
//     decimals: string;
//   };
//   token1: {
//     id: string;
//     symbol: string;
//     name: string;
//     decimals: string;
//   };
//   fee?: number;
//   liquidityUSD: number;
//   volumeUSD: number;
//   apr: number;
//   hasLiquidity: boolean;
//   version: 'V2' | 'V3';
// }

// export interface SwapQuote {
//   inputAmount: string;
//   outputAmount: string;
//   route: {
//     path: string[];
//     pairs: string[];
//     fees?: number[];
//     isV3?: boolean;
//     poolAddress?: string;
//     pool?: Pool;
//   };
//   priceImpact: number;
//   gasEstimate: string;
//   liquidityUSD?: number;
// }

// export interface SwapParams {
//   tokenIn: any; // DragonSwapToken
//   tokenOut: any; // DragonSwapToken
//   amountIn: string;
//   slippagePercent: number;
//   recipient: string;
// }

// /**
//  * Encode path for V3 multi-hop swaps (from DragonSwap frontend)
//  */
// function encodeV3Path(path: string[], fees: number[]): string {
//   if (path.length !== fees.length + 1) {
//     throw new Error('Path length must be fees length + 1');
//   }

//   const encodedPath = new ethers.AbiCoder();
//   const pathBytes: string[] = [];

//   for (let i = 0; i < path.length; i++) {
//     const address = ethers.getAddress(path[i]);
//     const addressBytes = address.slice(2); // Remove 0x
    
//     if (i < fees.length) {
//       const feeBytes = fees[i].toString(16).padStart(6, '0');
//       pathBytes.push(addressBytes + feeBytes);
//     } else {
//       pathBytes.push(addressBytes);
//     }
//   }

//   return '0x' + pathBytes.join('');
// }

// export class DragonSwapService {
//   private provider: ethers.JsonRpcProvider;
//   private v2RouterInterface: ethers.Interface;
//   private v3RouterInterface: ethers.Interface;
//   private multicallInterface: ethers.Interface;

//   constructor() {
//     this.provider = new ethers.JsonRpcProvider(KAIA_RPC_URL);
//     this.v2RouterInterface = new ethers.Interface(V2_ROUTER_ABI);
//     this.v3RouterInterface = new ethers.Interface(V3_SMART_ROUTER_ABI);
//     this.multicallInterface = new ethers.Interface(MULTICALL_ABI);
//   }

//   /**
//    * Get all pools from subgraph with enhanced filtering for liquidity
//    */
//   async getAllPools(version: 'V2' | 'V3' = 'V3', minLiquidityUSD: number = 1000): Promise<Pool[]> {
//     try {
//       console.log(`[DragonSwap] Fetching ${version} pools with TVL > $${minLiquidityUSD}`);
      
//       const response = await fetch('/api/dragonswap/pools', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           version,
//           minLiquidityUSD,
//           // Add additional filtering params
//           topPoolsOnly: true,
//           maxPools: 50,
//         }),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`API error: ${response.status} - ${errorText}`);
//       }

//       const result = await response.json();
      
//       if (!result.success) {
//         throw new Error(result.error || 'Failed to fetch pools');
//       }

//       console.log(`[DragonSwap] Found ${result.pools.length} ${version} pools`);
      
//       // Additional filtering to ensure pools have actual liquidity
//       const filteredPools = result.pools.filter((pool: Pool) => {
//         const hasLiquidity = pool.liquidityUSD > minLiquidityUSD;
//         const hasVolume = pool.volumeUSD > 0;
//         const isValidPair = pool.token0 && pool.token1 && 
//                            pool.token0.symbol && pool.token1.symbol;
        
//         if (!hasLiquidity) {
//           console.log(`[DragonSwap] Filtering out pool ${pool.address} - insufficient liquidity: $${pool.liquidityUSD}`);
//         }
//         if (!hasVolume) {
//           console.log(`[DragonSwap] Filtering out pool ${pool.address} - no volume: $${pool.volumeUSD}`);
//         }
//         if (!isValidPair) {
//           console.log(`[DragonSwap] Filtering out pool ${pool.address} - invalid token pair`);
//         }
        
//         return hasLiquidity && hasVolume && isValidPair;
//       });

//       console.log(`[DragonSwap] After filtering: ${filteredPools.length} valid ${version} pools`);
//       return filteredPools;
//     } catch (error) {
//       console.error('[DragonSwap] Error fetching pools:', error);
//       return [];
//     }
//   }

//   /**
//    * Get top pools by TVL for better routing
//    */
//   async getTopPoolsByTVL(version: 'V2' | 'V3' = 'V3', limit: number = 20): Promise<Pool[]> {
//     try {
//       console.log(`[DragonSwap] Fetching top ${limit} ${version} pools by TVL`);
      
//       const response = await fetch('/api/dragonswap/pools/top', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           version,
//           limit,
//           minLiquidityUSD: 5000, // Higher threshold for top pools
//         }),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`API error: ${response.status} - ${errorText}`);
//       }

//       const result = await response.json();
      
//       if (!result.success) {
//         throw new Error(result.error || 'Failed to fetch top pools');
//       }

//       console.log(`[DragonSwap] Found ${result.pools.length} top ${version} pools`);
//       return result.pools;
//     } catch (error) {
//       console.error('[DragonSwap] Error fetching top pools:', error);
//       return [];
//     }
//   }

//   /**
//    * Find pools for a specific token pair from all available pools
//    */
//   async findPoolsForPair(tokenInSymbol: string, tokenOutSymbol: string): Promise<Pool[]> {
//     try {
//       const tokenIn = getTokenBySymbol(tokenInSymbol);
//       const tokenOut = getTokenBySymbol(tokenOutSymbol);

//       if (!tokenIn || !tokenOut) {
//         throw new Error('Token not found');
//       }

//       // Get all V3 and V2 pools
//       const [v3Pools, v2Pools] = await Promise.all([
//         this.getAllPools('V3'),
//         this.getAllPools('V2')
//       ]);

//       const allPools = [...v3Pools, ...v2Pools];

//       console.log("allPools:", allPools)

//       function normalizeSymbol(symbol: string): string {
//         const upper = symbol.toUpperCase();
//         if (upper === 'WKLAY') return 'WKAIA'; // pool uses WKLAY, system uses WKAIA
//         if (upper === 'STKAIA') return 'WKAIA'; // pool uses stKAIA, map to WKAIA
//         return upper;
//       }

//       function normalizeSystemSymbol(symbol: string): string {
//         const upper = symbol.toUpperCase();
//         if (upper === 'KAIA') return 'WKLAY'; // KAIA native should also match WKLAY pools
//         if (upper === 'WKAIA') return 'WKLAY'; // WKAIA should match WKLAY pools
//         return upper;
//       }

//       // Filter pools that contain our token pair by symbol
//       const matchingPools = allPools.filter(pool => {
//         const token0Symbol = normalizeSymbol(pool.token0.symbol).toUpperCase();
//         const token1Symbol = normalizeSymbol(pool.token1.symbol).toUpperCase();
//         const tokenInSymbolUpper = normalizeSystemSymbol(tokenInSymbol).toUpperCase();
//         const tokenOutSymbolUpper = normalizeSystemSymbol(tokenOutSymbol).toUpperCase();

//         return (
//           (token0Symbol === tokenInSymbolUpper && token1Symbol === tokenOutSymbolUpper) ||
//           (token0Symbol === tokenOutSymbolUpper && token1Symbol === tokenInSymbolUpper)
//         );
//       });

//       console.log("matchingPools:", matchingPools)

//       // Enhance pools with complete token information
//       const enhancedPools = matchingPools.map(pool => {
//         const token0 = getTokenBySymbol(pool.token0.symbol);
//         const token1 = getTokenBySymbol(pool.token1.symbol);
        
//         return {
//           ...pool,
//           token0: {
//             id: token0?.isNative ? DRAGONSWAP_CONFIG.WKAIA : (token0?.address || pool.token0.symbol),
//             symbol: pool.token0.symbol,
//             name: token0?.name || pool.token0.symbol,
//             decimals: token0?.decimals?.toString() || '18'
//           },
//           token1: {
//             id: token1?.isNative ? DRAGONSWAP_CONFIG.WKAIA : (token1?.address || pool.token1.symbol),
//             symbol: pool.token1.symbol,
//             name: token1?.name || pool.token1.symbol,
//             decimals: token1?.decimals?.toString() || '18'
//           }
//         };
//       });

//       // Sort by liquidity (highest first) and prefer V3
//       return enhancedPools.sort((a, b) => {
//         if (a.liquidityUSD !== b.liquidityUSD) {
//           return b.liquidityUSD - a.liquidityUSD;
//         }
//         return a.version === 'V3' ? -1 : 1;
//       });
//     } catch (error) {
//       console.error('[DragonSwap] Error finding pools for pair:', error);
//       return [];
//     }
//   }

//   /**
//    * Get V2 quote using direct contract calls
//    */
//   async getV2Quote(tokenIn: any, tokenOut: any, amountIn: string): Promise<{ amountOut: string; pool?: Pool }> {
//     try {
//       const pools = await this.findPoolsForPair(tokenIn.symbol, tokenOut.symbol);
//       const v2Pool = pools.find(p => p.version === 'V2');
      
//       if (!v2Pool) {
//         throw new Error('No V2 pool available');
//       }

//       const routerContract = new ethers.Contract(
//         DRAGONSWAP_CONFIG.V2_ROUTER,
//         V2_ROUTER_ABI,
//         this.provider
//       );

//       const tokenInAddress = tokenIn.isNative ? DRAGONSWAP_CONFIG.WKAIA : tokenIn.address;
//       const tokenOutAddress = tokenOut.isNative ? DRAGONSWAP_CONFIG.WKAIA : tokenOut.address;
      
//       const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);
//       const amounts = await routerContract.getAmountsOut(amountInWei, [tokenInAddress, tokenOutAddress]);
      
//       return {
//         amountOut: ethers.formatUnits(amounts[1], tokenOut.decimals),
//         pool: v2Pool
//       };
//     } catch (error) {
//       console.error('[DragonSwap] Error getting V2 quote:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get V3 quote using Quoter V2
//    */
//   async getV3Quote(tokenIn: any, tokenOut: any, amountIn: string): Promise<{ amountOut: string; pool?: Pool }> {
//     try {
//       const pools = await this.findPoolsForPair(tokenIn.symbol, tokenOut.symbol);
//       const v3Pool = pools.find(p => p.version === 'V3');
      
//       if (!v3Pool) {
//         throw new Error('No V3 pool available');
//       }

//       // Use read-only provider for quoter calls
//       const quoterContract = new ethers.Contract(
//         DRAGONSWAP_CONFIG.QUOTER_V2,
//         V3_QUOTER_V2_ABI,
//         this.provider
//       );

//       const tokenInAddress = tokenIn.isNative ? DRAGONSWAP_CONFIG.WKAIA : tokenIn.address;
//       const tokenOutAddress = tokenOut.isNative ? DRAGONSWAP_CONFIG.WKAIA : tokenOut.address;
      
//       const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);
      
//       try {
//         // Use callStatic for read-only operations
//         const amountOut = await quoterContract.quoteExactInputSingle.staticCall([
//           tokenInAddress,
//           tokenOutAddress,
//           amountInWei,
//           v3Pool.fee!
//         ]);
        
//         return {
//           amountOut: ethers.formatUnits(amountOut, tokenOut.decimals),
//           pool: v3Pool
//         };
//       } catch (quoterError) {
//         console.warn('[DragonSwap] Quoter V2 failed, using simplified calculation:', quoterError);
        
//         // Fallback to simplified calculation
//         const amountOut = this.calculateV3Output(amountIn, tokenIn, tokenOut, v3Pool);
//         return {
//           amountOut,
//           pool: v3Pool
//         };
//       }
//     } catch (error) {
//       console.error('[DragonSwap] Error getting V3 quote:', error);
//       throw error;
//     }
//   }

//   /**
//    * Calculate V3 output amount (simplified fallback)
//    */
//   private calculateV3Output(
//     amountIn: string,
//     tokenIn: any,
//     tokenOut: any,
//     pool: Pool
//   ): string {
//     // Estimate based on liquidity - this is a rough calculation
//     const liquidityRatio = Math.min(parseFloat(amountIn) / 1000, 0.01); // Max 1% of liquidity
//     const estimatedOutput = pool.liquidityUSD * liquidityRatio * 0.997; // 0.3% fee
    
//     // Convert to token units (rough estimation)
//     return (estimatedOutput / 1000).toString();
//   }

//   /**
//    * Get swap quote using best available pool with multi-hop support
//    */
//   async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
//     try {
//       const { tokenIn, tokenOut, amountIn, slippagePercent } = params;

//       console.log(`[DragonSwap] Getting quote for ${amountIn} ${tokenIn.symbol} -> ${tokenOut.symbol}`);

//       // First try direct pool
//       const directPools = await this.findPoolsForPair(tokenIn.symbol, tokenOut.symbol);
      
//       if (directPools.length > 0) {
//         console.log(`[DragonSwap] Found direct pool, trying single-hop`);
//         return await this.getSingleHopQuote(params, directPools[0]);
//       }

//       // If no direct pool, try multi-hop via multiple intermediate tokens
//       console.log(`[DragonSwap] No direct pool, trying multi-hop via intermediate tokens`);
//       const multiHopQuote = await this.getBestMultiHopQuote(params);
      
//       if (multiHopQuote) {
//         return multiHopQuote;
//       }

//       throw new Error('No pools found for this token pair');
//     } catch (error) {
//       console.error('[DragonSwap] Error getting swap quote:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get single-hop quote
//    */
//   private async getSingleHopQuote(params: SwapParams, pool: Pool): Promise<SwapQuote> {
//     const { tokenIn, tokenOut, amountIn } = params;

//     console.log(`[DragonSwap] Using ${pool.version} pool with $${pool.liquidityUSD.toFixed(0)} liquidity`);
    
//     // Get quote based on pool version
//     let quoteResult: { amountOut: string; pool?: Pool };
    
//     if (pool.version === 'V3') {
//       quoteResult = await this.getV3Quote(tokenIn, tokenOut, amountIn);
//     } else {
//       quoteResult = await this.getV2Quote(tokenIn, tokenOut, amountIn);
//     }

//     if (parseFloat(quoteResult.amountOut) <= 0) {
//       throw new Error('Insufficient liquidity for swap');
//     }

//     const tokenInAddress = tokenIn.isNative ? DRAGONSWAP_CONFIG.WKAIA : tokenIn.address;
//     const tokenOutAddress = tokenOut.isNative ? DRAGONSWAP_CONFIG.WKAIA : tokenOut.address;

//     const route = {
//       path: [tokenInAddress, tokenOutAddress],
//       pairs: [pool.address],
//       fees: pool.version === 'V3' ? [pool.fee!] : undefined,
//       isV3: pool.version === 'V3',
//       poolAddress: pool.address,
//       pool: quoteResult.pool || pool,
//     };

//     console.log('[DragonSwap] Single-hop quote route:', {
//       path: route.path,
//       fees: route.fees,
//       isV3: route.isV3,
//       poolAddress: route.poolAddress
//     });

//     return {
//       inputAmount: amountIn,
//       outputAmount: quoteResult.amountOut,
//       route,
//       priceImpact: this.calculatePriceImpact(amountIn, pool.liquidityUSD),
//       gasEstimate: pool.version === 'V3' ? '200000' : '150000',
//       liquidityUSD: pool.liquidityUSD,
//     };
//   }

//   /**
//    * Get best multi-hop quote by trying multiple intermediate tokens
//    */
//   private async getBestMultiHopQuote(params: SwapParams): Promise<SwapQuote | null> {
//     const { tokenIn, tokenOut, amountIn } = params;

//     // Define intermediate tokens in order of preference
//     const intermediateTokens = [
//       'WKAIA',     // WKAIA - wrapped native
//       'USDT',
//       'WETH'
//     ];

//     console.log(`[DragonSwap] Trying multi-hop via ${intermediateTokens.length} intermediate tokens`);

//     const multiHopQuotes: Array<{ quote: SwapQuote; intermediateToken: string }> = [];

//     // Try each intermediate token
//     for (const intermediateSymbol of intermediateTokens) {
//       // Skip if intermediate token is same as input or output
//       if (intermediateSymbol === tokenIn.symbol || intermediateSymbol === tokenOut.symbol) {
//         continue;
//       }

//       try {
//         console.log(`[DragonSwap] Trying multi-hop via ${intermediateSymbol}`);
        
//         const quote = await this.getMultiHopQuoteViaIntermediate(params, intermediateSymbol);
        
//         if (quote) {
//           multiHopQuotes.push({ quote, intermediateToken: intermediateSymbol });
//           console.log(`[DragonSwap] ✅ Found viable route via ${intermediateSymbol}: ${quote.outputAmount} ${tokenOut.symbol}`);
//         }
//       } catch (error) {
//         console.log(`[DragonSwap] ❌ No viable route via ${intermediateSymbol}:`, error instanceof Error ? error.message : error);
//       }
//     }

//     if (multiHopQuotes.length === 0) {
//       console.log('[DragonSwap] No viable multi-hop routes found');
//       return null;
//     }

//     // Sort by output amount (best rate first)
//     multiHopQuotes.sort((a, b) => parseFloat(b.quote.outputAmount) - parseFloat(a.quote.outputAmount));

//     const bestRoute = multiHopQuotes[0];
//     console.log(`[DragonSwap] 🎯 Best route: ${tokenIn.symbol} -> ${bestRoute.intermediateToken} -> ${tokenOut.symbol}`);
//     console.log(`[DragonSwap] 📊 Best output: ${bestRoute.quote.outputAmount} ${tokenOut.symbol}`);

//     return bestRoute.quote;
//   }

//   /**
//    * Get multi-hop quote via specific intermediate token
//    */
//   private async getMultiHopQuoteViaIntermediate(
//     params: SwapParams,
//     intermediateSymbol: string
//   ): Promise<SwapQuote | null> {
//     const { tokenIn, tokenOut, amountIn } = params;

//     try {
//       // Get intermediate token
//       const intermediateToken = getTokenBySymbol(intermediateSymbol);
//       if (!intermediateToken) {
//         console.log(`[DragonSwap] Intermediate token ${intermediateSymbol} not found`);
//         return null;
//       }

//       // Find pools: tokenIn -> intermediate and intermediate -> tokenOut
//       const [poolsIn, poolsOut] = await Promise.all([
//         this.findPoolsForPair(tokenIn.symbol, intermediateSymbol),
//         this.findPoolsForPair(intermediateSymbol, tokenOut.symbol)
//       ]);

//       if (poolsIn.length === 0 || poolsOut.length === 0) {
//         console.log(`[DragonSwap] No pools found for ${intermediateSymbol} route`);
//         return null;
//       }

//       // Use best pools for each hop
//       const poolIn = poolsIn[0];
//       const poolOut = poolsOut[0];

//       console.log(`[DragonSwap] Multi-hop via ${intermediateSymbol}: ${tokenIn.symbol} -> ${intermediateSymbol} -> ${tokenOut.symbol}`);
//       console.log(`[DragonSwap] Pool 1: ${poolIn.version} with $${poolIn.liquidityUSD.toFixed(0)} liquidity`);
//       console.log(`[DragonSwap] Pool 2: ${poolOut.version} with $${poolOut.liquidityUSD.toFixed(0)} liquidity`);

//       // Get quotes for each hop
//       const quoteIn = poolIn.version === 'V3' 
//         ? await this.getV3Quote(tokenIn, intermediateToken, amountIn)
//         : await this.getV2Quote(tokenIn, intermediateToken, amountIn);
      
//       const quoteOut = poolOut.version === 'V3'
//         ? await this.getV3Quote(intermediateToken, tokenOut, quoteIn.amountOut)
//         : await this.getV2Quote(intermediateToken, tokenOut, quoteIn.amountOut);

//       if (parseFloat(quoteOut.amountOut) <= 0) {
//         throw new Error('Insufficient liquidity for multi-hop swap');
//       }

//       // Build multi-hop route
//       const tokenInAddress = tokenIn.isNative ? DRAGONSWAP_CONFIG.WKAIA : tokenIn.address;
//       const intermediateAddress = intermediateToken.address;
//       const tokenOutAddress = tokenOut.isNative ? DRAGONSWAP_CONFIG.WKAIA : tokenOut.address;

//       const path = [tokenInAddress, intermediateAddress, tokenOutAddress];
//       const pairs = [poolIn.address, poolOut.address];
      
//       // For V3 pools, we need fees for each hop
//       const fees: number[] = [];
//       if (poolIn.version === 'V3' && poolIn.fee) fees.push(poolIn.fee);
//       if (poolOut.version === 'V3' && poolOut.fee) fees.push(poolOut.fee);

//       const route = {
//         path,
//         pairs,
//         fees: fees.length > 0 ? fees : undefined,
//         isV3: poolIn.version === 'V3' || poolOut.version === 'V3',
//         poolAddress: poolIn.address, // First pool address
//         pool: poolIn, // First pool
//       };

//       console.log(`[DragonSwap] Multi-hop quote route via ${intermediateSymbol}:`, {
//         path: route.path.map(addr => addr.slice(0, 8) + '...'),
//         fees: route.fees,
//         isV3: route.isV3,
//         poolAddress: route.poolAddress,
//         hops: 2
//       });

//       // Calculate combined liquidity and gas
//       const totalLiquidity = poolIn.liquidityUSD + poolOut.liquidityUSD;
//       const gasEstimate = (poolIn.version === 'V3' ? 200000 : 150000) + 
//                          (poolOut.version === 'V3' ? 200000 : 150000);

//       return {
//         inputAmount: amountIn,
//         outputAmount: quoteOut.amountOut,
//         route,
//         priceImpact: this.calculatePriceImpact(amountIn, totalLiquidity),
//         gasEstimate: gasEstimate.toString(),
//         liquidityUSD: totalLiquidity,
//       };
//     } catch (error) {
//       console.error(`[DragonSwap] Error getting multi-hop quote via ${intermediateSymbol}:`, error);
//       return null;
//     }
//   }

//   /**
//    * Calculate price impact
//    */
//   calculatePriceImpact(amountIn: string, liquidityUSD?: number): number {
//     const amount = parseFloat(amountIn);
//     if (!liquidityUSD || liquidityUSD === 0) return 0.1;
    
//     const impact = (amount / liquidityUSD) * 100;
//     return Math.min(Math.max(impact, 0.01), 5.0); // Cap between 0.01% and 5%
//   }

//   /**
//    * Execute swap with multi-call support for ETH -> ERC-20
//    */
//   async executeSwap(
//     quote: SwapQuote,
//     signer: ethers.Signer,
//     slippageTolerance: number = 0.5
//   ): Promise<ethers.ContractTransactionResponse> {
//     try {
//       const { route, inputAmount, outputAmount } = quote;
//       const tokenInAddress = route.path[0];
//       const tokenOutAddress = route.path[route.path.length - 1];
      
//       console.log(`[DragonSwap] Executing swap: ${inputAmount} -> ${outputAmount}`);
//       console.log(`[DragonSwap] Route: ${route.path.join(' -> ')}`);

//       // Calculate minimum output with slippage
//       const minOutput = (parseFloat(outputAmount) * (1 - slippageTolerance / 100)).toFixed(
//         this.getOutputTokenDecimals(tokenOutAddress)
//       );

//       // Check if this is ETH -> ERC-20 swap
//       const isETHToERC20 = tokenInAddress === DRAGONSWAP_CONFIG.WKAIA && 
//                           tokenOutAddress !== DRAGONSWAP_CONFIG.WKAIA;

//       if (isETHToERC20 && route.isV3) {
//         return await this.executeETHToERC20V3Swap(quote, signer, minOutput);
//       } else if (isETHToERC20 && !route.isV3) {
//         return await this.executeETHToERC20V2Swap(quote, signer, minOutput);
//       } else {
//         return await this.executeStandardSwap(quote, signer, minOutput);
//       }
//     } catch (error) {
//       console.error('[DragonSwap] Error executing swap:', error);
//       throw error;
//     }
//   }

//   /**
//    * Execute ETH -> ERC-20 V3 swap using multicall
//    */
//   private async executeETHToERC20V3Swap(
//     quote: SwapQuote,
//     signer: ethers.Signer,
//     minOutput: string
//   ): Promise<ethers.ContractTransactionResponse> {
//     const { route, inputAmount } = quote;
//     const tokenOutAddress = route.path[route.path.length - 1];
    
//     // Get V3 Smart Router contract
//     const routerContract = new ethers.Contract(
//       DRAGONSWAP_CONFIG.V3_SMART_ROUTER,
//       V3_SMART_ROUTER_ABI,
//       signer
//     );

//     // Get Multicall contract
//     const multicallContract = new ethers.Contract(
//       DRAGONSWAP_CONFIG.MULTICALL,
//       MULTICALL_ABI,
//       signer
//     );

//     const amountInWei = ethers.parseEther(inputAmount);
//     const minOutputWei = ethers.parseUnits(minOutput, this.getOutputTokenDecimals(tokenOutAddress));

//     if (route.path.length === 2) {
//       // Single hop ETH -> ERC-20
//       const params = {
//         tokenIn: DRAGONSWAP_CONFIG.WKAIA,
//         tokenOut: tokenOutAddress,
//         fee: route.fees![0],
//         recipient: await signer.getAddress(),
//         amountIn: amountInWei,
//         amountOutMinimum: minOutputWei,
//         sqrtPriceLimitX96: 0
//       };

//       return await routerContract.exactInputSingle(params, {
//         value: amountInWei
//       });
//     } else {
//       // Multi-hop ETH -> ERC-20 using multicall
//       const encodedPath = this.encodeV3Path(route.path, route.fees!);
      
//       const swapCall = this.v3RouterInterface.encodeFunctionData('exactInput', [{
//         path: encodedPath,
//         recipient: await signer.getAddress(),
//         amountIn: amountInWei,
//         amountOutMinimum: minOutputWei
//       }]);

//       const unwrapCall = this.v3RouterInterface.encodeFunctionData('unwrapWETH9', [
//         minOutputWei,
//         await signer.getAddress()
//       ]);

//       return await multicallContract.multicall([swapCall, unwrapCall], {
//         value: amountInWei
//       });
//     }
//   }

//   /**
//    * Execute ETH -> ERC-20 V2 swap
//    */
//   private async executeETHToERC20V2Swap(
//     quote: SwapQuote,
//     signer: ethers.Signer,
//     minOutput: string
//   ): Promise<ethers.ContractTransactionResponse> {
//     const { route, inputAmount } = quote;
//     const tokenOutAddress = route.path[route.path.length - 1];
    
//     // Get V2 Router contract
//     const routerContract = new ethers.Contract(
//       DRAGONSWAP_CONFIG.V2_ROUTER,
//       V2_ROUTER_ABI,
//       signer
//     );

//     const amountInWei = ethers.parseEther(inputAmount);
//     const minOutputWei = ethers.parseUnits(minOutput, this.getOutputTokenDecimals(tokenOutAddress));

//     return await routerContract.swapExactETHForTokens(
//       minOutputWei,
//       route.path,
//       await signer.getAddress(),
//       Math.floor(Date.now() / 1000) + 1200, // 20 minutes deadline
//       {
//         value: amountInWei
//       }
//     );
//   }

//   /**
//    * Execute standard ERC-20 -> ERC-20 swap
//    */
//   private async executeStandardSwap(
//     quote: SwapQuote,
//     signer: ethers.Signer,
//     minOutput: string
//   ): Promise<ethers.ContractTransactionResponse> {
//     const { route, inputAmount } = quote;
//     const tokenInAddress = route.path[0];
//     const tokenOutAddress = route.path[route.path.length - 1];
    
//     const routerContract = new ethers.Contract(
//       route.isV3 ? DRAGONSWAP_CONFIG.V3_SMART_ROUTER : DRAGONSWAP_CONFIG.V2_ROUTER,
//       route.isV3 ? V3_SMART_ROUTER_ABI : V2_ROUTER_ABI,
//       signer
//     );

//     const inputDecimals = this.getInputTokenDecimals(tokenInAddress);
//     const outputDecimals = this.getOutputTokenDecimals(tokenOutAddress);

//     const amountInWei = ethers.parseUnits(inputAmount, inputDecimals);
//     const minOutputWei = ethers.parseUnits(minOutput, outputDecimals);

//     if (route.isV3) {
//       if (route.path.length === 2) {
//         // V3 single hop
//         const params = {
//           tokenIn: tokenInAddress,
//           tokenOut: tokenOutAddress,
//           fee: route.fees![0],
//           recipient: await signer.getAddress(),
//           amountIn: amountInWei,
//           amountOutMinimum: minOutputWei,
//           sqrtPriceLimitX96: 0
//         };

//         return await routerContract.exactInputSingle(params);
//       } else {
//         // V3 multi-hop
//         const encodedPath = this.encodeV3Path(route.path, route.fees!);
        
//         const params = {
//           path: encodedPath,
//           recipient: await signer.getAddress(),
//           amountIn: amountInWei,
//           amountOutMinimum: minOutputWei
//         };

//         return await routerContract.exactInput(params);
//       }
//     } else {
//       // V2 swap
//       return await routerContract.swapExactTokensForTokens(
//         amountInWei,
//         minOutputWei,
//         route.path,
//         await signer.getAddress(),
//         Math.floor(Date.now() / 1000) + 1200 // 20 minutes deadline
//       );
//     }
//   }

//   /**
//    * Get input token decimals
//    */
//   private getInputTokenDecimals(tokenAddress: string): number {
//     const token = getTokenBySymbol('WKAIA'); // This should be enhanced to get token by address
//     return token?.decimals || 18;
//   }

//   /**
//    * Get output token decimals
//    */
//   private getOutputTokenDecimals(tokenAddress: string): number {
//     const token = getTokenBySymbol('USDT'); // This should be enhanced to get token by address
//     return token?.decimals || 18;
//   }

//   /**
//    * Encode V3 path for multi-hop swaps
//    */
//   private encodeV3Path(path: string[], fees: number[]): string {
//     if (path.length !== fees.length + 1) {
//       throw new Error('Path length must be fees length + 1');
//     }

//     const pathBytes: string[] = [];
//     for (let i = 0; i < path.length; i++) {
//       const address = ethers.getAddress(path[i]);
//       const addressBytes = address.slice(2); // Remove 0x
      
//       if (i < fees.length) {
//         const feeBytes = fees[i].toString(16).padStart(6, '0');
//         pathBytes.push(addressBytes + feeBytes);
//       } else {
//         pathBytes.push(addressBytes);
//       }
//     }

//     return '0x' + pathBytes.join('');
//   }
// }

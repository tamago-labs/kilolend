// import { useState, useCallback, useEffect } from 'react';
// import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
// import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
// import { ethers } from 'ethers';
// import { DragonSwapToken, getTokenBySymbol } from '@/utils/dragonSwapTokenAdapter';
// import { useAppStore } from '@/stores/appStore';

// // DragonSwap contract addresses on KAIA Mainnet (ChainId: 8217)
// // These are the verified addresses from the DragonSwap frontend codebase
// const DRAGONSWAP_CONFIG = {
//   // V2 Router for KAIA - DragonSwap V2 Router
//   V2_ROUTER: '0x8203cBc504CE43c3Cad07Be0e057f25B1d4DB578',
//   // V3 Smart Router for better rates - DragonSwap V3 Smart Router
//   V3_SMART_ROUTER: '0x5EA3e22C41B08DD7DC7217549939d987ED410354',
//   // Wrapped KAIA address (WETH9 in DragonSwap codebase)
//   WKAIA: '0x98a8345bb9d3dda9d808ca1c9142a28f6b0430e1',
//   // Quoter V2 for accurate V3 quotes - DragonSwap V3 Quoter
//   QUOTER_V2: '0x673d88960D320909af24db6eE7665aF223fec060',
//   // Mixed Route Quoter for complex routes
//   MIXED_ROUTE_QUOTER: '0xa36aAf0Ae4E2a91B0ebf0bFE938AD3F55f8D4Ee4',
// };

// // KAIA Mainnet RPC
// const KAIA_RPC_URL = 'https://public-en.node.kaia.io';

// // Common V3 fee tiers (in basis points)
// const V3_FEE_TIERS = [100, 500, 2500, 10000]; // 0.01%, 0.05%, 0.25%, 1%

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
//   // V3 exactInput for multi-hop swaps
//   'function exactInput(tuple(bytes path, address recipient, uint256 amountIn, uint256 amountOutMinimum) params) external payable returns (uint256 amountOut)',
//   // V3 exactInputSingle for single-hop swaps
//   'function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)',
//   // V2 compatibility
//   'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to) external payable returns (uint256 amountOut)',
// ];

// // Quoter V2 ABI
// const QUOTER_V2_ABI = [
//   'function quoteExactInputSingle(tuple(address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
//   'function quoteExactInput(bytes memory path, uint256 amountIn) external returns (uint256 amountOut, uint160[] memory sqrtPriceX96AfterList, uint32[] memory initializedTicksCrossedList, uint256 gasEstimate)',
// ];

// export interface SwapQuote {
//   inputAmount: string;
//   outputAmount: string;
//   route: {
//     path: string[];
//     pairs: string[];
//     fees?: number[]; // V3 fees
//     isV3?: boolean;
//   };
//   priceImpact: number;
//   gasEstimate: string;
// }

// export interface SwapParams {
//   tokenIn: DragonSwapToken;
//   tokenOut: DragonSwapToken;
//   amountIn: string;
//   slippagePercent: number;
//   recipient: string;
// }

// export interface SwapResult {
//   success: boolean;
//   transactionHash?: string;
//   error?: string;
// }

// export interface DragonSwapState {
//   quote: SwapQuote | null;
//   isLoading: boolean;
//   isSwapping: boolean;
//   error: string | null;
//   needsApproval: boolean;
//   isApproving: boolean;
// }

// export interface UseDragonSwapReturn {
//   state: DragonSwapState;
//   getQuote: (
//     tokenInSymbol: string,
//     tokenOutSymbol: string,
//     amountIn: string,
//     slippagePercent: number
//   ) => Promise<void>;
//   executeSwap: (
//     tokenInSymbol: string,
//     tokenOutSymbol: string,
//     amountIn: string,
//     slippagePercent: number
//   ) => Promise<SwapResult>;
//   approveToken: (tokenSymbol: string) => Promise<SwapResult>;
//   checkApproval: (tokenSymbol: string, amount: string) => Promise<boolean>;
//   resetState: () => void;
//   clearError: () => void;
// }

// class DragonSwapService {
//   private provider: ethers.JsonRpcProvider;
//   private v2RouterInterface: ethers.Interface;
//   private v3RouterInterface: ethers.Interface;
//   private quoterInterface: ethers.Interface;

//   constructor() {
//     this.provider = new ethers.JsonRpcProvider(KAIA_RPC_URL);
//     this.v2RouterInterface = new ethers.Interface(V2_ROUTER_ABI);
//     this.v3RouterInterface = new ethers.Interface(V3_SMART_ROUTER_ABI);
//     this.quoterInterface = new ethers.Interface(QUOTER_V2_ABI);
//   }

//   /**
//    * Get token balance
//    */
//   async getTokenBalance(token: DragonSwapToken, account: string): Promise<string> {
//     try {
//       let normalizedAccount: string;
//       try {
//         normalizedAccount = ethers.getAddress(account);
//       } catch (error) {
//         console.warn('Invalid account address, using as-is:', account);
//         normalizedAccount = account;
//       }

//       if (token.isNative) {
//         const balance = await this.provider.getBalance(normalizedAccount);
//         return ethers.formatEther(balance);
//       } else {
//         let normalizedTokenAddress: string;
//         try {
//           normalizedTokenAddress = ethers.getAddress(token.address);
//         } catch (error) {
//           console.warn(`Invalid token address for ${token.symbol}, using as-is:`, token.address);
//           normalizedTokenAddress = token.address;
//         }
        
//         const tokenContract = new ethers.Contract(
//           normalizedTokenAddress,
//           ERC20_ABI,
//           this.provider
//         );

//         try {
//           const balance = await tokenContract.balanceOf(normalizedAccount);
//           return ethers.formatUnits(balance, token.decimals);
//         } catch (error) {
//           console.warn(`Failed to get balance for ${token.symbol}:`, error);
//           return '0';
//         }
//       }
//     } catch (error) {
//       console.error('Error getting token balance:', error);
//       return '0';
//     }
//   }

//   /**
//    * Get token allowance
//    */
//   async getTokenAllowance(
//     token: DragonSwapToken,
//     owner: string,
//     spender: string
//   ): Promise<string> {
//     try {
//       if (token.isNative) {
//         return 'unlimited';
//       }

//       const normalizedOwner = ethers.getAddress(owner);
//       const normalizedSpender = ethers.getAddress(spender);
//       const normalizedTokenAddress = ethers.getAddress(token.address);

//       const tokenContract = new ethers.Contract(
//         normalizedTokenAddress,
//         ERC20_ABI,
//         this.provider
//       );

//       const allowance = await tokenContract.allowance(normalizedOwner, normalizedSpender);
//       return ethers.formatUnits(allowance, token.decimals);
//     } catch (error) {
//       console.error('Error getting token allowance:', error);
//       return '0';
//     }
//   }

//   /**
//    * Create approval transaction
//    */
//   createApprovalTransaction(
//     token: DragonSwapToken,
//     spender: string,
//     amount: string = 'unlimited'
//   ): { to: string; data: string; value: string } {
//     if (token.isNative) {
//       throw new Error('Native token does not need approval');
//     }

//     const tokenInterface = new ethers.Interface(ERC20_ABI);
//     const approvalAmount =
//       amount === 'unlimited'
//         ? ethers.MaxUint256
//         : ethers.parseUnits(amount, token.decimals);

//     const data = tokenInterface.encodeFunctionData('approve', [spender, approvalAmount]);

//     return {
//       to: ethers.getAddress(token.address),
//       data,
//       value: '0x0',
//     };
//   }

//   /**
//    * Create V2 swap path
//    */
//   private createV2Path(tokenIn: DragonSwapToken, tokenOut: DragonSwapToken): string[] {
//     const WKAIA = DRAGONSWAP_CONFIG.WKAIA;

//     if (tokenIn.isNative && tokenOut.isNative) {
//       throw new Error('Cannot swap native to native');
//     } else if (tokenIn.isNative) {
//       return [WKAIA, ethers.getAddress(tokenOut.address)];
//     } else if (tokenOut.isNative) {
//       return [ethers.getAddress(tokenIn.address), WKAIA];
//     } else {
//       return [
//         ethers.getAddress(tokenIn.address),
//         ethers.getAddress(tokenOut.address),
//       ];
//     }
//   }

//   /**
//    * Get V2 quote
//    */
//   async getV2Quote(
//     tokenIn: DragonSwapToken,
//     tokenOut: DragonSwapToken,
//     amountIn: string
//   ): Promise<{ outputAmount: string; path: string[] } | null> {
//     try {
//       const path = this.createV2Path(tokenIn, tokenOut);
//       const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);

//       const callData = this.v2RouterInterface.encodeFunctionData('getAmountsOut', [
//         amountInWei,
//         path,
//       ]);

//       const result = await this.provider.call({
//         to: DRAGONSWAP_CONFIG.V2_ROUTER,
//         data: callData,
//       });

//       const decoded = this.v2RouterInterface.decodeFunctionResult('getAmountsOut', result);
//       const amountsOut = decoded[0];

//       if (amountsOut.length < 2) {
//         return null;
//       }

//       const outputAmountWei = amountsOut[amountsOut.length - 1];
//       const outputAmount = ethers.formatUnits(outputAmountWei, tokenOut.decimals);

//       return { outputAmount, path };
//     } catch (error) {
//       console.warn('V2 quote failed:', error);
//       return null;
//     }
//   }

//   /**
//    * Get V3 quote for a specific fee tier using real quoter
//    */
//   async getV3QuoteSingleFee(
//     tokenIn: DragonSwapToken,
//     tokenOut: DragonSwapToken,
//     amountIn: string,
//     fee: number
//   ): Promise<{ outputAmount: string; gasEstimate: string } | null> {
//     try {
//       const tokenInAddress = tokenIn.isNative ? DRAGONSWAP_CONFIG.WKAIA : ethers.getAddress(tokenIn.address);
//       const tokenOutAddress = tokenOut.isNative ? DRAGONSWAP_CONFIG.WKAIA : ethers.getAddress(tokenOut.address);
//       const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);

//       console.log(`Trying V3 quote ${tokenIn.symbol}(${tokenInAddress}) -> ${tokenOut.symbol}(${tokenOutAddress}) fee: ${fee}`);

//       // Use the real Quoter V2 contract
//       const callData = this.quoterInterface.encodeFunctionData('quoteExactInputSingle', [
//         {
//           tokenIn: tokenInAddress,
//           tokenOut: tokenOutAddress,
//           amountIn: amountInWei,
//           fee,
//           sqrtPriceLimitX96: 0, // No price limit
//         },
//       ]);

//       const result = await this.provider.call({
//         to: DRAGONSWAP_CONFIG.QUOTER_V2,
//         data: callData,
//       });

//       const decoded = this.quoterInterface.decodeFunctionResult('quoteExactInputSingle', result);
//       const [outputAmountWei, , , gasEstimate] = decoded;

//       const outputAmount = ethers.formatUnits(outputAmountWei, tokenOut.decimals);

//       console.log(`V3 quote success: ${outputAmount} ${tokenOut.symbol}, gas: ${gasEstimate}`);

//       return {
//         outputAmount,
//         gasEstimate: gasEstimate.toString(),
//       };
//     } catch (error) {
//       console.warn(`V3 quote failed for fee ${fee}:`, error);
//       return null;
//     }
//   }

//   /**
//    * Get best quote across all fee tiers
//    */
//   async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
//     try {
//       const { tokenIn, tokenOut, amountIn, slippagePercent } = params;

//       console.log(`Getting quotes for ${amountIn} ${tokenIn.symbol} -> ${tokenOut.symbol}`);

//       // Try all V3 fee tiers
//       const v3Quotes = await Promise.all(
//         V3_FEE_TIERS.map(async (fee) => {
//           const result = await this.getV3QuoteSingleFee(tokenIn, tokenOut, amountIn, fee);
//           return result ? { ...result, fee, isV3: true } : null;
//         })
//       );

//       // Get V2 quote
//       const v2Quote = await this.getV2Quote(tokenIn, tokenOut, amountIn);

//       // Find best quote (highest output)
//       const allQuotes = [
//         ...v3Quotes.filter(q => q !== null) as { outputAmount: string; fee: number; isV3: boolean; gasEstimate: string }[],
//         v2Quote ? { outputAmount: v2Quote.outputAmount, fee: 0, isV3: false, gasEstimate: '250000' } : null,
//       ].filter(q => q !== null) as { outputAmount: string; fee: number; isV3: boolean; gasEstimate: string }[];

//       if (allQuotes.length === 0) {
//         throw new Error('No valid routes found');
//       }

//       // Pick best quote (highest output)
//       const bestQuote = allQuotes.reduce((best, current) => 
//         parseFloat(current.outputAmount) > parseFloat(best.outputAmount) ? current : best
//       );

//       console.log(`Best quote: ${bestQuote.outputAmount} ${tokenOut.symbol} (${bestQuote.isV3 ? `V3 fee: ${bestQuote.fee/10000}%` : 'V2'})`);

//       const tokenInAddress = tokenIn.isNative ? DRAGONSWAP_CONFIG.WKAIA : ethers.getAddress(tokenIn.address);
//       const tokenOutAddress = tokenOut.isNative ? DRAGONSWAP_CONFIG.WKAIA : ethers.getAddress(tokenOut.address);

//       return {
//         inputAmount: amountIn,
//         outputAmount: bestQuote.outputAmount,
//         route: {
//           path: [tokenInAddress, tokenOutAddress],
//           pairs: [`${tokenInAddress}/${tokenOutAddress}`],
//           fees: bestQuote.isV3 ? [bestQuote.fee] : undefined,
//           isV3: bestQuote.isV3,
//         },
//         priceImpact: this.calculatePriceImpact(amountIn),
//         gasEstimate: bestQuote.gasEstimate,
//       };
//     } catch (error) {
//       console.error('Error getting swap quote:', error);
//       throw new Error(
//         `Failed to get swap quote: ${error instanceof Error ? error.message : 'Unknown error'}`
//       );
//     }
//   }

//   /**
//    * Create swap transaction (V2 or V3)
//    */
//   createSwapTransaction(
//     quote: SwapQuote,
//     params: SwapParams
//   ): { to: string; data: string; value: string; gasLimit: string } {
//     try {
//       const { tokenIn, tokenOut, amountIn, slippagePercent, recipient } = params;

//       const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);
//       const amountOutWei = ethers.parseUnits(quote.outputAmount, tokenOut.decimals);

//       // Calculate minimum output with slippage (more conservative)
//       const slippageMultiplier = (100 - slippagePercent) / 100;
//       const minAmountOutWei =
//         (amountOutWei * BigInt(Math.floor(slippageMultiplier * 10000))) / BigInt(10000);

//       const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes

//       let data: string;
//       let value: string;
//       let to: string;
//       let gasEstimate: number;

//       if (quote.route.isV3 && quote.route.fees) {
//         // V3 Swap
//         console.log('Creating V3 swap transaction');
//         to = DRAGONSWAP_CONFIG.V3_SMART_ROUTER;

//         const tokenInAddress = tokenIn.isNative ? DRAGONSWAP_CONFIG.WKAIA : ethers.getAddress(tokenIn.address);
//         const tokenOutAddress = tokenOut.isNative ? DRAGONSWAP_CONFIG.WKAIA : ethers.getAddress(tokenOut.address);

//         if (quote.route.fees.length === 1) {
//           // Single hop V3 swap
//           const fee = quote.route.fees[0];
          
//           data = this.v3RouterInterface.encodeFunctionData('exactInputSingle', [
//             {
//               tokenIn: tokenInAddress,
//               tokenOut: tokenOutAddress,
//               fee,
//               recipient: ethers.getAddress(recipient),
//               amountIn: amountInWei.toString(),
//               amountOutMinimum: minAmountOutWei.toString(),
//               sqrtPriceLimitX96: 0, // No price limit
//             },
//           ]);
//         } else {
//           // Multi-hop V3 swap (not implemented in this simplified version)
//           throw new Error('Multi-hop V3 swaps not supported in this implementation');
//         }

//         value = tokenIn.isNative ? amountInWei.toString() : '0x0';
//         gasEstimate = parseInt(quote.gasEstimate) + 50000; // Add 50k buffer for V3
//       } else {
//         // V2 Swap - Use proper V2 router methods for native tokens
//         console.log('Creating V2 swap transaction');
//         to = DRAGONSWAP_CONFIG.V2_ROUTER; // Use V2 router for V2 swaps

//         if (tokenIn.isNative && !tokenOut.isNative) {
//           // Native to ERC20 - use swapExactETHForTokens
//           data = this.v2RouterInterface.encodeFunctionData('swapExactETHForTokens', [
//             minAmountOutWei.toString(),
//             quote.route.path,
//             ethers.getAddress(recipient),
//             deadline,
//           ]);
//           value = amountInWei.toString();
//         } else if (!tokenIn.isNative && tokenOut.isNative) {
//           // ERC20 to Native - use swapExactTokensForETH
//           data = this.v2RouterInterface.encodeFunctionData('swapExactTokensForETH', [
//             amountInWei.toString(),
//             minAmountOutWei.toString(),
//             quote.route.path,
//             ethers.getAddress(recipient),
//             deadline,
//           ]);
//           value = '0x0';
//         } else {
//           // ERC20 to ERC20 - use swapExactTokensForTokens
//           data = this.v2RouterInterface.encodeFunctionData('swapExactTokensForTokens', [
//             amountInWei.toString(),
//             minAmountOutWei.toString(),
//             quote.route.path,
//             ethers.getAddress(recipient),
//             deadline,
//           ]);
//           value = '0x0';
//         }

//         gasEstimate = 200000; // Base gas for V2 swaps
//       }

//       // Add additional gas buffer for safety 
//       const finalGasLimit = Math.max(gasEstimate, 300000) + 100000; // Minimum 400k gas

//       console.log(`Final gas limit: ${finalGasLimit}, value: ${value}`);

//       return {
//         to,
//         data,
//         value,
//         gasLimit: `0x${finalGasLimit.toString(16)}`,
//       };
//     } catch (error) {
//       console.error('Error creating swap transaction:', error);
//       throw new Error('Failed to create swap transaction');
//     }
//   }

//   /**
//    * Calculate price impact
//    */
//   calculatePriceImpact(amountIn: string): number {
//     const amount = parseFloat(amountIn);
//     if (amount > 10000) return 2.5;
//     if (amount > 1000) return 1.0;
//     if (amount > 100) return 0.5;
//     return 0.1;
//   }

//   /**
//    * Get recommended slippage based on token pair and amount
//    */
//   getRecommendedSlippage(tokenIn: DragonSwapToken, tokenOut: DragonSwapToken, amountIn: string): number {
//     const amount = parseFloat(amountIn);
    
//     // Higher slippage for larger amounts or exotic tokens
//     if (amount > 1000) return 2.0;
//     if (amount > 100) return 1.5;
    
//     // Check if tokens are stablecoins
//     const stablecoins = ['USDC', 'USDT', 'DAI'];
//     const isStablePair = stablecoins.includes(tokenIn.symbol) && stablecoins.includes(tokenOut.symbol);
    
//     if (isStablePair) return 1.0; // Default 1% slippage even for stablecoins
//     return 1.0; // Default 1% slippage for all pairs
//   }
// }

// // Singleton instance
// const dragonSwapService = new DragonSwapService();

// // Export the service instance for use in other hooks
// export { dragonSwapService };

// export const useDragonSwap = (): UseDragonSwapReturn => {
//   const { account } = useWalletAccountStore();
//   const { sendTransaction } = useKaiaWalletSdk();
//   const { gasLimit } = useAppStore();

//   const [state, setState] = useState<DragonSwapState>({
//     quote: null,
//     isLoading: false,
//     isSwapping: false,
//     error: null,
//     needsApproval: false,
//     isApproving: false,
//   });

//   const updateState = useCallback((updates: Partial<DragonSwapState>) => {
//     setState((prev) => ({ ...prev, ...updates }));
//   }, []);

//   const resetState = useCallback(() => {
//     setState({
//       quote: null,
//       isLoading: false,
//       isSwapping: false,
//       error: null,
//       needsApproval: false,
//       isApproving: false,
//     });
//   }, []);

//   const clearError = useCallback(() => {
//     updateState({ error: null });
//   }, [updateState]);

//   /**
//    * Check if token approval is needed
//    */
//   const checkApprovalNeeded = useCallback(
//     async (token: DragonSwapToken, owner: string, amount: string): Promise<boolean> => {
//       try {
//         if (token.isNative) {
//           return false;
//         }

//         const allowance = await dragonSwapService.getTokenAllowance(
//           token,
//           owner,
//           DRAGONSWAP_CONFIG.V3_SMART_ROUTER
//         );

//         const allowanceAmount = parseFloat(allowance);
//         const requiredAmount = parseFloat(amount);

//         return allowanceAmount < requiredAmount;
//       } catch (error) {
//         console.error('Error checking approval:', error);
//         return true;
//       }
//     },
//     []
//   );

//   /**
//    * Get swap quote (tries V3 first, falls back to V2)
//    */
//   const getQuote = useCallback(
//     async (
//       tokenInSymbol: string,
//       tokenOutSymbol: string,
//       amountIn: string,
//       slippagePercent: number
//     ) => {
//       if (!account) {
//         updateState({ error: 'Wallet not connected', isLoading: false });
//         return;
//       }

//       if (!amountIn || parseFloat(amountIn) <= 0) {
//         updateState({ error: 'Invalid amount', isLoading: false });
//         return;
//       }

//       if (tokenInSymbol === tokenOutSymbol) {
//         updateState({ error: 'Cannot swap same token', isLoading: false });
//         return;
//       }

//       updateState({ isLoading: true, error: null });

//       try {
//         const tokenIn = getTokenBySymbol(tokenInSymbol);
//         const tokenOut = getTokenBySymbol(tokenOutSymbol);

//         if (!tokenIn || !tokenOut) {
//           throw new Error('Token not found');
//         }

//         const swapParams: SwapParams = {
//           tokenIn,
//           tokenOut,
//           amountIn,
//           slippagePercent,
//           recipient: account,
//         };

//         // Get best quote (automatically tries V3 and V2)
//         const quote = await dragonSwapService.getSwapQuote(swapParams);

//         // Check if approval is needed
//         const needsApproval = await checkApprovalNeeded(tokenIn, account, amountIn);

//         updateState({
//           quote,
//           isLoading: false,
//           needsApproval,
//           error: null,
//         });
//       } catch (error) {
//         console.error('Error getting quote:', error);
//         updateState({
//           error: error instanceof Error ? error.message : 'Failed to get quote',
//           isLoading: false,
//           quote: null,
//         });
//       }
//     },
//     [account, updateState, checkApprovalNeeded]
//   );

//   /**
//    * Check token approval status
//    */
//   const checkApproval = useCallback(
//     async (tokenSymbol: string, amount: string): Promise<boolean> => {
//       if (!account) return false;

//       const token = getTokenBySymbol(tokenSymbol);
//       if (!token) return false;

//       return !(await checkApprovalNeeded(token, account, amount));
//     },
//     [account, checkApprovalNeeded]
//   );

//   /**
//    * Approve token for V3 Smart Router
//    */
//   const approveToken = useCallback(
//     async (tokenSymbol: string): Promise<SwapResult> => {
//       if (!account) {
//         return { success: false, error: 'Wallet not connected' };
//       }

//       const token = getTokenBySymbol(tokenSymbol);
//       if (!token) {
//         return { success: false, error: 'Token not found' };
//       }

//       if (token.isNative) {
//         return { success: true };
//       }

//       updateState({ isApproving: true, error: null });

//       try {
//         const approvalTx = dragonSwapService.createApprovalTransaction(
//           token,
//           DRAGONSWAP_CONFIG.V3_SMART_ROUTER
//         );

//         // Format for LINE SDK
//         const transaction = {
//           from: account,
//           to: approvalTx.to,
//           value: approvalTx.value,
//           gas: `0x${Math.min(gasLimit, 200000).toString(16)}`,
//           data: approvalTx.data,
//         };

//         await sendTransaction([transaction]);

//         updateState({ isApproving: false, needsApproval: false });

//         return { success: true };
//       } catch (error) {
//         console.error('Error approving token:', error);
//         const errorMessage = error instanceof Error ? error.message : 'Approval failed';

//         updateState({
//           isApproving: false,
//           error: errorMessage,
//         });

//         return { success: false, error: errorMessage };
//       }
//     },
//     [account, sendTransaction, gasLimit, updateState]
//   );

//   /**
//    * Execute swap (V3 or V2 depending on quote)
//    */
//   const executeSwap = useCallback(
//     async (
//       tokenInSymbol: string,
//       tokenOutSymbol: string,
//       amountIn: string,
//       slippagePercent: number
//     ): Promise<SwapResult> => {
//       if (!account) {
//         return { success: false, error: 'Wallet not connected' };
//       }

//       if (!state.quote) {
//         return { success: false, error: 'No quote available' };
//       }

//       updateState({ isSwapping: true, error: null });

//       try {
//         const tokenIn = getTokenBySymbol(tokenInSymbol);
//         const tokenOut = getTokenBySymbol(tokenOutSymbol);

//         if (!tokenIn || !tokenOut) {
//           throw new Error('Token not found');
//         }

//         const swapParams: SwapParams = {
//           tokenIn,
//           tokenOut,
//           amountIn,
//           slippagePercent,
//           recipient: account,
//         };

//         // Create swap transaction (V3 or V2 based on quote)
//         const swapTx = dragonSwapService.createSwapTransaction(state.quote, swapParams);

//         console.log(`Executing ${state.quote.route.isV3 ? 'V3' : 'V2'} swap transaction`);

//         // Format for LINE SDK
//         const transaction = {
//           from: account,
//           to: swapTx.to,
//           value: swapTx.value,
//           gas: swapTx.gasLimit,
//           data: swapTx.data,
//         };

//         // Execute via LINE SDK
//         await sendTransaction([transaction]);

//         updateState({ isSwapping: false });

//         return { success: true };
//       } catch (error) {
//         console.error('Error executing swap:', error);
//         const errorMessage = error instanceof Error ? error.message : 'Swap failed';

//         updateState({
//           isSwapping: false,
//           error: errorMessage,
//         });

//         return { success: false, error: errorMessage };
//       }
//     },
//     [account, state.quote, sendTransaction, updateState]
//   );

//   return {
//     state,
//     getQuote,
//     executeSwap,
//     approveToken,
//     checkApproval,
//     resetState,
//     clearError,
//   };
// };

// /**
//  * Hook for getting token balances
//  */
// export const useDragonSwapBalances = (tokens: DragonSwapToken[]) => {
//   const { account } = useWalletAccountStore();
//   const [balances, setBalances] = useState<Record<string, string>>({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchBalances = useCallback(async () => {
//     if (!account || tokens.length === 0) {
//       setBalances({});
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       const balancePromises = tokens.map(async (token) => {
//         try {
//           const balance = await dragonSwapService.getTokenBalance(token, account);
//           return [token.symbol, balance] as [string, string];
//         } catch (err) {
//           console.warn(`Failed to fetch balance for ${token.symbol}:`, err);
//           return [token.symbol, '0'] as [string, string];
//         }
//       });

//       const results = await Promise.all(balancePromises);
//       const balanceMap = Object.fromEntries(results);

//       setBalances(balanceMap);
//     } catch (err) {
//       console.error('Error fetching balances:', err);
//       setError(err instanceof Error ? err.message : 'Failed to fetch balances');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [account, tokens]);

//   useEffect(() => {
//     fetchBalances();
//   }, []);

//   return { balances, isLoading, error, refetch: fetchBalances };
// };

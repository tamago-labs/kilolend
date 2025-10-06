import { ethers } from 'ethers';
import { DragonSwapToken, getTokenBySymbol } from '@/utils/dragonSwapTokenAdapter';

// DragonSwap contract addresses on KAIA Mainnet - CORRECT ADDRESSES FROM DRAGONSWAP FRONTEND
const DRAGONSWAP_CONFIG = {
  // V2 Router for KAIA (ChainId: 8217)
  V2_ROUTER: '0x8203cBc504CE43c3Cad07Be0e057f25B1d4DB578',
  // Wrapped KAIA address
  WKAIA: '0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432',
  // Factory
  FACTORY: '0x224302153096E3ba16c4423d9Ba102D365a94B2B',
};

// KAIA Mainnet RPC
const KAIA_RPC_URL = 'https://public-en.node.kaia.io';

// ERC-20 ABI for token operations
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

// DragonSwap Router ABI (simplified)
const DRAGONSWAP_ROUTER_ABI = [
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)',
  'function WETH() external pure returns (address)'
];

export interface SwapQuote {
  inputAmount: string;
  outputAmount: string;
  route: {
    path: string[];
    pairs: string[];
  };
  priceImpact: number;
  gasEstimate: string;
}

export interface SwapParams {
  tokenIn: DragonSwapToken;
  tokenOut: DragonSwapToken;
  amountIn: string;
  slippagePercent: number;
  recipient: string;
}

export interface SwapResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export class DragonSwapService {
  private provider: ethers.JsonRpcProvider;
  private routerInterface: ethers.Interface;
  private routerAddress: string;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(KAIA_RPC_URL);
    this.routerInterface = new ethers.Interface(DRAGONSWAP_ROUTER_ABI);
    this.routerAddress = DRAGONSWAP_CONFIG.V2_ROUTER;
  }

  /**
   * Get token balance for an account
   */
  async getTokenBalance(token: DragonSwapToken, account: string): Promise<string> {
    try {
      const normalizedAccount = ethers.getAddress(account);

      if (token.isNative) {
        const balance = await this.provider.getBalance(normalizedAccount);
        return ethers.formatEther(balance);
      } else {
        const normalizedTokenAddress = ethers.getAddress(token.address);
        const tokenContract = new ethers.Contract(
          normalizedTokenAddress,
          ERC20_ABI,
          this.provider
        );

        try {
          const balance = await tokenContract.balanceOf(normalizedAccount);
          return ethers.formatUnits(balance, token.decimals);
        } catch (error) {
          console.warn(`Failed to get balance for ${token.symbol}:`, error);
          return '0';
        }
      }
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  /**
   * Get token allowance for spender
   */
  async getTokenAllowance(
    token: DragonSwapToken,
    owner: string,
    spender: string
  ): Promise<string> {
    try {
      if (token.isNative) {
        return 'unlimited';
      }

      const normalizedOwner = ethers.getAddress(owner);
      const normalizedSpender = ethers.getAddress(spender);
      const normalizedTokenAddress = ethers.getAddress(token.address);

      const tokenContract = new ethers.Contract(
        normalizedTokenAddress,
        ERC20_ABI,
        this.provider
      );

      const allowance = await tokenContract.allowance(normalizedOwner, normalizedSpender);
      return ethers.formatUnits(allowance, token.decimals);
    } catch (error) {
      console.error('Error getting token allowance:', error);
      return '0';
    }
  }

  /**
   * Create approval transaction
   */
  createApprovalTransaction(
    token: DragonSwapToken,
    spender: string,
    amount: string = 'unlimited'
  ): { to: string; data: string; value: string } {
    if (token.isNative) {
      throw new Error('Native token does not need approval');
    }

    const tokenInterface = new ethers.Interface(ERC20_ABI);
    const approvalAmount =
      amount === 'unlimited'
        ? ethers.MaxUint256
        : ethers.parseUnits(amount, token.decimals);

    const data = tokenInterface.encodeFunctionData('approve', [spender, approvalAmount]);

    return {
      to: ethers.getAddress(token.address),
      data,
      value: '0x0',
    };
  }

  /**
   * Create swap path (handles native KAIA)
   */
  private createSwapPath(tokenIn: DragonSwapToken, tokenOut: DragonSwapToken): string[] {
    const WKAIA = DRAGONSWAP_CONFIG.WKAIA;

    if (tokenIn.isNative && tokenOut.isNative) {
      throw new Error('Cannot swap native to native');
    } else if (tokenIn.isNative) {
      return [WKAIA, ethers.getAddress(tokenOut.address)];
    } else if (tokenOut.isNative) {
      return [ethers.getAddress(tokenIn.address), WKAIA];
    } else {
      return [
        ethers.getAddress(tokenIn.address),
        ethers.getAddress(tokenOut.address),
      ];
    }
  }

  /**
   * Get swap quote using eth_call directly
   */
  async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
    try {
      const { tokenIn, tokenOut, amountIn, slippagePercent } = params;

      // Create path
      const path = this.createSwapPath(tokenIn, tokenOut);
      console.log('Swap path:', path);

      // Convert amount to wei
      const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);

      // Encode the getAmountsOut call
      const callData = this.routerInterface.encodeFunctionData('getAmountsOut', [
        amountInWei,
        path
      ]);

      console.log('Router address:', this.routerAddress);
      console.log('Call data:', callData);

      // Make the call using eth_call directly
      const result = await this.provider.call({
        to: this.routerAddress,
        data: callData
      });

      // Decode the result
      const decoded = this.routerInterface.decodeFunctionResult('getAmountsOut', result);
      const amountsOut = decoded[0];

      if (amountsOut.length < 2) {
        throw new Error('Invalid route');
      }

      // Get output amount
      const outputAmountWei = amountsOut[amountsOut.length - 1];
      const outputAmount = ethers.formatUnits(outputAmountWei, tokenOut.decimals);

      console.log('Quote successful:', outputAmount, tokenOut.symbol);

      // Calculate price impact (simplified)
      const priceImpact = this.calculatePriceImpact(amountIn);

      // Estimate gas
      const gasEstimate = tokenIn.isNative ? '250000' : '300000';

      return {
        inputAmount: amountIn,
        outputAmount,
        route: {
          path,
          pairs: this.getPathPairs(path),
        },
        priceImpact,
        gasEstimate,
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw new Error(
        `Failed to get swap quote: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create swap transaction
   */
  createSwapTransaction(
    quote: SwapQuote,
    params: SwapParams
  ): { to: string; data: string; value: string; gasLimit: string } {
    try {
      const { tokenIn, tokenOut, amountIn, slippagePercent, recipient } = params;

      const path = quote.route.path;
      const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);
      const amountOutWei = ethers.parseUnits(quote.outputAmount, tokenOut.decimals);

      // Calculate minimum output with slippage
      const slippageMultiplier = (100 - slippagePercent) / 100;
      const minAmountOutWei =
        (amountOutWei * BigInt(Math.floor(slippageMultiplier * 10000))) / BigInt(10000);

      // Deadline: 20 minutes from now
      const deadline = Math.floor(Date.now() / 1000) + 1200;

      let data: string;
      let value: string;

      if (tokenIn.isNative) {
        // Native KAIA to token
        data = this.routerInterface.encodeFunctionData('swapExactETHForTokens', [
          minAmountOutWei.toString(),
          path,
          recipient,
          deadline,
        ]);
        value = amountInWei.toString();
      } else if (tokenOut.isNative) {
        // Token to native KAIA
        data = this.routerInterface.encodeFunctionData('swapExactTokensForETH', [
          amountInWei.toString(),
          minAmountOutWei.toString(),
          path,
          recipient,
          deadline,
        ]);
        value = '0x0';
      } else {
        // Token to token
        data = this.routerInterface.encodeFunctionData('swapExactTokensForTokens', [
          amountInWei.toString(),
          minAmountOutWei.toString(),
          path,
          recipient,
          deadline,
        ]);
        value = '0x0';
      }

      return {
        to: this.routerAddress,
        data,
        value,
        gasLimit: tokenIn.isNative ? '0x3D090' : '0x493E0',
      };
    } catch (error) {
      console.error('Error creating swap transaction:', error);
      throw new Error('Failed to create swap transaction');
    }
  }

  /**
   * Execute swap
   */
  async executeSwap(
    transaction: { to: string; data: string; value: string; gasLimit: string },
    sendTransaction: (transactions: any[]) => Promise<void>
  ): Promise<SwapResult> {
    try {
      const formattedTx = {
        to: transaction.to,
        data: transaction.data,
        value: transaction.value,
        gas: transaction.gasLimit,
      };

      await sendTransaction([formattedTx]);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error executing swap:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Swap execution failed',
      };
    }
  }

  /**
   * Calculate price impact (simplified)
   */
  private calculatePriceImpact(amountIn: string): number {
    const amount = parseFloat(amountIn);
    if (amount > 10000) return 2.5;
    if (amount > 1000) return 1.0;
    if (amount > 100) return 0.5;
    return 0.1;
  }

  /**
   * Get pairs in path
   */
  private getPathPairs(path: string[]): string[] {
    const pairs: string[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      pairs.push(`${path[i]}/${path[i + 1]}`);
    }
    return pairs;
  }
}

// Singleton instance
export const dragonSwapService = new DragonSwapService();

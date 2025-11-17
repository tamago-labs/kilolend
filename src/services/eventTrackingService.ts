import { ethers } from 'ethers';
import { MARKET_CONFIG_V1, MarketId } from '@/utils/contractConfig';

// CToken ABI - events we need to listen to
const CTOKEN_ABI = [
  "event Mint(address minter, uint256 mintAmount, uint256 mintTokens)",
  "event Redeem(address redeemer, uint256 redeemAmount, uint256 redeemTokens)",
  "event Borrow(address borrower, uint borrowAmount, uint accountBorrows, uint totalBorrows, uint borrowRateDiscountBps, uint actualBorrowRate)",
  "event RepayBorrow(address payer, address borrower, uint repayAmount, uint accountBorrows, uint totalBorrows, uint borrowRateDiscountBps, uint actualBorrowRate)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function underlying() view returns (address)"
];



export interface TrackedEvent {
  type: 'mint' | 'redeem' | 'borrow' | 'repay';
  user: string;
  amount: string;
  tokenAmount: string;
  transactionHash: string;
  blockNumber: number;
  marketId: MarketId;
  timestamp: number;
}

export interface EventTrackingOptions {
  userAddress: string;
  marketId: MarketId;
  eventType: 'mint' | 'borrow';
  timeoutMs?: number;
  onEventFound?: (event: TrackedEvent) => void;
  onTimeout?: () => void;
  onError?: (error: Error) => void;
}

class EventTrackingService {
  private provider: ethers.JsonRpcProvider | null = null;
  private pollIntervals: Map<string, NodeJS.Timeout> = new Map();
  private scanWindowSeconds = 60; // Same as kilo-point-bot
  private maxBlocksPerScan = 100; // Same as kilo-point-bot

  constructor() {
    this.init();
  }

  private async init() {
    try {
      // Use the same RPC URL as the app
      this.provider = new ethers.JsonRpcProvider('https://public-en.node.kaia.io');
      
      const network = await this.provider.getNetwork();
      console.log(`EventTrackingService connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    } catch (error) {
      console.error('Failed to initialize EventTrackingService:', error);
    }
  }

  /**
   * Start tracking for a specific event
   */
  public startTracking(options: EventTrackingOptions): string {
    const trackingId = `${options.userAddress}-${options.marketId}-${options.eventType}-${Date.now()}`;
    
    console.log(`Starting event tracking for ${trackingId}:`, {
      user: options.userAddress,
      market: options.marketId,
      eventType: options.eventType
    });

    // Start polling immediately
    this.pollForEvent(trackingId, options);

    // Set up interval polling
    const interval = setInterval(() => {
      this.pollForEvent(trackingId, options);
    }, 5000); // Poll every 5 seconds

    this.pollIntervals.set(trackingId, interval);

    // Set timeout
    const timeoutMs = options.timeoutMs || 120000; // 2 minutes default
    setTimeout(() => {
      this.stopTracking(trackingId);
      if (options.onTimeout) {
        options.onTimeout();
      }
    }, timeoutMs);

    return trackingId;
  }

  /**
   * Stop tracking for a specific event
   */
  public stopTracking(trackingId: string): void {
    const interval = this.pollIntervals.get(trackingId);
    if (interval) {
      clearInterval(interval);
      this.pollIntervals.delete(trackingId);
      console.log(`Stopped event tracking for ${trackingId}`);
    }
  }

  /**
   * Poll for events in the recent blocks
   */
  private async pollForEvent(trackingId: string, options: EventTrackingOptions): Promise<void> {
    if (!this.provider) {
      if (options.onError) {
        options.onError(new Error('Provider not initialized'));
      }
      return;
    }

    try {
      const currentBlock = await this.provider.getBlockNumber();
      const blocksToScan = Math.min(this.scanWindowSeconds, this.maxBlocksPerScan);
      const fromBlock = Math.max(currentBlock - blocksToScan, 0);
      const toBlock = currentBlock;

      if (toBlock <= fromBlock) {
        return;
      }

      const marketConfig = MARKET_CONFIG_V1[options.marketId];
      if (!marketConfig.marketAddress) {
        throw new Error(`Market ${options.marketId} not available`);
      }

      const contract = new ethers.Contract(marketConfig.marketAddress, CTOKEN_ABI, this.provider);

      let events: any[] = [];

      // Get events based on type
      if (options.eventType === 'mint') {
        events = await contract.queryFilter(contract.filters.Mint(), fromBlock, toBlock);
      } else if (options.eventType === 'borrow') {
        events = await contract.queryFilter(contract.filters.Borrow(), fromBlock, toBlock);
      }

      // Filter events by user address
      const userEvents = events.filter(event => {
        const user = options.eventType === 'mint' ? event.args[0] : event.args[0]; // minter or borrower
        return user.toLowerCase() === options.userAddress.toLowerCase();
      });

      if (userEvents.length > 0) {
        // Get the most recent event
        const latestEvent = userEvents[userEvents.length - 1];
        
        const trackedEvent = await this.createTrackedEvent(latestEvent, options);
        
        console.log(`Found matching event for ${trackingId}:`, trackedEvent);
        
        // Stop tracking
        this.stopTracking(trackingId);
        
        // Call callback
        if (options.onEventFound) {
          options.onEventFound(trackedEvent);
        }
      }

    } catch (error) {
      console.error(`Error polling for events (${trackingId}):`, error);
      if (options.onError) {
        options.onError(error as Error);
      }
    }
  }

  /**
   * Create a tracked event object from a blockchain event
   */
  private async createTrackedEvent(event: any, options: EventTrackingOptions): Promise<TrackedEvent> {
    const marketConfig = MARKET_CONFIG_V1[options.marketId];
    
    let amount: string;
    let tokenAmount: string;

    if (options.eventType === 'mint') {
      // Mint event: (address minter, uint256 mintAmount, uint256 mintTokens)
      amount = ethers.formatUnits(event.args[1], marketConfig.decimals); // mintAmount
      tokenAmount = ethers.formatUnits(event.args[2], 8); // mintTokens (cTokens have 8 decimals)
    } else if (options.eventType === 'borrow') {
      // Borrow event: (address borrower, uint borrowAmount, uint accountBorrows, uint totalBorrows, uint borrowRateDiscountBps, uint actualBorrowRate)
      amount = ethers.formatUnits(event.args[1], marketConfig.decimals); // borrowAmount
      tokenAmount = '0'; // No token minting in borrow
    } else {
      throw new Error(`Unsupported event type: ${options.eventType}`);
    }

    return {
      type: options.eventType,
      user: options.eventType === 'mint' ? event.args[0] : event.args[0],
      amount,
      tokenAmount,
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      marketId: options.marketId,
      timestamp: Date.now()
    };
  }

  /**
   * Clean up all tracking intervals
   */
  public cleanup(): void {
    for (const [trackingId, interval] of this.pollIntervals) {
      clearInterval(interval);
    }
    this.pollIntervals.clear();
    console.log('EventTrackingService cleaned up');
  }
}

// Singleton instance
export const eventTrackingService = new EventTrackingService();

const { ethers } = require('ethers');
const { getChainConfig, getChainContracts, getAllChainIds } = require('../config/chains');

/**
 * ChainManager - Manages blockchain connections and providers for all chains
 * 
 * Responsibilities:
 * - Initialize providers for all enabled chains
 * - Manage wallet connections per chain
 * - Cache block numbers and prices
 * - Handle retry logic for RPC failures
 * - Provide chain-specific utilities
 */
class ChainManager {
  constructor(config = {}) {
    this.enabledChains = config.enabledChains || getAllChainIds();
    this.providers = {};
    this.wallets = {};
    this.blockCache = {};
    this.priceCache = {};
    this.lastUpdateTime = {};
    this.isInitialized = false;
    this.initPromise = null;
  }

  async init() {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }
    
    this.initPromise = (async () => {
      try {
        console.log('🔧 Initializing ChainManager...');
        
        for (const chainId of this.enabledChains) {
          await this.initializeChain(chainId);
        }
        
        this.isInitialized = true;
        console.log(`✅ ChainManager initialized for ${this.enabledChains.length} chains`);
        
      } catch (error) {
        console.error('❌ Failed to initialize ChainManager:', error.message);
        throw error;
      }
    })();
    
    return this.initPromise;
  }

  /**
   * Initialize a single chain
   */
  async initializeChain(chainId) {
    try {
      const chainConfig = getChainConfig(chainId);
      
      console.log(`📡 Connecting to ${chainConfig.chainName} (Chain ID: ${chainConfig.chainId})...`);
      
      // Create provider
      const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
      
      // Test connection
      const network = await provider.getNetwork();
      
      console.log(`   ✅ Connected: ${network.name} (Chain ID: ${network.chainId})`);
      
      this.providers[chainId] = provider;
      this.blockCache[chainId] = await provider.getBlockNumber();
      this.lastUpdateTime[chainId] = new Date();
      
      // Initialize price cache for this chain
      this.priceCache[chainId] = {};
      
    } catch (error) {
      console.error(`❌ Failed to initialize chain ${chainId}:`, error.message);
      throw error;
    }
  }

  /**
   * Add a wallet for a specific chain (used by oracle and liquidator modules)
   */
  addWallet(chainId, privateKey) {
    try {
      if (!this.providers[chainId]) {
        throw new Error(`Provider not initialized for chain ${chainId}`);
      }
      
      const wallet = new ethers.Wallet(privateKey, this.providers[chainId]);
      this.wallets[chainId] = wallet;
      
      console.log(`💼 Wallet added for ${chainId}: ${wallet.address}`);
      return wallet;
      
    } catch (error) {
      console.error(`❌ Failed to add wallet for chain ${chainId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get provider for a chain
   */
  getProvider(chainId) {
    const provider = this.providers[chainId];
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }
    return provider;
  }

  /**
   * Get wallet for a chain (if configured)
   */
  getWallet(chainId) {
    const wallet = this.wallets[chainId];
    if (!wallet) {
      throw new Error(`Wallet not configured for chain ${chainId}`);
    }
    return wallet;
  }

  /**
   * Check if wallet exists for a chain
   */
  hasWallet(chainId) {
    return !!this.wallets[chainId];
  }

  /**
   * Get latest block number for a chain
   * Uses cache with TTL of 1 second
   */
  async getBlockNumber(chainId) {
    try {
      const provider = this.getProvider(chainId);
      const blockNumber = await provider.getBlockNumber();
      
      this.blockCache[chainId] = blockNumber;
      this.lastUpdateTime[chainId] = new Date();
      
      return blockNumber;
      
    } catch (error) {
      console.error(`❌ Failed to get block number for ${chainId}:`, error.message);
      // Return cached value if available
      return this.blockCache[chainId] || 0;
    }
  }

  /**
   * Get cached block number
   */
  getCachedBlockNumber(chainId) {
    return this.blockCache[chainId] || 0;
  }

  /**
   * Cache a price for a token on a chain
   */
  cachePrice(chainId, tokenAddress, price) {
    if (!this.priceCache[chainId]) {
      this.priceCache[chainId] = {};
    }
    this.priceCache[chainId][tokenAddress] = {
      price,
      timestamp: Date.now()
    };
  }

  /**
   * Get cached price for a token on a chain
   */
  getCachedPrice(chainId, tokenAddress) {
    const cached = this.priceCache[chainId]?.[tokenAddress];
    if (!cached) {
      return null;
    }
    
    // Price is valid for 5 minutes
    const maxAge = 5 * 60 * 1000;
    if (Date.now() - cached.timestamp > maxAge) {
      return null;
    }
    
    return cached.price;
  }

  /**
   * Clear price cache for a chain
   */
  clearPriceCache(chainId) {
    this.priceCache[chainId] = {};
  }

  /**
   * Get chain configuration
   */
  getChainConfig(chainId) {
    return getChainConfig(chainId);
  }

  /**
   * Get chain contracts
   */
  getChainContracts(chainId) {
    return getChainContracts(chainId);
  }

  /**
   * Get all enabled chains
   */
  getEnabledChains() {
    return this.enabledChains;
  }

  /**
   * Check if a chain is enabled
   */
  isChainEnabled(chainId) {
    return this.enabledChains.includes(chainId);
  }

  /**
   * Get health status for all chains
   */
  async getHealthStatus() {
    const status = {
      isInitialized: this.isInitialized,
      chains: {},
      chainsCount: this.enabledChains.length,
      timestamp: new Date().toISOString()
    };

    for (const chainId of this.enabledChains) {
      try {
        const blockNumber = await this.getBlockNumber(chainId);
        const chainConfig = getChainConfig(chainId);
        
        status.chains[chainId] = {
          status: 'healthy',
          chainName: chainConfig.chainName,
          chainId: chainConfig.chainId,
          blockNumber,
          lastUpdate: this.lastUpdateTime[chainId],
          hasWallet: this.hasWallet(chainId)
        };
      } catch (error) {
        status.chains[chainId] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }

    return status;
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Shutting down ChainManager...');
    
    for (const [chainId, provider] of Object.entries(this.providers)) {
      try {
        await provider.destroy();
        console.log(`   ✅ Disconnected from ${chainId}`);
      } catch (error) {
        console.error(`   ❌ Error disconnecting from ${chainId}:`, error.message);
      }
    }
    
    this.providers = {};
    this.wallets = {};
    this.blockCache = {};
    this.priceCache = {};
    this.isInitialized = false;
    
    console.log('✅ ChainManager shutdown complete');
  }
}

module.exports = ChainManager;
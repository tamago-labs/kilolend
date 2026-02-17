/**
 * BaseModule - Shared base class for all bot modules
 * 
 * Responsibilities:
 * - Provide common initialization logic
 * - Shared logging with chain prefix
 * - Error handling and retry logic
 * - Graceful shutdown support
 * - Health status reporting
 */
class BaseModule {
  constructor(name, chainManager, options = {}) {
    this.name = name;
    this.chainManager = chainManager;
    this.chainId = options.chainId;
    this.enabled = options.enabled !== false; // Default to enabled
    this.isRunning = false;
    this.isInitialized = false;
    this.errorCount = 0;
    this.successCount = 0;
    this.lastRunTime = null;
    
    // Chain-specific configuration
    this.chainConfig = this.chainId ? 
      this.chainManager.getChainConfig(this.chainId) : null;
    this.chainContracts = this.chainId ? 
      this.chainManager.getChainContracts(this.chainId) : null;
  }

  /**
   * Initialize the module
   * Override this method in subclasses
   */
  async init() {
    if (!this.enabled) {
      this.log('Module disabled, skipping initialization', 'info');
      return;
    }

    try {
      this.log('Initializing...', 'info');
      await this.initialize();
      this.isInitialized = true;
      this.log('✅ Initialized successfully', 'success');
    } catch (error) {
      this.log(`❌ Failed to initialize: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Module-specific initialization
   * Override this method in subclasses
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Start the module
   * Override this method in subclasses
   */
  async start() {
    if (!this.enabled || !this.isInitialized) {
      return;
    }

    try {
      this.log('Starting...', 'info');
      this.isRunning = true;
      await this.run();
    } catch (error) {
      this.log(`❌ Failed to start: ${error.message}`, 'error');
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Main run loop for the module
   * Override this method in subclasses
   */
  async run() {
    throw new Error('run() must be implemented by subclass');
  }

  /**
   * Stop the module
   */
  async stop() {
    this.log('Stopping...', 'info');
    this.isRunning = false;
    
    try {
      await this.cleanup();
      this.log('✅ Stopped successfully', 'success');
    } catch (error) {
      this.log(`❌ Error during stop: ${error.message}`, 'error');
    }
  }

  /**
   * Cleanup resources
   * Override this method in subclasses
   */
  async cleanup() {
    // Override in subclasses if needed
  }

  /**
   * Log a message with module and chain prefix
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const chainPrefix = this.chainId ? `[${this.chainId.toUpperCase()}] ` : '';
    const modulePrefix = `${chainPrefix}[${this.name}] `;
    
    let emoji = '';
    switch (level) {
      case 'error': emoji = '❌'; break;
      case 'warn': emoji = '⚠️'; break;
      case 'success': emoji = '✅'; break;
      case 'info': emoji = 'ℹ️'; break;
      default: emoji = '';
    }
    
    console.log(`${timestamp} ${emoji} ${modulePrefix}${message}`);
  }

  /**
   * Handle an error
   */
  handleError(error, context = '') {
    this.errorCount++;
    const contextStr = context ? ` (${context})` : '';
    this.log(`Error${contextStr}: ${error.message}`, 'error');
    
    // Log stack trace in debug mode
    if (process.env.LOG_LEVEL === 'debug' && error.stack) {
      console.error(error.stack);
    }
  }

  /**
   * Record a successful operation
   */
  recordSuccess() {
    this.successCount++;
    this.lastRunTime = new Date().toISOString();
  }

  /**
   * Retry a function with exponential backoff
   */
  async retry(fn, maxRetries = 3, baseDelay = 1000, context = '') {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        const delayMs = Math.min(delay, 5000); // Max 5 seconds
        
        this.log(`Attempt ${attempt}/${maxRetries} failed, retrying in ${delayMs}ms...`, 'warn');
        await this.sleep(delayMs);
      }
    }
  }

  /**
   * Sleep for a given number of milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format token amount from wei to human-readable
   */
  formatTokenAmount(amount, decimals) {
    const { ethers } = require('ethers');
    return ethers.formatUnits(amount, decimals);
  }

  /**
   * Parse token amount from human-readable to wei
   */
  parseTokenAmount(amount, decimals) {
    const { ethers } = require('ethers');
    return ethers.parseUnits(amount.toString(), decimals);
  }

  /**
   * Calculate USD value from token amount and price
   */
  calculateUSDValue(tokenAmount, tokenPrice) {
    const amount = parseFloat(tokenAmount);
    const price = parseFloat(tokenPrice);
    return amount * price;
  }

  /**
   * Get health status for the module
   */
  getHealthStatus() {
    return {
      name: this.name,
      chainId: this.chainId || 'all',
      enabled: this.enabled,
      initialized: this.isInitialized,
      running: this.isRunning,
      errorCount: this.errorCount,
      successCount: this.successCount,
      lastRunTime: this.lastRunTime,
      status: this.enabled && this.isInitialized && this.isRunning ? 'healthy' : 'unhealthy'
    };
  }

  /**
   * Get module configuration
   */
  getConfig() {
    return {
      name: this.name,
      chainId: this.chainId,
      enabled: this.enabled
    };
  }
}

module.exports = BaseModule;
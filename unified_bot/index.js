
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();


const ChainManager = require('./services/ChainManager');
const PointTracker = require('./modules/PointTracker');
const OracleUpdater = require('./modules/OracleUpdater');
const Liquidator = require('./modules/Liquidator');
const { getAllChainIds, getChainConfig } = require('./config/chains');


/**
 * UnifiedBot - Main orchestrator for all bot modules
 * 
 * Responsibilities:
 * - Initialize ChainManager
 * - Create and manage per-chain module instances
 * - Coordinate module lifecycle
 * - Provide health check API
 * - Handle graceful shutdown
 */
class UnifiedBot {
  constructor() {
    this.chainManager = null;
    this.modules = [];
    this.isInitialized = false;
    this.isRunning = false;
    this.startTime = null;
    
    // Parse enabled chains from environment
    this.enabledChains = this.parseEnabledChains();
  }

  /**
   * Parse enabled chains from environment variable
   * Format: "kaia,kub,etherlink" or "all"
   */
  parseEnabledChains() {
    const chainsEnv = process.env.ENABLED_CHAINS || 'all';
    
    if (chainsEnv === 'all') {
      return getAllChainIds();
    }
    
    const requestedChains = chainsEnv.split(',').map(c => c.trim().toLowerCase());
    const availableChains = getAllChainIds();
    const validChains = requestedChains.filter(c => availableChains.includes(c));
    
    if (validChains.length === 0) {
      console.warn('⚠️  No valid chains specified, defaulting to all chains');
      return availableChains;
    }
    
    return validChains;
  }

  /**
   * Initialize the bot
   */
  async init() {
    try {
      console.log('🚀 KiloLend Unified Bot Starting...');
      console.log('===================================');
      console.log(`📡 Enabled chains: ${this.enabledChains.join(', ')}`);
      
      // Initialize ChainManager
      this.chainManager = new ChainManager({
        enabledChains: this.enabledChains
      });
      
      // IMPORTANT: Wait for ChainManager to fully initialize before adding wallets
      console.log('⏳ Waiting for ChainManager to initialize providers...');
      await this.chainManager.init();
      console.log('✅ ChainManager initialized');
      
      // Add wallet private keys for each chain (if configured)
      for (const chainId of this.enabledChains) {
        const privateKeyEnv = `${chainId.toUpperCase()}_PRIVATE_KEY`;
        const privateKey = process.env[privateKeyEnv];
        
        if (privateKey) {
          try {
            this.chainManager.addWallet(chainId, privateKey);
          } catch (error) {
            console.warn(`⚠️  Failed to add wallet for ${chainId}: ${error.message}`);
          }
        } else {
          console.warn(`⚠️  No wallet configured for ${chainId} (env: ${privateKeyEnv})`);
          console.warn(`   Oracle and Liquidator modules will not work for ${chainId}`);
        }
      }
      
      // Create modules for each enabled chain
      await this.createModules();
      
      this.isInitialized = true;
      console.log('✅ Unified Bot initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Unified Bot:', error.message);
      throw error;
    }
  }

  /**
   * Create and configure modules
   */
  async createModules() {
    console.log('\n🔧 Creating modules...');
    
    // Parse enabled modules from environment
    const modulesEnv = process.env.ENABLED_MODULES || 'pointtracker,oracle,liquidator';
    const enabledModules = modulesEnv.split(',').map(m => m.trim().toLowerCase());
    
    // Create PointTracker instances for each chain
    if (enabledModules.includes('pointtracker')) {
      console.log('   ➕ Creating PointTracker modules...');
      for (const chainId of this.enabledChains) {
        const module = new PointTracker(this.chainManager, { chainId });
        this.modules.push(module);
      }
    }
    
    // Create OracleUpdater instances for each chain (requires wallet)
    if (enabledModules.includes('oracle')) {
      console.log('   ➕ Creating OracleUpdater modules...');
      for (const chainId of this.enabledChains) {
        if (this.chainManager.hasWallet(chainId)) {
          const module = new OracleUpdater(this.chainManager, { chainId });
          this.modules.push(module);
        } else {
          console.warn(`   ⚠️  Skipping OracleUpdater for ${chainId} (no wallet)`);
        }
      }
    }
    
    // Create Liquidator instances for each chain (requires wallet)
    if (enabledModules.includes('liquidator')) {
      console.log('   ➕ Creating Liquidator modules...');
      for (const chainId of this.enabledChains) {
        if (this.chainManager.hasWallet(chainId)) {
          const module = new Liquidator(this.chainManager, { chainId });
          this.modules.push(module);
        } else {
          console.warn(`   ⚠️  Skipping Liquidator for ${chainId} (no wallet)`);
        }
      }
    }
    
    console.log(`✅ Created ${this.modules.length} module instances`);
    
    // Initialize all modules
    console.log('\n🔧 Initializing modules...');
    for (const module of this.modules) {
      try {
        await module.init();
      } catch (error) {
        console.error(`❌ Failed to initialize ${module.name} for ${module.chainId}:`, error.message);
        throw error;
      }
    }
    
    console.log('✅ All modules initialized');
  }

  /**
   * Start the bot
   */
  async start() {
    if (!this.isInitialized) {
      throw new Error('Bot must be initialized before starting');
    }
    
    try {
      console.log('\n🚀 Starting Unified Bot...');
      this.startTime = new Date();
      this.isRunning = true;
      
      // Start all modules
      for (const module of this.modules) {
        await module.start();
      }
      
      console.log('\n✅ Unified Bot is running');
      console.log('===================================');
      console.log(`📊 Modules active: ${this.modules.filter(m => m.enabled).length}`);
      console.log(`📡 Chains active: ${this.enabledChains.length}`);
      console.log(`⏰ Started at: ${this.startTime.toISOString()}`);
      console.log('===================================\n');
      
    } catch (error) {
      console.error('❌ Failed to start Unified Bot:', error.message);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop the bot gracefully
   */
  async stop() {
    console.log('\n🛑 Stopping Unified Bot...');
    
    try {
      // Stop all modules
      for (const module of this.modules) {
        await module.stop();
      }
      
      // Shutdown ChainManager
      if (this.chainManager) {
        await this.chainManager.shutdown();
      }
      
      this.isRunning = false;
      console.log('✅ Unified Bot stopped gracefully');
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error.message);
    }
  }

  /**
   * Get overall health status
   */
  getHealthStatus() {
    const chainHealth = this.chainManager?.getHealthStatus() || {};
    const moduleHealth = this.modules.map(m => m.getHealthStatus());
    
    const healthyModules = moduleHealth.filter(m => m.status === 'healthy').length;
    
    return {
      status: this.isInitialized && this.isRunning && chainHealth.isInitialized ? 'healthy' : 'unhealthy',
      initialized: this.isInitialized,
      running: this.isRunning,
      startTime: this.startTime?.toISOString(),
      uptime: this.startTime ? Math.floor((Date.now() - this.startTime.getTime()) / 1000) : 0,
      chains: this.enabledChains,
      chainHealth,
      modules: {
        total: this.modules.length,
        healthy: healthyModules,
        unhealthy: this.modules.length - healthyModules,
        details: moduleHealth
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Print status summary
   */
  printStatus() {
    console.log('\n📊 UNIFIED BOT STATUS');
    console.log('====================');
    console.log(`Status: ${this.isRunning ? 'RUNNING 🟢' : 'STOPPED 🔴'}`);
    console.log(`Uptime: ${this.formatUptime(this.getHealthStatus().uptime)}`);
    console.log(`Chains: ${this.enabledChains.join(', ')}`);
    console.log(`Modules: ${this.modules.length} total`);
    
    // Module summary
    const moduleTypes = {};
    for (const module of this.modules) {
      if (!moduleTypes[module.name]) {
        moduleTypes[module.name] = { total: 0, healthy: 0 };
      }
      moduleTypes[module.name].total++;
      if (module.getHealthStatus().status === 'healthy') {
        moduleTypes[module.name].healthy++;
      }
    }
    
    console.log('\nModule Status:');
    for (const [name, stats] of Object.entries(moduleTypes)) {
      const status = stats.healthy === stats.total ? '✅' : '⚠️';
      console.log(`  ${status} ${name}: ${stats.healthy}/${stats.total} healthy`);
    }
    
    console.log('====================\n');
  }

  formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }
}

// ============================================
// Main Entry Point
// ============================================

async function main() {
  const bot = new UnifiedBot();
  
  // Setup Express server for health checks
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    const health = bot.getHealthStatus();
    
    if (health.status === 'healthy') {
      res.status(200).json(health);
    } else {
      res.status(503).json(health);
    }
  });
  
  // Status endpoint
  app.get('/status', (req, res) => {
    res.status(200).json(bot.getHealthStatus());
  });
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'KiloLend Unified Bot',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        status: '/status',
        triggerDailyUpdate: '/trigger-daily-update (POST)'
      }
    });
  });
  
  // Manual trigger endpoint for daily point calculation
  app.post('/trigger-daily-update', async (req, res) => {
    try {
      console.log('\n🚀 MANUAL TRIGGER: Daily Point Update Requested');
      console.log('='.repeat(60));
      
      const chainId = req.body.chainId || null;
      const targetChains = chainId ? [chainId] : bot.enabledChains;
      
      console.log(`📡 Target chains: ${targetChains.join(', ')}`);
      
      const results = {};
      let totalDistributions = 0;
      
      // Trigger update for each chain's PointTracker
      for (const cId of targetChains) {
        const pointTracker = bot.modules.find(m => 
          m.name === 'PointTracker' && m.chainId === cId
        );
        
        if (pointTracker) {
          try {
            console.log(`\n📊 Processing ${cId}...`);
            
            // Force daily summary calculation
            await pointTracker.printDailySummary();
            
            const stats = pointTracker.statsManagers[cId];
            const today = new Date().toISOString().split('T')[0];
            const users = stats.getUsers();
            const events = stats.getTotalEvents();
            const kiloDist = pointTracker.dailyKiloDistribution;
            
            results[cId] = {
              success: true,
              users: users.length,
              events: events,
              kiloDistribution: kiloDist,
              date: today
            };
            
            totalDistributions += users.length;
            console.log(`✅ ${cId}: ${users.length} users, ${events} events, ${kiloDist.toLocaleString()} KILO`);
            
          } catch (error) {
            console.error(`❌ Error processing ${cId}:`, error.message);
            results[cId] = {
              success: false,
              error: error.message
            };
          }
        } else {
          console.warn(`⚠️  No PointTracker found for ${cId}`);
          results[cId] = {
            success: false,
            error: 'PointTracker module not found'
          };
        }
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ Manual daily update completed successfully');
      
      const successCount = Object.values(results).filter(r => r.success).length;
      
      res.json({
        success: true,
        message: `Manual trigger completed: ${successCount}/${targetChains.length} chains`,
        timestamp: new Date().toISOString(),
        chains: results,
        summary: {
          totalChains: targetChains.length,
          successfulChains: successCount,
          totalUsers: Object.values(results).filter(r => r.success).reduce((sum, r) => sum + r.users, 0)
        }
      });
      
    } catch (error) {
      console.error('❌ Manual trigger failed:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  try {
    // Initialize and start bot
    await bot.init();
    await bot.start();
    
    // Print initial status
    bot.printStatus();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🌐 Health check server running on port ${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`📋 Status: http://localhost:${PORT}/status\n`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT, shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });
    
    // Print status every hour
    setInterval(() => {
      bot.printStatus();
    }, 60 * 60 * 1000);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Start the bot
if (require.main === module) {
  main();
}

module.exports = UnifiedBot;
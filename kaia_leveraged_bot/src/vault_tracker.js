const { ethers } = require('ethers');
const config = require('./config');

class VaultTracker {
  constructor(provider) {
    this.provider = provider;
    this.vaultAddress = '0xFe575cdE21BEb23d9D9F35e11E443d41CE8e68E3';
    this.lastQueriedBlock = 0; // Track last queried block to avoid re-querying
    this.initContracts();
  }

  initContracts() {
    
    const vaultABI = [
      "function totalManagedAssets() external view returns (uint256)",
      "function liquidBalance() external view returns (uint256)",
      "function sharePrice() external view returns (uint256)",
      "function totalSupply() external view returns (uint256)",
      "function balanceOf(address) external view returns (uint256)",
      "event WithdrawalRequested(uint256 indexed requestId, address indexed user, uint256 depositIndex, uint256 shares, uint256 assets, bool isEarlyWithdrawal)",
      "event WithdrawalProcessed(uint256 indexed requestId, uint256 assetsReturned, uint256 penalty)",
      "event WithdrawalClaimed(uint256 indexed requestId, address indexed user, uint256 assets)",
      "event BotWithdraw(uint256 amount, string reason)"
    ];

    this.vault = new ethers.Contract(this.vaultAddress, vaultABI, this.provider);
  }

  async getVaultMetrics() {
    console.log('\n🏦 VAULT METRICS');
    console.log('='.repeat(50));

    try {
      const [totalAssets, liquidBalance, sharePrice, totalSupply] = await Promise.all([
        this.vault.totalManagedAssets(),
        this.vault.liquidBalance(),
        this.vault.sharePrice(),
        this.vault.totalSupply()
      ]);

      const metrics = {
        totalManagedAssets: parseFloat(ethers.formatEther(totalAssets)),
        liquidBalance: parseFloat(ethers.formatEther(liquidBalance)),
        sharePrice: parseFloat(ethers.formatEther(sharePrice)),
        totalSupply: parseFloat(ethers.formatEther(totalSupply)),
        // Calculate how much is deployed (staked/leveraged)
        deployedAssets: parseFloat(ethers.formatEther(totalAssets)) - parseFloat(ethers.formatEther(liquidBalance))
      };

      console.log(`📊 Total Managed: ${metrics.totalManagedAssets.toFixed(4)} KAIA`);
      console.log(`💧 Liquid Balance: ${metrics.liquidBalance.toFixed(4)} KAIA`);
      console.log(`🚀 Deployed: ${metrics.deployedAssets.toFixed(4)} KAIA`);
      console.log(`💎 Share Price: ${metrics.sharePrice.toFixed(6)}`);
      console.log(`📈 Total Supply: ${metrics.totalSupply.toFixed(4)} shares`);
      console.log('='.repeat(50));

      return metrics;
    } catch (error) {
      console.error('❌ Error getting vault metrics:', error.message);
      return null;
    }
  }

  async checkPendingWithdrawals() {
    try {
      // Get current block number safely
      const currentBlock = await this.provider.getBlockNumber();
      
      console.log(`\n🔍 Checking withdrawals (Current Block: ${currentBlock})`);
      
      // Calculate safe block range
      // KAIA has 1-second blocks, so:
      // - Last 24 hours = 86,400 blocks
      // - Last 12 hours = 43,200 blocks  
      // - Last 6 hours = 21,600 blocks
      // Use 6 hours as a safe range to avoid RPC limits
      const blocksToQuery = 21600; // 6 hours
      
      // Ensure fromBlock is valid and not negative
      const fromBlock = Math.max(0, currentBlock - blocksToQuery);
      
      // IMPORTANT: Make sure toBlock doesn't exceed currentBlock
      const toBlock = Math.min(currentBlock, fromBlock + blocksToQuery);
      
      console.log(`📦 Querying blocks ${fromBlock} to ${toBlock} (${toBlock - fromBlock} blocks)`);
      
      // Query only if the range is valid
      if (fromBlock >= toBlock) {
        console.log('⚠️  Invalid block range, skipping query');
        return [];
      }

      const filter = this.vault.filters.WithdrawalRequested();
      
      // Add timeout and error handling for the query
      const events = await Promise.race([
        this.vault.queryFilter(filter, fromBlock, toBlock),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
        )
      ]);

      if (events.length > 0) {
        console.log(`\n⏳ PENDING WITHDRAWALS: ${events.length}`);
        console.log('='.repeat(50));

        const withdrawals = [];
        
        for (const event of events) {
          try {
            // Parse event based on the actual event signature
            const withdrawal = {
              requestId: event.args.requestId?.toString() || 'unknown',
              user: event.args.user || 'unknown',
              shares: event.args.shares ? parseFloat(ethers.formatEther(event.args.shares)) : 0,
              assets: event.args.assets ? parseFloat(ethers.formatEther(event.args.assets)) : 0,
              depositIndex: event.args.depositIndex?.toString() || 'unknown',
              isEarlyWithdrawal: event.args.isEarlyWithdrawal || false,
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash
            };
            
            withdrawals.push(withdrawal);
          } catch (parseError) {
            console.error('⚠️  Error parsing event:', parseError.message);
          }
        }

        // Display withdrawals
        withdrawals.forEach((w, i) => {
          console.log(`\n${i + 1}. Request ID: ${w.requestId}`);
          console.log(`   User: ${w.user.slice(0, 10)}...`);
          console.log(`   Shares: ${w.shares.toFixed(4)}`);
          console.log(`   Assets: ${w.assets.toFixed(4)} KAIA`);
          console.log(`   Early: ${w.isEarlyWithdrawal ? 'Yes' : 'No'}`);
          console.log(`   Block: ${w.blockNumber}`);
        });

        console.log('='.repeat(50));

        // Update last queried block
        this.lastQueriedBlock = toBlock;

        return withdrawals;
      }

      console.log('✅ No pending withdrawals found');
      return [];
      
    } catch (error) {
      console.error('❌ Failed to check pending withdrawals:', error.message);
      
      // If it's a block number error, log more details
      if (error.message.includes('block number') || error.message.includes('header')) {
        console.error('💡 Tip: The block range might be invalid. Trying with smaller range...');
        
        // Retry with smaller range
        try {
          const currentBlock = await this.provider.getBlockNumber();
          const smallerRange = 7200; // 2 hours instead of 6
          const fromBlock = Math.max(0, currentBlock - smallerRange);
          
          console.log(`🔄 Retrying with blocks ${fromBlock} to ${currentBlock}`);
          
          const filter = this.vault.filters.WithdrawalRequested();
          const events = await this.vault.queryFilter(filter, fromBlock, currentBlock);
          
          if (events.length > 0) {
            console.log(`✅ Found ${events.length} withdrawals with smaller range`);
            return events.map(event => ({
              requestId: event.args.requestId?.toString() || 'unknown',
              user: event.args.user || 'unknown',
              shares: event.args.shares ? parseFloat(ethers.formatEther(event.args.shares)) : 0,
              blockNumber: event.blockNumber
            }));
          }
        } catch (retryError) {
          console.error('❌ Retry also failed:', retryError.message);
        }
      }
      
      return [];
    }
  }

  /**
   * Alternative: Query withdrawals using getPendingRequests from contract
   * This is more reliable if the contract has this view function
   */
  async checkPendingWithdrawalsFromContract() {
    try {
      // If your vault has a getPendingRequests view function
      const pendingRequestIds = await this.vault.getPendingRequests();
      
      console.log(`\n⏳ PENDING WITHDRAWALS: ${pendingRequestIds.length}`);
      
      // Fetch details for each request
      const withdrawals = [];
      for (const requestId of pendingRequestIds) {
        try {
          const request = await this.vault.withdrawalRequests(requestId);
          withdrawals.push({
            requestId: requestId.toString(),
            user: request.user,
            shares: parseFloat(ethers.formatEther(request.shares)),
            assets: parseFloat(ethers.formatEther(request.assets)),
            processed: request.processed,
            claimed: request.claimed
          });
        } catch (err) {
          console.error(`⚠️  Error fetching request ${requestId}:`, err.message);
        }
      }
      
      return withdrawals;
      
    } catch (error) {
      console.error('⚠️  Contract view function not available:', error.message);
      return null;
    }
  }

  calculateRequiredLiquidity(withdrawals, sharePrice) {
    const totalShares = withdrawals.reduce((sum, w) => sum + w.shares, 0);
    const totalAssets = withdrawals.reduce((sum, w) => sum + w.assets, 0);
    
    // Use assets if available, otherwise calculate from shares
    const requiredAssets = totalAssets > 0 ? totalAssets : totalShares * sharePrice;
    
    return {
      totalShares,
      requiredAssets,
      estimatedWithdrawalAmount: requiredAssets * 1.02 // Add 2% buffer
    };
  }

  shouldPrepareForWithdrawals(vaultMetrics, pendingWithdrawals) {
    if (!vaultMetrics) {
      return {
        shouldPrepare: false,
        reason: 'Cannot check - vault metrics unavailable'
      };
    }

    if (pendingWithdrawals.length === 0) {
      return {
        shouldPrepare: false,
        reason: 'No pending withdrawals'
      };
    }

    const required = this.calculateRequiredLiquidity(pendingWithdrawals, vaultMetrics.sharePrice);

    // Check if liquid balance is insufficient
    if (vaultMetrics.liquidBalance < required.requiredAssets) {
      const deficit = required.requiredAssets - vaultMetrics.liquidBalance;
      
      return {
        shouldPrepare: true,
        reason: `Insufficient liquidity for ${pendingWithdrawals.length} withdrawal(s)`,
        deficit: deficit,
        requiredAssets: required.requiredAssets,
        currentLiquid: vaultMetrics.liquidBalance,
        recommendation: `Unstake ${deficit.toFixed(4)} KAIA to prepare for withdrawals`
      };
    }

    return {
      shouldPrepare: false,
      reason: 'Sufficient liquidity available',
      currentLiquid: vaultMetrics.liquidBalance,
      requiredAssets: required.requiredAssets
    };
  }

  /**
   * Get safe block range for queries based on network conditions
   */
  async getSafeBlockRange(hoursBack = 6) {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const blocksPerHour = 3600; // KAIA has 1-second blocks
      const blocksToQuery = hoursBack * blocksPerHour;
      
      const fromBlock = Math.max(0, currentBlock - blocksToQuery);
      
      return {
        fromBlock,
        toBlock: currentBlock,
        blocksToQuery: currentBlock - fromBlock
      };
    } catch (error) {
      console.error('❌ Error getting safe block range:', error.message);
      return null;
    }
  }
}

module.exports = VaultTracker;
/**
 * Statistics Manager
 * Handles daily statistics tracking and user data management
 */
class StatsManager {
  constructor(databaseService = null) {
    this.databaseService = databaseService;
    this.reset();
    this.currentDate = this.getCurrentDate();
  }

  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }

  reset() {
    this.dailyStats = {
      users: new Set(),
      totalEvents: 0,
      // User-specific tracking
      userStats: {}, // { userAddress: { baseTVL, netContribution, basePoints, multiplier, finalKilo, activities } }
      // Protocol-wide tracking
      totalTVLContributed: 0,
      totalNetContribution: 0,
      // Market-wise tracking
      tvlChanges: {},
      borrowChanges: {}
    };
  }

  initializeUserStats(userAddress) {
    if (!this.dailyStats.userStats[userAddress]) {
      this.dailyStats.userStats[userAddress] = {
        baseTVL: 0,           // Will be calculated from cToken balances
        netContribution: 0,   // Net contribution: (supply-withdraw) - (borrow-repay)
        basePoints: 0,        // Points before multiplier
        multiplier: 1.0,      // User's multiplier
        finalKilo: 0,         // Final KILO after multiplier and distribution
        activities: {
          supplies: 0,
          withdraws: 0,
          borrows: 0,
          repays: 0
        },
        // New fields for balance tracking
        balanceBreakdown: {}, // Per-market balance information
        lastBalanceUpdate: null
      };
    }
  }

  updateUserStats(userAddress, usdValue, type) {
    this.initializeUserStats(userAddress);
    
    const userStats = this.dailyStats.userStats[userAddress];
    
    // Update activity counters
    switch (type) {
      case 'mint':
        userStats.activities.supplies++;
        userStats.netContribution += usdValue; // Positive net contribution
        this.dailyStats.totalTVLContributed += usdValue;
        this.dailyStats.totalNetContribution += usdValue;
        break;
        
      case 'redeem':
        userStats.activities.withdraws++;
        userStats.netContribution -= usdValue; // Negative net contribution
        this.dailyStats.totalNetContribution -= usdValue;
        break;
        
      case 'borrow':
        userStats.activities.borrows++;
        userStats.netContribution -= usdValue; // Negative net contribution (removes TVL)
        this.dailyStats.totalTVLContributed += usdValue;
        this.dailyStats.totalNetContribution -= usdValue;
        break;
        
      case 'repay':
        userStats.activities.repays++;
        userStats.netContribution += usdValue; // Positive net contribution (adds back TVL)
        this.dailyStats.totalNetContribution += usdValue;
        break;
    }
  }

  /**
   * Initialize user's base TVL from cToken balances at startup
   * This is called when loading existing users who had balances before the bot started
   */
  initializeUserBaseTVL(userAddress, totalBaseTVL, marketBreakdown) {
    this.initializeUserStats(userAddress);
    
    const userStats = this.dailyStats.userStats[userAddress];
    userStats.baseTVL = totalBaseTVL;
    // userStats.balanceBreakdown = marketBreakdown;
    userStats.lastBalanceUpdate = new Date().toISOString();
    
    // Add user to the tracked users set
    this.dailyStats.users.add(userAddress);
  }

  /**
   * Update user's base TVL from cToken balances
   */
  updateUserBaseTVL(userAddress, baseTVLData) {
    this.initializeUserStats(userAddress);
    
    const userStats = this.dailyStats.userStats[userAddress];
    userStats.baseTVL = baseTVLData.totalBaseTVL;
    // userStats.balanceBreakdown = baseTVLData.marketBreakdown;
    userStats.lastBalanceUpdate = new Date().toISOString();
  }

  updateDailyStats(user, market, usdValue, type) {
    // Check if we need to reset daily stats (new day)
    const currentDate = this.getCurrentDate();
    if (currentDate !== this.currentDate) {
      this.currentDate = currentDate;
      return true; // Signal that a new day started
    }

    // Track unique users
    this.dailyStats.users.add(user);
    this.dailyStats.totalEvents++;

    // Initialize market stats if needed
    if (!this.dailyStats.tvlChanges[market]) {
      this.dailyStats.tvlChanges[market] = 0;
    }
    if (!this.dailyStats.borrowChanges[market]) {
      this.dailyStats.borrowChanges[market] = 0;
    }

    // Update market stats based on event type
    switch (type) {
      case 'mint':
        this.dailyStats.tvlChanges[market] += usdValue;
        break;
      case 'redeem':
        this.dailyStats.tvlChanges[market] -= usdValue;
        break;
      case 'borrow':
        this.dailyStats.borrowChanges[market] += usdValue;
        break;
      case 'repay':
        this.dailyStats.borrowChanges[market] -= usdValue;
        break;
    }

    // Update user-specific stats for KILO point calculation
    this.updateUserStats(user, usdValue, type);
    
    return false; // No new day
  }

  async printDailySummary(kiloCalculator, balanceManager = null) {
    console.log('\\n📊 DAILY SUMMARY');
    console.log('================');
    console.log(`📅 Date: ${this.currentDate}`);
    console.log(`👥 Unique Users: ${this.dailyStats.users.size}`);
    console.log(`🎯 Total Events: ${this.dailyStats.totalEvents}`);
    console.log(`💰 Total TVL Contributed: $${this.dailyStats.totalTVLContributed.toFixed(2)}`);
    console.log(`📈 Total Net Contribution: $${this.dailyStats.totalNetContribution.toFixed(2)}`);
    
    console.log('\\n💰 TVL Changes by Market:');
    let totalTVLChange = 0;
    for (const [market, change] of Object.entries(this.dailyStats.tvlChanges)) {
      console.log(`  ${market}: ${change >= 0 ? '+' : ''}$${change.toFixed(2)}`);
      totalTVLChange += change;
    }
    console.log(`  🏆 Net TVL Change: ${totalTVLChange >= 0 ? '+' : ''}$${totalTVLChange.toFixed(2)}`);

    console.log('\\n🏦 Borrow Changes by Market:');
    let totalBorrowChange = 0;
    for (const [market, change] of Object.entries(this.dailyStats.borrowChanges)) {
      console.log(`  ${market}: ${change >= 0 ? '+' : ''}$${change.toFixed(2)}`);
      totalBorrowChange += change;
    }
    console.log(`  🏆 Net Borrow Change: ${totalBorrowChange >= 0 ? '+' : ''}$${totalBorrowChange.toFixed(2)}`);

    // Calculate base TVL for all users if balance manager is available
    if (balanceManager) {
      const userAddresses = Array.from(this.dailyStats.users);
      if (userAddresses.length > 0) {
        const baseTVLData = await balanceManager.calculateBaseTVLForUsers(userAddresses);
        
        // Update user stats with base TVL
        for (const [userAddress, data] of Object.entries(baseTVLData)) {
          this.updateUserBaseTVL(userAddress, data);
        }
      }
    }

    // Calculate and display KILO point distribution
    let distributions = [];
    if (Object.keys(this.dailyStats.userStats).length > 0) {
      distributions = await kiloCalculator.calculateKiloPoints(this.dailyStats.userStats);
    } else {
      console.log('\\n💎 No user activity for KILO distribution today');
    }

    // Store to database if available
    if (this.databaseService && distributions && distributions.length > 0) {
      console.log('\\n💾 STORING TO DATABASE...');
      console.log('==========================');
      
      const summary = {
        uniqueUsers: this.dailyStats.users.size,
        totalEvents: this.dailyStats.totalEvents,
        totalTVLContributed: this.dailyStats.totalTVLContributed,
        totalNetContribution: this.dailyStats.totalNetContribution,
        netTVLChange: totalTVLChange,
        netBorrowChange: totalBorrowChange,
        tvlChangesByMarket: this.dailyStats.tvlChanges,
        borrowChangesByMarket: this.dailyStats.borrowChanges
      };

      await this.databaseService.storeDailySummary(this.currentDate, distributions, summary);
    } else if (this.databaseService && (!distributions || distributions.length === 0)) {
      console.log('\\n💾 No distributions to store to database');
    }

    console.log('================\\n');
    
    return distributions;
  }

  getUserStats() {
    return this.dailyStats.userStats;
  }

  getTotalEvents() {
    return this.dailyStats.totalEvents;
  }

  getUsers() {
    return Array.from(this.dailyStats.users);
  }

  /**
   * Re-initialize existing users after daily reset
   * Ensures users with base TVL are tracked even without daily activity
   */
  async reinitializeExistingUsers(databaseService, balanceManager) {
    try {
      console.log('\n🔄 RE-INITIALIZING USERS AFTER DAILY RESET...');
      console.log('==========================================');
      
      // Get all users from the database
      const allUsers = await databaseService.getAllUsers();
      
      if (allUsers.length === 0) {
        console.log('💭 No existing users found in the system');
        return;
      }
      
      console.log(`🚀 Found ${allUsers.length} existing users, re-calculating base TVL...`);
      
      // Calculate base TVL for all existing users
      const existingUserBaseTVL = await balanceManager.calculateBaseTVLForUsers(allUsers);
      
      // Re-initialize stats manager with existing users' base TVL
      let usersWithTVL = 0;
      let usersWithZeroTVL = 0;
      let usersWithErrors = 0;
      
      for (const userAddress of allUsers) {
        const baseTVLData = existingUserBaseTVL[userAddress];
        
        if (baseTVLData && baseTVLData.error) {
          console.log(`❌ Error calculating TVL for ${userAddress.slice(0, 8)}...: ${baseTVLData.error}`);
          usersWithErrors++;
          // Still initialize with zero TVL to ensure user is tracked
          this.initializeUserBaseTVL(userAddress, 0, {});
          this.dailyStats.users.add(userAddress);
        } else if (baseTVLData) {
          if (baseTVLData.totalBaseTVL > 0) {
            this.initializeUserBaseTVL(userAddress, baseTVLData.totalBaseTVL, baseTVLData.marketBreakdown);
            this.dailyStats.users.add(userAddress);
            console.log(`✅ Re-initialized ${userAddress.slice(0, 8)}... with ${baseTVLData.totalBaseTVL.toFixed(2)} base TVL (${baseTVLData.marketsWithBalance} markets)`);
            usersWithTVL++;
          } else {
            this.initializeUserBaseTVL(userAddress, 0, baseTVLData.marketBreakdown);
            this.dailyStats.users.add(userAddress);
            console.log(`💭 Re-initialized ${userAddress.slice(0, 8)}... with 0.00 base TVL (no balances)`);
            usersWithZeroTVL++;
          }
        } else {
          console.log(`⚠️  No TVL data found for ${userAddress.slice(0, 8)}...`);
          usersWithErrors++;
          // Still initialize with zero TVL to ensure user is tracked
          this.initializeUserBaseTVL(userAddress, 0, {});
          this.dailyStats.users.add(userAddress);
        }
      }
      
      console.log(`\n🏆 Re-initialization Complete:`);
      console.log(`   • Total users re-loaded: ${allUsers.length}`);
      console.log(`   • Users with TVL > 0: ${usersWithTVL}`);
      console.log(`   • Users with TVL = 0: ${usersWithZeroTVL}`);
      console.log(`   • Users with errors: ${usersWithErrors}`);
      console.log(`   • Total users tracked: ${this.dailyStats.users.length}`);
      console.log('==========================================\n');
      
    } catch (error) {
      console.error('❌ Error re-initializing existing users:', error.message);
      console.log('💡 Continuing without existing user data - new events will still be tracked');
    }
  }
}

module.exports = StatsManager;

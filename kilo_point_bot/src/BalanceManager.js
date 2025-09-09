const { ethers } = require('ethers');

/**
 * Balance Manager
 * Handles fetching user cToken balances and calculating TVL contributions
 */
class BalanceManager {
  constructor(provider, markets) {
    this.provider = provider;
    this.markets = markets;
    
    // cToken ABI for balance queries
    this.CTOKEN_ABI = [
      "function balanceOf(address account) view returns (uint256)",
      "function totalSupply() view returns (uint256)",
      "function exchangeRateStored() view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];
    
    // Cache for total supplies to avoid repeated calls
    this.totalSupplyCache = {};
    this.cacheExpiry = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Get user's cToken balance and calculate their share of total supply
   */
  async getUserBalanceShare(userAddress, cTokenAddress, marketInfo) {
    try {
      const contract = new ethers.Contract(cTokenAddress, this.CTOKEN_ABI, this.provider);
      
      // Get user balance and total supply
      const [userBalance, totalSupply] = await Promise.all([
        contract.balanceOf(userAddress),
        this.getCachedTotalSupply(cTokenAddress, contract)
      ]);

      if (totalSupply === 0n) {
        return {
          userBalance: 0,
          totalSupply: 0,
          sharePercentage: 0,
          baseTVLContribution: 0
        };
      }

      // Calculate share as percentage
      const sharePercentage = (Number(userBalance) / Number(totalSupply)) * 100;
      
      // Base TVL contribution: if user has 1% of total supply, they get 1 point
      const baseTVLContribution = sharePercentage;

      return {
        userBalance: Number(userBalance),
        totalSupply: Number(totalSupply),
        sharePercentage,
        baseTVLContribution,
        market: marketInfo.symbol
      };

    } catch (error) {
      console.warn(`⚠️  Failed to get balance for ${userAddress} in ${marketInfo.symbol}:`, error.message);
      return {
        userBalance: 0,
        totalSupply: 0,
        sharePercentage: 0,
        baseTVLContribution: 0,
        market: marketInfo.symbol
      };
    }
  }

  /**
   * Get total supply with caching to reduce RPC calls
   */
  async getCachedTotalSupply(cTokenAddress, contract) {
    const now = Date.now();
    const cache = this.totalSupplyCache[cTokenAddress];
    
    if (cache && (now - cache.timestamp) < this.cacheExpiry) {
      return cache.value;
    }

    try {
      const totalSupply = await contract.totalSupply();
      this.totalSupplyCache[cTokenAddress] = {
        value: totalSupply,
        timestamp: now
      };
      return totalSupply;
    } catch (error) {
      console.warn(`⚠️  Failed to get total supply for ${cTokenAddress}:`, error.message);
      return 0n;
    }
  }

  /**
   * Calculate user's total base TVL across all markets
   */
  async calculateUserBaseTVL(userAddress) {
    try {
      console.log(`📊 Calculating base TVL for ${userAddress.slice(0, 8)}...`);
      
      let totalBaseTVL = 0;
      const marketBreakdown = {};

      for (const [cTokenAddress, marketInfo] of Object.entries(this.markets)) {
        const balanceInfo = await this.getUserBalanceShare(userAddress, cTokenAddress, marketInfo);
        
        if (balanceInfo.baseTVLContribution > 0) {
          marketBreakdown[marketInfo.symbol] = {
            sharePercentage: balanceInfo.sharePercentage,
            baseTVLContribution: balanceInfo.baseTVLContribution,
            userBalance: balanceInfo.userBalance,
            totalSupply: balanceInfo.totalSupply
          };
          
          totalBaseTVL += balanceInfo.baseTVLContribution;
          
          console.log(`  ${marketInfo.symbol}: ${balanceInfo.sharePercentage.toFixed(4)}% of supply = ${balanceInfo.baseTVLContribution.toFixed(2)} base TVL`);
        }
      }

      console.log(`  🎯 Total Base TVL: ${totalBaseTVL.toFixed(2)}`);
      
      return {
        totalBaseTVL,
        marketBreakdown,
        userAddress
      };

    } catch (error) {
      console.error(`❌ Error calculating base TVL for ${userAddress}:`, error.message);
      return {
        totalBaseTVL: 0,
        marketBreakdown: {},
        userAddress
      };
    }
  }

  /**
   * Calculate base TVL for all active users
   */
  async calculateBaseTVLForUsers(userAddresses) {
    console.log('\\n📊 CALCULATING BASE TVL FROM cTOKEN BALANCES...');
    console.log('===============================================');
    console.log('💡 Base TVL = Sum of (User cToken Balance / Total Supply) * 100 across all markets');
    console.log('💡 Example: 1% of cUSDT supply + 0.5% of cSIX supply = 1.5 base TVL points');
    console.log('');

    const userBaseTVLData = {};
    
    for (const userAddress of userAddresses) {
      const baseTVLInfo = await this.calculateUserBaseTVL(userAddress);
      userBaseTVLData[userAddress] = baseTVLInfo;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Log summary
    const totalUsers = Object.keys(userBaseTVLData).length;
    const usersWithTVL = Object.values(userBaseTVLData).filter(u => u.totalBaseTVL > 0).length;
    const totalBaseTVL = Object.values(userBaseTVLData).reduce((sum, u) => sum + u.totalBaseTVL, 0);

    console.log('\\n📈 BASE TVL SUMMARY:');
    console.log(`👥 Users checked: ${totalUsers}`);
    console.log(`💰 Users with TVL: ${usersWithTVL}`);
    console.log(`🎯 Total base TVL points: ${totalBaseTVL.toFixed(2)}`);
    console.log('===============================================\\n');

    return userBaseTVLData;
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.totalSupplyCache = {};
  }
}

module.exports = BalanceManager;

/**
 * KILO Point Calculation Engine
 * Handles the complex point calculation and distribution logic
 */
class KiloPointCalculator {
  constructor(dailyKiloDistribution = 100000) {
    this.dailyKiloDistribution = dailyKiloDistribution;
  }

  // Get multiplier for a user - can be extended with complex logic
  async getUserMultiplier(userAddress, userStats = null) {
    try {
      // Future implementation could include:
      // - API call to get user tier/level
      // - Check user's historical activity
      // - Special event multipliers
      // - NFT holder bonuses
      // - Loyalty program multipliers
      
      // Example of future conditional logic:
      /*
      if (userStats && userStats.baseTVL > 10) {
        return 2.0; // VIP users get 2x multiplier
      }
      if (userStats && userStats.activities.supplies > 5) {
        return 1.5; // Active users get 1.5x multiplier
      }
      */
      
      return 1.0; // Default multiplier
      
    } catch (error) {
      console.warn(`⚠️  Failed to get multiplier for ${userAddress}:`, error.message);
      return 1.0; // Default on error
    }
  }

  async calculateKiloPoints(userStats) {
    const users = Object.keys(userStats);
    if (users.length === 0) return [];

    console.log('\\n🧮 CALCULATING KILO POINTS...');
    console.log('==============================');
    console.log('💡 Formula: (Base TVL × 50%) + (Net Contribution × 50%)');
    console.log('💡 Base TVL = Sum of cToken share percentages across all markets');
    console.log('💡 Net Contribution = (Supply - Withdraw) - (Borrow - Repay)');
    console.log('');

    // Step 1: Calculate base points for each user using the formula:
    // base point (TVL contribution) x 50% + net contribution to TVL x 50%
    let totalBasePoints = 0;
    
    for (const userAddress of users) {
      const stats = userStats[userAddress];
      
      // Calculate user base points using the 50/50 formula
      const basePoints = stats.baseTVL * 0.5;
      const netPoints = Math.max(0, stats.netContribution) * 0.5; // Only positive net contribution counts
      const userBasePoints = basePoints + netPoints;
      
      stats.basePoints = userBasePoints;
      totalBasePoints += userBasePoints;
      
      console.log(`👤 ${userAddress.slice(0, 8)}...`);
      console.log(`   Base TVL: ${stats.baseTVL.toFixed(2)} x 50% = ${basePoints.toFixed(2)} points`);
      if (stats.balanceBreakdown && Object.keys(stats.balanceBreakdown).length > 0) {
        for (const [market, breakdown] of Object.entries(stats.balanceBreakdown)) {
          console.log(`     ${market}: ${breakdown.sharePercentage.toFixed(4)}% of supply`);
        }
      }
      console.log(`   Net Contribution: $${stats.netContribution.toFixed(2)} x 50% = ${netPoints.toFixed(2)} points`);
      console.log(`   Total Base Points: ${userBasePoints.toFixed(2)}`);
      console.log('');
    }

    console.log(`🎯 Total Base Points Generated: ${totalBasePoints.toFixed(2)}`);

    // Step 2: Get multipliers for each user
    console.log('\\n🔄 GETTING USER MULTIPLIERS...');
    console.log('===============================');

    for (const userAddress of users) {
      const stats = userStats[userAddress];
      const multiplier = await this.getUserMultiplier(userAddress, stats);
      stats.multiplier = multiplier;
      
      console.log(`👤 ${userAddress.slice(0, 8)}... → Multiplier: ${multiplier}x`);
    }

    // Step 3: Calculate total weighted points (base points × multiplier)
    let totalWeightedPoints = 0;
    
    console.log('\\n⚖️  CALCULATING WEIGHTED POINTS...');
    console.log('==================================');

    for (const userAddress of users) {
      const stats = userStats[userAddress];
      const weightedPoints = stats.basePoints * stats.multiplier;
      totalWeightedPoints += weightedPoints;
      
      console.log(`👤 ${userAddress.slice(0, 8)}...`);
      console.log(`   ${stats.basePoints.toFixed(2)} points × ${stats.multiplier}x = ${weightedPoints.toFixed(2)} weighted points`);
    }

    console.log(`\\n🎯 Total Weighted Points: ${totalWeightedPoints.toFixed(2)}`);
    console.log(`💰 Daily KILO Pool: ${this.dailyKiloDistribution.toLocaleString()} KILO`);

    // Step 4: Distribute KILO proportionally based on weighted points
    if (totalWeightedPoints > 0) {
      return this.distributeKilo(users, userStats, totalWeightedPoints);
    }

    return [];
  }

  distributeKilo(users, userStats, totalWeightedPoints) {
    console.log('\\n💎 KILO DISTRIBUTION');
    console.log('====================');
    
    const distributions = [];
    
    for (const userAddress of users) {
      const stats = userStats[userAddress];
      const weightedPoints = stats.basePoints * stats.multiplier;
      const userShare = weightedPoints / totalWeightedPoints;
      const kiloReward = userShare * this.dailyKiloDistribution;
      
      stats.finalKilo = kiloReward;
      
      distributions.push({
        address: userAddress,
        baseTVL: stats.baseTVL,
        netContribution: stats.netContribution,
        basePoints: stats.basePoints,
        multiplier: stats.multiplier,
        weightedPoints: weightedPoints,
        share: userShare,
        kilo: kiloReward,
        balanceBreakdown: stats.balanceBreakdown || {}
      });
    }

    // Sort by KILO reward (highest first)
    distributions.sort((a, b) => b.kilo - a.kilo);

    for (let i = 0; i < distributions.length; i++) {
      const dist = distributions[i];
      const rank = i + 1;
      const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';
      
      console.log(`${rankEmoji} #${rank} ${dist.address.slice(0, 8)}...`);
      console.log(`   Base TVL: ${dist.baseTVL.toFixed(2)} (from cToken balances)`);
      if (Object.keys(dist.balanceBreakdown).length > 0) {
        for (const [market, breakdown] of Object.entries(dist.balanceBreakdown)) {
          console.log(`     ${market}: ${breakdown.sharePercentage.toFixed(4)}%`);
        }
      }
      console.log(`   Net Contribution: $${dist.netContribution.toFixed(2)}`);
      console.log(`   Base Points: ${dist.basePoints.toFixed(2)}`);
      console.log(`   Multiplier: ${dist.multiplier}x`);
      console.log(`   Weighted Points: ${dist.weightedPoints.toFixed(2)}`);
      console.log(`   Share: ${(dist.share * 100).toFixed(2)}%`);
      console.log(`   🎁 KILO Reward: ${Math.floor(dist.kilo).toLocaleString()} KILO`);
      console.log('');
    }

    // Summary with example formula
    this.printDistributionFormula(distributions);

    return distributions;
  }

  printDistributionFormula(distributions) {
    console.log('📋 BALANCED DISTRIBUTION FORMULA EXAMPLE:');
    console.log('==========================================');
    console.log('💡 Base TVL = Sum of (cToken Balance / Total Supply) × 100 across markets');
    console.log('💡 Formula = (Base TVL × 50%) + (Net Contribution × 50%)');
    console.log('💡 This rewards both existing holders AND new contributors');
    console.log('');
    
    if (distributions.length >= 3) {
      const userA = distributions[0];
      const userB = distributions[1]; 
      const userC = distributions[2];
      
      console.log(`USER A = ${userA.baseTVL.toFixed(1)} TVL + $${userA.netContribution.toFixed(0)} net × ${userA.multiplier}x = ${userA.weightedPoints.toFixed(0)} weighted points`);
      console.log(`USER B = ${userB.baseTVL.toFixed(1)} TVL + $${userB.netContribution.toFixed(0)} net × ${userB.multiplier}x = ${userB.weightedPoints.toFixed(0)} weighted points`);
      console.log(`USER C = ${userC.baseTVL.toFixed(1)} TVL + $${userC.netContribution.toFixed(0)} net × ${userC.multiplier}x = ${userC.weightedPoints.toFixed(0)} weighted points`);
      console.log('');
      console.log('Then:');
      console.log(`USER A = ${Math.floor(userA.kilo).toLocaleString()} KILO`);
      console.log(`USER B = ${Math.floor(userB.kilo).toLocaleString()} KILO`);
      console.log(`USER C = ${Math.floor(userC.kilo).toLocaleString()} KILO`);
    } else if (distributions.length > 0) {
      // Show available users
      for (let i = 0; i < Math.min(distributions.length, 3); i++) {
        const user = distributions[i];
        const letter = String.fromCharCode(65 + i); // A, B, C
        console.log(`USER ${letter} = ${user.baseTVL.toFixed(1)} TVL + $${user.netContribution.toFixed(0)} net × ${user.multiplier}x = ${Math.floor(user.kilo).toLocaleString()} KILO`);
      }
    }
    
    console.log('');
    console.log('🎯 BALANCED SYSTEM BENEFITS:');
    console.log('• Early contributors get base TVL rewards from cToken holdings');
    console.log('• New contributors get rewards from net TVL contribution');
    console.log('• On quiet days, existing holders still earn KILO');
    console.log('• Encourages both holding and new activity');
  }
}

module.exports = KiloPointCalculator;

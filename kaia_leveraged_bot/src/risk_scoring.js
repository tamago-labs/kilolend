const config = require('./config');

class RiskScoring {
  constructor() {
    this.weights = {
      healthFactor: 0.40,
      marketVolatility: 0.20,
      utilizationRate: 0.15,
      borrowRate: 0.15,
      depegRisk: 0.10
    };
  }

  calculateRiskScore(snapshot, marketData) {
    console.log('\n⚠️  RISK ASSESSMENT');
    console.log('='.repeat(50));

    const scores = {
      healthFactor: this.scoreHealthFactor(snapshot.lending?.healthFactor || 999),
      marketVolatility: this.scoreVolatility(marketData.volatility),
      utilizationRate: this.scoreUtilization(marketData.utilizationRate),
      borrowRate: this.scoreBorrowRate(marketData.lendingRates.borrow),
      depegRisk: this.scoreDepegRisk(marketData.prices)
    };

    // Calculate weighted score (0-100)
    const overallScore = Object.keys(scores).reduce((total, key) => {
      return total + (scores[key] * this.weights[key] * 100);
    }, 0);

    const riskLevel = this.getRiskLevel(overallScore);
    const recommendation = this.getRecommendation(overallScore, scores);

    console.log('📊 Risk Scores:');
    console.log(`   Health Factor: ${(scores.healthFactor * 100).toFixed(0)}/100`);
    console.log(`   Market Volatility: ${(scores.marketVolatility * 100).toFixed(0)}/100`);
    console.log(`   Utilization Rate: ${(scores.utilizationRate * 100).toFixed(0)}/100`);
    console.log(`   Borrow Rate: ${(scores.borrowRate * 100).toFixed(0)}/100`);
    console.log(`   Depeg Risk: ${(scores.depegRisk * 100).toFixed(0)}/100`);
    console.log('');
    console.log(`🎯 Overall Risk Score: ${overallScore.toFixed(1)}/100`);
    console.log(`⚠️  Risk Level: ${riskLevel}`);
    console.log(`💡 Recommendation: ${recommendation}`);
    console.log('='.repeat(50));

    return {
      overallScore,
      riskLevel,
      scores,
      recommendation,
      shouldReduceRisk: overallScore < 60,
      shouldIncreaseEfficiency: overallScore > 80
    };
  }

  scoreHealthFactor(hf) {
    if (hf < config.RISK_PARAMS.EMERGENCY_THRESHOLD) return 0.0; // Critical
    if (hf < config.RISK_PARAMS.SAFE_HEALTH_FACTOR) return 0.3;  // Warning
    if (hf < 1.7) return 0.6;  // Safe
    if (hf <= config.RISK_PARAMS.MAX_HEALTH_FACTOR) return 1.0; // Optimal
    return 0.8; // Too conservative
  }

  scoreVolatility(volatility) {
    const scores = {
      'VERY_LOW': 1.0,
      'LOW': 0.8,
      'MEDIUM': 0.6,
      'HIGH': 0.3
    };
    return scores[volatility] || 0.6;
  }

  scoreUtilization(rate) {
    if (rate < 50) return 1.0;  // Low utilization, safe
    if (rate < 70) return 0.8;  // Normal
    if (rate < 85) return 0.6;  // Getting high
    if (rate < 95) return 0.3;  // High risk
    return 0.1; // Very high risk
  }

  scoreBorrowRate(rate) {
    if (rate < 5) return 1.0;   // Low rates, good
    if (rate < 8) return 0.8;   // Normal
    if (rate < 12) return 0.6;  // Getting expensive
    if (rate < 15) return 0.3;  // High rates
    return 0.1; // Very high rates
  }

  scoreDepegRisk(prices) {
    const premium = ((prices.stKAIA - prices.KAIA) / prices.KAIA) * 100;
    const absDeviation = Math.abs(premium);
    
    if (absDeviation < 1) return 1.0;   // Tight peg
    if (absDeviation < 3) return 0.8;   // Acceptable
    if (absDeviation < 5) return 0.6;   // Concerning
    if (absDeviation < 10) return 0.3;  // High risk
    return 0.1; // Critical depeg
  }

  getRiskLevel(score) {
    if (score >= 80) return 'LOW';
    if (score >= 60) return 'MEDIUM';
    if (score >= 40) return 'HIGH';
    return 'CRITICAL';
  }

  getRecommendation(score, scores) {
    if (score < 40) {
      return 'URGENT: Reduce leverage immediately';
    }
    
    if (score < 60) {
      const issues = [];
      if (scores.healthFactor < 0.5) issues.push('low HF');
      if (scores.marketVolatility < 0.5) issues.push('high volatility');
      if (scores.utilizationRate < 0.5) issues.push('high utilization');
      
      return `Consider reducing risk due to: ${issues.join(', ')}`;
    }

    if (score > 85) {
      return 'Position very safe, can optimize for better returns';
    }

    return 'Risk levels acceptable, maintain current strategy';
  }

  adjustDecisionForRisk(decision, riskAssessment) {
    // If risk is too high, override to safer action
    if (riskAssessment.riskLevel === 'CRITICAL') {
      if (decision.action === 'LEVERAGE_UP') {
        console.log('⚠️  Risk override: Changing LEVERAGE_UP to HOLD due to critical risk');
        return {
          ...decision,
          action: 'HOLD',
          reasoning: `Risk override: ${riskAssessment.recommendation}. Original: ${decision.reasoning}`,
          riskLevel: 'CRITICAL'
        };
      }
    }

    if (riskAssessment.riskLevel === 'HIGH') {
      if (decision.action === 'LEVERAGE_UP') {
        console.log('⚠️  Risk override: Changing LEVERAGE_UP to LEVERAGE_DOWN due to high risk');
        return {
          ...decision,
          action: 'LEVERAGE_DOWN',
          reasoning: `Risk override: ${riskAssessment.recommendation}. Original: ${decision.reasoning}`,
          riskLevel: 'HIGH'
        };
      }
    }

    return decision;
  }
}

module.exports = RiskScoring;

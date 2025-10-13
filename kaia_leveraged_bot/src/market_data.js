const { ethers } = require('ethers');
const axios = require('axios');
const config = require('./config');

class MarketDataService {
  constructor() {
    this.apiBaseUrl = config.API_BASE_URL;
    this.provider = new ethers.JsonRpcProvider(config.RPC_URL);
    this.comptrollerAddress = '0x0B5f0Ba5F13eA4Cb9C8Ee48FB75aa22B451470C2';
    this.cStKaiaAddress = '0x0BC926EF3856542134B06DCf53c86005b08B9625';
    
    this.priceCache = {};
    this.lastFetch = 0;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    
    this.initContracts();
  }

  initContracts() {
    // Comptroller ABI
    const comptrollerABI = [
      "function markets(address) external view returns (bool, uint256, bool)",
      "function closeFactorMantissa() external view returns (uint256)",
      "function liquidationIncentiveMantissa() external view returns (uint256)"
    ];

    // CToken ABI  
    const cTokenABI = [
      "function borrowRatePerBlock() external view returns (uint256)",
      "function supplyRatePerBlock() external view returns (uint256)",
      "function totalBorrows() external view returns (uint256)",
      "function getCash() external view returns (uint256)",
      "function totalReserves() external view returns (uint256)"
    ];

    this.comptroller = new ethers.Contract(this.comptrollerAddress, comptrollerABI, this.provider);
    this.cStKaia = new ethers.Contract(this.cStKaiaAddress, cTokenABI, this.provider);
  }

  async getMarketData() {
    console.log('\n📈 MARKET DATA');
    console.log('='.repeat(50));

    const [prices, lendingRates, utilizationRate] = await Promise.all([
      this.getPrices(),
      this.getLendingRates(),
      this.getUtilizationRate()
    ]);

    const marketData = {
      timestamp: Date.now(),
      prices,
      lendingRates,
      utilizationRate,
      volatility: this.calculateVolatility(prices.KAIA)
    };

    console.log('💵 KAIA Price: $' + prices.KAIA.toFixed(4));
    console.log('💵 USDT Price: $' + prices.USDT.toFixed(4));
    console.log('💵 stKAIA Price: $' + prices.stKAIA.toFixed(4));
    console.log('📊 Borrow Rate: ' + lendingRates.borrow.toFixed(2) + '%');
    console.log('📊 Supply Rate: ' + lendingRates.supply.toFixed(2) + '%');
    console.log('📊 Utilization: ' + utilizationRate.toFixed(2) + '%');
    console.log('📈 Volatility: ' + marketData.volatility);
    console.log('='.repeat(50));

    return marketData;
  }

  async getPrices() {
    const now = Date.now();
    
    if (now - this.lastFetch < this.cacheDuration && Object.keys(this.priceCache).length > 0) {
      return this.priceCache;
    }

    try {
      const response = await axios.get(`${this.apiBaseUrl}/prices`, { timeout: 5000 });
      
      if (response.data && response.data.success) {
        const prices = {
          KAIA: this.extractPrice(response.data.data, 'KAIA'),
          USDT: 1.00,
          stKAIA: this.extractPrice(response.data.data, 'STAKED_KAIA')
        };

        // Validate prices
        if (prices.KAIA === 0) {
          console.error('❌ CRITICAL: KAIA price is 0!');
          throw new Error('Invalid KAIA price');
        }
        
        if (prices.USDT === 0) {
          console.error('❌ CRITICAL: USDT price is 0!');
          throw new Error('Invalid USDT price');
        }

        this.priceCache = prices;
        this.lastFetch = now;
        return prices;
      }
    } catch (error) {
      console.error('❌ Failed to fetch prices from API:', error.message);
      throw new Error('Cannot operate without valid prices');
    }
  }

  extractPrice(data, symbol) {
    if (Array.isArray(data)) {
      const item = data.find(p => p.symbol === symbol);
      if (item && item.price) {
        return parseFloat(item.price);
      }
    }
    return 0;
  }

  async getLendingRates() {
    try { 
      const [borrowRatePerBlock, supplyRatePerBlock] = await Promise.all([
        this.cStKaia.borrowRatePerBlock(),
        this.cStKaia.supplyRatePerBlock()
      ]);

      // Convert to APY (blocks per year on KAIA: ~31,536,000 / 1 second blocks)
      const blocksPerYear = 31536000;
      
      const borrowRate = parseFloat(ethers.formatUnits(borrowRatePerBlock, 18)) * blocksPerYear * 100;
      const supplyRate = parseFloat(ethers.formatUnits(supplyRatePerBlock, 18)) * blocksPerYear * 100;

      return {
        borrow: borrowRate,
        supply: supplyRate
      };
    } catch (error) {
      console.error('❌ Failed to fetch lending rates:', error.message);
      throw new Error('Cannot operate without lending rates');
    }
  }

  async getUtilizationRate() {
    try {
      const [totalBorrows, cash, reserves] = await Promise.all([
        this.cStKaia.totalBorrows(),
        this.cStKaia.getCash(),
        this.cStKaia.totalReserves()
      ]);

      const totalBorrowsNum = parseFloat(ethers.formatEther(totalBorrows));
      const cashNum = parseFloat(ethers.formatEther(cash));
      const reservesNum = parseFloat(ethers.formatEther(reserves));

      // Utilization = totalBorrows / (cash + totalBorrows - reserves)
      const denominator = cashNum + totalBorrowsNum - reservesNum;
      
      if (denominator === 0) {
        return 0;
      }

      const utilization = (totalBorrowsNum / denominator) * 100;
      return Math.min(utilization, 100); // Cap at 100%
    } catch (error) {
      console.error('❌ Failed to fetch utilization rate:', error.message);
      throw new Error('Cannot operate without utilization rate');
    }
  }

  calculateVolatility(price) {
    // Simple volatility indicator based on price
    if (price < 0.10) return 'HIGH';
    if (price < 0.15) return 'MEDIUM';
    if (price < 0.20) return 'LOW';
    return 'VERY_LOW';
  }

  getMarketCondition(marketData) {
    const { prices, lendingRates, utilizationRate, volatility } = marketData;

    let condition = 'NORMAL';
    let factors = [];

    // Check volatility
    if (volatility === 'HIGH') {
      condition = 'VOLATILE';
      factors.push('High volatility detected');
    }

    // Check borrow rate
    if (lendingRates.borrow > 10) {
      condition = 'HIGH_RATES';
      factors.push('High borrow rates');
    }

    // Check utilization
    if (utilizationRate > 85) {
      condition = 'HIGH_UTILIZATION';
      factors.push('High pool utilization');
    }

    // Check price stability
    const stKaiaPremium = ((prices.stKAIA - prices.KAIA) / prices.KAIA) * 100;
    if (Math.abs(stKaiaPremium) > 5) {
      condition = 'DEPEG_RISK';
      factors.push('stKAIA/KAIA peg unstable');
    }

    return {
      condition,
      factors,
      recommendation: this.getRecommendation(condition)
    };
  }

  getRecommendation(condition) {
    const recommendations = {
      'NORMAL': 'Continue normal operations',
      'VOLATILE': 'Reduce leverage, increase safety buffer',
      'HIGH_RATES': 'Consider reducing borrow position',
      'HIGH_UTILIZATION': 'Be cautious, liquidity may be limited',
      'DEPEG_RISK': 'Monitor stKAIA peg closely, reduce exposure'
    };

    return recommendations[condition] || 'Monitor closely';
  }
}

module.exports = MarketDataService;

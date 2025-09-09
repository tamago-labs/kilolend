const axios = require('axios');

/**
 * Price Manager
 * Handles fetching and caching of token prices
 */
class PriceManager {
  constructor(priceApiUrl) {
    this.priceApiUrl = priceApiUrl;
    this.priceCache = {
      data: {},
      lastUpdate: 0,
      cacheDuration: 5 * 60 * 1000 // 5 minutes cache
    };
  }

  async fetchPrices() {
    try {
      const now = Date.now();
      if (now - this.priceCache.lastUpdate < this.priceCache.cacheDuration) {
        return this.priceCache.data;
      }

      const response = await axios.get(this.priceApiUrl, {
        timeout: 10000
      });
      
      if (!response.data || !response.data.success) {
        throw new Error('API response indicates failure');
      }
      
      const prices = {
        'USDT': 1.0 // USDT is always $1.00 (stablecoin)
      };
      const priceData = response.data.data;
      
      for (const item of priceData) {
        const symbol = item.symbol;
        
        if (symbol === 'MARBLEX') {
          prices['MBX'] = item.price;
        } else if (symbol !== 'USDT') {
          prices[symbol] = item.price;
        }
      }
      
      this.priceCache.data = prices;
      this.priceCache.lastUpdate = now;
      
      console.log(`✅ Successfully fetched ${Object.keys(prices).length} prices`);
      console.log(`   💰 USDT: $1.00 (stablecoin - hardcoded)`);
      for (const [symbol, price] of Object.entries(prices)) {
        if (symbol !== 'USDT') {
          console.log(`   💰 ${symbol}: $${price}`);
        }
      }
      
      return prices;
      
    } catch (error) {
      console.error('❌ Failed to fetch prices:', error.message);
      if (Object.keys(this.priceCache.data).length > 0) {
        console.log('⚠️  Using cached prices');
        return this.priceCache.data;
      }
      
      console.log('⚠️  Using emergency fallback prices');
      return { 'USDT': 1.0 };
    }
  }

  async getTokenPrice(underlyingSymbol) {
    try {
      const prices = await this.fetchPrices();
      
      if (underlyingSymbol === 'USDT') {
        return 1.0;
      }
      
      return prices[underlyingSymbol] || 0;
    } catch (error) {
      console.warn(`⚠️  Failed to get price for ${underlyingSymbol}:`, error.message);
      
      if (underlyingSymbol === 'USDT') {
        return 1.0;
      }
      
      return 0;
    }
  }
}
 
module.exports = PriceManager;
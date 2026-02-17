const axios = require('axios');

/**
 * Database Service for KiloLend Unified Bot
 * Handles storing daily summaries, fetching users, and API interactions
 */
class DatabaseService {
  constructor(options = {}) {
    this.apiBaseUrl = process.env.API_BASE_URL || options.apiBaseUrl;
    this.apiKey = process.env.API_KEY || options.apiKey;
    this.timeout = options.timeout || 10000; // 10 second timeout
    this.minKiloThreshold = parseInt(process.env.MIN_KILO_THRESHOLD || '3');
  }

  /**
   * Filter distributions to remove users with 0 or very small KILO amounts
   */
  filterDistributions(distributions) {
    const originalCount = distributions.length;
    
    const filteredDistributions = distributions.filter(distribution => {
      const kiloAmount = Math.floor(distribution.kilo);
      
      // Filter out users with 0 KILO or amounts below threshold
      if (kiloAmount === 0) {
        return false;
      }
      
      if (kiloAmount <= this.minKiloThreshold) {
        return false;
      }
      
      return true;
    });
    
    const filteredCount = originalCount - filteredDistributions.length;
    
    if (filteredCount > 0) {
      console.log(`🔍 Filtered ${filteredCount} users with ≤${this.minKiloThreshold} KILO (including 0 KILO users)`);
      console.log(`📊 Reduced from ${originalCount} to ${filteredDistributions.length} users for database storage`);
    }
    
    return filteredDistributions;
  }

  /**
   * Store daily summary to leaderboard database
   */
  async storeDailySummary(date, distributions, summary) {
    try {
      if (!this.apiBaseUrl) {
        console.warn('⚠️  API_BASE_URL not configured, skipping database storage');
        return null;
      }

      if (!distributions || distributions.length === 0) {
        console.log('📝 No distributions to store for', date);
        return null;
      }

      console.log(`💾 Storing leaderboard to database for ${date}...`);
      console.log(`📊 ${distributions.length} total users calculated`);
      
      // Filter out users with 0 KILO or very small amounts
      const filteredDistributions = this.filterDistributions(distributions);
      
      if (filteredDistributions.length === 0) {
        console.log('📝 No users meet minimum KILO threshold for storage');
        return null;
      }
      
      console.log(`📊 ${filteredDistributions.length} users to store after filtering`);

      // Sanitize payload for large numbers
      const sanitizedDistributions = filteredDistributions.map(distribution => {
        const sanitized = { ...distribution };
        
        // Ensure balance breakdown numbers are strings
        if (sanitized.balanceBreakdown) {
          Object.keys(sanitized.balanceBreakdown).forEach(market => {
            const marketData = sanitized.balanceBreakdown[market];
            if (marketData.userBalance !== undefined && typeof marketData.userBalance !== 'string') {
              marketData.userBalance = marketData.userBalance.toString();
            }
            if (marketData.totalSupply !== undefined && typeof marketData.totalSupply !== 'string') {
              marketData.totalSupply = marketData.totalSupply.toString();
            }
          });
        }
        
        return sanitized;
      });

      const payload = {
        date,
        distributions: sanitizedDistributions,
        summary: {
          totalUsers: filteredDistributions.length,
          totalKiloDistributed: filteredDistributions.reduce((sum, d) => sum + d.kilo, 0),
          topUser: filteredDistributions[0] ? {
            address: filteredDistributions[0].address,
            kilo: Math.floor(filteredDistributions[0].kilo)
          } : null,
          ...summary
        }
      };

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add API key if available
      if (this.apiKey) {
        headers['X-Api-Key'] = this.apiKey;
      }

      const response = await axios.post(
        `${this.apiBaseUrl}/leaderboard`,
        payload,
        {
          timeout: this.timeout,
          headers
        }
      );

      if (response.data && response.data.success) {
        console.log('✅ Leaderboard stored successfully');
        console.log(`📍 Save for ${date} with ${response.data.data.usersStored} users`);
        console.log(`💰 Total KILO: ${response.data.data.totalKilo.toLocaleString()}`);
        return response.data;
      } else {
        console.error('❌ Failed to store leaderboard:', response.data);
        return null;
      }

    } catch (error) {
      console.error('❌ Error storing leaderboard:', error.message);
      
      if (error.response) {
        console.error('📍 Response status:', error.response.status);
        console.error('📍 Response data:', error.response.data);
      }
      
      return null;
    }
  }

  /**
   * Get leaderboard for a specific date
   */
  async getLeaderboard(date = null) {
    try {
      if (!this.apiBaseUrl) {
        console.warn('⚠️  API_BASE_URL not configured');
        return null;
      }

      const url = date 
        ? `${this.apiBaseUrl}/leaderboard/${date}`
        : `${this.apiBaseUrl}/leaderboard`;

      const response = await axios.get(url, {
        timeout: this.timeout
      });

      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        console.error('❌ Failed to get leaderboard:', response.data);
        return null;
      }

    } catch (error) {
      console.error('❌ Error getting leaderboard:', error.message);
      return null;
    }
  }

  /**
   * Get user total points
   */
  async getUserPoints(userAddress) {
    try {
      if (!this.apiBaseUrl) {
        console.warn('⚠️  API_BASE_URL not configured');
        return null;
      }

      const response = await axios.get(
        `${this.apiBaseUrl}/users/${userAddress}`,
        {
          timeout: this.timeout
        }
      );

      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        return {
          userAddress,
          totalKilo: 0,
          lastUpdated: null
        };
      }

    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          userAddress,
          totalKilo: 0,
          lastUpdated: null
        };
      }
      
      console.error('❌ Error getting user points:', error.message);
      return null;
    }
  }

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      if (!this.apiBaseUrl) {
        console.log('⚠️  Database not configured (API_BASE_URL missing)');
        console.log('💡 Add API_BASE_URL to .env to enable database storage');
        return false;
      }

      console.log('🔍 Testing database connection...');
      
      const today = new Date().toISOString().split('T')[0];

      const response = await axios.get(
        `${this.apiBaseUrl}/leaderboard/${today}`,
        {
          timeout: 5000
        }
      );

      console.log('✅ Database connection successful');
      console.log(`📍 API URL: ${this.apiBaseUrl}`);
      return true;

    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log('❌ Database connection failed - API server not reachable');
        console.log(`📍 Attempted URL: ${this.apiBaseUrl}`);
      } else if (error.response && error.response.status === 404) {
        console.log('✅ Database connection successful (API running)');
        console.log(`📍 API URL: ${this.apiBaseUrl}`);
        return true;
      } else {
        console.log('❌ Database connection test failed:', error.message);
      }
      
      console.log('💡 Bot will continue without database storage');
      return false;
    }
  }

  /**
   * Get all users in the system
   */
  async getAllUsers() {
    try {
      if (!this.apiBaseUrl) {
        console.warn('⚠️  API_BASE_URL not configured');
        return [];
      }

      console.log('🔍 Fetching all users from API...');
      
      const response = await axios.get(
        `${this.apiBaseUrl}/all`,
        {
          timeout: this.timeout
        }
      );

      if (response.data && response.data.success && response.data.data) {
        const users = response.data.data.map(user => user.userAddress);
        console.log(`✅ Found ${users.length} users in the system`);
        return users;
      } else {
        console.log('⚠️  No users found or invalid response format');
        return [];
      }

    } catch (error) {
      console.error('❌ Error fetching all users:', error.message);
      if (error.response) {
        console.error('📍 Response status:', error.response.status);
        console.error('📍 Response data:', error.response.data);
      }
      return [];
    }
  }

  /**
   * Get configuration info
   */
  getConfig() {
    return {
      apiBaseUrl: this.apiBaseUrl,
      apiKeyConfigured: !!this.apiKey,
      timeout: this.timeout,
      configured: !!this.apiBaseUrl
    };
  }
}

module.exports = DatabaseService;
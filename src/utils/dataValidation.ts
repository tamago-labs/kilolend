/**
 * Data Validation Utilities
 * Ensures data integrity and prevents fake/invalid data from being processed
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: any;
}

export interface MarketDataValidation {
  supplyAPY?: number;
  borrowAPR?: number;
  utilization?: number;
  totalSupply?: number;
  totalBorrow?: number;
  price?: number;
  priceChange24h?: number;
}

export interface PortfolioValidation {
  totalSupplied?: number;
  totalBorrowed?: number;
  healthFactor?: number;
  netAPY?: number;
  positions?: any[];
}

/**
 * Validates market data to ensure it's safe to use
 */
export function validateMarketData(data: MarketDataValidation): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sanitized: MarketDataValidation = {};

  // Validate supply APY
  if (data.supplyAPY !== undefined) {
    if (typeof data.supplyAPY !== 'number' || isNaN(data.supplyAPY)) {
      errors.push('Supply APY must be a valid number');
    } else if (data.supplyAPY < 0) {
      errors.push('Supply APY cannot be negative');
    } else if (data.supplyAPY > 100) {
      warnings.push('Supply APY seems unusually high (>100%)');
      sanitized.supplyAPY = Math.min(data.supplyAPY, 100); // Cap at 100%
    } else {
      sanitized.supplyAPY = data.supplyAPY;
    }
  }

  // Validate borrow APR
  if (data.borrowAPR !== undefined) {
    if (typeof data.borrowAPR !== 'number' || isNaN(data.borrowAPR)) {
      errors.push('Borrow APR must be a valid number');
    } else if (data.borrowAPR < 0) {
      errors.push('Borrow APR cannot be negative');
    } else if (data.borrowAPR > 100) {
      warnings.push('Borrow APR seems unusually high (>100%)');
      sanitized.borrowAPR = Math.min(data.borrowAPR, 100); // Cap at 100%
    } else {
      sanitized.borrowAPR = data.borrowAPR;
    }
  }

  // Validate utilization
  if (data.utilization !== undefined) {
    if (typeof data.utilization !== 'number' || isNaN(data.utilization)) {
      errors.push('Utilization must be a valid number');
    } else if (data.utilization < 0 || data.utilization > 100) {
      errors.push('Utilization must be between 0 and 100');
    } else {
      sanitized.utilization = data.utilization;
    }
  }

  // Validate total supply
  if (data.totalSupply !== undefined) {
    if (typeof data.totalSupply !== 'number' || isNaN(data.totalSupply)) {
      errors.push('Total supply must be a valid number');
    } else if (data.totalSupply < 0) {
      errors.push('Total supply cannot be negative');
    } else {
      sanitized.totalSupply = data.totalSupply;
    }
  }

  // Validate total borrow
  if (data.totalBorrow !== undefined) {
    if (typeof data.totalBorrow !== 'number' || isNaN(data.totalBorrow)) {
      errors.push('Total borrow must be a valid number');
    } else if (data.totalBorrow < 0) {
      errors.push('Total borrow cannot be negative');
    } else {
      sanitized.totalBorrow = data.totalBorrow;
    }
  }

  // Validate price
  if (data.price !== undefined) {
    if (typeof data.price !== 'number' || isNaN(data.price)) {
      errors.push('Price must be a valid number');
    } else if (data.price <= 0) {
      errors.push('Price must be positive');
    } else {
      sanitized.price = data.price;
    }
  }

  // Validate price change
  if (data.priceChange24h !== undefined) {
    if (typeof data.priceChange24h !== 'number' || isNaN(data.priceChange24h)) {
      errors.push('Price change must be a valid number');
    } else if (Math.abs(data.priceChange24h) > 100) {
      warnings.push('Price change seems extreme (>100%)');
      sanitized.priceChange24h = Math.max(-100, Math.min(100, data.priceChange24h));
    } else {
      sanitized.priceChange24h = data.priceChange24h;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitized
  };
}

/**
 * Validates portfolio data to ensure it's safe to use
 */
export function validatePortfolioData(data: PortfolioValidation): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sanitized: PortfolioValidation = {};

  // Validate total supplied
  if (data.totalSupplied !== undefined) {
    if (typeof data.totalSupplied !== 'number' || isNaN(data.totalSupplied)) {
      errors.push('Total supplied must be a valid number');
    } else if (data.totalSupplied < 0) {
      errors.push('Total supplied cannot be negative');
    } else {
      sanitized.totalSupplied = data.totalSupplied;
    }
  }

  // Validate total borrowed
  if (data.totalBorrowed !== undefined) {
    if (typeof data.totalBorrowed !== 'number' || isNaN(data.totalBorrowed)) {
      errors.push('Total borrowed must be a valid number');
    } else if (data.totalBorrowed < 0) {
      errors.push('Total borrowed cannot be negative');
    } else {
      sanitized.totalBorrowed = data.totalBorrowed;
    }
  }

  // Validate health factor
  if (data.healthFactor !== undefined) {
    if (typeof data.healthFactor !== 'number' || isNaN(data.healthFactor)) {
      errors.push('Health factor must be a valid number');
    } else if (data.healthFactor < 0) {
      errors.push('Health factor cannot be negative');
    } else if (data.healthFactor > 999) {
      warnings.push('Health factor seems unusually high');
      sanitized.healthFactor = Math.min(data.healthFactor, 999);
    } else {
      sanitized.healthFactor = data.healthFactor;
    }
  }

  // Validate net APY
  if (data.netAPY !== undefined) {
    if (typeof data.netAPY !== 'number' || isNaN(data.netAPY)) {
      errors.push('Net APY must be a valid number');
    } else if (Math.abs(data.netAPY) > 100) {
      warnings.push('Net APY seems extreme');
      sanitized.netAPY = Math.max(-100, Math.min(100, data.netAPY));
    } else {
      sanitized.netAPY = data.netAPY;
    }
  }

  // Validate positions array
  if (data.positions !== undefined) {
    if (!Array.isArray(data.positions)) {
      errors.push('Positions must be an array');
    } else {
      const validPositions = data.positions.filter(pos => {
        return pos && 
               typeof pos.marketId === 'string' &&
               typeof pos.type === 'string' &&
               typeof pos.usdValue === 'number' &&
               pos.usdValue >= 0;
      });

      if (validPositions.length !== data.positions.length) {
        warnings.push('Some positions were filtered out due to invalid data');
      }

      sanitized.positions = validPositions;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitized
  };
}

/**
 * Validates API response to ensure it contains expected data structure
 */
export function validateApiResponse(response: any, expectedFields: string[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!response || typeof response !== 'object') {
    errors.push('Response must be a valid object');
    return { isValid: false, errors, warnings };
  }

  expectedFields.forEach(field => {
    if (!(field in response)) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: response
  };
}

/**
 * Sanitizes numeric values to prevent NaN and Infinity
 */
export function sanitizeNumber(value: any, defaultValue: number = 0): number {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return value;
}

/**
 * Validates and sanitizes a complete market dataset
 */
export function validateMarketDataset(markets: any[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sanitizedMarkets: any[] = [];

  if (!Array.isArray(markets)) {
    errors.push('Market data must be an array');
    return { isValid: false, errors, warnings };
  }

  markets.forEach((market, index) => {
    const validation = validateMarketData(market);
    
    if (!validation.isValid) {
      errors.push(`Market ${index}: ${validation.errors.join(', ')}`);
    } else {
      if (validation.warnings.length > 0) {
        warnings.push(`Market ${index}: ${validation.warnings.join(', ')}`);
      }
      
      // Merge original data with sanitized data
      sanitizedMarkets.push({
        ...market,
        ...validation.sanitizedData
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitizedMarkets
  };
}

/**
 * Creates a safe data wrapper that prevents access to invalid data
 */
export function createSafeDataWrapper<T>(data: T, validator: (data: T) => ValidationResult): T {
  const validation = validator(data);
  
  if (!validation.isValid) {
    console.error('Data validation failed:', validation.errors);
    throw new Error(`Invalid data: ${validation.errors.join(', ')}`);
  }

  if (validation.warnings.length > 0) {
    console.warn('Data validation warnings:', validation.warnings);
  }

  return validation.sanitizedData || data;
}

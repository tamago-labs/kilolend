// KAIA Kairos Testnet Configuration
export const KAIA_TESTNET_CONFIG = {
  chainId: 1001,
  chainName: 'Kaia Kairos Testnet',
  rpcUrl: 'https://public-en-kairos.node.kaia.io',
  blockExplorer: 'https://kairos.kaiascope.com',
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA',
    decimals: 18
  }
};

// Smart Contract Addresses on Kaia Kairos Testnet
export const CONTRACT_ADDRESSES = {
  // Main Contracts
  PriceOracle: '0xe5209A4f622C6eD2C158dcCcdDB69B05f9D0E4E0',
  InterestRateModel: '0x0Ee774bF5793b51C9c52decde8C07b783c42Df96',
  
  // Market Contracts
  USDTMarket: '0xA657b300009802Be7c88617128545534aCA12dbe',
  KRWMarket: '0xE53048D2D19338A294395D8A7f780E44A9379925',
  THBMarket: '0xd91Fd5c773C24Cc27D39c86EfEb3bfF57eF36F99',
  JPYMarket: '0x3c4151361e9718b45409B803B6a9Ee623DBF59FE',
  
  // Token Contracts - Fixed order based on deployment
  USDT: '0x16EE94e3C07B24EbA6067eb9394BA70178aAc4c0', // 6 decimals
  KRW: '0xf2260B00250c772CB64606dBb88d9544F709308C',  // 0 decimals
  JPY: '0xFa15adECD1CC94bd17cf48DD3b41F066FE2812a7',  // 0 decimals  
  THB: '0x576430Ecadbd9729B32a4cA9Fed9F38331273924',  // 2 decimals
  
  // Collateral Tokens
  stKAIA: '0x65e38111d8e2561aDC0E2EA1eeA856E6a43dC892', // 18 decimals
  wKAIA: '0x553588e084604a2677e10E46ea0a8A8e9D859146',  // 18 decimals
};

// Market Configuration
export const MARKET_CONFIG = {
  usdt: {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    icon: '💰',
    marketAddress: CONTRACT_ADDRESSES.USDTMarket,
    tokenAddress: CONTRACT_ADDRESSES.USDT,
    decimals: 6,
    isActive: true,
    description: 'USD-pegged stablecoin for secure lending'
  },
  krw: {
    id: 'krw',
    name: 'Korean Won',
    symbol: 'KRW',
    icon: '🏦',
    marketAddress: CONTRACT_ADDRESSES.KRWMarket,
    tokenAddress: CONTRACT_ADDRESSES.KRW,
    decimals: 0, // Fixed: KRW has 0 decimals
    isActive: true,
    description: 'Korean Won stablecoin market'
  },
  jpy: {
    id: 'jpy',
    name: 'Japanese Yen',
    symbol: 'JPY',
    icon: '🏯',
    marketAddress: CONTRACT_ADDRESSES.JPYMarket,
    tokenAddress: CONTRACT_ADDRESSES.JPY,
    decimals: 0, // Fixed: JPY has 0 decimals
    isActive: true,
    description: 'Japanese Yen market'
  },
  thb: {
    id: 'thb',
    name: 'Thai Baht',
    symbol: 'THB',
    icon: '🐘',
    marketAddress: CONTRACT_ADDRESSES.THBMarket,
    tokenAddress: CONTRACT_ADDRESSES.THB,
    decimals: 2, // Fixed: THB has 2 decimals
    isActive: true,
    description: 'Thai Baht market'
  },
  stkaia: {
    id: 'stkaia',
    name: 'Staked KAIA',
    symbol: 'stKAIA',
    icon: '🔥',
    marketAddress: null, // Collateral only
    tokenAddress: CONTRACT_ADDRESSES.stKAIA,
    decimals: 18,
    isActive: true,
    isCollateralOnly: true,
    description: 'Liquid staked KAIA tokens with higher yields'
  },
  wkaia: {
    id: 'wkaia',
    name: 'Wrapped KAIA',
    symbol: 'wKAIA',
    icon: '⚡',
    marketAddress: null, // Collateral only
    tokenAddress: CONTRACT_ADDRESSES.wKAIA,
    decimals: 18,
    isActive: true,
    isCollateralOnly: true,
    description: 'Wrapped KAIA for DeFi applications'
  }
};

// Gas Configuration
export const GAS_CONFIG = {
  // Standard gas limits for different operations
  APPROVE: 60000,
  SUPPLY: 150000,
  WITHDRAW: 180000,
  BORROW: 200000,
  REPAY: 150000,
  DEPOSIT_COLLATERAL: 120000,
  WITHDRAW_COLLATERAL: 150000,
  LIQUIDATE: 300000,
  
  // Gas price (in Gwei)
  DEFAULT_GAS_PRICE: 25, // 25 Gwei
  
  // Buffer multiplier for gas estimation
  GAS_BUFFER: 1.2
};

// Protocol Constants
export const PROTOCOL_CONFIG = {
  // LTV ratios (basis points, 10000 = 100%)
  WKAIA_LTV: 6000,        // 60%
  STKAIA_LTV: 6500,       // 65%
  
  // Liquidation threshold and penalty
  LIQUIDATION_THRESHOLD: 8000,  // 80%
  LIQUIDATION_PENALTY: 1000,    // 10%
  
  // Protocol fee
  PROTOCOL_FEE: 500,      // 5%
  
  // Minimum amounts per token (adjusted for decimals)
  MIN_COLLATERAL: '1000000000000000000', // 1 KAIA/stKAIA in wei (18 decimals)
  MIN_BORROW_USDT: '1000000',             // 1 USDT (6 decimals)
  MIN_BORROW_KRW: '1000',                    // 1000 KRW (0 decimals)
  MIN_BORROW_JPY: '1000',                    // 1000 JPY (0 decimals)
  MIN_BORROW_THB: '10000',                  // 100 THB (2 decimals)
};

export type MarketId = keyof typeof MARKET_CONFIG;
export type ContractName = keyof typeof CONTRACT_ADDRESSES;

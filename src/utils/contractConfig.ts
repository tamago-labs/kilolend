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

// Smart Contract Addresses on Kaia Kairos Testnet - Updated with deployed contracts
export const CONTRACT_ADDRESSES = {
  // Main Contracts
  Comptroller: '0xA4d31FAD3D2b0b2777F639e6FBe125368Fd4d845',
  KiloOracle: '0xF0b8eaEeBe416Ec43f79b0c83CCc5670d2b7C3Db',
  StablecoinJumpRateModel: '0x216ecf2825a654849D4076f7A616B9Caaf0C6E04',
  VolatileRateModel: '0x1C0bf077BFCfC103B375dDe63F9f2FbF6eA7d8a0',
  CollateralRateModel: '0x0213468b5ED54826b363bbC4A90BBc0A5f972c39',
  
  // cToken Market Contracts
  cUSDT: '0x3466441C38D2F76405085b730268240E4F2d0D25', // Stablecoin
  cSIX: '0x772195938d86fcf500dF18563876d7Cefcf47e4D',  // Volatile
  cBORA: '0x260fC7251fAe677B6254773d347121862336fb9f', // Volatile
  cMBX: '0x10bB22532eC21Fd25719565f440b0322c010bDF3',  // Volatile
  cKAIA: '0xf13D09eD3cbdD1C930d4de74808de1f33B6b3D4f', // Collateral Only
  
  // Underlying Token Contracts (will be fetched from cTokens)
  USDT: '0x5F7392Ec616F829Ab54092e7F167F518835Ac740', // 6 decimals
  SIX: '0xe438E6157Ad6e38A8528fd68eBf5d8C4F57420eC',  // 18 decimals
  BORA: '0xFdB35092c0cf5e1A5175308CB312613972C3DF3D', // 18 decimals
  MBX: '0xCeB75a9a4Af613afd42BD000893eD16fB1F0F057',  // 18 decimals
  KAIA: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',   // Native KAIA
};

// Market Configuration - Updated to match deployed contracts
export const MARKET_CONFIG = {
  usdt: {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    marketAddress: CONTRACT_ADDRESSES.cUSDT,
    tokenAddress: CONTRACT_ADDRESSES.USDT,
    decimals: 6,
    isActive: true,
    isCollateralOnly: false,
    description: 'USD-pegged stablecoin for secure lending',
    interestModel: 'Stablecoin'
  },
  six: {
    id: 'six',
    name: 'SIX Token',
    symbol: 'SIX',
    icon: 'https://cryptologos.cc/logos/six-six-logo.png',
    marketAddress: CONTRACT_ADDRESSES.cSIX,
    tokenAddress: CONTRACT_ADDRESSES.SIX,
    decimals: 18,
    isActive: true,
    isCollateralOnly: false,
    description: 'SIX Network utility token',
    interestModel: 'Volatile'
  },
  bora: {
    id: 'bora',
    name: 'BORA Token',
    symbol: 'BORA',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5222.png',
    marketAddress: CONTRACT_ADDRESSES.cBORA,
    tokenAddress: CONTRACT_ADDRESSES.BORA,
    decimals: 18,
    isActive: true,
    isCollateralOnly: false,
    description: 'BORA gaming ecosystem token',
    interestModel: 'Volatile'
  },
  mbx: {
    id: 'mbx',
    name: 'MARBLEX Token',
    symbol: 'MBX',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/9170.png',
    marketAddress: CONTRACT_ADDRESSES.cMBX,
    tokenAddress: CONTRACT_ADDRESSES.MBX,
    decimals: 18,
    isActive: true,
    isCollateralOnly: false,
    description: 'MARBLEX gaming platform token',
    interestModel: 'Volatile'
  },
  kaia: {
    id: 'kaia',
    name: 'KAIA',
    symbol: 'KAIA',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/28007.png',
    marketAddress: CONTRACT_ADDRESSES.cKAIA,
    tokenAddress: CONTRACT_ADDRESSES.KAIA,
    decimals: 18,
    isActive: true,
    isCollateralOnly: true,
    description: 'Native KAIA token - collateral only',
    interestModel: 'Collateral'
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
  KAIA_LTV: 7500,         // 75%
  
  // Liquidation threshold and penalty
  LIQUIDATION_THRESHOLD: 8000,  // 80%
  LIQUIDATION_PENALTY: 1000,    // 10%
  
  // Protocol fee
  PROTOCOL_FEE: 500,      // 5%
  
  // Minimum amounts per token (adjusted for decimals)
  MIN_COLLATERAL: '1000000000000000000', // 1 KAIA in wei (18 decimals)
  MIN_BORROW_USDT: '1000000',             // 1 USDT (6 decimals)
  MIN_BORROW_SIX: '1000000000000000000',  // 1 SIX (18 decimals)
  MIN_BORROW_BORA: '1000000000000000000', // 1 BORA (18 decimals)
  MIN_BORROW_MBX: '1000000000000000000',  // 1 MBX (18 decimals)
};

export type MarketId = keyof typeof MARKET_CONFIG;
export type ContractName = keyof typeof CONTRACT_ADDRESSES;

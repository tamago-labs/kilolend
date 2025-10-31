
export const KAIA_MAINNET_CONFIG = {
  chainId: 8217,
  chainName: 'Kaia Mainnet', 
  rpcUrl: 'https://public-en.node.kaia.io',
  blockExplorer: 'https://kaiascan.io',
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA', 
    decimals: 18
  }
}

// Smart Contract Addresses on Kaia
export const CONTRACT_ADDRESSES = {
  // Main Contracts
  Comptroller: '0x0B5f0Ba5F13eA4Cb9C8Ee48FB75aa22B451470C2',
  KiloOracle: '0xBB265F42Cce932c5e383536bDf50B82e08eaf454',
  StablecoinJumpRateModel: '0x792ecD8E829ca66DE9a744F7a6C17F4B76FE932e',
  VolatileRateModel: '0x741AD28811a05845D1de298860F796a54CaE2130',
  CollateralRateModel: '0x0FB331ed4abE0A2D7da880c6D81C42436B5abAC6',
  
  // cToken Market Contracts
  cUSDT: '0x498823F094f6F2121CcB4e09371a57A96d619695', // Stablecoin
  cSIX: '0xC468dFD0C96691035B3b1A4CA152Cb64F0dbF64c',  // Volatile
  cBORA: '0x7a937C07d49595282c711FBC613c881a83B9fDFD', // Volatile
  cMBX: '0xE321e20F0244500A194543B1EBD8604c02b8fA85',  // Volatile
  cKAIA: '0x98Ab86C97Ebf33D28fc43464353014e8c9927aB3', // Volatile
  
  // Underlying Token Contracts 
  USDT: '0xd077A400968890Eacc75cdc901F0356c943e4fDb', // 6 decimals
  SIX: '0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435',  // 18 decimals
  BORA: '0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa', // 18 decimals
  MBX: '0xD068c52d81f4409B9502dA926aCE3301cc41f623',  // 18 decimals
  KAIA: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',   // Native KAIA
};


// Smart Contract Addresses on Kaia
export const CONTRACT_ADDRESSES_V1 = {
  // Main Contracts
  Comptroller: '0x2591d179a0B1dB1c804210E111035a3a13c95a48',
  KiloOracle: '0xE370336C3074E76163b2f9B07876d0Cb3425488D',
  StablecoinJumpRateModel: '0x9948DFaC28D39c2EeDB7543E24c28df2922568A6',
  VolatileRateModel: '0x836B1A7A6996cC04bA2387e691c7947679A1eF0d',
  
  // cToken Market Contracts
  cUSDT: '0x20A2Cbc68fbee094754b2F03d15B1F5466f1F649', // Stablecoin
  cSIX: '0x287770f1236AdbE3F4dA4f29D0f1a776f303C966',  // Volatile
  cBORA: '0xA7247a6f5EaC85354642e0E90B515E2dC027d5F4', // Volatile
  cMBX: '0xa024B1DE3a6022FB552C2ED9a8050926Fb22d7b6',  // Volatile
  cKAIA: '0x2029f3E3C667EBd68b1D29dbd61dc383BdbB56e5', // Volatile
  
  // Underlying Token Contracts 
  USDT: '0xd077A400968890Eacc75cdc901F0356c943e4fDb', // 6 decimals
  SIX: '0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435',  // 18 decimals
  BORA: '0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa', // 18 decimals
  MBX: '0xD068c52d81f4409B9502dA926aCE3301cc41f623',  // 18 decimals
  KAIA: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',   // Native KAIA
};

// Market Configuration  
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
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3327.png',
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
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3801.png',
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
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/18895.png',
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
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
    marketAddress: CONTRACT_ADDRESSES.cKAIA,
    tokenAddress: CONTRACT_ADDRESSES.KAIA,
    decimals: 18,
    isActive: true,
    isCollateralOnly: false,
    description: 'Native KAIA token',
    interestModel: 'Stablecoin'
  },
  "staked-kaia": {
    id: 'staked-kaia',
    name: 'Lair Staked KAIA',
    symbol: 'stKAIA',
    icon: 'https://assets.coingecko.com/coins/images/40001/standard/token_stkaia.png',
    marketAddress: "0x0BC926EF3856542134B06DCf53c86005b08B9625",
    tokenAddress: "0x42952b873ed6f7f0a7e4992e2a9818e3a9001995",
    decimals: 18,
    isActive: true,
    isCollateralOnly: false,
    description: 'Lair Staked KAIA',
    interestModel: 'Stablecoin'
  }
};

export const MARKET_CONFIG_V1 = {
  usdt: {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    marketAddress: CONTRACT_ADDRESSES_V1.cUSDT,
    tokenAddress: CONTRACT_ADDRESSES_V1.USDT,
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
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3327.png',
    marketAddress: CONTRACT_ADDRESSES_V1.cSIX,
    tokenAddress: CONTRACT_ADDRESSES_V1.SIX,
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
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3801.png',
    marketAddress: CONTRACT_ADDRESSES_V1.cBORA,
    tokenAddress: CONTRACT_ADDRESSES_V1.BORA,
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
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/18895.png',
    marketAddress: CONTRACT_ADDRESSES_V1.cMBX,
    tokenAddress: CONTRACT_ADDRESSES_V1.MBX,
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
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
    marketAddress: CONTRACT_ADDRESSES_V1.cKAIA,
    tokenAddress: CONTRACT_ADDRESSES_V1.KAIA,
    decimals: 18,
    isActive: true,
    isCollateralOnly: false,
    description: 'Native KAIA token',
    interestModel: 'Stablecoin'
  },
  "staked-kaia": {
    id: 'staked-kaia',
    name: 'Lair Staked KAIA',
    symbol: 'stKAIA',
    icon: 'https://assets.coingecko.com/coins/images/40001/standard/token_stkaia.png',
    marketAddress: "0x8a424ccf2d2b7d85f1dfb756307411d2bbc73e07",
    tokenAddress: "0x42952b873ed6f7f0a7e4992e2a9818e3a9001995",
    decimals: 18,
    isActive: true,
    isCollateralOnly: false,
    description: 'Lair Staked KAIA',
    interestModel: 'Stablecoin'
  }
};
 

export type MarketId = keyof typeof MARKET_CONFIG;
export type ContractName = keyof typeof CONTRACT_ADDRESSES;

 
export const KAIA_MAINNET_TOKENS = {
  USDT: {
    address: '0xd077A400968890Eacc75cdc901F0356c943e4fDb',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    iconType: 'image' as const
  }, 
  SIX: {
    address: '0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435',
    name: 'SIX Protocol',
    symbol: 'SIX',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3327.png',
    iconType: 'image' as const
  },
  BORA: {
    address: '0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa',
    name: 'BORA',
    symbol: 'BORA',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3801.png',
    iconType: 'image' as const
  },
  MBX: {
    address: '0xD068c52d81f4409B9502dA926aCE3301cc41f623',
    name: 'MARBLEX',
    symbol: 'MBX',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/18895.png',
    iconType: 'image' as const
  }
} as const;


// Token configuration for KAIA Testnet
export const KAIA_TESTNET_TOKENS = {
  USDT: {
    address: '0x5F7392Ec616F829Ab54092e7F167F518835Ac740',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    iconType: 'image' as const
  },
  KRW: {
    address: '0xf2260B00250c772CB64606dBb88d9544F709308C',
    name: 'Korean Won',
    symbol: 'KRW', 
    decimals: 0,
    icon: 'KR',
    iconType: 'flag' as const
  },
  JPY: {
    address: '0xFa15adECD1CC94bd17cf48DD3b41F066FE2812a7',
    name: 'Japanese Yen',
    symbol: 'JPY',
    decimals: 0,
    icon: 'JP',
    iconType: 'flag' as const
  },
  THB: {
    address: '0x576430Ecadbd9729B32a4cA9Fed9F38331273924',
    name: 'Thai Baht',
    symbol: 'THB',
    decimals: 2,
    icon: 'TH',
    iconType: 'flag' as const
  },
  stKAIA: {
    address: '0x65e38111d8e2561aDC0E2EA1eeE856E6a43dC892',
    name: 'Staked KAIA',
    symbol: 'stKAIA',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
    iconType: 'image' as const
  },
  wKAIA: {
    address: '0x553588e084604a2677e10E46ea0a8A8e9D859146',
    name: 'Wrapped KAIA',
    symbol: 'wKAIA', 
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
    iconType: 'image' as const
  },
  SIX: {
    address: '0xe438E6157Ad6e38A8528fd68eBf5d8C4F57420eC',
    name: 'SIX Protocol',
    symbol: 'SIX',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3327.png',
    iconType: 'image' as const
  },
  BORA: {
    address: '0xFdB35092c0cf5e1A5175308CB312613972C3DF3D',
    name: 'BORA',
    symbol: 'BORA',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3801.png',
    iconType: 'image' as const
  },
  MBX: {
    address: '0xCeB75a9a4Af613afd42BD000893eD16fB1F0F057',
    name: 'MARBLEX',
    symbol: 'MBX',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/18895.png',
    iconType: 'image' as const
  }
} as const;

export type TokenSymbol = keyof typeof KAIA_MAINNET_TOKENS;

export const TOKEN_LIST = Object.values(KAIA_MAINNET_TOKENS);

export const getTokenBySymbol = (symbol: TokenSymbol) => KAIA_MAINNET_TOKENS[symbol];

export const getTokenByAddress = (address: string) => {
  return TOKEN_LIST.find(token => token.address.toLowerCase() === address.toLowerCase());
};

// Faucet configuration - tokens available for testnet faucet
export const FAUCET_TOKENS = ['USDT', 'SIX', 'BORA', 'MBX'] as const;
export type FaucetTokenSymbol = typeof FAUCET_TOKENS[number];

export const FAUCET_CONFIG = {
  amounts: {
    USDT: '1000', // 1000 USDT
    SIX: '10000', // 10000 SIX
    BORA: '5000', // 5000 BORA
    MBX: '2000'   // 2000 MBX
  }
};

// Price API configuration
export const PRICE_API_CONFIG = {
  endpoint: 'https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod/prices',
  supportedTokens: ['KAIA', 'USDT', 'MARBLEX', 'BORA', 'SIX'] as const,
  // Map API symbols to our token symbols
  symbolMapping: {
    'MARBLEX': 'MBX' // API uses MARBLEX, we use MBX
  }
};

// ERC20 ABI for token interactions
export const ERC20_ABI: any = [
  "function name() view returns (string)",
  "function symbol() view returns (string)", 
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  // Mock token specific function for faucet
  "function mint(address to, uint256 amount) returns (bool)"
];

// KAIA network configuration
export const KAIA_TESTNET_CONFIG = {
  chainId: 1001,
  name: 'KAIA Testnet',
  rpcUrl: 'https://public-en-kairos.node.kaia.io',
  blockExplorer: 'https://kairos.kaiascan.io',
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA', 
    decimals: 18
  }
};

export const KAIA_MAINNET_CONFIG = {
  chainId: 8217,
  name: 'KAIA Mainet',
  rpcUrl: 'https://public-en.node.kaia.io',
  // rpcUrl: "https://rpc.ankr.com/kaia",
  blockExplorer: 'https://kaiascan.io',
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA', 
    decimals: 18
  }
}

// Block explorer URL
export const KAIA_SCAN_URL = 'https://kaiascan.io';
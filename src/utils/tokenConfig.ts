// Token configuration for KAIA Testnet
export const KAIA_TESTNET_TOKENS = {
  USDT: {
    address: '0x16EE94e3C07B24EbA6067eb9394BA70178aAc4c0',
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
  MARBLEX: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'MARBLEX',
    symbol: 'MARBLEX',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/17982/large/mbx.png',
    iconType: 'image' as const
  },
  BORA: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'BORA',
    symbol: 'BORA',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/7646/large/bora.png',
    iconType: 'image' as const
  }
} as const;

export type TokenSymbol = keyof typeof KAIA_TESTNET_TOKENS;

export const TOKEN_LIST = Object.values(KAIA_TESTNET_TOKENS);

export const getTokenBySymbol = (symbol: TokenSymbol) => KAIA_TESTNET_TOKENS[symbol];

export const getTokenByAddress = (address: string) => {
  return TOKEN_LIST.find(token => token.address.toLowerCase() === address.toLowerCase());
};

// ERC20 ABI for token interactions
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)", 
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  // Mock token specific function
  "function mint(address to, uint256 amount) returns (bool)"
];

// KAIA network configuration
export const KAIA_TESTNET_CONFIG = {
  chainId: 1001,
  name: 'KAIA Testnet',
  rpcUrl: 'https://public-en-kairos.node.kaia.io',
  blockExplorer: 'https://baobab.klaytnscope.com',
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA', 
    decimals: 18
  }
};
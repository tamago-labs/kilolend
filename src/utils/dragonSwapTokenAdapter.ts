import { KAIA_MAINNET_TOKENS } from './tokenConfig';

// DragonSwap tokens - verified KAIA Mainnet tokens with proper checksums
const DRAGONSWAP_ADDITIONAL_TOKENS = {
  weth: {
    address: '0x98A8345bB9D3DDa9d808Ca1c9142a28F6b0430E1',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    iconType: 'image' as const,
    isSwapOnly: true
  },
  usdc: {
    address: '0x608792Deb376CCE1c9FA4D0E6B7b44f507CfFa6A',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    iconType: 'image' as const,
    isSwapOnly: true
  },
  kai: {
    address: '0xe950bdcFa4d1e45472E76cf967Db93dBfc51Ba3E',
    name: 'Kai Token',
    symbol: 'KAI',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
    iconType: 'image' as const,
    isSwapOnly: true
  },
  grnd: {
    address: '0x84F8C3C8d6eE30a559D73Ec570d574f671E82647',
    name: 'SuperWalk',
    symbol: 'GRND',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
    iconType: 'image' as const,
    isSwapOnly: true
  },
  npt: {
    address: '0xE06597D02A2C3AA7a9708DE2Cfa587B128bd3815',
    name: 'NEOPIN Token',
    symbol: 'NPT',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
    iconType: 'image' as const,
    isSwapOnly: true
  },
  azit: {
    address: '0x6CEF6Dd9a3C4ad226b8B66EffEEa2c125dF194F1',
    name: 'AziT',
    symbol: 'AZIT',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
    iconType: 'image' as const,
    isSwapOnly: true
  },
  usdt_e: {
    address: '0x9025095263d1E548dc890A7589A4C78038aC40ab',
    name: 'Tether USD (Stargate)',
    symbol: 'USDT(Stargate)',
    decimals: 6,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    iconType: 'image' as const,
    isSwapOnly: true
  },
  usdc_e: {
    address: '0xE2053BCf56D2030d2470Fb454574237cF9ee3D4B',
    name: 'Bridged USDC (Stargate)',
    symbol: 'USDC(Stargate)',
    decimals: 6,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    iconType: 'image' as const,
    isSwapOnly: true
  }
} as const;

// KAIA native token configuration
const KAIA_NATIVE_TOKEN = {
  address: '0x0000000000000000000000000000000000000000',
  name: 'KAIA',
  symbol: 'KAIA',
  decimals: 18,
  icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
  iconType: 'image' as const,
  isNative: true
};

// Token interface for unified token system
export interface DragonSwapToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  iconType: 'image' | 'flag';
  isSwapOnly?: boolean;
  isNative?: boolean;
}

// Get main tokens (your current tokens + KAIA) - shown everywhere
export function getMainTokens(): DragonSwapToken[] {
  const mainTokens = Object.values(KAIA_MAINNET_TOKENS);
  return [KAIA_NATIVE_TOKEN, ...mainTokens];
}

// Get all tokens (main + DragonSwap additional) - for swap modal
export function getAllSwapTokens(): DragonSwapToken[] {
  const mainTokens = Object.values(KAIA_MAINNET_TOKENS);
  const additionalTokens = Object.values(DRAGONSWAP_ADDITIONAL_TOKENS);
  return [KAIA_NATIVE_TOKEN, ...mainTokens, ...additionalTokens];
}

// Get swap-only tokens (DragonSwap additional only)
export function getSwapOnlyTokens(): DragonSwapToken[] {
  return Object.values(DRAGONSWAP_ADDITIONAL_TOKENS);
}

// Get token by symbol
export function getTokenBySymbol(symbol: string): DragonSwapToken | undefined {
  const allTokens = getAllSwapTokens();
  return allTokens.find(token => token.symbol === symbol);
}

// Get token by address
export function getTokenByAddress(address: string): DragonSwapToken | undefined {
  const allTokens = getAllSwapTokens();
  return allTokens.find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  );
}

// Check if token is a main token (shown everywhere)
export function isMainToken(symbol: string): boolean {
  const mainTokens = getMainTokens();
  return mainTokens.some(token => token.symbol === symbol);
}

// Check if token is swap-only (only shown in swap modal)
export function isSwapOnlyToken(symbol: string): boolean {
  return DRAGONSWAP_ADDITIONAL_TOKENS[symbol as keyof typeof DRAGONSWAP_ADDITIONAL_TOKENS] !== undefined;
}

// Get tokens for display in different contexts
export function getTokensForDisplay(context: 'main' | 'swap' = 'main'): DragonSwapToken[] {
  switch (context) {
    case 'main':
      return getMainTokens();
    case 'swap':
      return getAllSwapTokens();
    default:
      return getMainTokens();
  }
}

// Token search function
export function searchTokens(query: string, context: 'main' | 'swap' = 'main'): DragonSwapToken[] {
  const tokens = getTokensForDisplay(context);
  const lowerQuery = query.toLowerCase();
  
  return tokens.filter(token =>
    token.symbol.toLowerCase().includes(lowerQuery) ||
    token.name.toLowerCase().includes(lowerQuery)
  );
}

// Export token configurations for different uses
export { DRAGONSWAP_ADDITIONAL_TOKENS, KAIA_NATIVE_TOKEN };

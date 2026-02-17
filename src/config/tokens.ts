export const KUB_TOKENS = {
  KUB: {
    symbol: 'KUB',
    name: 'KUB',
    decimals: 18,
    isNative: true,
  },
  KKUB: {
    symbol: 'KKUB',
    name: 'Wrapped KUB',
    decimals: 18,
    address: '0x67eBD850304c70d983B2d1b93ea79c7CD6c3F6b5',
    isNative: false,
  },
  KUSDT: {
    symbol: 'KUSDT',
    name: 'Bitkub-Peg USDT',
    decimals: 18, // KUSDT uses 18 decimals
    address: '0x7d984C24d2499D840eB3b7016077164e15E5faA6',
    isNative: false,
  },
} as const;

export type KUBTokenKey = keyof typeof KUB_TOKENS;

// KAIA Chain tokens - same as LINE SDK tokens
export const KAIA_TOKENS = {
  KAIA: {
    symbol: 'KAIA',
    name: 'KAIA',
    decimals: 18,
    isNative: true,
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0xd077A400968890Eacc75cdc901F0356c943e4fDb',
    isNative: false,
  },
  STAKED_KAIA: {
    symbol: 'STAKED_KAIA',
    name: 'Lair Staked KAIA',
    decimals: 18,
    address: '0x42952b873ed6f7f0a7e4992e2a9818e3a9001995',
    isNative: false,
  },
  SIX: {
    symbol: 'SIX',
    name: 'SIX Protocol',
    decimals: 18,
    address: '0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435',
    isNative: false,
  },
  BORA: {
    symbol: 'BORA',
    name: 'BORA',
    decimals: 18,
    address: '0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa',
    isNative: false,
  },
  MBX: {
    symbol: 'MBX',
    name: 'MARBLEX',
    decimals: 18,
    address: '0xD068c52d81f4409B9502dA926aCE3301cc41f623',
    isNative: false,
  },
} as const;

export type KAIATokenKey = keyof typeof KAIA_TOKENS;

export const ETHERLINK_TOKENS = {
  XTZ: {
    symbol: 'XTZ',
    name: 'Tezos',
    decimals: 18,
    isNative: true,
  },
  WXTZ: {
    symbol: 'WXTZ',
    name: 'Wrapped Tezos',
    decimals: 18,
    address: '0xc9B53AB2679f573e480d01e0f49e2B5CFB7a3EAb',
    isNative: false,
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0x2C03058C8AFC06713be23e58D2febC8337dbfE6A',
    isNative: false,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9',
    isNative: false,
  },
} as const;

export type EtherlinkTokenKey = keyof typeof ETHERLINK_TOKENS;

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  address?: string;
  isNative: boolean;
}

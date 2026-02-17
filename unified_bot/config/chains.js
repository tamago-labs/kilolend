// Chain configurations for KiloLend multi-chain support

const CHAIN_CONFIGS = {
  kaia: {
    chainId: 8217,
    chainName: 'KAIA',
    blocksPerYear: 15768000, // 2 second block time
    rpcUrl: process.env.KAIA_RPC_URL || 'https://public-en.node.kaia.io',
    blockExplorer: 'https://kaiascan.io',
    nativeCurrency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18
    }
  },
  kub: {
    chainId: 96,
    chainName: 'KUB',
    blocksPerYear: 6307200, // 5 second block time
    rpcUrl: process.env.KUB_RPC_URL || 'https://rpc.bitkubchain.io',
    blockExplorer: 'https://www.kubscan.com',
    nativeCurrency: {
      name: 'KUB',
      symbol: 'KUB',
      decimals: 18
    }
  },
  etherlink: {
    chainId: 42793,
    chainName: 'Etherlink',
    blocksPerYear: 39420000, // 0.8 second block time
    rpcUrl: process.env.ETHERLINK_RPC_URL || 'https://node.mainnet.etherlink.com',
    blockExplorer: 'https://explorer.etherlink.com',
    nativeCurrency: {
      name: 'Tezos',
      symbol: 'XTZ',
      decimals: 18
    }
  }
};

// Smart Contract Addresses for each chain
const CHAIN_CONTRACTS = {
  kaia: {
    Comptroller: '0x2591d179a0B1dB1c804210E111035a3a13c95a48',
    KiloOracle: '0xE370336C3074E76163b2f9B07876d0Cb3425488D',
    StablecoinJumpRateModel: '0x9948DFaC28D39c2EeDB7543E24c28df2922568A6',
    VolatileRateModel: '0x836B1A7A6996cC04bA2387e691c7947679A1eF0d',
    cUSDT: '0x20A2Cbc68fbee094754b2F03d15B1F5466f1F649',
    cSIX: '0x287770f1236AdbE3F4dA4f29D0f1a776f303C966',
    cBORA: '0xA7247a6f5EaC85354642e0E90B515E2dC027d5F4',
    cMBX: '0xa024B1DE3a6022FB552C2ED9a8050926Fb22d7b6',
    cKAIA: '0x2029f3E3C667EBd68b1D29dbd61dc383BdbB56e5',
    cstKAIA: '0x8A424cCf2D2B7D85F1DFb756307411D2BBc73e07',
    USDT: '0xd077A400968890Eacc75cdc901F0356c943e4fDb',
    SIX: '0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435',
    BORA: '0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa',
    MBX: '0xD068c52d81f4409B9502dA926aCE3301cc41f623',
    KAIA: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    stKAIA: '0x42952b873ed6f7f0a7e4992e2a9818e3a9001995'
  },
  kub: {
    Comptroller: '0x42f098E6aE5e81f357D3fD6e104BAA77A195133A',
    KiloOracle: '0xE370336C3074E76163b2f9B07876d0Cb3425488D',
    StablecoinRateModel: '0x7a4399356987E22156b9a0f8449E0a5a9713D5a6',
    VolatileRateModel: '0x790057160a6B183C80C0514f644eA6BCE9EDa0D4',
    cKUSDT: '0x5E9aF11F9a09174B87550B4Bfb4EdE65De933085',
    cKUB: '0x0cA8DaD1e517a9BB760Ba0C27051C4C3A036eA75',
    KUSDT: '0x2C03058C8AFC06713be23e58D2febC8337dbfE6A',
    KUB: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  },
  etherlink: {
    Comptroller: '0x42f098E6aE5e81f357D3fD6e104BAA77A195133A',
    KiloOracle: '0xE370336C3074E76163b2f9B07876d0Cb3425488D',
    StablecoinRateModel: '0x7a4399356987E22156b9a0f8449E0a5a9713D5a6',
    VolatileRateModel: '0x790057160a6B183C80C0514f644eA6BCE9EDa0D4',
    cUSDT: '0x5E9aF11F9a09174B87550B4Bfb4EdE65De933085',
    cXTZ: '0x0cA8DaD1e517a9BB760Ba0C27051C4C3A036eA75',
    USDT: '0x2C03058C8AFC06713be23e58D2febC8337dbfE6A',
    XTZ: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  }
};

// Market configurations for each chain
const CHAIN_MARKETS = {
  kaia: {
    usdt: {
      id: 'kaia-usdt',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      isActive: true,
      isCollateralOnly: false,
      interestModel: 'Stablecoin'
    },
    six: {
      id: 'kaia-six',
      name: 'SIX Token',
      symbol: 'SIX',
      decimals: 18,
      isActive: true,
      isCollateralOnly: false,
      interestModel: 'Volatile'
    },
    bora: {
      id: 'kaia-bora',
      name: 'BORA Token',
      symbol: 'BORA',
      decimals: 18,
      isActive: true,
      isCollateralOnly: false,
      interestModel: 'Volatile'
    },
    mbx: {
      id: 'kaia-mbx',
      name: 'MARBLEX Token',
      symbol: 'MBX',
      decimals: 18,
      isActive: true,
      isCollateralOnly: false,
      interestModel: 'Volatile'
    },
    kaia: {
      id: 'kaia-kaia',
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18,
      isActive: true,
      isCollateralOnly: false,
      interestModel: 'Stablecoin'
    },
    'staked-kaia': {
      id: 'kaia-stkaia',
      name: 'Lair Staked KAIA',
      symbol: 'stKAIA',
      decimals: 18,
      isActive: true,
      isCollateralOnly: false,
      interestModel: 'Stablecoin'
    }
  },
  kub: {
    kusdt: {
      id: 'kub-kusdt',
      name: 'KUB Tether USD',
      symbol: 'KUSDT',
      decimals: 6,
      isActive: true,
      isCollateralOnly: false,
      interestModel: 'Stablecoin'
    },
    kub: {
      id: 'kub-kub',
      name: 'KUB Token',
      symbol: 'KUB',
      decimals: 18,
      isActive: true,
      isCollateralOnly: false,
      interestModel: 'Volatile'
    }
  },
  etherlink: {
    usdt: {
      id: 'etherlink-usdt',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      isActive: true,
      isCollateralOnly: false,
      interestModel: 'Stablecoin'
    },
    xtz: {
      id: 'etherlink-xtz',
      name: 'Tezos',
      symbol: 'XTZ',
      decimals: 18,
      isActive: true,
      isCollateralOnly: false,
      interestModel: 'Volatile'
    }
  }
};

// KILO Points distribution per chain (daily)
const KILO_DISTRIBUTION = {
  kaia: 50000,
  kub: 30000,
  etherlink: 20000
};

// Helper function to get chain configuration
function getChainConfig(chainId) {
  return CHAIN_CONFIGS[chainId];
}

// Helper function to get chain contracts
function getChainContracts(chainId) {
  return CHAIN_CONTRACTS[chainId];
}

// Helper function to get chain markets
function getChainMarkets(chainId) {
  return CHAIN_MARKETS[chainId];
}

// Helper function to get KILO distribution for chain
function getKiloDistribution(chainId) {
  return KILO_DISTRIBUTION[chainId] || 0;
}

// Helper function to get all supported chain IDs
function getAllChainIds() {
  return Object.keys(CHAIN_CONFIGS);
}

module.exports = {
  CHAIN_CONFIGS,
  CHAIN_CONTRACTS,
  CHAIN_MARKETS,
  KILO_DISTRIBUTION,
  getChainConfig,
  getChainContracts,
  getChainMarkets,
  getKiloDistribution,
  getAllChainIds
};
import { create } from 'zustand';

// Enhanced market interface with contract data
export interface ContractMarket {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  iconType: any;
  description: string;
  
  // Contract addresses
  marketAddress: string | null;
  tokenAddress: string;
  decimals: number;
  
  // Market data from contracts
  supplyAPY: number;
  borrowAPR: number;
  totalSupply: number;
  totalBorrow: number;
  utilization: number;
  price: number;
  priceChange24h: number;
  
  // Status
  isActive: boolean;
  isCollateralOnly?: boolean;
  
  // Contract-specific data
  contractData?: any;
  lastUpdated?: number;
}

export interface ContractMarketState {
  markets: ContractMarket[];
  priceData: any;
  totalTVL: number;
  bestSupplyAPY: number;
  bestBorrowAPR: number;
  avgUtilization: number;
  isLoading: boolean;
  lastUpdate: number;
  
  // Actions
  updateMarketData: (marketId: string, data: any) => void;
  updatePriceData: (prices: any) => void;
  setLoading: (loading: boolean) => void;
  refreshAllData: () => void;
  getMarketById: (id: string) => ContractMarket | undefined;
  getBestSupplyMarket: () => ContractMarket | undefined;
  getBestBorrowMarket: () => ContractMarket | undefined;
}

// Initial markets based on deployed contract configuration
const initialContractMarkets: ContractMarket[] = [
  {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    iconType: 'image' as const,
    description: 'USD-pegged stablecoin for secure lending',
    marketAddress: '0x498823F094f6F2121CcB4e09371a57A96d619695',
    tokenAddress: '0xd077A400968890Eacc75cdc901F0356c943e4fDb',
    decimals: 6,
    supplyAPY: 5.2,
    borrowAPR: 6.1,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 1.0,
    priceChange24h: 0.02,
    isActive: true,
    isCollateralOnly: false
  },
  {
    id: 'six',
    name: 'SIX Token',
    symbol: 'SIX',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3327.png',
    iconType: 'image' as const,
    description: 'SIX Network utility token',
    marketAddress: '0xC468dFD0C96691035B3b1A4CA152Cb64F0dbF64c',
    tokenAddress: '0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435',
    decimals: 18,
    supplyAPY: 8.1,
    borrowAPR: 9.2,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.05,
    priceChange24h: 1.2,
    isActive: true,
    isCollateralOnly: false
  },
  {
    id: 'bora',
    name: 'BORA Token',
    symbol: 'BORA',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3801.png',
    iconType: 'image' as const,
    description: 'BORA gaming ecosystem token',
    marketAddress: '0x7a937C07d49595282c711FBC613c881a83B9fDFD',
    tokenAddress: '0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa',
    decimals: 18,
    supplyAPY: 7.8,
    borrowAPR: 8.8,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.10,
    priceChange24h: -0.5,
    isActive: true,
    isCollateralOnly: false
  },
  {
    id: 'mbx',
    name: 'MARBLEX Token',
    symbol: 'MBX',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/18895.png',
    iconType: 'image' as const,
    description: 'MARBLEX gaming platform token',
    marketAddress: '0xE321e20F0244500A194543B1EBD8604c02b8fA85',
    tokenAddress: '0xD068c52d81f4409B9502dA926aCE3301cc41f623',
    decimals: 18,
    supplyAPY: 6.9,
    borrowAPR: 7.9,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.25,
    priceChange24h: 0.8,
    isActive: true,
    isCollateralOnly: false
  },
  {
    id: 'kaia',
    name: 'KAIA',
    symbol: 'KAIA',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
    iconType: 'image' as const,
    description: 'Native KAIA token',
    marketAddress: '0x98Ab86C97Ebf33D28fc43464353014e8c9927aB3',
    tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    decimals: 18,
    supplyAPY: 0.1,
    borrowAPR: 0,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.15,
    priceChange24h: -1.2,
    isActive: true,
    isCollateralOnly: false
  }
];

export const useContractMarketStore = create<ContractMarketState>((set, get) => ({
  markets: initialContractMarkets,
  priceData: null,
  totalTVL: 0,
  bestSupplyAPY: 0,
  bestBorrowAPR: 0,
  avgUtilization: 0,
  isLoading: false,
  lastUpdate: 0,

  updateMarketData: (marketId: string, data: any) => {
    set((state) => {
      const updatedMarkets = state.markets.map(market => {
        if (market.id === marketId && market.marketAddress) {
          return {
            ...market,
            supplyAPY: data.supplyAPY || 0,
            borrowAPR: data.borrowAPR || 0,
            totalSupply: parseFloat(data.totalSupply || '0'),
            totalBorrow: parseFloat(data.totalBorrow || '0'),
            utilization: data.utilizationRate || market.utilization,
            contractData: data,
            lastUpdated: Date.now()
          };
        }
        return market;
      });
      
      // Calculate aggregate stats
      const lendingMarkets = updatedMarkets.filter(m => !m.isCollateralOnly);
      const totalTVL = lendingMarkets.reduce((sum, m) => sum + m.totalSupply + m.totalBorrow, 0);
      const bestSupplyAPY = Math.max(...lendingMarkets.map(m => m.supplyAPY));
      const bestBorrowAPR = Math.min(...lendingMarkets.filter(m => m.borrowAPR > 0).map(m => m.borrowAPR));
      const avgUtilization = lendingMarkets.length > 0 
        ? lendingMarkets.reduce((sum, m) => sum + m.utilization, 0) / lendingMarkets.length 
        : 0;
      
      return {
        markets: updatedMarkets,
        totalTVL,
        bestSupplyAPY,
        bestBorrowAPR,
        avgUtilization,
        lastUpdate: Date.now()
      };
    });
  },

  updatePriceData: (prices: any) => {
    set((state) => {
      const updatedMarkets = state.markets.map(market => {
        const symbolToCheck = market.symbol.toUpperCase();
        
        // Get real price from the prices data
        let newPrice = market.price; // Keep existing as fallback
        let priceChange24h = market.priceChange24h;
        
        if (prices && prices[symbolToCheck]) {
          newPrice = prices[symbolToCheck].price;
          priceChange24h = prices[symbolToCheck].change24h || 0;
        }
        
        return {
          ...market,
          price: newPrice,
          priceChange24h
        };
      });
      
      return {
        markets: updatedMarkets,
        priceData: prices,
        lastUpdate: Date.now()
      };
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  refreshAllData: () => {
    // This will be called by components to trigger a full refresh
    // The actual data fetching will be handled by hooks
    set({ lastUpdate: Date.now() });
  },

  getMarketById: (id: string) => {
    return get().markets.find(market => market.id === id);
  },

  getBestSupplyMarket: () => {
    const lendingMarkets = get().markets.filter(m => !m.isCollateralOnly && m.isActive);
    return lendingMarkets.reduce((best, current) => 
      current.supplyAPY > best.supplyAPY ? current : best
    );
  },

  getBestBorrowMarket: () => {
    const lendingMarkets = get().markets.filter(m => !m.isCollateralOnly && m.isActive && m.borrowAPR > 0);
    return lendingMarkets.reduce((best, current) => 
      current.borrowAPR < best.borrowAPR ? current : best
    );
  }
}));

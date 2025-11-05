import { create } from 'zustand';

// Enhanced market interface with contract data
export interface ContractMarket {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  iconType: any;  
  decimals: number;
  
  // Market data from contracts
  supplyAPY: number;
  borrowAPR: number;
  totalSupply: number;
  totalBorrow: number;
  utilization: number;
  price: number;
  priceChange24h: number;

  marketAddress?: string;
  tokenAddress?: string;
  
  // Status
  isActive: boolean; 
  
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
    decimals: 6,
    supplyAPY: 2,
    borrowAPR: 3,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 1.0,
    priceChange24h: 0.02,
    isActive: true
  },
  {
    id: 'six',
    name: 'SIX Token',
    symbol: 'SIX',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3327.png',
    iconType: 'image' as const, 
    decimals: 18,
    supplyAPY: 8,
    borrowAPR: 9,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.016,
    priceChange24h: 1.2,
    isActive: true
  },
  {
    id: 'bora',
    name: 'BORA Token',
    symbol: 'BORA',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3801.png',
    iconType: 'image' as const, 
    decimals: 18,
    supplyAPY: 7,
    borrowAPR: 8,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.10,
    priceChange24h: -0.5,
    isActive: true
  },
  {
    id: 'mbx',
    name: 'MARBLEX Token',
    symbol: 'MBX',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/18895.png',
    iconType: 'image' as const, 
    decimals: 18,
    supplyAPY: 6,
    borrowAPR: 7,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.1,
    priceChange24h: 0.8,
    isActive: true
  },
  {
    id: 'kaia',
    name: 'KAIA',
    symbol: 'KAIA',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
    iconType: 'image' as const, 
    decimals: 18,
    supplyAPY: 1,
    borrowAPR: 2,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.11,
    priceChange24h: -1.2,
    isActive: true
  },
  {
    id: 'staked-kaia',
    name: 'Lair Staked KAIA',
    symbol: 'stKAIA',
    icon: 'https://assets.coingecko.com/coins/images/40001/standard/token_stkaia.png',
    iconType: 'image' as const, 
    decimals: 18,
    supplyAPY: 1,
    borrowAPR: 2,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.11,
    priceChange24h: 0.1,
    isActive: true
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
        if (market.id === marketId) {
          return {
            ...market,
            supplyAPY: data.supplyAPY || 0,
            borrowAPR: data.borrowAPR || 0,
            totalSupply: parseFloat(data.totalSupply || '0'),
            totalBorrow: parseFloat(data.totalBorrow || '0'),
            utilization: data.utilizationRate || market.utilization,
            marketAddress: data.marketAddress,
            tokenAddress: data.tokenAddress,
            contractData: data,
            lastUpdated: Date.now()
          };
        }
        return market;
      });
      
      // Calculate aggregate stats
      const lendingMarkets = updatedMarkets 
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
        let symbolToCheck = market.symbol.toUpperCase();
        
        if (symbolToCheck === "STKAIA") { 
          symbolToCheck = "STAKED_KAIA"
        }

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
    const lendingMarkets = get().markets.filter(m =>  m.isActive);
    return lendingMarkets.reduce((best, current) => 
      current.supplyAPY > best.supplyAPY ? current : best
    );
  },

  getBestBorrowMarket: () => {
    const lendingMarkets = get().markets.filter(m => m.isActive && m.borrowAPR > 0);
    return lendingMarkets.reduce((best, current) => 
      current.borrowAPR < best.borrowAPR ? current : best
    );
  }
}));

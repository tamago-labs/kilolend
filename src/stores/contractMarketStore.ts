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
    marketAddress: '0x3466441C38D2F76405085b730268240E4F2d0D25',
    tokenAddress: '0x5F7392Ec616F829Ab54092e7F167F518835Ac740',
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
    marketAddress: '0x772195938d86fcf500dF18563876d7Cefcf47e4D',
    tokenAddress: '0xe438E6157Ad6e38A8528fd68eBf5d8C4F57420eC',
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
    marketAddress: '0x260fC7251fAe677B6254773d347121862336fb9f',
    tokenAddress: '0xFdB35092c0cf5e1A5175308CB312613972C3DF3D',
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
    marketAddress: '0x10bB22532eC21Fd25719565f440b0322c010bDF3',
    tokenAddress: '0xCeB75a9a4Af613afd42BD000893eD16fB1F0F057',
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
    description: 'Native KAIA token - collateral only',
    marketAddress: '0x307992307C89216b1079C7c5Cbc4F51005b1472D',
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
    isCollateralOnly: true
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
        let newPrice = market.price;
        
        switch (market.symbol.toLowerCase()) {
          case 'kaia':
            newPrice = 0.15;
            break;
          case 'six':
            newPrice = 0.05;
            break;
          case 'bora':
            newPrice = 0.10;
            break;
          case 'mbx':
            newPrice = 0.25;
            break;
          case 'usdt':
          default:
            newPrice = 1.0; // USDT pegged to USD
            break;
        }
        
        // Calculate 24h price change (simplified)
        const priceChange24h = ((newPrice - market.price) / market.price) * 100;
        
        return {
          ...market,
          price: newPrice,
          priceChange24h: isFinite(priceChange24h) ? priceChange24h : 0
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

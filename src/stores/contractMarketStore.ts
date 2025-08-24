import { create } from 'zustand';
import { MarketInfo } from '@/hooks/useMarketContract';
import { PriceData } from '@/hooks/usePriceOracle';

// Enhanced market interface with contract data
export interface ContractMarket {
  id: string;
  name: string;
  symbol: string;
  icon: string;
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
  contractData?: MarketInfo;
  lastUpdated?: number;
}

export interface ContractMarketState {
  markets: ContractMarket[];
  priceData: PriceData | null;
  totalTVL: number;
  bestSupplyAPY: number;
  bestBorrowAPR: number;
  avgUtilization: number;
  isLoading: boolean;
  lastUpdate: number;
  
  // Actions
  updateMarketData: (marketId: string, data: MarketInfo) => void;
  updatePriceData: (prices: PriceData) => void;
  setLoading: (loading: boolean) => void;
  refreshAllData: () => void;
  getMarketById: (id: string) => ContractMarket | undefined;
  getBestSupplyMarket: () => ContractMarket | undefined;
  getBestBorrowMarket: () => ContractMarket | undefined;
}

// Initial markets based on contract configuration
const initialContractMarkets: ContractMarket[] = [
  {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    icon: '💰',
    description: 'USD-pegged stablecoin for secure lending',
    marketAddress: '0xA657b300009802Be7c88617128545534aCA12dbe',
    tokenAddress: '0x16EE94e3C07B24EbA6067eb9394BA70178aAc4c0',
    decimals: 6,
    supplyAPY: 5.2,
    borrowAPR: 6.1,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 1.0,
    priceChange24h: 0.02,
    isActive: true
  },
  {
    id: 'krw',
    name: 'Korean Won',
    symbol: 'KRW',
    icon: '🏦',
    description: 'Korean Won stablecoin market',
    marketAddress: '0x4fd5Ae48A869c5ec0214CB050D2D713433515D8d',
    tokenAddress: '0xf2260B00250c772CB64606dBb88d9544F709308C',
    decimals: 18,
    supplyAPY: 4.8,
    borrowAPR: 3.8,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.00075,
    priceChange24h: -0.15,
    isActive: true
  },
  {
    id: 'jpy',
    name: 'Japanese Yen',
    symbol: 'JPY',
    icon: '🏯',
    description: 'Japanese Yen market',
    marketAddress: '0x3c4151361e9718b45409B803B6a9Ee623DBF59FE',
    tokenAddress: '0xFa15adECD1CC94bd17cf48DD3b41F066FE2812a7',
    decimals: 18,
    supplyAPY: 3.5,
    borrowAPR: 4.2,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.0067,
    priceChange24h: 0.08,
    isActive: true
  },
  {
    id: 'thb',
    name: 'Thai Baht',
    symbol: 'THB',
    icon: '🐘',
    description: 'Thai Baht market',
    marketAddress: '0xd91Fd5c773C24Cc27D39c86EfEb3bfF57eF36F99',
    tokenAddress: '0x576430Ecadbd9729B32a4cA9Fed9F38331273924',
    decimals: 18,
    supplyAPY: 4.1,
    borrowAPR: 5.0,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.029,
    priceChange24h: -0.05,
    isActive: true
  },
  {
    id: 'stkaia',
    name: 'Staked KAIA',
    symbol: 'stKAIA',
    icon: '🔥',
    description: 'Liquid staked KAIA tokens - collateral only',
    marketAddress: null,
    tokenAddress: '0x65e38111d8e2561aDC0E2EA1eeA856E6a43dC892',
    decimals: 18,
    supplyAPY: 0,
    borrowAPR: 0,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.12,
    priceChange24h: 2.3,
    isActive: true,
    isCollateralOnly: true
  },
  {
    id: 'wkaia',
    name: 'Wrapped KAIA',
    symbol: 'wKAIA',
    icon: '⚡',
    description: 'Wrapped KAIA for DeFi applications - collateral only',
    marketAddress: null,
    tokenAddress: '0x553588e084604a2677e10E46ea0a8A8e9D859146',
    decimals: 18,
    supplyAPY: 0,
    borrowAPR: 0,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.11,
    priceChange24h: 1.8,
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

  updateMarketData: (marketId: string, data: MarketInfo) => {
    set((state) => {
      const updatedMarkets = state.markets.map(market => {
        if (market.id === marketId && market.marketAddress) {
          return {
            ...market,
            supplyAPY: data.supplyAPY,
            borrowAPR: data.borrowAPR,
            totalSupply: parseFloat(data.totalSupply),
            totalBorrow: parseFloat(data.totalBorrow),
            utilization: data.utilizationRate,
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

  updatePriceData: (prices: PriceData) => {
    set((state) => {
      const updatedMarkets = state.markets.map(market => {
        let newPrice = market.price;
        
        switch (market.symbol.toLowerCase()) {
          case 'wkaia':
            newPrice = parseFloat(prices.wkaiaPrice);
            break;
          case 'stkaia':
            // stKAIA price = stKAIA exchange rate * wKAIA price
            newPrice = parseFloat(prices.stkaiaExchangeRate) * parseFloat(prices.wkaiaPrice);
            break;
          case 'krw':
            newPrice = parseFloat(prices.krwUsdRate);
            break;
          case 'jpy':
            newPrice = parseFloat(prices.jpyUsdRate);
            break;
          case 'thb':
            newPrice = parseFloat(prices.thbUsdRate);
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

import { create } from 'zustand';

export interface Market {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  supplyAPY: number;
  borrowAPR: number;
  totalSupply: number;
  totalBorrow: number;
  utilization: number;
  price: number;
  priceChange24h: number;
  isActive: boolean;
  description: string;
}

export interface MarketState {
  markets: Market[];
  totalTVL: number;
  bestSupplyAPY: number;
  bestBorrowAPR: number;
  avgUtilization: number;
  updateMarkets: () => void;
  getMarketById: (id: string) => Market | undefined;
  getBestSupplyMarket: () => Market | undefined;
  getBestBorrowMarket: () => Market | undefined;
}

const initialMarkets: Market[] = [
  {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    icon: '💰',
    supplyAPY: 5.2,
    borrowAPR: 6.1,
    totalSupply: 1200000,
    totalBorrow: 890000,
    utilization: 74.2,
    price: 1.0,
    priceChange24h: 0.02,
    isActive: true,
    description: 'USD-pegged stablecoin for secure lending'
  },
  {
    id: 'krw',
    name: 'Korean Won',
    symbol: 'KRW',
    icon: '🏦',
    supplyAPY: 4.8,
    borrowAPR: 3.8,
    totalSupply: 800000,
    totalBorrow: 620000,
    utilization: 77.5,
    price: 0.00075, // ~1340 KRW per USD
    priceChange24h: -0.15,
    isActive: true,
    description: 'Korean Won stablecoin market'
  },
  {
    id: 'jpy',
    name: 'Japanese Yen',
    symbol: 'JPY',
    icon: '🏯',
    supplyAPY: 3.5,
    borrowAPR: 4.2,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.0067, // ~150 JPY per USD
    priceChange24h: 0.08,
    isActive: false,
    description: 'Japanese Yen market (Coming Soon)'
  },
  {
    id: 'thb',
    name: 'Thai Baht',
    symbol: 'THB',
    icon: '🐘',
    supplyAPY: 4.1,
    borrowAPR: 5.0,
    totalSupply: 0,
    totalBorrow: 0,
    utilization: 0,
    price: 0.029, // ~35 THB per USD
    priceChange24h: -0.05,
    isActive: false,
    description: 'Thai Baht market (Coming Soon)'
  },
  {
    id: 'stkaia',
    name: 'Staked KAIA',
    symbol: 'stKAIA',
    icon: '🔥',
    supplyAPY: 8.5,
    borrowAPR: 9.2,
    totalSupply: 450000,
    totalBorrow: 280000,
    utilization: 62.2,
    price: 0.12, // Example price
    priceChange24h: 2.3,
    isActive: true,
    description: 'Liquid staked KAIA tokens with higher yields'
  },
  {
    id: 'wkaia',
    name: 'Wrapped KAIA',
    symbol: 'wKAIA',
    icon: '⚡',
    supplyAPY: 7.2,
    borrowAPR: 8.1,
    totalSupply: 680000,
    totalBorrow: 420000,
    utilization: 61.8,
    price: 0.11, // Example price
    priceChange24h: 1.8,
    isActive: true,
    description: 'Wrapped KAIA for DeFi applications'
  }
];

export const useMarketStore = create<MarketState>((set, get) => ({
  markets: initialMarkets,
  totalTVL: 3530000,
  bestSupplyAPY: 8.5,
  bestBorrowAPR: 3.8,
  avgUtilization: 76,

  updateMarkets: () => {
    set((state) => {
      const updatedMarkets = state.markets.map(market => {
        if (!market.isActive) return market;

        // Simulate small price fluctuations
        const priceVariation = (Math.random() - 0.5) * 0.02; // ±1%
        const newPrice = Math.max(0, market.price * (1 + priceVariation));
        
        // Simulate APY/APR changes
        const rateVariation = (Math.random() - 0.5) * 0.2; // ±0.1%
        const newSupplyAPY = Math.max(0.1, market.supplyAPY + rateVariation);
        const newBorrowAPR = Math.max(0.1, market.borrowAPR + rateVariation);

        return {
          ...market,
          price: newPrice,
          priceChange24h: priceVariation * 100,
          supplyAPY: newSupplyAPY,
          borrowAPR: newBorrowAPR,
        };
      });

      const activeMarkets = updatedMarkets.filter(m => m.isActive);
      const totalTVL = activeMarkets.reduce((sum, m) => sum + m.totalSupply + m.totalBorrow, 0);
      const bestSupplyAPY = Math.max(...activeMarkets.map(m => m.supplyAPY));
      const bestBorrowAPR = Math.min(...activeMarkets.map(m => m.borrowAPR));
      const avgUtilization = activeMarkets.reduce((sum, m) => sum + m.utilization, 0) / activeMarkets.length;

      return {
        markets: updatedMarkets,
        totalTVL,
        bestSupplyAPY,
        bestBorrowAPR,
        avgUtilization
      };
    });
  },

  getMarketById: (id: string) => {
    return get().markets.find(market => market.id === id);
  },

  getBestSupplyMarket: () => {
    const activeMarkets = get().markets.filter(m => m.isActive);
    return activeMarkets.reduce((best, current) => 
      current.supplyAPY > best.supplyAPY ? current : best
    );
  },

  getBestBorrowMarket: () => {
    const activeMarkets = get().markets.filter(m => m.isActive);
    return activeMarkets.reduce((best, current) => 
      current.borrowAPR < best.borrowAPR ? current : best
    );
  }
}));

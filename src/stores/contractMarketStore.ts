import { create } from 'zustand';

// Enhanced market interface with contract data
export interface ContractMarket {
  id: string;
  chainId: number;
  chainName: string;
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

// Initial markets - empty since we fetch all markets from multi-chain hook
const initialContractMarkets: ContractMarket[] = [];

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
      // Check if market already exists
      const existingMarket = state.markets.find(m => m.id === marketId);

      let updatedMarkets;

      if (existingMarket) {
        // Update existing market
        updatedMarkets = state.markets.map(market => {
          if (market.id === marketId) {
            return {
              ...market,
              supplyAPY: data.supplyAPY || 0,
              borrowAPR: data.borrowAPR || 0,
              totalSupply: parseFloat(data.totalSupply || '0'),
              totalBorrow: parseFloat(data.totalBorrow || '0'),
              utilization: data.utilizationRate || market.utilization,
              price: data.price !== undefined ? data.price : market.price,
              marketAddress: data.marketAddress,
              tokenAddress: data.tokenAddress,
              contractData: data,
              lastUpdated: Date.now()
            };
          }
          return market;
        });
      } else {
        // Add new market (from KUB or Etherlink)
        const newMarket: ContractMarket = {
          id: data.id,
          chainId: data.chainId,
          chainName: data.chainName,
          name: data.name,
          symbol: data.symbol,
          icon: data.icon,
          iconType: 'image' as const,
          decimals: data.decimals,
          supplyAPY: data.supplyAPY || 0,
          borrowAPR: data.borrowAPR || 0,
          totalSupply: parseFloat(data.totalSupply || '0'),
          totalBorrow: parseFloat(data.totalBorrow || '0'),
          utilization: data.utilizationRate || 0,
          price: data.price || 1,
          priceChange24h: 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
          isCollateralOnly: data.isCollateralOnly || false,
          contractData: data,
          lastUpdated: Date.now()
        };
        updatedMarkets = [...state.markets, newMarket];
      }
      
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

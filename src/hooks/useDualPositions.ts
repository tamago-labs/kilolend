'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useUserPositions } from '@/hooks/useUserPositions'; // Hackathon version
import { useUserPositions as useV1UserPositions } from '@/hooks/v1/useUserPositions'; // V1 version
import { useContractMarketStore } from '@/stores/contractMarketStore';

export interface Position {
  marketId: string;
  symbol: string;
  supplyBalance: string;
  borrowBalance: string;
  formattedSupplyBalance: string;
  formattedBorrowBalance: string;
  price: number;
  icon: string;
  supplyAPY: number;
  borrowAPR: number;
  decimals: number;
  marketAddress: string;
}

export interface DualPositions {
  hackathonPositions: Position[];
  v1Positions: Position[];
  isLoading: boolean;
  refreshPositions?: () => Promise<void>; 
}

export interface UseDualPositionsOptions {
  disableAutoRefresh?: boolean;
  cacheDuration?: number;
}

export const useDualPositions = (options: UseDualPositionsOptions = {}): DualPositions => {
  

  const { account } = useWalletAccountStore();
  const { markets } = useContractMarketStore();
  
  const { positions: hackathonPositionsRaw, isLoading: hackathonLoading, refreshPositions: refreshHackathonPositions } = useUserPositions();
  const { positions: v1PositionsRaw, isLoading: v1Loading, refreshPositions: refreshV1Positions } = useV1UserPositions();
   
  const [dualPositions, setDualPositions] = useState<DualPositions>({
    hackathonPositions: [],
    v1Positions: [],
    isLoading: true
  });
 
  useEffect(() => {
    
    const processPositions = () => {
      if (!account || !markets.length) {
        setDualPositions({
          hackathonPositions: [],
          v1Positions: [],
          isLoading: false
        });
        return;
      }

      // Process hackathon positions
      const hackathonPositions = Object.values(hackathonPositionsRaw)
        // .filter((pos: any) => {
        //   const supplyBalance = parseFloat(pos.supplyBalance || '0');
        //   const borrowBalance = parseFloat(pos.borrowBalance || '0');
        //   return supplyBalance > 0 || borrowBalance > 0;
        // })
        .map((pos: any) => {
          const market = markets.find(m => m.id === pos.marketId);
          return {
            marketId: pos.marketId,
            symbol: pos.symbol,
            supplyBalance: pos.supplyBalance || '0',
            borrowBalance: pos.borrowBalance || '0',
            formattedSupplyBalance: pos.formattedSupplyBalance || '0',
            formattedBorrowBalance: pos.formattedBorrowBalance || '0',
            price: market?.price || 0,
            icon: market?.icon || '',
            supplyAPY: market?.supplyAPY || 0,
            borrowAPR: market?.borrowAPR || 0,
            decimals: market?.decimals || 18,
            marketAddress: market?.marketAddress || ''
          } as Position;
        });

      // Process V1 positions
      const v1Positions = Object.values(v1PositionsRaw)
        // .filter((pos: any) => {
        //   const supplyBalance = parseFloat(pos.supplyBalance || '0');
        //   const borrowBalance = parseFloat(pos.borrowBalance || '0');
        //   return supplyBalance > 0 || borrowBalance > 0;
        // })
        .map((pos: any) => {
          const market = markets.find(m => m.id === pos.marketId);
          return {
            marketId: pos.marketId,
            symbol: pos.symbol,
            supplyBalance: pos.supplyBalance || '0',
            borrowBalance: pos.borrowBalance || '0',
            formattedSupplyBalance: pos.formattedSupplyBalance || '0',
            formattedBorrowBalance: pos.formattedBorrowBalance || '0',
            price: market?.price || 0,
            icon: market?.icon || '',
            supplyAPY: market?.supplyAPY || 0,
            borrowAPR: market?.borrowAPR || 0,
            decimals: market?.decimals || 18,
            marketAddress: market?.marketAddress || ''
          } as Position;
        });

      setDualPositions({
        hackathonPositions,
        v1Positions,
        isLoading: hackathonLoading || v1Loading
      });
    };

    processPositions();
  }, [account, markets.length, hackathonPositionsRaw, v1PositionsRaw]);


  const refreshPositions = useCallback(async () => {
    console.log('🔄 Refreshing positions...');
    try {
      await Promise.all([
        refreshHackathonPositions(),
        refreshV1Positions()
      ]);
      console.log('✅ Positions refreshed');
    } catch (error) {
      console.error('❌ Error refreshing:', error);
    }
  }, [refreshHackathonPositions, refreshV1Positions])

  return {
    ...dualPositions,
    refreshPositions
  };
};

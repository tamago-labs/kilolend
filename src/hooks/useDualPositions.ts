'use client';

import { useState, useEffect, useMemo } from 'react';
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
}

export const useDualPositions = (): DualPositions => {
  const { account } = useWalletAccountStore();
  const { markets } = useContractMarketStore();
  const { positions: hackathonPositionsRaw, isLoading: hackathonLoading } = useUserPositions();
  const { positions: v1PositionsRaw, isLoading: v1Loading } = useV1UserPositions();
  
  const [dualPositions, setDualPositions] = useState<DualPositions>({
    hackathonPositions: [],
    v1Positions: [],
    isLoading: true
  });

  // Memoize position data to prevent infinite loops
  const hackathonPositionsMemo = useMemo(() => hackathonPositionsRaw, [hackathonPositionsRaw]);
  const v1PositionsMemo = useMemo(() => v1PositionsRaw, [v1PositionsRaw]);

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
      const hackathonPositions = Object.values(hackathonPositionsMemo)
        .filter((pos: any) => {
          const supplyBalance = parseFloat(pos.supplyBalance || '0');
          const borrowBalance = parseFloat(pos.borrowBalance || '0');
          return supplyBalance > 0 || borrowBalance > 0;
        })
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
      const v1Positions = Object.values(v1PositionsMemo)
        .filter((pos: any) => {
          const supplyBalance = parseFloat(pos.supplyBalance || '0');
          const borrowBalance = parseFloat(pos.borrowBalance || '0');
          return supplyBalance > 0 || borrowBalance > 0;
        })
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
  }, [account, markets.length, hackathonPositionsMemo, v1PositionsMemo, hackathonLoading, v1Loading]);

  return dualPositions;
};

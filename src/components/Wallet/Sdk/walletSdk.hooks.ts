'use client'

import { create } from 'zustand/react';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {DappPortalSDKType, default as DappPortalSDK} from "@/utils/dapp-portal-sdk";
import {liff} from "@/utils/liff";


type KaiaWalletSdkState = {
    sdk: DappPortalSDKType | null;
    setSdk: (sdk: DappPortalSDKType| null) => void;
};

export const useKaiaWalletSdkStore = create<KaiaWalletSdkState>((set) => ({
    sdk: null,
    setSdk: (sdk) => set({ sdk }),
}));

export const initializeKaiaWalletSdk = async () => {
    try {
        const sdk = await DappPortalSDK.init({
            clientId: process.env.NEXT_PUBLIC_CLIENT_ID as string,
            chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
        });
        return sdk as DappPortalSDKType;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
        return null;
    }
};

export const useKaiaWalletSecurity = () => {
    const { setSdk } = useKaiaWalletSdkStore();
    return useQuery({
        queryKey: ['wallet', 'sdk'],
        queryFn: async () => {
            await liff.init({
                liffId: process.env.NEXT_PUBLIC_LIFF_ID as string,
            })
            setSdk(await initializeKaiaWalletSdk());
            return true;
        },
        throwOnError: true,

    });
};

// export type Block = 'latest' | 'earliest';

export type Transaction = {
    from: string;
    to: string;
    value: string;
    gas: string;
}

export const useKaiaWalletSdk = () => {
    const { sdk } = useKaiaWalletSdkStore();
    if (!sdk) {
        throw new Error('KaiaWalletSdk is not initialized');
    }

    const walletProvider = sdk.getWalletProvider();

    const getAccount = useCallback(async () => {
        const addresses = await walletProvider.request({ method: 'kaia_accounts' }) as string[];
        return addresses[0];
    }, [walletProvider]);

    const requestAccount = useCallback(async () => {
        const addresses = await walletProvider.request({ method: 'kaia_requestAccounts' }) as string[];
        return addresses[0];
    }, [walletProvider]);

    const connectAndSign = useCallback(
      async (msg: string) => {
          const [account, signature] =  await walletProvider.request({
              method: 'kaia_connectAndSign',
              params: [msg],
          }) as string[];
          return [account,signature];
      },
      [walletProvider]
    );

    const getBalance = useCallback(async(params: [account:string,blockNumberOrHash:'latest'|'earliest'])=>{
        return await walletProvider.request({ method: 'kaia_getBalance', params: params });
    },[walletProvider]);

    const disconnectWallet = useCallback(async ()=>{
        await walletProvider.disconnectWallet()
        window.location.reload();
    },[walletProvider]);

    const sendTransaction = useCallback(async(params: Transaction[])=>{
        await walletProvider.request({ method: 'kaia_sendTransaction', params: params });
    },[walletProvider]);

    const getErc20TokenBalance = useCallback(async(contractAddress:string,account:string)=>{
        return await walletProvider.getErc20TokenBalance(contractAddress,account);
    },[walletProvider]);
  return {getAccount, requestAccount, connectAndSign, disconnectWallet, getBalance, sendTransaction, getErc20TokenBalance}
};
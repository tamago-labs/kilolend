"use client";

import { create } from 'zustand';

type walletAccountState = {
  account: string | null;
  setAccount: (account: string| null) => void;
};

export const useWalletAccountStore = create<walletAccountState>((set) => {
  const account = typeof window !== 'undefined' ?window.localStorage.getItem('account'):undefined;
  return ({
    account: account || null,
    setAccount: (account) => set({ account }),
  })
});
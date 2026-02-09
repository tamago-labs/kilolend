import { createConfig, http } from 'wagmi'
import { defineChain } from "viem"
import { injected, metaMask } from 'wagmi/connectors'
import { kaia } from 'wagmi/chains'

export { kaia }

export const kubChain = defineChain({
  id: 96,
  name: 'KUB Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'KUB',
    symbol: 'KUB',
  },
  rpcUrls: {
    default: { http: ['https://rpc.bitkubchain.io'] },
  },
  blockExplorers: {
    default: { name: 'KUB Explorer', url: 'https://www.kubscan.com/' },
  },
  testnet: false,
})

export const config = createConfig({
  chains: [kubChain, kaia],
  transports: {
    [kubChain.id]: http(),
    [kaia.id]: http(),
  },
  connectors: [
    injected(),
    metaMask()
  ],
})


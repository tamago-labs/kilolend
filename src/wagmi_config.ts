import { createConfig, http } from 'wagmi'
import { defineChain } from "viem"
import { injected, metaMask } from 'wagmi/connectors'
import { kaia, etherlink } from 'wagmi/chains'

export { kaia, etherlink }

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
  chains: [kubChain, kaia, etherlink],
  transports: {
    [kubChain.id]: http(),
    [kaia.id]: http(),
    [etherlink.id]: http()
  },
  connectors: [
    injected(),
    metaMask()
  ],
})


import { KUB_TOKENS, KAIA_TOKENS, ETHERLINK_TOKENS, TokenConfig } from './tokens';

// Multi-chain token configuration indexed by chain ID
export const CHAIN_TOKENS: Record<number, Record<string, TokenConfig>> = {
  8217: KAIA_TOKENS, // KAIA Mainnet
  96: KUB_TOKENS,    // KUB Chain
  42793: ETHERLINK_TOKENS, // Etherlink
};

// Helper function to get token config by chain and symbol
export const getTokenConfig = (chainId: number, symbol: string): TokenConfig | undefined => {
  const chainTokens = CHAIN_TOKENS[chainId];
  if (!chainTokens) return undefined;
  
  return Object.values(chainTokens).find(
    token => token.symbol === symbol || token.symbol === symbol.toUpperCase()
  );
};

// Helper function to get all tokens for a chain
export const getChainTokens = (chainId: number): TokenConfig[] => {
  const chainTokens = CHAIN_TOKENS[chainId];
  return chainTokens ? Object.values(chainTokens) : [];
};

// Helper function to check if a symbol is native token for a chain
export const isNativeToken = (chainId: number, symbol: string): boolean => {
  const chainTokens = CHAIN_TOKENS[chainId];
  if (!chainTokens) return false;
  
  const token = Object.values(chainTokens).find(
    t => t.symbol === symbol || t.symbol === symbol.toUpperCase()
  );
  
  return token?.isNative || false;
};
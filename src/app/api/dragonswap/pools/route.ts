import { NextResponse } from 'next/server';

const DGSWAP_GATEWAY = 'https://gateway.graph.dgswap.io';
const DRAGONSWAP_SUBGRAPH_URLS = {
  V3: `${DGSWAP_GATEWAY}/dgswap-exchange-v3-kaia`,
  V2: `${DGSWAP_GATEWAY}/dgswap-exchange-v2-kaia`,
};


export async function POST(request: Request) {
  try {
    console.log('[API] DragonSwap pools request received');

    const body = await request.json();
    const { 
      version = 'V3', 
      minLiquidityUSD = 1000,
      topPoolsOnly = false,
      maxPools = 50
    } = body;

    const subgraphUrl = DRAGONSWAP_SUBGRAPH_URLS[version as keyof typeof DRAGONSWAP_SUBGRAPH_URLS];
    if (!subgraphUrl) {
      return NextResponse.json({ error: `Invalid version: ${version}` }, { status: 400 });
    }

    console.log(`[API] Fetching ${version} pools with TVL > $${minLiquidityUSD}, topOnly: ${topPoolsOnly}, max: ${maxPools}`);

    // Enhanced query with better filtering and WKLAY/WKAIA symbol handling
    const limit = topPoolsOnly ? Math.min(maxPools, 20) : maxPools;
    const query = version === 'V3' 
      ? `{
          pools(
            first: ${limit}, 
            orderBy: totalValueLockedUSD, 
            orderDirection: desc, 
            where: { 
              liquidity_gt: 0,
              totalValueLockedUSD_gt: "${minLiquidityUSD}"
            }
          ) {
            id
            token0 { 
              symbol 
              id
              name
              decimals
            }
            token1 { 
              symbol 
              id
              name
              decimals
            }
            feeTier
            totalValueLockedUSD
            volumeUSD
            liquidity
          }
        }`
      : `{
          pairs(
            first: ${limit}, 
            orderBy: reserveUSD, 
            orderDirection: desc, 
            where: { 
              reserveUSD_gt: "${minLiquidityUSD}"
            }
          ) {
            id
            token0 { 
              symbol 
              id
              name
              decimals
            }
            token1 { 
              symbol 
              id
              name
              decimals
            }
            reserveUSD
            volumeUSD
            reserve0
            reserve1
          }
        }`;

    const response = await fetch(subgraphUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KiloLend-DragonSwap-Integration/2.0',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[API] Subgraph error: ${response.status} ${errText}`);
      return NextResponse.json({ error: 'Subgraph request failed', status: response.status });
    }

    const result = await response.json();
    if (result.errors) {
      console.error('[API] GraphQL errors:', result.errors);
      return NextResponse.json({ error: 'GraphQL errors', details: result.errors }, { status: 500 });
    }

    const data = version === 'V3' ? result.data?.pools || [] : result.data?.pairs || [];

    // Process pools with WKLAY/WKAIA symbol normalization
    const pools = data.map((p: any) => {
      // Normalize WKLAY to WKAIA for consistency
      const normalizeTokenSymbol = (symbol: string) => {
        if (symbol === 'WKLAY') return 'WKAIA';
        if (symbol === 'stKAIA') return 'WKAIA';
        return symbol;
      };

      const pool: any = {
        id: p.id,
        address: p.id,
        token0: {
          id: p.token0.id,
          symbol: normalizeTokenSymbol(p.token0.symbol),
          name: p.token0.name,
          decimals: p.token0.decimals,
        },
        token1: {
          id: p.token1.id,
          symbol: normalizeTokenSymbol(p.token1.symbol),
          name: p.token1.name,
          decimals: p.token1.decimals,
        },
        liquidityUSD: parseFloat(p.totalValueLockedUSD || p.reserveUSD || '0'),
        volumeUSD: parseFloat(p.volumeUSD || '0'),
        apr: parseFloat(p.apr || '0'),
        version,
        hasLiquidity: true,
      };

      // Add V3 specific fields
      if (version === 'V3') {
        pool.fee = parseInt(p.feeTier);
        pool.liquidity = p.liquidity;
      }

      // Add V2 specific fields
      if (version === 'V2') {
        pool.reserve0 = p.reserve0;
        pool.reserve1 = p.reserve1;
      }

      return pool;
    });

    // Additional filtering to ensure quality pools
    const filteredPools = pools.filter((pool: any) => {
      // Ensure both tokens have valid symbols
      if (!pool.token0.symbol || !pool.token1.symbol) {
        return false;
      }

      // Ensure minimum liquidity threshold
      if (pool.liquidityUSD < minLiquidityUSD) {
        return false;
      }

      // Ensure some trading volume for better routing
      if (pool.volumeUSD <= 0) {
        return false;
      }

      return true;
    });

    console.log(`[API] Found ${filteredPools.length} ${version} pools after filtering`);
    return NextResponse.json({ 
      success: true, 
      pools: filteredPools,
      total: filteredPools.length,
      queried: data.length
    });

  } catch (err: any) {
    console.error('[API] Error fetching pools:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

// Handle GET requests for basic pool discovery
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version') || 'V3';
  const minLiquidityUSD = parseInt(searchParams.get('minLiquidityUSD') || '1000');

  return POST({
    json: async () => ({
      version,
      minLiquidityUSD
    })
  } as any);
}

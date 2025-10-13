import { NextRequest, NextResponse } from 'next/server';

// DragonSwap Subgraph endpoints
const DGSWAP_GATEWAY = 'https://gateway.graph.dgswap.io';
const DRAGONSWAP_SUBGRAPH_URLS = {
  V3: `${DGSWAP_GATEWAY}/dgswap-exchange-v3-kaia`,
  V2: `${DGSWAP_GATEWAY}/dgswap-exchange-v2-kaia`,
};

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Received subgraph request');
    
    let body;
    try {
      body = await request.json();
      console.log('[API] Request body parsed successfully');
    } catch (parseError) {
      console.error('[API] Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { query, variables, version = 'V3' } = body;

    if (!query) {
      console.error('[API] Missing query in request body');
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const subgraphUrl = DRAGONSWAP_SUBGRAPH_URLS[version as keyof typeof DRAGONSWAP_SUBGRAPH_URLS];
    
    if (!subgraphUrl) {
      console.error(`[API] Invalid version: ${version}`);
      return NextResponse.json(
        { error: `Invalid version: ${version}` },
        { status: 400 }
      );
    }

    console.log(`[API] Forwarding ${version} subgraph request to: ${subgraphUrl}`);
    console.log(`[API] Query:`, query.substring(0, 100) + '...');
    console.log(`[API] Variables:`, JSON.stringify(variables));

    // Forward request to DragonSwap subgraph
    let response;
    try {
      response = await fetch(subgraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'KiloLend-DragonSwap-Integration/1.0',
        },
        body: JSON.stringify({ query, variables }),
      });
      console.log(`[API] Subgraph response status: ${response.status}`);
    } catch (fetchError) {
      console.error('[API] Fetch error:', fetchError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch from subgraph',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
        },
        { status: 500 }
      );
    }

    let result;
    try {
      const responseText = await response.text();
      console.log(`[API] Raw response (${responseText.length} chars):`, responseText.substring(0, 500) + '...');
      
      if (!response.ok) {
        console.error(`[API] Subgraph error (${response.status}):`, responseText);
        return NextResponse.json(
          { 
            error: `Subgraph request failed: ${response.status} ${response.statusText}`,
            details: responseText
          },
          { status: response.status }
        );
      }

      result = JSON.parse(responseText);
      console.log(`[API] Parsed response successfully`);
    } catch (parseError) {
      console.error('[API] Failed to parse subgraph response:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON response from subgraph',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        },
        { status: 500 }
      );
    }

    console.log(`[API] Subgraph response keys:`, Object.keys(result || {}));

    // Add CORS headers and return response
    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('[API] Unhandled error in subgraph request:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

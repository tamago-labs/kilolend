const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb"); 

const dynamoClient = new DynamoDBClient({});

// Token configuration
const TOKENS = [
  { symbol: "BTC", id: 1 },
  { symbol: "ETH", id: 1027 },
  { symbol: "KAIA", id: 32880 },
  { symbol: "SOMNIA", id: 37637 },
  { symbol: "BORA", id: 3801 },
  { symbol: "MARBLEX", id: 18895 },
  { symbol: "SIX", id: 3327 }
];

// CoinGecko token configuration
const COINGECKO_TOKENS = [
  { symbol: "STAKED_KAIA", id: "lair-staked-kaia" }
];

exports.handler = async (event) => {
  console.log('Starting price fetch process...');
  
  try {
    // Get all token IDs
    const tokenIds = TOKENS.map(token => token.id).join(',');

    console.log("all tokenIds:", tokenIds)
    
    // Fetch prices from CoinMarketCap
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${tokenIds}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': atob("YzlhMDdkMzAtODQwNi00ZTg1LTg2OWQtMDcyNzJhZTcwMWQ1"),
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();

    console.log("data:", data)
    
    if (data.status.error_code !== 0) {
      throw new Error(`CoinMarketCap API error: ${data.status.error_message}`);
    }
    
    const timestamp = new Date().toISOString();
    const results = [];
    
    // Process each token
    for (const token of TOKENS) {
      const tokenData = data.data[token.id.toString()];
      
      if (tokenData && tokenData.quote && tokenData.quote.USD) {
        const usdQuote = tokenData.quote.USD;
        
        const priceData = {
          symbol: { S: token.symbol },
          timestamp: { S: timestamp },
          price: { N: usdQuote.price.toString() },
          percent_change_24h: { N: (usdQuote.percent_change_24h || 0).toString() },
          market_cap: { N: (usdQuote.market_cap || 0).toString() },
          volume_24h: { N: (usdQuote.volume_24h || 0).toString() },
          last_updated: { S: usdQuote.last_updated },
          ttl: { N: Math.floor((Date.now() / 1000) + (7 * 24 * 60 * 60)).toString() } // 7 days TTL
        };
        
        // Save to DynamoDB
        const putCommand = new PutItemCommand({
          TableName: process.env.PRICES_TABLE_NAME,
          Item: priceData
        });
        
        await dynamoClient.send(putCommand);
        
        results.push({
          symbol: token.symbol,
          price: usdQuote.price,
          change_24h: usdQuote.percent_change_24h
        });
        
        console.log(`Saved price for ${token.symbol}: $${usdQuote.price}`);
      } else {
        console.warn(`No data found for token ${token.symbol} (ID: ${token.id})`);
      }
    }
    
    // Fetch prices from CoinGecko with full data
    const coingeckoIds = COINGECKO_TOKENS.map(token => token.id).join(',');
    console.log("CoinGecko token IDs:", coingeckoIds);
    
    const coingeckoResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoIds}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`,
      {
        headers: {
          'x-cg-demo-api-key': atob("Q0ctY0MxdGpiSDd0dzJtcWt6SDlOc21LRFVT"),
          'Accept': 'application/json'
        }
      }
    );
    
    if (!coingeckoResponse.ok) {
      console.error(`CoinGecko API error: ${coingeckoResponse.status} ${coingeckoResponse.statusText}`);
    } else {
      const coingeckoData = await coingeckoResponse.json();
      console.log("CoinGecko data:", coingeckoData);
      
      // Process each CoinGecko token
      for (const token of COINGECKO_TOKENS) {
        const tokenData = coingeckoData[token.id];
        
        if (tokenData && tokenData.usd) {
          // Convert timestamp to ISO string
          const lastUpdated = tokenData.last_updated_at 
            ? new Date(tokenData.last_updated_at * 1000).toISOString()
            : timestamp;
          
          const priceData = {
            symbol: { S: token.symbol },
            timestamp: { S: timestamp },
            price: { N: tokenData.usd.toString() },
            percent_change_24h: { N: (tokenData.usd_24h_change || 0).toString() },
            market_cap: { N: (tokenData.usd_market_cap || 0).toString() },
            volume_24h: { N: (tokenData.usd_24h_vol || 0).toString() },
            last_updated: { S: lastUpdated },
            ttl: { N: Math.floor((Date.now() / 1000) + (7 * 24 * 60 * 60)).toString() } // 7 days TTL
          };
          
          // Save to DynamoDB
          const putCommand = new PutItemCommand({
            TableName: process.env.PRICES_TABLE_NAME,
            Item: priceData
          });
          
          await dynamoClient.send(putCommand);
          
          results.push({
            symbol: token.symbol,
            price: tokenData.usd,
            change_24h: tokenData.usd_24h_change || 0
          });
          
          console.log(`Saved price for ${token.symbol}: $${tokenData.usd}`);
        } else {
          console.warn(`No data found for CoinGecko token ${token.symbol} (ID: ${token.id})`);
        }
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Price fetch completed successfully',
        timestamp: timestamp,
        results: results,
        count: results.length
      })
    };
    
  } catch (error) {
    console.error('Error fetching prices:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error fetching prices',
        error: error.message
      })
    };
  }
};

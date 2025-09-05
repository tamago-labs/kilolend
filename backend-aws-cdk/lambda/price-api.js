const { DynamoDBClient, QueryCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');

const dynamoClient = new DynamoDBClient({});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }
  
  try {
    const path = event.path;
    const httpMethod = event.httpMethod;
    
    if (httpMethod === 'GET' && path === '/prices') {
      return await getAllLatestPrices();
    } else if (httpMethod === 'GET' && path.startsWith('/prices/')) {
      const symbol = path.split('/')[2].toUpperCase();
      return await getPriceBySymbol(symbol);
    } else {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Not Found' })
      };
    }
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error.message
      })
    };
  }
};

async function getAllLatestPrices() {
  try {
    // Get latest prices for all tokens
    const scanParams = {
      TableName: process.env.PRICES_TABLE_NAME,
      FilterExpression: '#ts = :timestamp',
      ExpressionAttributeNames: {
        '#ts': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':timestamp': { S: await getLatestTimestamp() }
      }
    };
    
    const command = new ScanCommand(scanParams);
    const result = await dynamoClient.send(command);
    
    const prices = result.Items.map(item => ({
      symbol: item.symbol.S,
      price: parseFloat(item.price.N),
      percent_change_24h: parseFloat(item.percent_change_24h.N),
      market_cap: parseFloat(item.market_cap.N),
      volume_24h: parseFloat(item.volume_24h.N),
      last_updated: item.last_updated.S,
      timestamp: item.timestamp.S
    }));
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: prices,
        count: prices.length
      })
    };
    
  } catch (error) {
    console.error('Error getting all prices:', error);
    throw error;
  }
}

async function getPriceBySymbol(symbol) {
  try {
    const queryParams = {
      TableName: process.env.PRICES_TABLE_NAME,
      KeyConditionExpression: 'symbol = :symbol',
      ExpressionAttributeValues: {
        ':symbol': { S: symbol }
      },
      ScanIndexForward: false, // Sort by timestamp descending
      Limit: 1 // Get only the latest entry
    };
    
    const command = new QueryCommand(queryParams);
    const result = await dynamoClient.send(command);
    
    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          message: `Price data not found for symbol: ${symbol}`
        })
      };
    }
    
    const item = result.Items[0];
    const priceData = {
      symbol: item.symbol.S,
      price: parseFloat(item.price.N),
      percent_change_24h: parseFloat(item.percent_change_24h.N),
      market_cap: parseFloat(item.market_cap.N),
      volume_24h: parseFloat(item.volume_24h.N),
      last_updated: item.last_updated.S,
      timestamp: item.timestamp.S
    };
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: priceData
      })
    };
    
  } catch (error) {
    console.error('Error getting price by symbol:', error);
    throw error;
  }
}

async function getLatestTimestamp() {
  try {
    // Scan to find the latest timestamp
    const scanParams = {
      TableName: process.env.PRICES_TABLE_NAME,
      ProjectionExpression: '#ts',
      ExpressionAttributeNames: {
        '#ts': 'timestamp'
      }
    };
    
    const command = new ScanCommand(scanParams);
    const result = await dynamoClient.send(command);
    
    if (!result.Items || result.Items.length === 0) {
      return new Date().toISOString();
    }
    
    // Find the latest timestamp
    const timestamps = result.Items.map(item => item.timestamp.S);
    return timestamps.sort().reverse()[0];
    
  } catch (error) {
    console.error('Error getting latest timestamp:', error);
    return new Date().toISOString();
  }
}

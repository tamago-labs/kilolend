const { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamoClient = new DynamoDBClient({});

const LEADERBOARD_TABLE = process.env.LEADERBOARD_TABLE_NAME;
const USER_POINTS_TABLE = process.env.USER_POINTS_TABLE_NAME;

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    try {
        const { httpMethod, resource, pathParameters, body } = event;

        console.log('Request:', {
            method: httpMethod,
            resource,
            pathParameters,
            body: body ? JSON.parse(body) : null
        });

        switch (resource) {
            case '/leaderboard':
                if (httpMethod === 'GET') {
                    return await getLeaderboard(event);
                } else if (httpMethod === 'POST') {
                    return await storeDailySummary(event);
                }
                break;

            case '/leaderboard/{date}':
                if (httpMethod === 'GET') {
                    return await getDailyLeaderboard(event);
                }
                break;

            case '/users/{userAddress}':
                if (httpMethod === 'GET') {
                    return await getUserPoints(event);
                }
                break;

            case '/all':
                if (httpMethod === 'GET') {
                    return await getAllUsers(event);
                }
                break;

            default:
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Endpoint not found'
                    })
                };
        }

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Internal server error',
                error: error.message
            })
        };
    }
};

// GET /leaderboard - Get today's leaderboard
async function getLeaderboard(event) {
    try {
        // Get today's date
        const today = new Date().toISOString().split('T')[0];

        const command = new GetItemCommand({
            TableName: LEADERBOARD_TABLE,
            Key: marshall({
                date: today
            })
        });

        const result = await dynamoClient.send(command);

        if (!result.Item) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    success: true,
                    data: {
                        date: today,
                        leaderboard: [],
                        totalUsers: 0,
                        message: 'No leaderboard data for today'
                    }
                })
            };
        }

        // Unmarshall the DynamoDB item
        const item = unmarshall(result.Item);

        // Parse the leaderboard data and add ranks
        const leaderboardData = item.leaderboard || {};
        const sortedUsers = Object.entries(leaderboardData)
            .map(([address, data]) => ({
                address,
                ...data
            }))
            .sort((a, b) => b.kiloReward - a.kiloReward)
            .map((user, index) => ({
                ...user,
                rank: index + 1
            }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: true,
                data: {
                    date: today,
                    leaderboard: sortedUsers,
                    totalUsers: sortedUsers.length,
                    summary: item.summary || {}
                }
            })
        };

    } catch (error) {
        console.error('Error getting leaderboard:', error);
        throw error;
    }
}

// GET /leaderboard/{date} - Get leaderboard for specific date
async function getDailyLeaderboard(event) {
    try {
        const { date } = event.pathParameters;

        const command = new GetItemCommand({
            TableName: LEADERBOARD_TABLE,
            Key: marshall({
                date: date
            })
        });

        const result = await dynamoClient.send(command);

        if (!result.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    success: false,
                    message: `No leaderboard data for ${date}`
                })
            };
        }

        // Unmarshall the DynamoDB item
        const item = unmarshall(result.Item);

        // Parse the leaderboard data and add ranks
        const leaderboardData = item.leaderboard || {};
        const sortedUsers = Object.entries(leaderboardData)
            .map(([address, data]) => ({
                address,
                ...data
            }))
            .sort((a, b) => b.kiloReward - a.kiloReward)
            .map((user, index) => ({
                ...user,
                rank: index + 1
            }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: true,
                data: {
                    date,
                    leaderboard: sortedUsers,
                    totalUsers: sortedUsers.length,
                    summary: item.summary || {}
                }
            })
        };

    } catch (error) {
        console.error('Error getting daily leaderboard:', error);
        throw error;
    }
}

// POST /leaderboard - Store daily summary from Point Bot
// This endpoint requires API key authentication
async function storeDailySummary(event) {
    try {
        // API Gateway handles API key validation automatically
        // If we reach here, the API key is valid
        
        const requestBody = JSON.parse(event.body);
        const { date, distributions, summary } = requestBody;

        console.log(`Storing leaderboard data for ${date} from authenticated bot`);

        if (!date || !distributions || !Array.isArray(distributions)) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Missing required fields: date, distributions'
                })
            };
        }

        // Convert distributions array to simple wallet -> points JSON
        const leaderboardJson = {};
        distributions.forEach((dist) => {
            leaderboardJson[dist.address] = {
                baseTVL: Math.round(dist.baseTVL * 100) / 100,
                netContribution: Math.round(dist.netContribution * 100) / 100,
                basePoints: Math.round(dist.basePoints * 100) / 100,
                multiplier: dist.multiplier,
                weightedPoints: Math.round(dist.weightedPoints * 100) / 100,
                share: Math.round(dist.share * 10000) / 100, // Convert to percentage
                kiloReward: Math.floor(dist.kilo),
                balanceBreakdown: dist.balanceBreakdown || {}
            };
        });

        // Prepare the item for DynamoDB
        const item = {
            date: date,
            leaderboard: leaderboardJson,
            summary: {
                totalUsers: distributions.length,
                totalKiloDistributed: distributions.reduce((sum, d) => sum + Math.floor(d.kilo), 0),
                topUser: distributions[0] ? {
                    address: distributions[0].address,
                    kilo: Math.floor(distributions[0].kilo)
                } : null,
                timestamp: new Date().toISOString(),
                ...summary
            }
        };

        const command = new PutItemCommand({
            TableName: LEADERBOARD_TABLE,
            Item: marshall(item, {
                removeUndefinedValues: true
            })
        });

        await dynamoClient.send(command);

        console.log(`Stored leaderboard for ${date} with ${distributions.length} users`);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: true,
                message: `Stored leaderboard for ${date}`,
                data: {
                    date,
                    usersStored: distributions.length,
                    totalKilo: leaderboardJson ? Object.values(leaderboardJson).reduce((sum, u) => sum + u.kiloReward, 0) : 0
                }
            })
        };

    } catch (error) {
        console.error('Error storing daily summary:', error);
        throw error;
    }
}

// GET /users/{userAddress} - Get user total points
async function getUserPoints(event) {
  try {
    const { userAddress } = event.pathParameters;

    const command = new QueryCommand({
      TableName: USER_POINTS_TABLE,
      KeyConditionExpression: 'userAddress = :user',
      ExpressionAttributeValues: marshall({
        ':user': userAddress
      })
    });

    const result = await dynamoClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          message: 'User not found'
        })
      };
    }

    const items = result.Items.map(i => unmarshall(i));

    // Optionally calculate total points
    const totalPoints = items.reduce((sum, i) => sum + (i.kiloReward || 0), 0);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        totalPoints,
        dailyPoints: items // array of { date, kiloReward }
      })
    };

  } catch (error) {
    console.error('Error getting user points:', error);
    throw error;
  }
}


// GET /users - Get all users for KILO point bot
async function getAllUsers(event) {
  try {
    const command = new ScanCommand({
      TableName: USER_POINTS_TABLE,
      ProjectionExpression: "userAddress" // fetch only PK
    });

    const result = await dynamoClient.send(command);

    const items = (result.Items || []).map(i => unmarshall(i));

    // Deduplicate user addresses
    const uniqueUsers = [...new Set(items.map(i => i.userAddress))].map(addr => ({ userAddress: addr }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: uniqueUsers
      })
    };

  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}
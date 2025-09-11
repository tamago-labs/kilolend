const { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });

const INVITE_TABLE_NAME = process.env.INVITE_TABLE_NAME;
const API_KEY = process.env.API_KEY;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json',
};

// Helper function to format response
const response = (statusCode, body) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
});

// Helper function to validate wallet address
const isValidWalletAddress = (address) => {
    return address && /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Helper function to get current timestamp
const getCurrentTimestamp = () => new Date().toISOString();

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    // Handle preflight OPTIONS requests
    if (event.httpMethod === 'OPTIONS') {
        return response(200, { message: 'OK' });
    }

    const { httpMethod, pathParameters, headers } = event;
    const userAddress = pathParameters?.userAddress?.toLowerCase();

    try {
        // GET /invite/{userAddress} - Get user's invite multiplier
        if (httpMethod === 'GET' && userAddress) {
            if (!isValidWalletAddress(userAddress)) {
                return response(400, {
                    success: false,
                    error: 'Invalid wallet address format'
                });
            }

            try {
                const command = new GetItemCommand({
                    TableName: INVITE_TABLE_NAME,
                    Key: marshall({ userAddress })
                });

                const result = await dynamoClient.send(command);

                if (result.Item) {
                    const item = unmarshall(result.Item);
                    return response(200, {
                        success: true,
                        data: {
                            userAddress,
                            multiplier: item.multiplier,
                            totalInvites: item.totalInvites || 0,
                            lastInviteAt: item.lastInviteAt,
                            createdAt: item.createdAt,
                            updatedAt: item.updatedAt
                        }
                    });
                } else {
                    // User not found, return default multiplier
                    return response(200, {
                        success: true,
                        data: {
                            userAddress,
                            multiplier: 1.0,
                            totalInvites: 0,
                            lastInviteAt: null,
                            isNewUser: true
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching user invite data:', error);
                return response(500, {
                    success: false,
                    error: 'Failed to fetch user invite data'
                });
            }
        }

        // POST /invite/{userAddress} - Top up user's multiplier after successful invite
        if (httpMethod === 'POST' && userAddress) {
            // Validate API key for POST requests
            const apiKey = headers['X-Api-Key'] || headers['x-api-key'];
            if (!apiKey || apiKey !== API_KEY) {
                return response(401, {
                    success: false,
                    error: 'Invalid or missing API key'
                });
            }

            if (!isValidWalletAddress(userAddress)) {
                return response(400, {
                    success: false,
                    error: 'Invalid wallet address format'
                });
            }

            const body = JSON.parse(event.body || '{}');
            const multiplierIncrease = body.multiplierIncrease || 0.02; // Default 2% increase per invite

            // Check if user exists and get current data
            try {
                const getCommand = new GetItemCommand({
                    TableName: INVITE_TABLE_NAME,
                    Key: marshall({ userAddress })
                });

                const currentResult = await dynamoClient.send(getCommand);
                
                const currentItem = currentResult.Item ? unmarshall(currentResult.Item) : {
                    userAddress,
                    multiplier: 1.0,
                    totalInvites: 0,
                    createdAt: getCurrentTimestamp()
                };

                // Check cooldown period (1 minute minimum between invites)
                const lastInviteAt = currentItem.lastInviteAt;
                if (lastInviteAt) {
                    const lastInviteTime = new Date(lastInviteAt);
                    const cooldownMs = 60 * 1000; // 1 minute in milliseconds
                    const timeSinceLastInvite = Date.now() - lastInviteTime.getTime();

                    if (timeSinceLastInvite < cooldownMs) {
                        const remainingCooldown = Math.ceil((cooldownMs - timeSinceLastInvite) / 1000);
                        return response(429, {
                            success: false,
                            error: 'Cooldown period active',
                            remainingCooldownSeconds: remainingCooldown
                        });
                    }
                }

                // Calculate new multiplier (max 2.0x)
                const newMultiplier = Math.min(currentItem.multiplier + multiplierIncrease, 2.0);
                const newTotalInvites = currentItem.totalInvites + 1;
                const timestamp = getCurrentTimestamp();

                // Prepare item for upsert
                const updatedItem = {
                    userAddress,
                    multiplier: newMultiplier,
                    totalInvites: newTotalInvites,
                    lastInviteAt: timestamp,
                    updatedAt: timestamp
                };

                // Add createdAt if it's a new user
                if (!currentResult.Item) {
                    updatedItem.createdAt = timestamp;
                }

                const putCommand = new PutItemCommand({
                    TableName: INVITE_TABLE_NAME,
                    Item: marshall(updatedItem)
                });

                await dynamoClient.send(putCommand);

                return response(200, {
                    success: true,
                    data: {
                        userAddress,
                        multiplier: newMultiplier,
                        totalInvites: newTotalInvites,
                        multiplierIncrease,
                        lastInviteAt: timestamp,
                        isNewRecord: !currentResult.Item
                    },
                    message: 'Invite multiplier updated successfully'
                });

            } catch (error) {
                console.error('Error updating invite multiplier:', error);
                return response(500, {
                    success: false,
                    error: 'Failed to update invite multiplier'
                });
            }
        }

        // Method not allowed
        return response(405, {
            success: false,
            error: 'Method not allowed'
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return response(500, {
            success: false,
            error: 'Internal server error'
        });
    }
};

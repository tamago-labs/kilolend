const {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
  BatchWriteItemCommand
} = require("@aws-sdk/client-dynamodb");

const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const dynamoClient = new DynamoDBClient({});

const LEADERBOARD_TABLE = process.env.LEADERBOARD_TABLE_NAME;
const USER_POINTS_TABLE = process.env.USER_POINTS_TABLE_NAME;

exports.handler = async () => {
  try {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().split("T")[0];
    
    // Get yesterday's leaderboard
    const leaderboardResp = await dynamoClient.send(new GetItemCommand({
      TableName: LEADERBOARD_TABLE,
      Key: marshall({ date: formattedYesterday })
    }));

    if (!leaderboardResp.Item) {
      console.log(`No leaderboard data for ${formattedYesterday}`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `No leaderboard data for ${formattedYesterday}`,
          processed: false
        })
      };
    }

    const leaderboardItem = unmarshall(leaderboardResp.Item);
    const leaderboardData = leaderboardItem.leaderboard || {};

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

    // Read lastProcessedIndex (default 0)
    let lastProcessedIndex = leaderboardItem.lastProcessedIndex || 0;

    // Check if all users have been processed
    if (lastProcessedIndex >= sortedUsers.length) {
      console.log(`All users already processed for ${formattedYesterday}`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `All users already processed for ${formattedYesterday}`,
          totalUsers: sortedUsers.length,
          processed: true,
          complete: true
        })
      };
    }

    // Process up to 25 users per run
    const BATCH_SIZE = 25;
    const batch = sortedUsers.slice(lastProcessedIndex, lastProcessedIndex + BATCH_SIZE);

    console.log(`Processing batch of ${batch.length} users, starting from index ${lastProcessedIndex}`);

    // Build batch write requests for USER_POINTS_TABLE
    // Store daily rewards with date as attribute, so they can be aggregated later
    const requestItems = {
      [USER_POINTS_TABLE]: batch.map((user) => ({
        PutRequest: {
          Item: marshall({
            userAddress: user.address,
            date: formattedYesterday, // sort key
            [formattedYesterday]: user.kiloReward, // Store kilo reward for this specific date
            lastUpdated: new Date().toISOString(),
            status: 'active'
          })
        }
      }))
    };

    console.log(`Sending batch write for ${batch.length} users`);

    // Execute batch write
    const batchCmd = new BatchWriteItemCommand({ RequestItems: requestItems });
    const resp = await dynamoClient.send(batchCmd);

    // Handle unprocessed items
    if (Object.keys(resp.UnprocessedItems || {}).length > 0) {
      console.warn("UnprocessedItems detected, will need retry:", resp.UnprocessedItems);
      // In a production environment, you might want to retry unprocessed items
      // or queue them for retry in a subsequent invocation
    }

    // Update lastProcessedIndex in LEADERBOARD_TABLE
    const newLastIndex = lastProcessedIndex + batch.length;
    const isComplete = newLastIndex >= sortedUsers.length;

    await dynamoClient.send(new UpdateItemCommand({
      TableName: LEADERBOARD_TABLE,
      Key: marshall({ date: formattedYesterday }),
      UpdateExpression: "SET lastProcessedIndex = :index, processingComplete = :complete, lastProcessedTime = :timestamp",
      ExpressionAttributeValues: marshall({
        ":index": newLastIndex,
        ":complete": isComplete,
        ":timestamp": new Date().toISOString()
      })
    }));

    console.log(`Processed ${batch.length} users, lastProcessedIndex=${newLastIndex}, complete=${isComplete}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Successfully updated points for batch',
        date: formattedYesterday,
        batchSize: batch.length,
        lastProcessedIndex: newLastIndex,
        totalUsers: sortedUsers.length,
        processingComplete: isComplete,
        unprocessedItems: Object.keys(resp.UnprocessedItems || {}).length
      })
    };

  } catch (error) {
    console.error("Error updating points:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: error.message,
        error: error.stack
      })
    };
  }
};
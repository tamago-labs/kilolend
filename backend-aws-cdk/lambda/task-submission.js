const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamoClient = new DynamoDBClient({});
const USER_POINTS_TABLE_NAME = process.env.USER_POINTS_TABLE_NAME;

// Simple ID generator for experiment
function generateTaskId() {
  return `task_${Math.floor(Math.random() * 1_000_000_000)}`;
}

exports.handler = async (event) => {
  console.log("Task submission request:", JSON.stringify(event, null, 2));

  try {
    // Parse request body
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { userAddress, action, asset, amount, maxGasPrice } = body;

    // Validate required fields
    if (!userAddress || !action || !asset || !amount) {
      return response(400, {
        success: false,
        error: "Missing required fields: userAddress, action, asset, amount",
      });
    }

    // Validate action
    const validActions = ["supply", "withdraw", "borrow", "repay"];
    if (!validActions.includes(action)) {
      return response(400, {
        success: false,
        error: `Invalid action. Must be one of: ${validActions.join(", ")}`,
      });
    }

    // Validate asset
    const validAssets = ["USDT", "MBX", "BORA", "SIX", "KAIA"];
    if (!validAssets.includes(asset)) {
      return response(400, {
        success: false,
        error: `Invalid asset. Must be one of: ${validAssets.join(", ")}`,
      });
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return response(400, {
        success: false,
        error: "Amount must be a positive number",
      });
    }

    // Generate simple task ID
    const taskId = generateTaskId();
    const timestamp = new Date().toISOString();

    // Task data
    const taskData = {
      request_id: taskId,
      user_address: userAddress,
      action,
      asset,
      amount,
      max_gas_price: maxGasPrice || "50",
      created_at: timestamp,
      status: "PENDING",
    };

    // PutItem params for DynamoDB
    const params = {
      TableName: USER_POINTS_TABLE_NAME,
      Item: {
        userAddress: { S: userAddress },
        date: { S: `EXEC_PENDING_${taskId}` },
        taskData: { S: JSON.stringify(taskData) },
        status: { S: "PENDING" },
        createdAt: { N: Date.now().toString() },
        retryCount: { N: "0" },
        maxRetries: { N: "3" },
      },
    };

    await dynamoClient.send(new PutItemCommand(params));

    console.log(`Task ${taskId} stored successfully for user ${userAddress}`);

    return response(202, {
      success: true,
      taskId,
      status: "PENDING",
      message: "Task submitted for execution",
      estimatedTime: "30-60 seconds",
      userAddress,
      action,
      asset,
      amount,
      checkStatusUrl: `/execute/${taskId}`,
    });
  } catch (error) {
    console.error("Task submission error:", error);
    return response(500, {
      success: false,
      error: "Internal server error",
      message: "Failed to submit task for execution",
    });
  }
};

// Helper response builder
function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

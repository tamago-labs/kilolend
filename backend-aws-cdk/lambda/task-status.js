

const { DynamoDBClient, PutItemCommand, ScanCommand, QueryCommand } = require("@aws-sdk/client-dynamodb"); 

const dynamoClient = new DynamoDBClient({});

const USER_POINTS_TABLE_NAME = process.env.USER_POINTS_TABLE_NAME;

export const handler = async (event) => {
  console.log("Task status request:", JSON.stringify(event, null, 2));

  try {
    const taskId = event.pathParameters?.taskId;
    const userAddress = event.pathParameters?.userAddress;
    const httpMethod = event.httpMethod;

    if (httpMethod === "GET" && taskId) {
      return await getTaskStatus(taskId);
    } else if (httpMethod === "GET" && userAddress) {
      return await getUserExecutionHistory(userAddress);
    } else {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Invalid request. Provide taskId or userAddress",
        }),
      };
    }
  } catch (error) {
    console.error("Task status error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
        message: "Failed to retrieve task status",
      }),
    };
  }
};

async function getTaskStatus(taskId) {
  const possibleStates = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];

  for (const state of possibleStates) {
    try {
      const scanParams = {
        TableName: USER_POINTS_TABLE_NAME,
        FilterExpression: "#date = :dateValue",
        ExpressionAttributeNames: {
          "#date": "date",
        },
        ExpressionAttributeValues: {
          ":dateValue": `EXEC_${state}_${taskId}`,
        },
      };

      const result = await dynamoClient.send(new ScanCommand(scanParams));

      if (result.Items && result.Items.length > 0) {
        const task = result.Items[0];
        const taskData = JSON.parse(task.taskData || "{}");

        const createdAt = new Date(taskData.created_at || task.createdAt);
        const now = new Date();
        const elapsedSeconds = Math.floor((now - createdAt) / 1000);

        const response = {
          taskId,
          status: state,
          userAddress: task.userAddress,
          action: taskData.action,
          asset: taskData.asset,
          amount: taskData.amount,
          createdAt: taskData.created_at || new Date(task.createdAt).toISOString(),
          elapsedSeconds,
          retryCount: task.retryCount || 0,
        };

        if (state === "COMPLETED" && task.result) {
          const resultData = JSON.parse(task.result);
          response.transactionHash = resultData.transaction_hash;
          response.gasUsed = resultData.gas_used;
          response.blockNumber = resultData.block_number;
        } else if (state === "FAILED" && task.result) {
          const resultData = JSON.parse(task.result);
          response.error = resultData.error;
        }

        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(response),
        };
      }
    } catch (error) {
      console.error(`Error checking state ${state}:`, error);
    }
  }

  return {
    statusCode: 404,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      error: "Task not found",
      taskId,
    }),
  };
}

async function getUserExecutionHistory(userAddress) {
  try {
    const queryParams = {
      TableName: USER_POINTS_TABLE_NAME,
      KeyConditionExpression: "userAddress = :userAddress",
      FilterExpression: "begins_with(#date, :execPrefix)",
      ExpressionAttributeNames: {
        "#date": "date",
      },
      ExpressionAttributeValues: {
        ":userAddress": userAddress,
        ":execPrefix": "EXEC_",
      },
      ScanIndexForward: false,
      Limit: 50,
    };

    const result = await dynamoClient.send(new QueryCommand(queryParams));

    const executions = result.Items.map((item) => {
      const taskData = JSON.parse(item.taskData || "{}");
      const status = item.date.split("_")[1];
      const taskId = item.date.split("_").slice(2).join("_");

      const execution = {
        taskId,
        status,
        action: taskData.action,
        asset: taskData.asset,
        amount: taskData.amount,
        createdAt: taskData.created_at || new Date(item.createdAt).toISOString(),
        retryCount: item.retryCount || 0,
      };

      if (item.result) {
        const resultData = JSON.parse(item.result);
        if (status === "COMPLETED") {
          execution.transactionHash = resultData.transaction_hash;
          execution.gasUsed = resultData.gas_used;
        } else if (status === "FAILED") {
          execution.error = resultData.error;
        }
      }

      return execution;
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        userAddress,
        totalExecutions: executions.length,
        executions,
      }),
    };
  } catch (error) {
    console.error("Error getting user execution history:", error);
    throw error;
  }
}

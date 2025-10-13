const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.VAULT_TASKS_TABLE_NAME;
const BOT_ADDRESS = process.env.BOT_ADDRESS;
const API_KEY = process.env.API_KEY;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json',
};

const response = (statusCode, body) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
});

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const path = event.path || event.resource;
  const method = event.httpMethod;

  if (method === 'OPTIONS') {
    return response(200, { message: 'OK' });
  }

  try {
    // POST /bot/activity - Submit task
    if (path.includes('/bot/activity') && method === 'POST') {
      return await submitTask(event);
    }

    // PUT /bot/activity/{taskId} - Update task status
    if (path.match(/\/bot\/activity\/[^/]+$/) && method === 'PUT') {
      return await updateTask(event);
    }

    // GET /bot/activity/{taskId} - Get specific task
    if (path.match(/\/bot\/activity\/[^/]+$/) && method === 'GET') {
      return await getTask(event);
    }

    // GET /bot/activity/recent
    if (path.includes('/bot/activity/recent') && method === 'GET') {
      return await getRecentActivity(event);
    }

    // GET /bot/activity/pending
    if (path.includes('/bot/activity/pending') && method === 'GET') {
      return await getPendingTasks(event);
    }
    
    // GET /bot/activity - All tasks
    if (path.includes('/bot/activity') && method === 'GET') {
      return await getAllActivity(event);
    }
    
    // GET /bot/metrics
    if (path.includes('/bot/metrics') && method === 'GET') {
      return await getBotMetrics(event);
    }

    return response(404, { error: 'Not found' });

  } catch (error) {
    console.error('Error:', error);
    return response(500, { 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

/**
 * Submit new task (bot endpoint)
 */
async function submitTask(event) {
  const apiKey = event.headers['X-Api-Key'] || event.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return response(401, { error: 'Unauthorized' });
  }

  const body = JSON.parse(event.body || '{}');

  if (!body.taskType || !body.userAddress) {
    return response(400, { error: 'Missing required fields: taskType, userAddress' });
  }

  const task = {
    taskId: body.taskId || `TASK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: body.timestamp || Date.now(),
    userAddress: body.userAddress,
    taskType: body.taskType,
    status: body.status || 'PENDING_OPERATOR',
    description: body.description || '',
    steps: body.steps || [],
    parameters: body.parameters || {},
    aiReasoning: body.aiReasoning || '',
    strategyType: body.strategyType || 'KAIA_LEVERAGE_VAULT',
    confidenceScore: body.confidenceScore || 0,
    riskAssessment: body.riskAssessment || 'MEDIUM',
    healthFactorBefore: body.healthFactorBefore || 0,
    healthFactorAfter: body.healthFactorAfter || 0,
    leverageRatio: body.leverageRatio || 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    completedAt: null,
    operatorAddress: null,
    txHash: null,
    executionNotes: null,
    retryCount: body.retryCount || 0,
    botVersion: body.botVersion || '2.0.0',
    aiModel: body.aiModel || 'Claude Sonnet 4'
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: task
  });

  await docClient.send(command);

  console.log('Task submitted:', task.taskId);

  return response(200, {
    success: true,
    message: 'Task submitted successfully',
    taskId: task.taskId,
    task
  });
}

/**
 * Update task status (operator endpoint)
 */
async function updateTask(event) {
  const apiKey = event.headers['X-Api-Key'] || event.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return response(401, { error: 'Unauthorized' });
  }

  const taskId = event.pathParameters?.taskId;
  if (!taskId) {
    return response(400, { error: 'Missing taskId' });
  }

  const body = JSON.parse(event.body || '{}');

  if (!body.status) {
    return response(400, { error: 'Missing status' });
  }

  // Get task first to get timestamp
  const getCommand = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'taskId = :taskId',
    ExpressionAttributeValues: {
      ':taskId': taskId
    },
    Limit: 1
  });

  const getResult = await docClient.send(getCommand);
  
  if (!getResult.Items || getResult.Items.length === 0) {
    return response(404, { error: 'Task not found' });
  }

  const task = getResult.Items[0];

  // Update task
  const updateCommand = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      taskId: taskId,
      timestamp: task.timestamp
    },
    UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt, operatorAddress = :operator, txHash = :txHash, executionNotes = :notes, completedAt = :completedAt',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': body.status,
      ':updatedAt': Date.now(),
      ':operator': body.operatorAddress || null,
      ':txHash': body.txHash || null,
      ':notes': body.executionNotes || null,
      ':completedAt': body.status === 'COMPLETED' ? Date.now() : null
    },
    ReturnValues: 'ALL_NEW'
  });

  const result = await docClient.send(updateCommand);

  return response(200, {
    success: true,
    message: 'Task updated successfully',
    task: result.Attributes
  });
}

/**
 * Get specific task
 */
async function getTask(event) {
  const taskId = event.pathParameters?.taskId;
  if (!taskId) {
    return response(400, { error: 'Missing taskId' });
  }

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'taskId = :taskId',
    ExpressionAttributeValues: {
      ':taskId': taskId
    },
    Limit: 1
  });

  const result = await docClient.send(command);

  if (!result.Items || result.Items.length === 0) {
    return response(404, { error: 'Task not found' });
  }

  return response(200, {
    success: true,
    task: result.Items[0]
  });
}

/**
 * Get all tasks
 */
async function getAllActivity(event) {
  const queryParams = event.queryStringParameters || {};
  const limit = parseInt(queryParams.limit || '50');

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'UserAddressIndex',
    KeyConditionExpression: 'userAddress = :botAddress',
    ExpressionAttributeValues: {
      ':botAddress': BOT_ADDRESS
    },
    ScanIndexForward: false,
    Limit: limit
  });

  const result = await docClient.send(command);

  return response(200, {
    success: true,
    botAddress: BOT_ADDRESS,
    tasks: result.Items || [],
    count: result.Items?.length || 0
  });
}

/**
 * Get recent activity
 */
async function getRecentActivity(event) {
  const queryParams = event.queryStringParameters || {};
  const hours = parseInt(queryParams.hours || '24');
  const limit = parseInt(queryParams.limit || '100');
  
  const since = Date.now() - (hours * 60 * 60 * 1000);

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'UserAddressIndex',
    KeyConditionExpression: 'userAddress = :botAddress AND #ts > :since',
    ExpressionAttributeNames: {
      '#ts': 'timestamp'
    },
    ExpressionAttributeValues: {
      ':botAddress': BOT_ADDRESS,
      ':since': since
    },
    ScanIndexForward: false,
    Limit: limit
  });

  const result = await docClient.send(command);

  return response(200, {
    success: true,
    botAddress: BOT_ADDRESS,
    hours,
    tasks: result.Items || [],
    count: result.Items?.length || 0
  });
}

/**
 * Get pending tasks (for operators)
 */
async function getPendingTasks(event) {
  const queryParams = event.queryStringParameters || {};
  const limit = parseInt(queryParams.limit || '50');

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'UserAddressIndex',
    KeyConditionExpression: 'userAddress = :botAddress',
    FilterExpression: '#status = :pending OR #status = :urgent',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':botAddress': BOT_ADDRESS,
      ':pending': 'PENDING_OPERATOR',
      ':urgent': 'URGENT_OPERATOR_ACTION'
    },
    ScanIndexForward: false,
    Limit: limit
  });

  const result = await docClient.send(command);

  return response(200, {
    success: true,
    botAddress: BOT_ADDRESS,
    tasks: result.Items || [],
    count: result.Items?.length || 0
  });
}

/**
 * Get bot metrics
 */
async function getBotMetrics(event) {
  const queryParams = event.queryStringParameters || {};
  const hours = parseInt(queryParams.hours || '24');
  
  const since = Date.now() - (hours * 60 * 60 * 1000);

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'UserAddressIndex',
    KeyConditionExpression: 'userAddress = :botAddress AND #ts > :since',
    ExpressionAttributeNames: {
      '#ts': 'timestamp'
    },
    ExpressionAttributeValues: {
      ':botAddress': BOT_ADDRESS,
      ':since': since
    },
    ScanIndexForward: false
  });

  const result = await docClient.send(command);
  const tasks = result.Items || [];

  const metrics = {
    totalTasks: tasks.length,
    tasksByType: {},
    tasksByStatus: {},
    averageConfidence: 0,
    riskDistribution: {},
    lastTaskTime: null,
    healthFactors: [],
    currentHealthFactor: null,
    successRate: 0,
    pendingCount: 0,
    completedCount: 0
  };

  let totalConfidence = 0;
  let completedTasks = 0;

  tasks.forEach(task => {
    const type = task.taskType || 'UNKNOWN';
    metrics.tasksByType[type] = (metrics.tasksByType[type] || 0) + 1;

    const status = task.status || 'UNKNOWN';
    metrics.tasksByStatus[status] = (metrics.tasksByStatus[status] || 0) + 1;

    if (status === 'COMPLETED') {
      completedTasks++;
      metrics.completedCount++;
    }

    if (status === 'PENDING_OPERATOR' || status === 'URGENT_OPERATOR_ACTION') {
      metrics.pendingCount++;
    }

    if (task.confidenceScore) {
      totalConfidence += task.confidenceScore;
    }

    const risk = task.riskAssessment || 'UNKNOWN';
    metrics.riskDistribution[risk] = (metrics.riskDistribution[risk] || 0) + 1;

    if (task.healthFactorBefore) {
      metrics.healthFactors.push({
        before: task.healthFactorBefore,
        after: task.healthFactorAfter || 0,
        timestamp: task.timestamp
      });
    }

    if (!metrics.lastTaskTime || task.timestamp > metrics.lastTaskTime) {
      metrics.lastTaskTime = task.timestamp;
    }
  });

  if (tasks.length > 0) {
    metrics.averageConfidence = totalConfidence / tasks.length;
    metrics.successRate = (completedTasks / tasks.length) * 100;
  }

  if (metrics.healthFactors.length > 0) {
    metrics.healthFactors.sort((a, b) => b.timestamp - a.timestamp);
    metrics.currentHealthFactor = metrics.healthFactors[0].before;
  }

  return response(200, {
    success: true,
    botAddress: BOT_ADDRESS,
    period: `${hours} hours`,
    metrics
  });
}

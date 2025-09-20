import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class BackendAwsCdkStack extends cdk.Stack {

  public readonly api: apigateway.RestApi;
  public readonly pricesTable: dynamodb.Table;
  public readonly leaderboardTable: dynamodb.Table;
  public readonly userPointsTable: dynamodb.Table;
  public readonly inviteTable: dynamodb.Table;
  public readonly cluster: ecs.Cluster;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create CloudWatch Log Group
    const lambdaLogGroup = new logs.LogGroup(this, 'CryptoPriceLambdaLogGroup', {
      logGroupName: '/aws/lambda/crypto-price-functions',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ========================================
    // NETWORKING - VPC and Load Balancer
    // ========================================

    const vpc = new ec2.Vpc(this, 'InferenceVPC', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ]
    });

    // ========================================
    // ECS Cluster - BOTS
    // ========================================

    // ECS Cluster for running liquidation and oracle bots
    this.cluster = new ecs.Cluster(this, 'KiloLendCluster', {
      vpc,
      clusterName: 'kilolend-bots'
    });

    const executionRole = new iam.Role(this, 'BotsExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    const taskRole = new iam.Role(this, 'BotsTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    const taskDef = new ecs.FargateTaskDefinition(this, 'KilolendBotsTaskDef', {
      cpu: 1024, // total CPU shared by all containers
      memoryLimitMiB: 2048, // total memory pool
      executionRole,
      taskRole,
    });

    // Oracle Bot
    taskDef.addContainer('OracleBot', {
      image: ecs.ContainerImage.fromRegistry(
        '057386374967.dkr.ecr.ap-northeast-1.amazonaws.com/kilolend-oracle-bot:latest',
      ),
      essential: true,
      environment: {
        NODE_ENV: 'production',
        AWS_REGION: this.region,
        BOT_TYPE: 'oracle',
        RPC_URL: "https://public-en.node.kaia.io",
        PRIVATE_KEY: "",
        ORACLE_ADDRESS: "0xBB265F42Cce932c5e383536bDf50B82e08eaf454",
        USDT_ADDRESS: "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
        SIX_ADDRESS: "0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435",
        BORA_ADDRESS: "0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa",
        MBX_ADDRESS: "0xD068c52d81f4409B9502dA926aCE3301cc41f623",
        UPDATE_INTERVAL_MINUTES: "120",
        PRICE_API_URL: "https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod/prices"
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'oracle-bot',
        logGroup: new logs.LogGroup(this, 'OracleBotLogGroup', {
          logGroupName: '/ecs/oracle-bot',
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      }),
    });

    // Liquidation Bot
    taskDef.addContainer('LiquidationBot', {
      image: ecs.ContainerImage.fromRegistry(
        '057386374967.dkr.ecr.ap-northeast-1.amazonaws.com/liquidation-bot:latest',
      ),
      essential: true,
      environment: {
        NODE_ENV: 'production',
        AWS_REGION: this.region,
        BOT_TYPE: 'liquidation',
        RPC_URL: "https://public-en.node.kaia.io",
        API_BASE_URL: 'https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod',
        PRIVATE_KEY: '', 
        COMPTROLLER_ADDRESS: '0x0B5f0Ba5F13eA4Cb9C8Ee48FB75aa22B451470C2',
        ORACLE_ADDRESS: '0xBB265F42Cce932c5e383536bDf50B82e08eaf454', 
        CUSDT_ADDRESS: '0x498823F094f6F2121CcB4e09371a57A96d619695',
        CSIX_ADDRESS: '0xC468dFD0C96691035B3b1A4CA152Cb64F0dbF64c',
        CBORA_ADDRESS: '0x7a937C07d49595282c711FBC613c881a83B9fDFD',
        CMBX_ADDRESS: '0xE321e20F0244500A194543B1EBD8604c02b8fA85',
        CKAIA_ADDRESS: '0x98Ab86C97Ebf33D28fc43464353014e8c9927aB3', 
        USDT_ADDRESS: '0xd077A400968890Eacc75cdc901F0356c943e4fDb',
        SIX_ADDRESS: '0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435',
        BORA_ADDRESS: '0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa',
        MBX_ADDRESS: '0xD068c52d81f4409B9502dA926aCE3301cc41f623', 
        CHECK_INTERVAL_SECONDS: '600',
        MIN_PROFIT_USD: '10',
        MAX_GAS_PRICE_GWEI: '50',
        LIQUIDATION_INCENTIVE: '0.08',
        CLOSE_FACTOR: '0.5', 
        MAX_LIQUIDATION_USD: '100',
        MIN_COLLATERAL_USD: '10',
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'liquidation-bot',
        logGroup: new logs.LogGroup(this, 'LiquidationBotLogGroup', {
          logGroupName: '/ecs/liquidation-bot',
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      }),
    });

    // Points Bot
    taskDef.addContainer('PointBot', {
      image: ecs.ContainerImage.fromRegistry(
        '057386374967.dkr.ecr.ap-northeast-1.amazonaws.com/kilolend-point-bot:latest',
      ),
      essential: true,
      environment: {
        NODE_ENV: 'production',
        AWS_REGION: this.region,
        BOT_TYPE: 'points',
        RPC_URL: 'https://public-en.node.kaia.io', 
        API_BASE_URL: 'https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod',
        API_KEY: "",
        CUSDT_ADDRESS: '0x498823F094f6F2121CcB4e09371a57A96d619695',
        CSIX_ADDRESS: '0xC468dFD0C96691035B3b1A4CA152Cb64F0dbF64c',
        CBORA_ADDRESS: '0x7a937C07d49595282c711FBC613c881a83B9fDFD',
        CMBX_ADDRESS: '0xE321e20F0244500A194543B1EBD8604c02b8fA85',
        CKAIA_ADDRESS: '0x98Ab86C97Ebf33D28fc43464353014e8c9927aB3',
        USDT_ADDRESS: '0xd077A400968890Eacc75cdc901F0356c943e4fDb',
        SIX_ADDRESS: '0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435',
        BORA_ADDRESS: '0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa',
        MBX_ADDRESS: '0xD068c52d81f4409B9502dA926aCE3301cc41f623',
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'point-bot',
        logGroup: new logs.LogGroup(this, 'PointBotLogGroup', {
          logGroupName: '/ecs/point-bot',
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      }),
    });

    // Service to run all together
    new ecs.FargateService(this, 'KilolendBotsService', {
      cluster: this.cluster,
      serviceName: 'kilolend-bots',
      taskDefinition: taskDef,
      desiredCount: 1,
      assignPublicIp: true,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });


    // ========================================
    // DATABASE - DynamoDB
    // ========================================

    // DynamoDB Table for storing cryptocurrency prices
    this.pricesTable = new dynamodb.Table(this, 'CryptoPricesTable', {
      tableName: 'crypto-prices',
      partitionKey: {
        name: 'symbol',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Create Global Secondary Index for querying by timestamp
    this.pricesTable.addGlobalSecondaryIndex({
      indexName: 'TimestampIndex',
      partitionKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // DynamoDB Table for daily leaderboard data
    this.leaderboardTable = new dynamodb.Table(this, 'LeaderboardTable', {
      tableName: 'kilo-leaderboard',
      partitionKey: {
        name: 'date',           // e.g., "2025-09-09"
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // DynamoDB Table for user total KILO points
    this.userPointsTable = new dynamodb.Table(this, 'UserPointsTable', {
      tableName: 'kilo-user-points-2',
      partitionKey: {
        name: 'userAddress',    // User wallet address
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'date',           // YYYY-MM-DD
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // DynamoDB Table for invite multipliers
    this.inviteTable = new dynamodb.Table(this, 'InviteTable', {
      tableName: 'kilo-invite-multipliers',
      partitionKey: {
        name: 'userAddress',    // User wallet address
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // IAM Role for Lambda functions with access to all tables
    const lambdaRole = new iam.Role(this, 'CryptoPriceLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        DynamoDBAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:PutItem',
                'dynamodb:GetItem',
                'dynamodb:Query',
                'dynamodb:Scan',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:BatchWriteItem',
                'dynamodb:BatchGetItem',
              ],
              resources: [
                this.pricesTable.tableArn,
                `${this.pricesTable.tableArn}/index/*`,
                this.leaderboardTable.tableArn,
                `${this.leaderboardTable.tableArn}/index/*`,
                this.userPointsTable.tableArn,
                `${this.userPointsTable.tableArn}/index/*`,
                this.inviteTable.tableArn,
                `${this.inviteTable.tableArn}/index/*`,
              ],
            }),
          ],
        }),
      },
    });

    // Price Fetcher Lambda Function (scheduled to run every hour)
    const priceFetcherFunction = new lambda.Function(this, 'PriceFetcherFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'price-fetcher.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.minutes(5),
      memorySize: 256,
      role: lambdaRole,
      logGroup: lambdaLogGroup,
      environment: {
        PRICES_TABLE_NAME: this.pricesTable.tableName
      },
    });

    // Point Snapshot Lambda Function (scheduled to run every hour)
    const pointSnapshotFunction = new lambda.Function(this, 'KiloPointSnapshotFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'point-snapshot.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.minutes(5),
      memorySize: 256,
      role: lambdaRole,
      logGroup: lambdaLogGroup,
      environment: {
        LEADERBOARD_TABLE_NAME: this.leaderboardTable.tableName,
        USER_POINTS_TABLE_NAME: this.userPointsTable.tableName
      },
    });

    // API Lambda Function (for frontend requests)
    const priceApiFunction = new lambda.Function(this, 'PriceApiFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'price-api.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      role: lambdaRole,
      logGroup: lambdaLogGroup,
      environment: {
        PRICES_TABLE_NAME: this.pricesTable.tableName,
      },
    });

    // Leaderboard API Lambda Function
    const leaderboardApiFunction = new lambda.Function(this, 'LeaderboardApiFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'leaderboard-api.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      role: lambdaRole,
      logGroup: lambdaLogGroup,
      environment: {
        LEADERBOARD_TABLE_NAME: this.leaderboardTable.tableName,
        USER_POINTS_TABLE_NAME: this.userPointsTable.tableName,
      },
    });

    // Invite API Lambda Function
    const inviteApiFunction = new lambda.Function(this, 'InviteApiFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'invite-api.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      role: lambdaRole,
      logGroup: lambdaLogGroup,
      environment: {
        INVITE_TABLE_NAME: this.inviteTable.tableName,
        API_KEY: ''
      },
    });

    // EventBridge Rule to trigger price fetcher every hour
    const priceScheduleRule = new events.Rule(this, 'PriceScheduleRule', {
      ruleName: 'crypto-price-fetcher-schedule',
      description: 'Trigger crypto price fetcher every hour',
      schedule: events.Schedule.rate(cdk.Duration.hours(1)),
    });

    // Add the Lambda function as a target to the EventBridge rule
    priceScheduleRule.addTarget(new targets.LambdaFunction(priceFetcherFunction));

    // EventBridge Rule to trigger point snapshot every hour
    const snapshotScheduleRule = new events.Rule(this, 'PointSnapshotRule', {
      ruleName: 'point-snapshot-schedule',
      description: 'Trigger point snapshot for user table every 15 minutes',
      schedule: events.Schedule.rate(cdk.Duration.minutes(15)),
    });

    // Add the Lambda function as a target to the EventBridge rule
    snapshotScheduleRule.addTarget(new targets.LambdaFunction(pointSnapshotFunction));

    // ========================================
    // API Gateway with API Key Authentication
    // ========================================

    // API Gateway
    this.api = new apigateway.RestApi(this, 'CryptoPriceApi', {
      restApiName: 'KiloLend API',
      description: 'API for cryptocurrency prices and leaderboard',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      },
    });

    // Create API Key for bot authentication
    const apiKey = new apigateway.ApiKey(this, 'KiloLendBotApiKey', {
      apiKeyName: 'kilolend-bot-key',
      description: 'API Key for KiloLend bots to access protected endpoints',
    });

    // Create Usage Plan
    const usagePlan = new apigateway.UsagePlan(this, 'KiloLendUsagePlan', {
      name: 'kilolend-bot-usage-plan',
      description: 'Usage plan for KiloLend bots',
      throttle: {
        rateLimit: 100,  // requests per second
        burstLimit: 200, // burst capacity
      },
      quota: {
        limit: 10000,    // requests per period
        period: apigateway.Period.DAY,
      },
      apiStages: [
        {
          api: this.api,
          stage: this.api.deploymentStage,
        },
      ],
    });

    // Associate API Key with Usage Plan
    usagePlan.addApiKey(apiKey);

    // API Gateway Integration
    const priceApiIntegration = new apigateway.LambdaIntegration(priceApiFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    const leaderboardApiIntegration = new apigateway.LambdaIntegration(leaderboardApiFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    const inviteApiIntegration = new apigateway.LambdaIntegration(inviteApiFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    // API Gateway Resources and Methods

    // Prices endpoints
    const pricesResource = this.api.root.addResource('prices');
    pricesResource.addMethod('GET', priceApiIntegration); // GET /prices - get all latest prices

    const singlePriceResource = pricesResource.addResource('{symbol}');
    singlePriceResource.addMethod('GET', priceApiIntegration); // GET /prices/{symbol} - get price for specific token

    // Leaderboard endpoints
    const leaderboardResource = this.api.root.addResource('leaderboard');
    leaderboardResource.addMethod('GET', leaderboardApiIntegration); // GET /leaderboard - get today's leaderboard (public)
    leaderboardResource.addMethod('POST', leaderboardApiIntegration, {
      apiKeyRequired: true, // Require API key for POST requests
    }); // POST /leaderboard - store daily summary (protected)

    const dailyLeaderboardResource = leaderboardResource.addResource('{date}');
    dailyLeaderboardResource.addMethod('GET', leaderboardApiIntegration); // GET /leaderboard/2025-09-09

    // User points endpoints
    const usersResource = this.api.root.addResource('users');
    const userPointsResource = usersResource.addResource('{userAddress}');
    userPointsResource.addMethod('GET', leaderboardApiIntegration); // GET /users/{address} - get user points

    // Get all users endpoints
    const allResource = this.api.root.addResource('all');
    allResource.addMethod('GET', leaderboardApiIntegration); // GET /all - get all user wallets

    // Invite endpoints
    const inviteResource = this.api.root.addResource('invite');
    const inviteUserResource = inviteResource.addResource('{userAddress}');
    inviteUserResource.addMethod('GET', inviteApiIntegration); // GET /invite/{address} - get user invite multiplier
    inviteUserResource.addMethod('POST', inviteApiIntegration, {
      apiKeyRequired: true, // Require API key for POST requests
    }); // POST /invite/{address} - update invite multiplier (protected)

    // ========================================
    // EXECUTION TASK SUBMISSION API (EXPERIMENT)
    // ========================================

    // Task Submission Lambda Function
    const taskSubmissionFunction = new lambda.Function(this, 'TaskSubmissionFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'task-submission.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      role: lambdaRole, // Use your existing lambda role
      logGroup: lambdaLogGroup, // Use your existing log group
      environment: {
        USER_POINTS_TABLE_NAME: this.userPointsTable.tableName, // Use existing table
      },
    });

    // Task Status Check Lambda Function
    const taskStatusFunction = new lambda.Function(this, 'TaskStatusFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'task-status.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      role: lambdaRole, // Use your existing lambda role
      logGroup: lambdaLogGroup,
      environment: {
        USER_POINTS_TABLE_NAME: this.userPointsTable.tableName,
      },
    });

    // API Gateway Integration
    const taskSubmissionIntegration = new apigateway.LambdaIntegration(taskSubmissionFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    const taskStatusIntegration = new apigateway.LambdaIntegration(taskStatusFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    // Add API endpoints to your existing API
    // Execution endpoints
    const executeResource = this.api.root.addResource('execute');
    
    // POST /execute - Submit execution task
    executeResource.addMethod('POST', taskSubmissionIntegration, {
      requestValidator: new apigateway.RequestValidator(this, 'TaskSubmissionValidator', {
        restApi: this.api,
        validateRequestBody: true,
        validateRequestParameters: true,
      }),
      requestModels: {
        'application/json': new apigateway.Model(this, 'TaskSubmissionModel', {
          restApi: this.api,
          contentType: 'application/json',
          schema: {
            type: apigateway.JsonSchemaType.OBJECT,
            properties: {
              userAddress: { type: apigateway.JsonSchemaType.STRING },
              action: { 
                type: apigateway.JsonSchemaType.STRING,
                enum: ['supply', 'withdraw', 'borrow', 'repay']
              },
              asset: { 
                type: apigateway.JsonSchemaType.STRING,
                enum: ['USDT', 'MBX', 'BORA', 'SIX', 'KAIA']
              },
              amount: { type: apigateway.JsonSchemaType.STRING },
              maxGasPrice: { type: apigateway.JsonSchemaType.STRING },
            },
            required: ['userAddress', 'action', 'asset', 'amount'],
          },
        }),
      },
    });

    // GET /execute/{taskId} - Check task status
    const taskStatusResource = executeResource.addResource('{taskId}');
    taskStatusResource.addMethod('GET', taskStatusIntegration);

    // GET /execute/user/{userAddress} - Get user's execution history
    const userTasksResource = executeResource.addResource('user').addResource('{userAddress}');
    userTasksResource.addMethod('GET', taskStatusIntegration);


    // Output important information
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'PricesTableName', {
      value: this.pricesTable.tableName,
      description: 'DynamoDB Table Name for Prices',
    });

    new cdk.CfnOutput(this, 'LeaderboardTableName', {
      value: this.leaderboardTable.tableName,
      description: 'DynamoDB Table Name for Leaderboard',
    });

    new cdk.CfnOutput(this, 'UserPointsTableName', {
      value: this.userPointsTable.tableName,
      description: 'DynamoDB Table Name for User Points',
    });

    new cdk.CfnOutput(this, 'PriceFetcherFunctionName', {
      value: priceFetcherFunction.functionName,
      description: 'Price Fetcher Lambda Function Name',
    });

    new cdk.CfnOutput(this, 'PriceApiFunctionName', {
      value: priceApiFunction.functionName,
      description: 'Price API Lambda Function Name',
    });

    new cdk.CfnOutput(this, 'LeaderboardApiFunctionName', {
      value: leaderboardApiFunction.functionName,
      description: 'Leaderboard API Lambda Function Name',
    });

    new cdk.CfnOutput(this, 'InviteApiFunctionName', {
      value: inviteApiFunction.functionName,
      description: 'Invite API Lambda Function Name',
    });

    new cdk.CfnOutput(this, 'InviteTableName', {
      value: this.inviteTable.tableName,
      description: 'DynamoDB Table Name for Invite Multipliers',
    });

    new cdk.CfnOutput(this, 'ApiKeyId', {
      value: apiKey.keyId,
      description: 'API Key ID for KiloLend bots',
    });

    new cdk.CfnOutput(this, 'UsagePlanId', {
      value: usagePlan.usagePlanId,
      description: 'Usage Plan ID for KiloLend bots',
    });
  }
}

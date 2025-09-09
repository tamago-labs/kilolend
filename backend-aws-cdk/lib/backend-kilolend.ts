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
      tableName: 'kilo-user-points',
      partitionKey: {
        name: 'userAddress',    // User wallet address
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // GSI for ranking users by total points
    this.userPointsTable.addGlobalSecondaryIndex({
      indexName: 'TotalPointsIndex',
      partitionKey: {
        name: 'status',         // Always "active" for all users
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'totalKilo',      // Sort by total KILO descending
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.ALL,
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
      memorySize: 512,
      role: lambdaRole,
      logGroup: lambdaLogGroup,
      environment: {
        PRICES_TABLE_NAME: this.pricesTable.tableName
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

    // EventBridge Rule to trigger price fetcher every hour
    const priceScheduleRule = new events.Rule(this, 'PriceScheduleRule', {
      ruleName: 'crypto-price-fetcher-schedule',
      description: 'Trigger crypto price fetcher every hour',
      schedule: events.Schedule.rate(cdk.Duration.hours(1)),
    });

    // Add the Lambda function as a target to the EventBridge rule
    priceScheduleRule.addTarget(new targets.LambdaFunction(priceFetcherFunction));

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

    // API Gateway Integration
    const priceApiIntegration = new apigateway.LambdaIntegration(priceApiFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    const leaderboardApiIntegration = new apigateway.LambdaIntegration(leaderboardApiFunction, {
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
    leaderboardResource.addMethod('GET', leaderboardApiIntegration); // GET /leaderboard - get today's leaderboard
    leaderboardResource.addMethod('POST', leaderboardApiIntegration); // POST /leaderboard - store daily summary

    const dailyLeaderboardResource = leaderboardResource.addResource('{date}');
    dailyLeaderboardResource.addMethod('GET', leaderboardApiIntegration); // GET /leaderboard/2025-09-09

    // User points endpoints
    const usersResource = this.api.root.addResource('users');
    const userPointsResource = usersResource.addResource('{userAddress}');
    userPointsResource.addMethod('GET', leaderboardApiIntegration); // GET /users/{address} - get user points
    
    // const pointsResource = userPointsResource.addResource('points');
    // pointsResource.addMethod('POST', leaderboardApiIntegration); // POST /users/{address}/points - add points

    // Manual trigger endpoint for testing
    // const triggerResource = this.api.root.addResource('trigger');
    // const triggerIntegration = new apigateway.LambdaIntegration(priceFetcherFunction);
    // triggerResource.addMethod('POST', triggerIntegration); // POST /trigger - manual price fetch

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
  }
}

import * as cdk from 'aws-cdk-lib';
import { BackendAwsCdkStack } from '../lib/backend-kilolend';

const app = new cdk.App();
new BackendAwsCdkStack(app, 'BackendKiloLend', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

import AWS from 'aws-sdk';
import { config } from './env';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region
});

// Create S3 instance
export const s3 = new AWS.S3();

// Export configuration
export const awsConfig = {
  bucketName: config.aws.bucketName,
  region: config.aws.region
};
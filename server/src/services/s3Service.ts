import AWS from 'aws-sdk';
import { s3, awsConfig } from '../config/aws';

export interface S3UploadResult {
  location: string;
  key: string;
}

export const uploadFile = async (fileBuffer: Buffer, fileName: string, mimeType: string): Promise<S3UploadResult> => {
  const params = {
    Bucket: awsConfig.bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType
  };

  try {
    const result = await s3.upload(params).promise();
    return {
      location: result.Location,
      key: result.Key
    };
  } catch (error) {
    throw new Error(`S3 upload failed: ${error}`);
  }
};

export const deleteFile = async (key: string): Promise<void> => {
  const params = {
    Bucket: awsConfig.bucketName,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    throw new Error(`S3 delete failed: ${error}`);
  }
};

export const getFileUrl = (key: string): string => {
  const params = {
    Bucket: awsConfig.bucketName,
    Key: key,
    Expires: 3600 // URL expires in 1 hour
  };

  return s3.getSignedUrl('getObject', params);
};
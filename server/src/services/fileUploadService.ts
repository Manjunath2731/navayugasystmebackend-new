import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { s3, awsConfig } from '../config/aws';
import { AppError } from '../utils/errors';

interface FileUploadResult {
  location: string;
  key: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export const uploadFileToS3 = async (file: Express.Multer.File): Promise<FileUploadResult> => {
  try {
    // Validate file
    if (!file) {
      throw new AppError('No file provided', 400);
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Upload parameters
    const params = {
      Bucket: awsConfig.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        'original-name': file.originalname,
        'upload-date': new Date().toISOString()
      }
    };

    // Upload to S3
    const result = await s3.upload(params).promise();
    
    return {
      location: result.Location,
      key: result.Key,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw new AppError('Failed to upload file to S3', 500);
  }
};

export const uploadMultipleFilesToS3 = async (files: Express.Multer.File[]): Promise<FileUploadResult[]> => {
  try {
    if (!files || files.length === 0) {
      throw new AppError('No files provided', 400);
    }

    // Upload all files concurrently
    const uploadPromises = files.map(file => uploadFileToS3(file));
    const results = await Promise.all(uploadPromises);
    
    return results;
  } catch (error) {
    console.error('Multiple file upload error:', error);
    throw new AppError('Failed to upload files to S3', 500);
  }
};

export const deleteFileFromS3 = async (key: string): Promise<void> => {
  try {
    const params = {
      Bucket: awsConfig.bucketName,
      Key: key
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('File deletion error:', error);
    throw new AppError('Failed to delete file from S3', 500);
  }
};

export const getFileUrlFromS3 = (key: string): string => {
  try {
    const params = {
      Bucket: awsConfig.bucketName,
      Key: key,
      Expires: 3600 // URL expires in 1 hour
    };

    return s3.getSignedUrl('getObject', params);
  } catch (error) {
    console.error('File URL generation error:', error);
    throw new AppError('Failed to generate file URL', 500);
  }
};
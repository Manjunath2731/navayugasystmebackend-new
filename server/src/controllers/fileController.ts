import { Request, Response, NextFunction } from 'express';
import { uploadFileToS3, uploadMultipleFilesToS3, deleteFileFromS3, getFileUrlFromS3 } from '../services/fileUploadService';
import { AppError } from '../utils/errors';
import { fileKeySchema, fileUploadSchema, multipleFileUploadSchema } from '../validation/fileValidation';

export const uploadSingleFile = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    // Check if file exists
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    // Validate file properties
    const fileData = {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    };
    
    fileUploadSchema.parse(fileData);

    // Upload file to S3
    const result = await uploadFileToS3(req.file);
    
    return res.status(201).json({
      status: 'success',
      message: 'File uploaded successfully',
      data: {
        file: result
      }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMultipleFiles = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    // Check if files exist
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return next(new AppError('No files uploaded', 400));
    }

    // Validate each file
    const fileDataArray = files.map(file => ({
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    }));
    
    multipleFileUploadSchema.parse({ files: fileDataArray });

    // Upload files to S3
    const results = await uploadMultipleFilesToS3(files);
    
    return res.status(201).json({
      status: 'success',
      message: `${results.length} files uploaded successfully`,
      data: {
        files: results
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    // Validate file key
    const { key } = req.params;
    fileKeySchema.parse({ key });

    // Delete file from S3
    await deleteFileFromS3(key);
    
    return res.status(200).json({
      status: 'success',
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getFileUrl = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    // Validate file key
    const { key } = req.params;
    fileKeySchema.parse({ key });

    // Get file URL from S3
    const url = getFileUrlFromS3(key);
    
    return res.status(200).json({
      status: 'success',
      data: {
        url,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      }
    });
  } catch (error) {
    next(error);
  }
};
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

interface ErrorResponse {
  status: 'error' | 'fail';
  message: string;
  statusCode: number;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response<any, Record<string, any>> => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  // Handle specific error types
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
      statusCode: err.statusCode
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    return res.status(400).json({
      status: 'fail',
      message,
      statusCode: 400
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    return res.status(400).json({
      status: 'fail',
      message,
      statusCode: 400
    });
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID';
    return res.status(400).json({
      status: 'fail',
      message,
      statusCode: 400
    });
  }

  // Default error response
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    statusCode: 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
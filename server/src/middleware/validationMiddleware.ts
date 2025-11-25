import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      schema.parse(req.body);
      next();
    } catch (error: any) {
      // Handle Zod validation errors
      if (error.errors) {
        const errorMessage = error.errors.map((err: any) => err.message).join(', ');
        return next(new ValidationError(errorMessage));
      }
      
      // Handle other validation errors
      return next(new ValidationError('Validation failed'));
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request params against schema
      schema.parse(req.params);
      next();
    } catch (error: any) {
      // Handle Zod validation errors
      if (error.errors) {
        const errorMessage = error.errors.map((err: any) => err.message).join(', ');
        return next(new ValidationError(errorMessage));
      }
      
      // Handle other validation errors
      return next(new ValidationError('Validation failed'));
    }
  };
};
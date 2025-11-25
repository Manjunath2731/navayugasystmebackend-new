import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserProfile } from '../services/userService';
import { AppError } from '../utils/errors';
import { validate } from '../middleware/validationMiddleware';
import { registerSchema, loginSchema } from '../validation/userValidation';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    
    // Register user through service layer
    const result = await registerUser(validatedData);
    
    return res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    
    // Login user through service layer
    const result = await loginUser(validatedData);
    
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }
    
    // Get user profile through service layer
    const user = await getUserProfile((req.user._id as any).toString());
    
    return res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};
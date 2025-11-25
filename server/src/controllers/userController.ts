import { Request, Response, NextFunction } from 'express';
import { createUserSchema, updateUserSchema, userIdSchema } from '../validation/userValidation';
import { createUser as createUserService, getAllUsers, getUserById as getUserByIdService, updateUser as updateUserService, deleteUser as deleteUserService } from '../services/userService';
import { AppError } from '../utils/errors';
import { IUser, UserRole } from '../models/User';

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    // Validate request body
    const validatedData = createUserSchema.parse(req.body);
    
    // Create user through service layer
    const user = await createUserService(validatedData, (req.user as IUser).role);
    
    return res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }
    
    // Get all users through service layer
    const users = await getAllUsers((req.user as IUser).role);
    
    return res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    // Validate request params
    const validatedParams = userIdSchema.parse(req.params);
    
    // Get user by ID through service layer
    const user = await getUserByIdService(validatedParams, (req.user as IUser).role);
    
    return res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    // Validate request params and body
    const validatedParams = userIdSchema.parse(req.params);
    const validatedData = updateUserSchema.parse(req.body);
    
    // Merge params and body for service layer
    const updateData = { ...validatedParams, ...validatedData };
    
    // Update user through service layer
    const user = await updateUserService(updateData, (req.user as IUser).role);
    
    return res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    // Validate request params
    const validatedParams = userIdSchema.parse(req.params);
    
    // Delete user through service layer
    const result = await deleteUserService(validatedParams, (req.user as IUser).role);
    
    return res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};
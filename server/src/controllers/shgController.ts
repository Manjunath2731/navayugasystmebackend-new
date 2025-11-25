import { Request, Response, NextFunction } from 'express';
import { createSHG, getAllSHGs, getSHGById, updateSHG, deleteSHG } from '../services/shgService';
import { AppError } from '../utils/errors';
import { shgIdSchema } from '../validation/shgValidation';
import { createSHGSchema, updateSHGSchema } from '../validation/shgValidation';
import { IUser } from '../models/User';

export const createSHGHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedData = createSHGSchema.parse(req.body);
    const shg = await createSHG(validatedData, (req.user as IUser).role);

    return res.status(201).json({
      status: 'success',
      message: 'SHG created successfully',
      data: { shg }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSHGsHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

    const result = await getAllSHGs(
      (req.user as IUser).role,
      (req.user._id as any).toString(),
      validPage,
      validLimit
    );

    return res.status(200).json({
      status: 'success',
      data: {
        shgs: result.shgs,
        pagination: result.pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSHGByIdHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = shgIdSchema.parse(req.params);
    const shg = await getSHGById(validatedParams, (req.user as IUser).role, (req.user._id as any).toString());

    return res.status(200).json({
      status: 'success',
      data: { shg }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSHGHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = shgIdSchema.parse(req.params);
    const validatedData = updateSHGSchema.parse(req.body);
    const shg = await updateSHG({ ...validatedParams, ...validatedData }, (req.user as IUser).role);

    return res.status(200).json({
      status: 'success',
      message: 'SHG updated successfully',
      data: { shg }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSHGHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = shgIdSchema.parse(req.params);
    const result = await deleteSHG(validatedParams, (req.user as IUser).role);

    return res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};


import { Request, Response, NextFunction } from 'express';
import { createLinkage, getAllLinkages, getLinkageById, updateLinkage, deleteLinkage } from '../services/linkageService';
import { AppError } from '../utils/errors';
import { linkageIdSchema } from '../validation/linkageValidation';
import { createLinkageSchema, updateLinkageSchema } from '../validation/linkageValidation';
import { IUser } from '../models/User';

export const createLinkageHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedData = createLinkageSchema.parse(req.body);
    const linkage = await createLinkage(validatedData, (req.user as IUser).role);

    return res.status(201).json({
      status: 'success',
      message: 'Linkage created successfully',
      data: { linkage }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLinkagesHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    const linkages = await getAllLinkages();

    return res.status(200).json({
      status: 'success',
      data: { linkages }
    });
  } catch (error) {
    next(error);
  }
};

export const getLinkageByIdHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = linkageIdSchema.parse(req.params);
    const linkage = await getLinkageById(validatedParams, (req.user as IUser).role);

    return res.status(200).json({
      status: 'success',
      data: { linkage }
    });
  } catch (error) {
    next(error);
  }
};

export const updateLinkageHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = linkageIdSchema.parse(req.params);
    const validatedData = updateLinkageSchema.parse(req.body);
    const linkage = await updateLinkage({ ...validatedParams, ...validatedData }, (req.user as IUser).role);

    return res.status(200).json({
      status: 'success',
      message: 'Linkage updated successfully',
      data: { linkage }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLinkageHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = linkageIdSchema.parse(req.params);
    const result = await deleteLinkage(validatedParams, (req.user as IUser).role);

    return res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};


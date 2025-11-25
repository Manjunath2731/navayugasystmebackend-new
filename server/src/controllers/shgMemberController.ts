import { Request, Response, NextFunction } from 'express';
import { createSHGMember, getAllSHGMembers, getSHGMemberById, updateSHGMember, deleteSHGMember } from '../services/shgMemberService';
import { AppError } from '../utils/errors';
import { shgMemberIdSchema } from '../validation/shgMemberValidation';
import { createSHGMemberSchema, updateSHGMemberSchema } from '../validation/shgMemberValidation';
import { IUser } from '../models/User';

export const createSHGMemberHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedData = createSHGMemberSchema.parse(req.body);
    const member = await createSHGMember(validatedData, (req.user as IUser).role);

    return res.status(201).json({
      status: 'success',
      message: 'SHG member created successfully',
      data: { member }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSHGMembersHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const shgId = req.query.shgId as string | undefined;
    const members = await getAllSHGMembers(shgId, (req.user as IUser).role, (req.user._id as any).toString());

    return res.status(200).json({
      status: 'success',
      data: { members }
    });
  } catch (error) {
    next(error);
  }
};

export const getSHGMemberByIdHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = shgMemberIdSchema.parse(req.params);
    const member = await getSHGMemberById(validatedParams, (req.user as IUser).role, (req.user._id as any).toString());

    return res.status(200).json({
      status: 'success',
      data: { member }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSHGMemberHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = shgMemberIdSchema.parse(req.params);
    const validatedData = updateSHGMemberSchema.parse(req.body);
    const member = await updateSHGMember({ ...validatedParams, ...validatedData }, (req.user as IUser).role);

    return res.status(200).json({
      status: 'success',
      message: 'SHG member updated successfully',
      data: { member }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSHGMemberHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = shgMemberIdSchema.parse(req.params);
    const result = await deleteSHGMember(validatedParams, (req.user as IUser).role);

    return res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};


import { Request, Response, NextFunction } from 'express';
import { createMonthlyRepayment, getAllMonthlyRepayments, getMonthlyRepaymentById, updateMonthlyRepayment, deleteMonthlyRepayment } from '../services/monthlyRepaymentService';
import { createMonthlyRepaymentSchema, updateMonthlyRepaymentSchema, repaymentIdSchema } from '../validation/monthlyRepaymentValidation';
import { IUser } from '../models/User';
import { AppError } from '../utils/errors';

export const createMonthlyRepaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const user = req.user as IUser;
    const validatedData = createMonthlyRepaymentSchema.parse(req.body);
    
    const repayment = await createMonthlyRepayment(validatedData, (user._id as any).toString());
    
    res.status(201).json({
      success: true,
      data: repayment
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMonthlyRepaymentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const shgId = req.query.shgId as string | undefined;
    const repayments = await getAllMonthlyRepayments(shgId);
    
    res.status(200).json({
      success: true,
      data: repayments
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyRepaymentByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = repaymentIdSchema.parse(req.params);
    const repayment = await getMonthlyRepaymentById(validatedParams.id);
    
    res.status(200).json({
      success: true,
      data: repayment
    });
  } catch (error) {
    next(error);
  }
};

export const updateMonthlyRepaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = repaymentIdSchema.parse(req.params);
    const validatedData = updateMonthlyRepaymentSchema.parse(req.body);
    
    const repayment = await updateMonthlyRepayment(validatedParams.id, validatedData);
    
    res.status(200).json({
      success: true,
      data: repayment
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMonthlyRepaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = repaymentIdSchema.parse(req.params);
    await deleteMonthlyRepayment(validatedParams.id);
    
    res.status(200).json({
      success: true,
      message: 'Monthly repayment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};


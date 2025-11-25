import { Request, Response, NextFunction } from 'express';
import { getRepaymentAnalytics } from '../services/repaymentAnalyticsService';

export const getRepaymentAnalyticsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const analytics = await getRepaymentAnalytics();
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};


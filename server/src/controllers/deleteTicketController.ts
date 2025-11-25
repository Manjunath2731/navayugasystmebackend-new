import { Request, Response, NextFunction } from 'express';
import { createDeleteTicket, getAllDeleteTickets, getDeleteTicketById, updateDeleteTicket } from '../services/deleteTicketService';
import { AppError } from '../utils/errors';
import { ticketIdSchema } from '../validation/deleteTicketValidation';
import { createDeleteTicketSchema, updateDeleteTicketSchema } from '../validation/deleteTicketValidation';
import { IUser } from '../models/User';

export const createDeleteTicketHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedData = createDeleteTicketSchema.parse(req.body);
    const ticket = await createDeleteTicket(validatedData, (req.user as IUser).role, (req.user._id as any).toString());

    return res.status(201).json({
      status: 'success',
      message: 'Delete ticket created successfully',
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDeleteTicketsHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const tickets = await getAllDeleteTickets((req.user as IUser).role, (req.user._id as any).toString());

    return res.status(200).json({
      status: 'success',
      data: { tickets }
    });
  } catch (error) {
    next(error);
  }
};

export const getDeleteTicketByIdHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = ticketIdSchema.parse(req.params);
    const ticket = await getDeleteTicketById(validatedParams, (req.user as IUser).role, (req.user._id as any).toString());

    return res.status(200).json({
      status: 'success',
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
};

export const updateDeleteTicketHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedParams = ticketIdSchema.parse(req.params);
    const validatedData = updateDeleteTicketSchema.parse(req.body);
    const ticket = await updateDeleteTicket({ ...validatedParams, ...validatedData }, (req.user as IUser).role, (req.user._id as any).toString());

    return res.status(200).json({
      status: 'success',
      message: `Delete ticket ${validatedData.status} successfully`,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
};


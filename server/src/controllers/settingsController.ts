import { Request, Response, NextFunction } from 'express';
import { updateProfile, changePassword, uploadAvatar, deleteAvatar } from '../services/settingsService';
import { validate } from '../middleware/validationMiddleware';
import { updateProfileSchema, changePasswordSchema } from '../validation/settingsValidation';
import { AppError } from '../utils/errors';

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const user = await updateProfile((req.user._id as any).toString(), validatedData);

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: (user._id as any).toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const changeUserPassword = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const validatedData = changePasswordSchema.parse(req.body);
    const result = await changePassword((req.user._id as any).toString(), validatedData);

    return res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const uploadUserAvatar = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const result = await uploadAvatar(
      (req.user._id as any).toString(),
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    return res.status(200).json({
      status: 'success',
      message: 'Avatar uploaded successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const removeUserAvatar = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const result = await deleteAvatar((req.user._id as any).toString());

    return res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};


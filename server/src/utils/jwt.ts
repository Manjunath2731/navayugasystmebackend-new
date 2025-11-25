import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { IUser } from '../models/User';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (user: IUser): string => {
  const payload: JwtPayload = {
    userId: (user._id as unknown as string).toString(),
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch (error) {
    return null;
  }
};
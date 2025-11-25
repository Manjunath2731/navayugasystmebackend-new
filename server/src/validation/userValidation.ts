import { z } from 'zod';
import { UserRole } from '../models/User';

// Base user schema
const userSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  role: z.nativeEnum(UserRole, { 
    message: 'Role must be one of: owner, front_desk, field_officer' 
  }),
  dashboards: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
});

// Schema for user registration
export const registerSchema = userSchema.omit({ 
  dashboards: true, 
  isActive: true 
});

// Schema for user login
export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

// Schema for user creation by admin
export const createUserSchema = userSchema.omit({ 
  dashboards: true, 
  isActive: true 
});

// Schema for user updates
export const updateUserSchema = userSchema.partial().omit({ 
  email: true, 
  password: true 
});

// Schema for user ID validation
export const userIdSchema = z.object({
  id: z.string().min(1, { message: 'User ID is required' })
});

// Schema for dashboard access updates
export const dashboardAccessSchema = z.object({
  dashboards: z.array(z.string()).min(1, { message: 'At least one dashboard is required' })
});

// Type inference
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type DashboardAccessInput = z.infer<typeof dashboardAccessSchema>;
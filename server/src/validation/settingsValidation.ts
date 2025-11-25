import { z } from 'zod';

// Schema for updating profile (name and phone)
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }).optional(),
  lastName: z.string().min(1, { message: 'Last name is required' }).optional(),
  phone: z.string().optional().or(z.literal('')),
});

// Schema for changing password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters long' }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your new password' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type inference
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;


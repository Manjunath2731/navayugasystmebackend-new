import User, { IUser } from '../models/User';
import { 
  UnauthorizedError, 
  NotFoundError, 
  ValidationError 
} from '../utils/errors';
import { UpdateProfileInput, ChangePasswordInput } from '../validation/settingsValidation';
import { uploadFile, deleteFile } from './s3Service';
import { sendPasswordResetEmail } from './emailService';
import { config } from '../config/env';

// Update user profile (name and phone)
export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput
): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update fields if provided
  if (input.firstName !== undefined) {
    user.firstName = input.firstName;
  }
  if (input.lastName !== undefined) {
    user.lastName = input.lastName;
  }
  if (input.phone !== undefined) {
    user.phone = input.phone || '';
  }

  await user.save();
  return user;
};

// Change user password
export const changePassword = async (
  userId: string,
  input: ChangePasswordInput
): Promise<{ message: string }> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(input.currentPassword);
  if (!isCurrentPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Check if new password is different from current password
  const isSamePassword = await user.comparePassword(input.newPassword);
  if (isSamePassword) {
    throw new ValidationError('New password must be different from current password');
  }

  // Update password (will be hashed by pre-save hook)
  user.password = input.newPassword;
  await user.save();

  // Send email with new password
  try {
    const roleDisplayName = user.role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    await sendPasswordResetEmail({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: input.newPassword, // Plain password before hashing
      role: roleDisplayName,
      loginUrl: `${config.app.url}/login`,
    });
  } catch (error) {
    // Log error but don't fail password change if email fails
    console.error('Failed to send password reset email:', error);
  }

  return { message: 'Password changed successfully. An email has been sent with your new password.' };
};

// Upload avatar image
export const uploadAvatar = async (
  userId: string,
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ avatarUrl: string }> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Validate file type
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new ValidationError('Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (fileBuffer.length > maxSize) {
    throw new ValidationError('File size too large. Maximum size is 5MB.');
  }

  // Generate unique filename
  const fileExtension = originalName.split('.').pop();
  const fileName = `avatars/${userId}-${Date.now()}.${fileExtension}`;

  // Delete old avatar if exists
  if (user.avatar) {
    try {
      // Extract key from S3 URL or use the full URL as key
      const oldKey = user.avatar.includes('amazonaws.com') 
        ? user.avatar.split('.com/')[1]?.split('?')[0] 
        : user.avatar;
      if (oldKey) {
        await deleteFile(oldKey);
      }
    } catch (error) {
      // Log but don't fail if old avatar deletion fails
      console.error('Failed to delete old avatar:', error);
    }
  }

  // Upload new avatar to S3
  const uploadResult = await uploadFile(fileBuffer, fileName, mimeType);

  // Update user avatar URL
  user.avatar = uploadResult.location;
  await user.save();

  return { avatarUrl: uploadResult.location };
};

// Delete avatar
export const deleteAvatar = async (userId: string): Promise<{ message: string }> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.avatar) {
    try {
      // Extract key from S3 URL
      const key = user.avatar.includes('amazonaws.com') 
        ? user.avatar.split('.com/')[1]?.split('?')[0] 
        : user.avatar;
      if (key) {
        await deleteFile(key);
      }
    } catch (error) {
      console.error('Failed to delete avatar from S3:', error);
    }
  }

  user.avatar = '';
  await user.save();

  return { message: 'Avatar deleted successfully' };
};


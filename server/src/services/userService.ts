import User, { IUser, UserRole } from '../models/User';
import { generateToken } from '../utils/jwt';
import { 
  ConflictError, 
  UnauthorizedError, 
  NotFoundError, 
  ValidationError 
} from '../utils/errors';
import { 
  RegisterInput, 
  LoginInput, 
  CreateUserInput, 
  UpdateUserInput, 
  UserIdInput 
} from '../validation/userValidation';
import { sendCredentialsEmail } from './emailService';
import { config } from '../config/env';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    dashboards: string[];
    phone?: string;
    avatar?: string;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  dashboards: string[];
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Register a new user
export const registerUser = async (input: RegisterInput): Promise<AuthResponse> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Create new user
  const user = new User({
    email: input.email,
    password: input.password,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role,
    dashboards: []
  });

  await user.save();

  // Generate token
  const token = generateToken(user);

  return {
    token,
    user: {
      id: (user._id as any).toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      dashboards: user.dashboards,
      phone: user.phone,
      avatar: user.avatar
    }
  };
};

// Login user
export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  // Find user by email
  const user = await User.findOne({ email: input.email });
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated');
  }

  // Compare passwords
  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate token
  const token = generateToken(user);

  return {
    token,
    user: {
      id: (user._id as any).toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      dashboards: user.dashboards,
      phone: user.phone,
      avatar: user.avatar
    }
  };
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserResponse> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return {
    id: (user._id as any).toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    dashboards: user.dashboards,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// Create user (admin only)
export const createUser = async (
  input: CreateUserInput,
  currentUserRole: UserRole
): Promise<UserResponse> => {
  // Only owners can create users
  if (currentUserRole !== UserRole.OWNER) {
    throw new UnauthorizedError('Only owners can create users');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Create new user
  const user = new User({
    email: input.email,
    password: input.password,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role,
    dashboards: []
  });

  await user.save();

  // Send credentials email to the new employee
  // Note: We use input.password here because the password is hashed in the pre-save hook
  try {
    const roleDisplayName = input.role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    await sendCredentialsEmail({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: input.password, // Plain password before hashing
      role: roleDisplayName,
      loginUrl: `${config.app.url}/login`,
    });
  } catch (error) {
    // Log error but don't fail user creation if email fails
    console.error('Failed to send credentials email:', error);
  }

  return {
    id: (user._id as any).toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    dashboards: user.dashboards,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// Get all users (admin only)
export const getAllUsers = async (currentUserRole: UserRole): Promise<UserResponse[]> => {
  // Only owners can get all users
  if (currentUserRole !== UserRole.OWNER) {
    throw new UnauthorizedError('Only owners can view users');
  }

  const users = await User.find({}, '-password'); // Exclude passwords

  return users.map(user => ({
    id: (user._id as any).toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    dashboards: user.dashboards,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));
};

// Get user by ID (admin only)
export const getUserById = async (
  input: UserIdInput,
  currentUserRole: UserRole
): Promise<UserResponse> => {
  // Only owners can get user details
  if (currentUserRole !== UserRole.OWNER) {
    throw new UnauthorizedError('Only owners can view user details');
  }

  const user = await User.findById(input.id, '-password'); // Exclude password
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return {
    id: (user._id as any).toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    dashboards: user.dashboards,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// Update user (admin only)
export const updateUser = async (
  input: UserIdInput & UpdateUserInput,
  currentUserRole: UserRole
): Promise<UserResponse> => {
  // Only owners can update users
  if (currentUserRole !== UserRole.OWNER) {
    throw new UnauthorizedError('Only owners can update users');
  }

  const user = await User.findById(input.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update fields if provided
  if (input.firstName !== undefined) user.firstName = input.firstName;
  if (input.lastName !== undefined) user.lastName = input.lastName;
  if (input.role !== undefined) user.role = input.role;
  if (input.dashboards !== undefined) user.dashboards = input.dashboards;
  if (input.isActive !== undefined) user.isActive = input.isActive;

  await user.save();

  return {
    id: (user._id as any).toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    dashboards: user.dashboards,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// Delete user (admin only) - deactivate instead of delete
export const deleteUser = async (
  input: UserIdInput,
  currentUserRole: UserRole
): Promise<{ message: string }> => {
  // Only owners can delete users
  if (currentUserRole !== UserRole.OWNER) {
    throw new UnauthorizedError('Only owners can delete users');
  }

  const user = await User.findById(input.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Instead of deleting, we deactivate the user
  user.isActive = false;
  await user.save();

  return { message: 'User deactivated successfully' };
};
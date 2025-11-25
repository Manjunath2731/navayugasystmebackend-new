import mongoose, { Document, Schema } from 'mongoose';
import argon2 from 'argon2';

export enum UserRole {
  OWNER = 'owner',
  FRONT_DESK = 'front_desk',
  FIELD_OFFICER = 'field_officer'
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  dashboards: string[]; // Array of dashboard IDs the user has access to
  phone?: string;
  avatar?: string; // S3 URL for profile image
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  dashboards: [{
    type: String
  }],
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  avatar: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const hash = await argon2.hash(this.password);
    this.password = hash;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (error) {
    return false;
  }
};

export default mongoose.model<IUser>('User', UserSchema);
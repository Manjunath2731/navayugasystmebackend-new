import mongoose, { Document, Schema } from 'mongoose';

export enum MemberRole {
  PRATINI1 = 'pratini1',
  PRATINI2 = 'pratini2',
  MEMBER = 'member'
}

export interface ISHGMember extends Document {
  shgId: mongoose.Types.ObjectId; // Reference to SHG
  name: string;
  phoneNumber: string;
  role: MemberRole;
  aadharCardFront: string; // S3 URL
  aadharCardBack: string; // S3 URL
  panCard: string; // S3 URL
  voidIdCard: string; // S3 URL
  homeRentalAgreement?: string; // S3 URL (optional)
  createdAt: Date;
  updatedAt: Date;
}

const SHGMemberSchema: Schema = new Schema({
  shgId: {
    type: Schema.Types.ObjectId,
    ref: 'SHG',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(MemberRole),
    required: true,
    default: MemberRole.MEMBER
  },
  aadharCardFront: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  aadharCardBack: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  panCard: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  voidIdCard: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  homeRentalAgreement: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model<ISHGMember>('SHGMember', SHGMemberSchema);


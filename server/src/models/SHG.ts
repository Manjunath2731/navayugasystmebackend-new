import mongoose, { Document, Schema } from 'mongoose';

export interface ISHG extends Document {
  shgNumber: string; // Unique SHG number format: NAV{YYYY}{0001}
  shgName: string;
  shgAddress: string;
  savingAccountNumber: string;
  loanAccountNumber: string;
  loanSanctionDate: Date;
  repaymentDate: Date;
  fieldOfficerId: mongoose.Types.ObjectId; // Reference to User
  branch: string;
  loanSanctionAmount: number;
  numberOfMonths: number;
  monthlyRepaymentAmount: number;
  fixedDeposit: number;
  linkageId: mongoose.Types.ObjectId; // Reference to Linkage
  numberOfMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

const SHGSchema: Schema = new Schema({
  shgNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  shgName: {
    type: String,
    required: true,
    trim: true
  },
  shgAddress: {
    type: String,
    required: true,
    trim: true
  },
  savingAccountNumber: {
    type: String,
    required: true,
    trim: true
  },
  loanAccountNumber: {
    type: String,
    required: true,
    trim: true
  },
  loanSanctionDate: {
    type: Date,
    required: true
  },
  repaymentDate: {
    type: Date,
    required: true
  },
  fieldOfficerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  branch: {
    type: String,
    required: true,
    trim: true
  },
  loanSanctionAmount: {
    type: Number,
    required: true,
    min: 0
  },
  numberOfMonths: {
    type: Number,
    required: true,
    min: 1
  },
  monthlyRepaymentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  fixedDeposit: {
    type: Number,
    required: true,
    min: 0
  },
  linkageId: {
    type: Schema.Types.ObjectId,
    ref: 'Linkage',
    required: true
  },
  numberOfMembers: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

export default mongoose.model<ISHG>('SHG', SHGSchema);


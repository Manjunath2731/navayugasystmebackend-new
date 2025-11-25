import mongoose, { Document, Schema } from 'mongoose';

export enum PaymentMethod {
  UPI = 'upi',
  CASH = 'cash'
}

export enum PaymentType {
  FULL = 'full',
  HALF = 'half'
}

export interface IMonthlyRepayment extends Document {
  shgId: mongoose.Types.ObjectId; // Reference to SHG
  repaymentDate: Date;
  amount: number;
  receiptPhoto: string; // S3 URL
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  unpaidMemberName?: string; // If half payment, name of member who hasn't paid
  recordedBy: mongoose.Types.ObjectId; // Reference to User (field_officer)
  createdAt: Date;
  updatedAt: Date;
}

const MonthlyRepaymentSchema: Schema = new Schema({
  shgId: {
    type: Schema.Types.ObjectId,
    ref: 'SHG',
    required: true
  },
  repaymentDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  receiptPhoto: {
    type: String,
    required: true,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true
  },
  paymentType: {
    type: String,
    enum: Object.values(PaymentType),
    required: true
  },
  unpaidMemberName: {
    type: String,
    trim: true,
    default: ''
  },
  recordedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IMonthlyRepayment>('MonthlyRepayment', MonthlyRepaymentSchema);


import MonthlyRepayment, { IMonthlyRepayment, PaymentMethod, PaymentType } from '../models/MonthlyRepayment';
import SHG from '../models/SHG';
import { CreateMonthlyRepaymentInput, UpdateMonthlyRepaymentInput } from '../validation/monthlyRepaymentValidation';
import { AppError } from '../utils/errors';

export interface MonthlyRepaymentResponse {
  id: string;
  shgId: string;
  shgName: string;
  repaymentDate: Date;
  amount: number;
  receiptPhoto: string;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  unpaidMemberName?: string;
  recordedBy: string;
  recordedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createMonthlyRepayment = async (
  input: CreateMonthlyRepaymentInput,
  recordedById: string
): Promise<MonthlyRepaymentResponse> => {
  // Verify SHG exists
  const shg = await SHG.findById(input.shgId);
  if (!shg) {
    throw new AppError('SHG not found', 404);
  }

  // Parse date if string
  const repaymentDate = typeof input.repaymentDate === 'string' 
    ? new Date(input.repaymentDate) 
    : input.repaymentDate;

  const repayment = new MonthlyRepayment({
    shgId: input.shgId,
    repaymentDate,
    amount: input.amount,
    receiptPhoto: input.receiptPhoto,
    paymentMethod: input.paymentMethod,
    paymentType: input.paymentType,
    unpaidMemberName: input.unpaidMemberName || '',
    recordedBy: recordedById
  });

  await repayment.save();
  await repayment.populate('shgId', 'shgName');
  await repayment.populate('recordedBy', 'firstName lastName');

  const shgDoc = repayment.shgId as any;
  const userDoc = repayment.recordedBy as any;

  return {
    id: (repayment._id as any).toString(),
    shgId: repayment.shgId.toString(),
    shgName: shgDoc.shgName,
    repaymentDate: repayment.repaymentDate,
    amount: repayment.amount,
    receiptPhoto: repayment.receiptPhoto,
    paymentMethod: repayment.paymentMethod,
    paymentType: repayment.paymentType,
    unpaidMemberName: repayment.unpaidMemberName,
    recordedBy: repayment.recordedBy.toString(),
    recordedByName: `${userDoc.firstName} ${userDoc.lastName}`,
    createdAt: repayment.createdAt,
    updatedAt: repayment.updatedAt
  };
};

export const getAllMonthlyRepayments = async (
  shgId?: string
): Promise<MonthlyRepaymentResponse[]> => {
  const query = shgId ? { shgId } : {};
  
  const repayments = await MonthlyRepayment.find(query)
    .populate('shgId', 'shgName')
    .populate('recordedBy', 'firstName lastName')
    .sort({ repaymentDate: -1 });

  return repayments.map((repayment) => {
    const shgDoc = repayment.shgId as any;
    const userDoc = repayment.recordedBy as any;
    
    return {
      id: (repayment._id as any).toString(),
      shgId: repayment.shgId.toString(),
      shgName: shgDoc.shgName,
      repaymentDate: repayment.repaymentDate,
      amount: repayment.amount,
      receiptPhoto: repayment.receiptPhoto,
      paymentMethod: repayment.paymentMethod,
      paymentType: repayment.paymentType,
      unpaidMemberName: repayment.unpaidMemberName,
      recordedBy: repayment.recordedBy.toString(),
      recordedByName: `${userDoc.firstName} ${userDoc.lastName}`,
      createdAt: repayment.createdAt,
      updatedAt: repayment.updatedAt
    };
  });
};

export const getMonthlyRepaymentById = async (
  id: string
): Promise<MonthlyRepaymentResponse> => {
  const repayment = await MonthlyRepayment.findById(id)
    .populate('shgId', 'shgName')
    .populate('recordedBy', 'firstName lastName');

  if (!repayment) {
    throw new AppError('Monthly repayment not found', 404);
  }

  const shgDoc = repayment.shgId as any;
  const userDoc = repayment.recordedBy as any;

  return {
    id: (repayment._id as any).toString(),
    shgId: repayment.shgId.toString(),
    shgName: shgDoc.shgName,
    repaymentDate: repayment.repaymentDate,
    amount: repayment.amount,
    receiptPhoto: repayment.receiptPhoto,
    paymentMethod: repayment.paymentMethod,
    paymentType: repayment.paymentType,
    unpaidMemberName: repayment.unpaidMemberName,
    recordedBy: repayment.recordedBy.toString(),
    recordedByName: `${userDoc.firstName} ${userDoc.lastName}`,
    createdAt: repayment.createdAt,
    updatedAt: repayment.updatedAt
  };
};

export const updateMonthlyRepayment = async (
  id: string,
  input: UpdateMonthlyRepaymentInput
): Promise<MonthlyRepaymentResponse> => {
  const repayment = await MonthlyRepayment.findById(id);
  if (!repayment) {
    throw new AppError('Monthly repayment not found', 404);
  }

  if (input.repaymentDate) {
    repayment.repaymentDate = typeof input.repaymentDate === 'string' 
      ? new Date(input.repaymentDate) 
      : input.repaymentDate;
  }
  if (input.amount !== undefined) repayment.amount = input.amount;
  if (input.receiptPhoto) repayment.receiptPhoto = input.receiptPhoto;
  if (input.paymentMethod) repayment.paymentMethod = input.paymentMethod;
  if (input.paymentType) repayment.paymentType = input.paymentType;
  if (input.unpaidMemberName !== undefined) repayment.unpaidMemberName = input.unpaidMemberName;

  await repayment.save();
  await repayment.populate('shgId', 'shgName');
  await repayment.populate('recordedBy', 'firstName lastName');

  const shgDoc = repayment.shgId as any;
  const userDoc = repayment.recordedBy as any;

  return {
    id: (repayment._id as any).toString(),
    shgId: repayment.shgId.toString(),
    shgName: shgDoc.shgName,
    repaymentDate: repayment.repaymentDate,
    amount: repayment.amount,
    receiptPhoto: repayment.receiptPhoto,
    paymentMethod: repayment.paymentMethod,
    paymentType: repayment.paymentType,
    unpaidMemberName: repayment.unpaidMemberName,
    recordedBy: repayment.recordedBy.toString(),
    recordedByName: `${userDoc.firstName} ${userDoc.lastName}`,
    createdAt: repayment.createdAt,
    updatedAt: repayment.updatedAt
  };
};

export const deleteMonthlyRepayment = async (id: string): Promise<void> => {
  const repayment = await MonthlyRepayment.findByIdAndDelete(id);
  if (!repayment) {
    throw new AppError('Monthly repayment not found', 404);
  }
};


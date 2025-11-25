import SHG, { ISHG } from '../models/SHG';
import { NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import { CreateSHGInput, UpdateSHGInput, SHGIdInput } from '../validation/shgValidation';
import { UserRole, IUser } from '../models/User';
import mongoose from 'mongoose';
import { generateUniqueSHGNumber } from '../utils/shgNumberGenerator';

export interface SHGResponse {
  id: string;
  shgNumber: string;
  shgName: string;
  shgAddress: string;
  savingAccountNumber: string;
  loanAccountNumber: string;
  loanSanctionDate: Date;
  repaymentDate: Date;
  fieldOfficerId: string;
  fieldOfficer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  branch: string;
  loanSanctionAmount: number;
  numberOfMonths: number;
  monthlyRepaymentAmount: number;
  fixedDeposit: number;
  linkageId: string;
  linkage?: {
    id: string;
    name: string;
    amount: number;
  };
  numberOfMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create SHG
export const createSHG = async (
  input: CreateSHGInput,
  currentUserRole: UserRole
): Promise<SHGResponse> => {
  // Only owner and front_desk can create SHG
  if (currentUserRole !== UserRole.OWNER && currentUserRole !== UserRole.FRONT_DESK) {
    throw new UnauthorizedError('Only owners and front desk can create SHG');
  }

  // Validate field officer exists and is a field_officer
  const User = (await import('../models/User')).default;
  const fieldOfficer = await User.findById(input.fieldOfficerId);
  if (!fieldOfficer) {
    throw new NotFoundError('Field officer not found');
  }
  if (fieldOfficer.role !== UserRole.FIELD_OFFICER) {
    throw new ValidationError('Selected user is not a field officer');
  }

  // Validate linkage exists
  const Linkage = (await import('../models/Linkage')).default;
  const linkage = await Linkage.findById(input.linkageId);
  if (!linkage) {
    throw new NotFoundError('Linkage not found');
  }

  // Generate unique SHG number
  const shgNumber = await generateUniqueSHGNumber();

  const shg = new SHG({
    shgNumber,
    shgName: input.shgName,
    shgAddress: input.shgAddress,
    savingAccountNumber: input.savingAccountNumber,
    loanAccountNumber: input.loanAccountNumber,
    loanSanctionDate: new Date(input.loanSanctionDate),
    repaymentDate: new Date(input.repaymentDate),
    fieldOfficerId: new mongoose.Types.ObjectId(input.fieldOfficerId),
    branch: input.branch,
    loanSanctionAmount: input.loanSanctionAmount,
    numberOfMonths: input.numberOfMonths,
    monthlyRepaymentAmount: input.monthlyRepaymentAmount,
    fixedDeposit: input.fixedDeposit,
    linkageId: new mongoose.Types.ObjectId(input.linkageId),
    numberOfMembers: input.numberOfMembers,
  });

  await shg.save();

  return {
    id: (shg._id as any).toString(),
    shgNumber: shg.shgNumber,
    shgName: shg.shgName,
    shgAddress: shg.shgAddress,
    savingAccountNumber: shg.savingAccountNumber,
    loanAccountNumber: shg.loanAccountNumber,
    loanSanctionDate: shg.loanSanctionDate,
    repaymentDate: shg.repaymentDate,
    fieldOfficerId: shg.fieldOfficerId ? (shg.fieldOfficerId as any).toString() : '',
    branch: shg.branch,
    loanSanctionAmount: shg.loanSanctionAmount,
    numberOfMonths: shg.numberOfMonths,
    monthlyRepaymentAmount: shg.monthlyRepaymentAmount,
    fixedDeposit: shg.fixedDeposit,
    linkageId: shg.linkageId ? (shg.linkageId as any).toString() : '',
    numberOfMembers: shg.numberOfMembers,
    createdAt: shg.createdAt,
    updatedAt: shg.updatedAt,
  };
};

export interface PaginatedSHGResponse {
  shgs: SHGResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Get all SHGs with pagination
export const getAllSHGs = async (
  currentUserRole: UserRole,
  currentUserId?: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedSHGResponse> => {
  let query: any = {};
  
  // Field officers can only see their own SHGs
  if (currentUserRole === UserRole.FIELD_OFFICER && currentUserId) {
    query.fieldOfficerId = new mongoose.Types.ObjectId(currentUserId);
  }

  // Calculate skip
  const skip = (page - 1) * limit;

  // Get total count
  const total = await SHG.countDocuments(query);

  // Get paginated results
  const shgs = await SHG.find(query)
    .populate('fieldOfficerId', 'firstName lastName email')
    .populate('linkageId', 'name amount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(total / limit);

  return {
    shgs: shgs.map(shg => ({
      id: (shg._id as any).toString(),
      shgNumber: shg.shgNumber,
      shgName: shg.shgName,
      shgAddress: shg.shgAddress,
      savingAccountNumber: shg.savingAccountNumber,
      loanAccountNumber: shg.loanAccountNumber,
      loanSanctionDate: shg.loanSanctionDate,
      repaymentDate: shg.repaymentDate,
      fieldOfficerId: shg.fieldOfficerId ? (shg.fieldOfficerId as any).toString() : '',
      fieldOfficer: shg.populated('fieldOfficerId') && shg.fieldOfficerId ? {
        id: ((shg.fieldOfficerId as any)._id || shg.fieldOfficerId).toString(),
        firstName: (shg.fieldOfficerId as any).firstName,
        lastName: (shg.fieldOfficerId as any).lastName,
        email: (shg.fieldOfficerId as any).email,
      } : undefined,
      branch: shg.branch,
      loanSanctionAmount: shg.loanSanctionAmount,
      numberOfMonths: shg.numberOfMonths,
      monthlyRepaymentAmount: shg.monthlyRepaymentAmount,
      fixedDeposit: shg.fixedDeposit,
      linkageId: shg.linkageId ? (shg.linkageId as any).toString() : '',
      linkage: shg.populated('linkageId') && shg.linkageId ? {
        id: ((shg.linkageId as any)._id || shg.linkageId).toString(),
        name: (shg.linkageId as any).name,
        amount: (shg.linkageId as any).amount,
      } : undefined,
      numberOfMembers: shg.numberOfMembers,
      createdAt: shg.createdAt,
      updatedAt: shg.updatedAt,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

// Get SHG by ID
export const getSHGById = async (
  input: SHGIdInput,
  currentUserRole: UserRole,
  currentUserId?: string
): Promise<SHGResponse> => {
  const shg = await SHG.findById(input.id)
    .populate('fieldOfficerId', 'firstName lastName email')
    .populate('linkageId', 'name amount');

  if (!shg) {
    throw new NotFoundError('SHG not found');
  }

  // Field officers can only view their own SHGs
  if (currentUserRole === UserRole.FIELD_OFFICER && currentUserId) {
    if (shg.fieldOfficerId && shg.fieldOfficerId.toString() !== currentUserId) {
      throw new UnauthorizedError('You can only view your own SHGs');
    }
  }

  return {
    id: (shg._id as any).toString(),
    shgNumber: shg.shgNumber,
    shgName: shg.shgName,
    shgAddress: shg.shgAddress,
    savingAccountNumber: shg.savingAccountNumber,
    loanAccountNumber: shg.loanAccountNumber,
    loanSanctionDate: shg.loanSanctionDate,
    repaymentDate: shg.repaymentDate,
    fieldOfficerId: shg.fieldOfficerId ? (shg.fieldOfficerId as any).toString() : '',
    fieldOfficer: shg.populated('fieldOfficerId') && shg.fieldOfficerId ? {
      id: ((shg.fieldOfficerId as any)._id || shg.fieldOfficerId).toString(),
      firstName: (shg.fieldOfficerId as any).firstName,
      lastName: (shg.fieldOfficerId as any).lastName,
      email: (shg.fieldOfficerId as any).email,
    } : undefined,
    branch: shg.branch,
    loanSanctionAmount: shg.loanSanctionAmount,
    numberOfMonths: shg.numberOfMonths,
    monthlyRepaymentAmount: shg.monthlyRepaymentAmount,
    fixedDeposit: shg.fixedDeposit,
    linkageId: shg.linkageId ? (shg.linkageId as any).toString() : '',
    linkage: shg.populated('linkageId') && shg.linkageId ? {
      id: ((shg.linkageId as any)._id || shg.linkageId).toString(),
      name: (shg.linkageId as any).name,
      amount: (shg.linkageId as any).amount,
    } : undefined,
    numberOfMembers: shg.numberOfMembers,
    createdAt: shg.createdAt,
    updatedAt: shg.updatedAt,
  };
};

// Update SHG
export const updateSHG = async (
  input: SHGIdInput & UpdateSHGInput,
  currentUserRole: UserRole
): Promise<SHGResponse> => {
  // Only owner and front_desk can update SHG
  if (currentUserRole !== UserRole.OWNER && currentUserRole !== UserRole.FRONT_DESK) {
    throw new UnauthorizedError('Only owners and front desk can update SHG');
  }

  const shg = await SHG.findById(input.id);
  if (!shg) {
    throw new NotFoundError('SHG not found');
  }

  // Validate field officer if being updated
  if (input.fieldOfficerId) {
    const User = (await import('../models/User')).default;
    const fieldOfficer = await User.findById(input.fieldOfficerId);
    if (!fieldOfficer) {
      throw new NotFoundError('Field officer not found');
    }
    if (fieldOfficer.role !== UserRole.FIELD_OFFICER) {
      throw new ValidationError('Selected user is not a field officer');
    }
    shg.fieldOfficerId = new mongoose.Types.ObjectId(input.fieldOfficerId);
  }

  // Validate linkage if being updated
  if (input.linkageId) {
    const Linkage = (await import('../models/Linkage')).default;
    const linkage = await Linkage.findById(input.linkageId);
    if (!linkage) {
      throw new NotFoundError('Linkage not found');
    }
    shg.linkageId = new mongoose.Types.ObjectId(input.linkageId);
  }

  // Update other fields
  if (input.shgName !== undefined) shg.shgName = input.shgName;
  if (input.shgAddress !== undefined) shg.shgAddress = input.shgAddress;
  if (input.savingAccountNumber !== undefined) shg.savingAccountNumber = input.savingAccountNumber;
  if (input.loanAccountNumber !== undefined) shg.loanAccountNumber = input.loanAccountNumber;
  if (input.loanSanctionDate !== undefined) shg.loanSanctionDate = new Date(input.loanSanctionDate);
  if (input.repaymentDate !== undefined) shg.repaymentDate = new Date(input.repaymentDate);
  if (input.branch !== undefined) shg.branch = input.branch;
  if (input.loanSanctionAmount !== undefined) shg.loanSanctionAmount = input.loanSanctionAmount;
  if (input.numberOfMonths !== undefined) shg.numberOfMonths = input.numberOfMonths;
  if (input.monthlyRepaymentAmount !== undefined) shg.monthlyRepaymentAmount = input.monthlyRepaymentAmount;
  if (input.fixedDeposit !== undefined) shg.fixedDeposit = input.fixedDeposit;
  if (input.numberOfMembers !== undefined) shg.numberOfMembers = input.numberOfMembers;

  await shg.save();

  return getSHGById({ id: input.id }, currentUserRole);
};

// Delete SHG (owner only, all others must create delete ticket)
export const deleteSHG = async (
  input: SHGIdInput,
  currentUserRole: UserRole
): Promise<{ message: string }> => {
  // Only owner can directly delete
  if (currentUserRole !== UserRole.OWNER) {
    const shg = await SHG.findById(input.id);
    const shgNumber = shg?.shgNumber || 'SHG';
    throw new UnauthorizedError(`Only owners can delete SHG. Please create a delete ticket for ${shgNumber}.`);
  }

  const shg = await SHG.findById(input.id);
  if (!shg) {
    throw new NotFoundError('SHG not found');
  }

  const shgNumber = shg.shgNumber;

  // Delete all members first
  const SHGMember = (await import('../models/SHGMember')).default;
  await SHGMember.deleteMany({ shgId: shg._id });

  await SHG.findByIdAndDelete(input.id);

  return { message: `SHG ${shgNumber} deleted successfully` };
};


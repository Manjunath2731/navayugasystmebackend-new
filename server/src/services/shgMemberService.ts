import SHGMember, { ISHGMember, MemberRole } from '../models/SHGMember';
import SHG from '../models/SHG';
import { NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import { CreateSHGMemberInput, UpdateSHGMemberInput, SHGMemberIdInput } from '../validation/shgMemberValidation';
import { UserRole } from '../models/User';
import mongoose from 'mongoose';

export interface SHGMemberResponse {
  id: string;
  shgId: string;
  shg?: {
    id: string;
    shgName: string;
  };
  name: string;
  phoneNumber: string;
  role: MemberRole;
  aadharCardFront: string;
  aadharCardBack: string;
  panCard: string;
  voidIdCard: string;
  homeRentalAgreement?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create SHG Member
export const createSHGMember = async (
  input: CreateSHGMemberInput,
  currentUserRole: UserRole
): Promise<SHGMemberResponse> => {
  // Only owner and front_desk can create members
  if (currentUserRole !== UserRole.OWNER && currentUserRole !== UserRole.FRONT_DESK) {
    throw new UnauthorizedError('Only owners and front desk can create SHG members');
  }

  // Validate SHG exists
  const shg = await SHG.findById(input.shgId);
  if (!shg) {
    throw new NotFoundError('SHG not found');
  }

  // Check if pratini1 or pratini2 already exists for this SHG
  if (input.role === MemberRole.PRATINI1 || input.role === MemberRole.PRATINI2) {
    const existingPratini = await SHGMember.findOne({
      shgId: new mongoose.Types.ObjectId(input.shgId),
      role: input.role,
    });
    if (existingPratini) {
      throw new ValidationError(`${input.role} already exists for this SHG`);
    }
  }

  const member = new SHGMember({
    shgId: new mongoose.Types.ObjectId(input.shgId),
    name: input.name,
    phoneNumber: input.phoneNumber,
    role: input.role,
    aadharCardFront: input.aadharCardFront,
    aadharCardBack: input.aadharCardBack,
    panCard: input.panCard,
    voidIdCard: input.voidIdCard,
    homeRentalAgreement: input.homeRentalAgreement || '',
  });

  await member.save();

  return {
    id: (member._id as any).toString(),
    shgId: (member.shgId as any).toString(),
    name: member.name,
    phoneNumber: member.phoneNumber,
    role: member.role,
    aadharCardFront: member.aadharCardFront,
    aadharCardBack: member.aadharCardBack,
    panCard: member.panCard,
    voidIdCard: member.voidIdCard,
    homeRentalAgreement: member.homeRentalAgreement,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
};

// Get all SHG Members (optionally filtered by SHG ID)
export const getAllSHGMembers = async (
  shgId?: string,
  currentUserRole?: UserRole,
  currentUserId?: string
): Promise<SHGMemberResponse[]> => {
  let query: any = {};
  
  if (shgId) {
    query.shgId = new mongoose.Types.ObjectId(shgId);
    
    // Field officers can only see members of their own SHGs
    if (currentUserRole === UserRole.FIELD_OFFICER && currentUserId) {
      const shg = await SHG.findById(shgId);
      if (!shg) {
        throw new NotFoundError('SHG not found');
      }
      if (shg.fieldOfficerId.toString() !== currentUserId) {
        throw new UnauthorizedError('You can only view members of your own SHGs');
      }
    }
  }

  const members = await SHGMember.find(query)
    .populate('shgId', 'shgName')
    .sort({ role: 1, createdAt: 1 }); // Sort by role (pratini1, pratini2, then members)

  return members.map(member => ({
    id: (member._id as any).toString(),
    shgId: (member.shgId as any).toString(),
    shg: member.populated('shgId') ? {
      id: ((member.shgId as any)._id || member.shgId).toString(),
      shgName: (member.shgId as any).shgName,
    } : undefined,
    name: member.name,
    phoneNumber: member.phoneNumber,
    role: member.role,
    aadharCardFront: member.aadharCardFront,
    aadharCardBack: member.aadharCardBack,
    panCard: member.panCard,
    voidIdCard: member.voidIdCard,
    homeRentalAgreement: member.homeRentalAgreement,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  }));
};

// Get SHG Member by ID
export const getSHGMemberById = async (
  input: SHGMemberIdInput,
  currentUserRole: UserRole,
  currentUserId?: string
): Promise<SHGMemberResponse> => {
  const member = await SHGMember.findById(input.id).populate('shgId', 'shgName fieldOfficerId');

  if (!member) {
    throw new NotFoundError('SHG member not found');
  }

  // Field officers can only view members of their own SHGs
  if (currentUserRole === UserRole.FIELD_OFFICER && currentUserId) {
    const shg = member.populated('shgId') as any;
    if (shg && shg.fieldOfficerId && shg.fieldOfficerId.toString() !== currentUserId) {
      throw new UnauthorizedError('You can only view members of your own SHGs');
    }
  }

  return {
    id: (member._id as any).toString(),
    shgId: (member.shgId as any).toString(),
    shg: member.populated('shgId') ? {
      id: ((member.shgId as any)._id || member.shgId).toString(),
      shgName: (member.shgId as any).shgName,
    } : undefined,
    name: member.name,
    phoneNumber: member.phoneNumber,
    role: member.role,
    aadharCardFront: member.aadharCardFront,
    aadharCardBack: member.aadharCardBack,
    panCard: member.panCard,
    voidIdCard: member.voidIdCard,
    homeRentalAgreement: member.homeRentalAgreement,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
};

// Update SHG Member
export const updateSHGMember = async (
  input: SHGMemberIdInput & UpdateSHGMemberInput,
  currentUserRole: UserRole
): Promise<SHGMemberResponse> => {
  // Only owner and front_desk can update members
  if (currentUserRole !== UserRole.OWNER && currentUserRole !== UserRole.FRONT_DESK) {
    throw new UnauthorizedError('Only owners and front desk can update SHG members');
  }

  const member = await SHGMember.findById(input.id);
  if (!member) {
    throw new NotFoundError('SHG member not found');
  }

  // Check if changing role to pratini1 or pratini2
  if (input.role && (input.role === MemberRole.PRATINI1 || input.role === MemberRole.PRATINI2)) {
    const existingPratini = await SHGMember.findOne({
      shgId: member.shgId,
      role: input.role,
      _id: { $ne: member._id },
    });
    if (existingPratini) {
      throw new ValidationError(`${input.role} already exists for this SHG`);
    }
  }

  // Update fields
  if (input.name !== undefined) member.name = input.name;
  if (input.phoneNumber !== undefined) member.phoneNumber = input.phoneNumber;
  if (input.role !== undefined) member.role = input.role;
  if (input.aadharCardFront !== undefined) member.aadharCardFront = input.aadharCardFront;
  if (input.aadharCardBack !== undefined) member.aadharCardBack = input.aadharCardBack;
  if (input.panCard !== undefined) member.panCard = input.panCard;
  if (input.voidIdCard !== undefined) member.voidIdCard = input.voidIdCard;
  if (input.homeRentalAgreement !== undefined) member.homeRentalAgreement = input.homeRentalAgreement;

  await member.save();

  return getSHGMemberById({ id: input.id }, currentUserRole);
};

// Delete SHG Member (owner and front_desk can delete directly)
export const deleteSHGMember = async (
  input: SHGMemberIdInput,
  currentUserRole: UserRole
): Promise<{ message: string }> => {
  // Owner and front_desk can directly delete (no ticket required)
  if (currentUserRole !== UserRole.OWNER && currentUserRole !== UserRole.FRONT_DESK) {
    throw new UnauthorizedError('Only owners and front desk can delete SHG members');
  }

  const member = await SHGMember.findById(input.id);
  if (!member) {
    throw new NotFoundError('SHG member not found');
  }

  await SHGMember.findByIdAndDelete(input.id);

  return { message: 'SHG member deleted successfully' };
};


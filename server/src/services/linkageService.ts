import Linkage, { ILinkage } from '../models/Linkage';
import { NotFoundError, UnauthorizedError } from '../utils/errors';
import { CreateLinkageInput, UpdateLinkageInput, LinkageIdInput } from '../validation/linkageValidation';
import { UserRole } from '../models/User';

export interface LinkageResponse {
  id: string;
  name: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create linkage (owner only)
export const createLinkage = async (
  input: CreateLinkageInput,
  currentUserRole: UserRole
): Promise<LinkageResponse> => {
  if (currentUserRole !== UserRole.OWNER) {
    throw new UnauthorizedError('Only owners can create linkages');
  }

  const linkage = new Linkage({
    name: input.name,
    amount: input.amount,
  });

  await linkage.save();

  return {
    id: (linkage._id as any).toString(),
    name: linkage.name,
    amount: linkage.amount,
    createdAt: linkage.createdAt,
    updatedAt: linkage.updatedAt,
  };
};

// Get all linkages
export const getAllLinkages = async (): Promise<LinkageResponse[]> => {
  const linkages = await Linkage.find().sort({ createdAt: -1 });

  return linkages.map(linkage => ({
    id: (linkage._id as any).toString(),
    name: linkage.name,
    amount: linkage.amount,
    createdAt: linkage.createdAt,
    updatedAt: linkage.updatedAt,
  }));
};

// Get linkage by ID
export const getLinkageById = async (
  input: LinkageIdInput,
  currentUserRole: UserRole
): Promise<LinkageResponse> => {
  if (currentUserRole !== UserRole.OWNER) {
    throw new UnauthorizedError('Only owners can view linkage details');
  }

  const linkage = await Linkage.findById(input.id);
  if (!linkage) {
    throw new NotFoundError('Linkage not found');
  }

  return {
    id: (linkage._id as any).toString(),
    name: linkage.name,
    amount: linkage.amount,
    createdAt: linkage.createdAt,
    updatedAt: linkage.updatedAt,
  };
};

// Update linkage (owner only)
export const updateLinkage = async (
  input: LinkageIdInput & UpdateLinkageInput,
  currentUserRole: UserRole
): Promise<LinkageResponse> => {
  if (currentUserRole !== UserRole.OWNER) {
    throw new UnauthorizedError('Only owners can update linkages');
  }

  const linkage = await Linkage.findById(input.id);
  if (!linkage) {
    throw new NotFoundError('Linkage not found');
  }

  if (input.name !== undefined) linkage.name = input.name;
  if (input.amount !== undefined) linkage.amount = input.amount;

  await linkage.save();

  return {
    id: (linkage._id as any).toString(),
    name: linkage.name,
    amount: linkage.amount,
    createdAt: linkage.createdAt,
    updatedAt: linkage.updatedAt,
  };
};

// Delete linkage (owner only)
export const deleteLinkage = async (
  input: LinkageIdInput,
  currentUserRole: UserRole
): Promise<{ message: string }> => {
  if (currentUserRole !== UserRole.OWNER) {
    throw new UnauthorizedError('Only owners can delete linkages');
  }

  const linkage = await Linkage.findById(input.id);
  if (!linkage) {
    throw new NotFoundError('Linkage not found');
  }

  await Linkage.findByIdAndDelete(input.id);

  return { message: 'Linkage deleted successfully' };
};


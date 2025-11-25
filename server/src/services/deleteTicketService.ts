import DeleteTicket, { IDeleteTicket, TicketType, TicketStatus } from '../models/DeleteTicket';
import SHG from '../models/SHG';
import SHGMember from '../models/SHGMember';
import { NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import { CreateDeleteTicketInput, UpdateDeleteTicketInput, TicketIdInput } from '../validation/deleteTicketValidation';
import { UserRole } from '../models/User';
import mongoose from 'mongoose';

export interface DeleteTicketResponse {
  id: string;
  requestedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  ticketType: TicketType;
  entityId: string;
  entityName?: string;
  reason?: string;
  status: TicketStatus;
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Create delete ticket (front_desk only)
export const createDeleteTicket = async (
  input: CreateDeleteTicketInput,
  currentUserRole: UserRole,
  currentUserId: string
): Promise<DeleteTicketResponse> => {
  // Only front_desk can create delete tickets
  if (currentUserRole !== UserRole.FRONT_DESK) {
    throw new UnauthorizedError('Only front desk can create delete tickets');
  }

  // Validate entity exists and find the entity ID
  let entityId: mongoose.Types.ObjectId;
  let entityName = '';

  if (input.ticketType === TicketType.SHG) {
    // Find SHG by shgNumber
    const shg = await SHG.findOne({ shgNumber: input.shgNumber });
    if (!shg) {
      throw new NotFoundError(`SHG with number ${input.shgNumber} not found`);
    }
    entityId = shg._id as mongoose.Types.ObjectId;
    entityName = `${shg.shgNumber} - ${shg.shgName}`;
  } else if (input.ticketType === TicketType.SHG_MEMBER) {
    // Find SHG member by name
    const members = await SHGMember.find({ name: input.name });
    if (members.length === 0) {
      throw new NotFoundError(`SHG member with name "${input.name}" not found`);
    }
    if (members.length > 1) {
      throw new ValidationError(`Multiple SHG members found with name "${input.name}". Please use a more specific identifier.`);
    }
    entityId = members[0]._id as mongoose.Types.ObjectId;
    entityName = members[0].name;
  } else {
    throw new ValidationError('Invalid ticket type');
  }

  const ticket = new DeleteTicket({
    requestedBy: new mongoose.Types.ObjectId(currentUserId),
    ticketType: input.ticketType,
    entityId: entityId,
    reason: input.reason,
    status: TicketStatus.PENDING,
  });

  await ticket.save();

  const User = (await import('../models/User')).default;
  const requester = await User.findById(currentUserId);

  return {
    id: (ticket._id as any).toString(),
    requestedBy: {
      id: currentUserId,
      firstName: requester?.firstName || '',
      lastName: requester?.lastName || '',
      email: requester?.email || '',
    },
    ticketType: ticket.ticketType,
    entityId: (ticket.entityId as any).toString(),
    entityName,
    reason: ticket.reason,
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
};

// Get all delete tickets
export const getAllDeleteTickets = async (
  currentUserRole: UserRole,
  currentUserId?: string
): Promise<DeleteTicketResponse[]> => {
  let query: any = {};

  // Front desk can only see their own tickets
  if (currentUserRole === UserRole.FRONT_DESK && currentUserId) {
    query.requestedBy = new mongoose.Types.ObjectId(currentUserId);
  }

  const tickets = await DeleteTicket.find(query)
    .populate('requestedBy', 'firstName lastName email')
    .populate('approvedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });

  const User = (await import('../models/User')).default;

  return Promise.all(tickets.map(async (ticket) => {
    let entityName = '';
    if (ticket.ticketType === TicketType.SHG) {
      const shg = await SHG.findById(ticket.entityId);
      entityName = shg ? `${shg.shgNumber} - ${shg.shgName}` : '';
    } else if (ticket.ticketType === TicketType.SHG_MEMBER) {
      const member = await SHGMember.findById(ticket.entityId);
      entityName = member?.name || '';
    }

    return {
      id: (ticket._id as any).toString(),
      requestedBy: ticket.populated('requestedBy') ? {
        id: ((ticket.requestedBy as any)._id || ticket.requestedBy).toString(),
        firstName: (ticket.requestedBy as any).firstName,
        lastName: (ticket.requestedBy as any).lastName,
        email: (ticket.requestedBy as any).email,
      } : {
        id: (ticket.requestedBy as any).toString(),
        firstName: '',
        lastName: '',
        email: '',
      },
      ticketType: ticket.ticketType,
      entityId: (ticket.entityId as any).toString(),
      entityName,
      reason: ticket.reason,
      status: ticket.status,
      approvedBy: ticket.approvedBy && ticket.populated('approvedBy') ? {
        id: ((ticket.approvedBy as any)._id || ticket.approvedBy).toString(),
        firstName: (ticket.approvedBy as any).firstName,
        lastName: (ticket.approvedBy as any).lastName,
        email: (ticket.approvedBy as any).email,
      } : undefined,
      approvedAt: ticket.approvedAt,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }));
};

// Get delete ticket by ID
export const getDeleteTicketById = async (
  input: TicketIdInput,
  currentUserRole: UserRole,
  currentUserId?: string
): Promise<DeleteTicketResponse> => {
  const ticket = await DeleteTicket.findById(input.id)
    .populate('requestedBy', 'firstName lastName email')
    .populate('approvedBy', 'firstName lastName email');

  if (!ticket) {
    throw new NotFoundError('Delete ticket not found');
  }

  // Front desk can only view their own tickets
  if (currentUserRole === UserRole.FRONT_DESK && currentUserId) {
    if (ticket.requestedBy.toString() !== currentUserId) {
      throw new UnauthorizedError('You can only view your own delete tickets');
    }
  }

  let entityName = '';
  if (ticket.ticketType === TicketType.SHG) {
    const shg = await SHG.findById(ticket.entityId);
    entityName = shg ? `${shg.shgNumber} - ${shg.shgName}` : '';
  } else if (ticket.ticketType === TicketType.SHG_MEMBER) {
    const member = await SHGMember.findById(ticket.entityId);
    entityName = member?.name || '';
  }

  return {
    id: (ticket._id as any).toString(),
    requestedBy: ticket.populated('requestedBy') ? {
      id: ((ticket.requestedBy as any)._id || ticket.requestedBy).toString(),
      firstName: (ticket.requestedBy as any).firstName,
      lastName: (ticket.requestedBy as any).lastName,
      email: (ticket.requestedBy as any).email,
    } : {
      id: (ticket.requestedBy as any).toString(),
      firstName: '',
      lastName: '',
      email: '',
    },
    ticketType: ticket.ticketType,
    entityId: (ticket.entityId as any).toString(),
    entityName,
    reason: ticket.reason,
    status: ticket.status,
    approvedBy: ticket.approvedBy && ticket.populated('approvedBy') ? {
      id: ((ticket.approvedBy as any)._id || ticket.approvedBy).toString(),
      firstName: (ticket.approvedBy as any).firstName,
      lastName: (ticket.approvedBy as any).lastName,
      email: (ticket.approvedBy as any).email,
    } : undefined,
    approvedAt: ticket.approvedAt,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
};

// Update delete ticket (approve/reject) - owner only
export const updateDeleteTicket = async (
  input: TicketIdInput & UpdateDeleteTicketInput,
  currentUserRole: UserRole,
  currentUserId: string
): Promise<DeleteTicketResponse> => {
  // Only owner can approve/reject tickets
  if (currentUserRole !== UserRole.OWNER) {
    throw new UnauthorizedError('Only owners can approve or reject delete tickets');
  }

  const ticket = await DeleteTicket.findById(input.id);
  if (!ticket) {
    throw new NotFoundError('Delete ticket not found');
  }

  if (ticket.status !== TicketStatus.PENDING) {
    throw new ValidationError('Ticket has already been processed');
  }

  ticket.status = input.status === 'approved' ? TicketStatus.APPROVED : TicketStatus.REJECTED;
  ticket.approvedBy = new mongoose.Types.ObjectId(currentUserId);
  ticket.approvedAt = new Date();

  await ticket.save();

  // If approved, delete the entity
  if (ticket.status === TicketStatus.APPROVED) {
    if (ticket.ticketType === TicketType.SHG) {
      const shg = await SHG.findById(ticket.entityId);
      const shgNumber = shg?.shgNumber || 'SHG';
      // Delete all members first
      await SHGMember.deleteMany({ shgId: ticket.entityId });
      await SHG.findByIdAndDelete(ticket.entityId);
      console.log(`SHG ${shgNumber} deleted via approved ticket`);
    } else if (ticket.ticketType === TicketType.SHG_MEMBER) {
      await SHGMember.findByIdAndDelete(ticket.entityId);
    }
  }

  return getDeleteTicketById({ id: input.id }, currentUserRole, currentUserId);
};


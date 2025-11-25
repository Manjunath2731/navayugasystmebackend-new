import mongoose, { Document, Schema } from 'mongoose';

export enum TicketType {
  SHG = 'shg',
  SHG_MEMBER = 'shg_member'
}

export enum TicketStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface IDeleteTicket extends Document {
  requestedBy: mongoose.Types.ObjectId; // Reference to User (front_desk)
  ticketType: TicketType;
  entityId: mongoose.Types.ObjectId; // ID of SHG or SHGMember
  reason?: string;
  status: TicketStatus;
  approvedBy?: mongoose.Types.ObjectId; // Reference to User (owner)
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeleteTicketSchema: Schema = new Schema({
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketType: {
    type: String,
    enum: Object.values(TicketType),
    required: true
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(TicketStatus),
    required: true,
    default: TicketStatus.PENDING
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model<IDeleteTicket>('DeleteTicket', DeleteTicketSchema);


import { z } from 'zod';
import { TicketType } from '../models/DeleteTicket';

export const createDeleteTicketSchema = z.discriminatedUnion('ticketType', [
  z.object({
    ticketType: z.literal(TicketType.SHG),
    shgNumber: z.string().min(1, { message: 'SHG number is required' }),
    reason: z.string().optional(),
  }),
  z.object({
    ticketType: z.literal(TicketType.SHG_MEMBER),
    name: z.string().min(1, { message: 'Member name is required' }),
    reason: z.string().optional(),
  }),
]);

export const updateDeleteTicketSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export const ticketIdSchema = z.object({
  id: z.string().min(1, { message: 'Ticket ID is required' }),
});

export type CreateDeleteTicketInput = z.infer<typeof createDeleteTicketSchema>;
export type UpdateDeleteTicketInput = z.infer<typeof updateDeleteTicketSchema>;
export type TicketIdInput = z.infer<typeof ticketIdSchema>;


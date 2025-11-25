import { z } from 'zod';

export const createLinkageSchema = z.object({
  name: z.string().min(1, { message: 'Linkage name is required' }),
  amount: z.number().min(0, { message: 'Amount must be 0 or greater' }),
});

export const updateLinkageSchema = z.object({
  name: z.string().min(1, { message: 'Linkage name is required' }).optional(),
  amount: z.number().min(0, { message: 'Amount must be 0 or greater' }).optional(),
});

export const linkageIdSchema = z.object({
  id: z.string().min(1, { message: 'Linkage ID is required' }),
});

export type CreateLinkageInput = z.infer<typeof createLinkageSchema>;
export type UpdateLinkageInput = z.infer<typeof updateLinkageSchema>;
export type LinkageIdInput = z.infer<typeof linkageIdSchema>;


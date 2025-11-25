import { z } from 'zod';

export const createSHGSchema = z.object({
  shgName: z.string().min(1, { message: 'SHG name is required' }),
  shgAddress: z.string().min(1, { message: 'SHG address is required' }),
  savingAccountNumber: z.string().min(1, { message: 'Saving account number is required' }),
  loanAccountNumber: z.string().min(1, { message: 'Loan account number is required' }),
  loanSanctionDate: z.string().or(z.date()),
  repaymentDate: z.string().or(z.date()),
  fieldOfficerId: z.string().min(1, { message: 'Field officer is required' }),
  branch: z.string().min(1, { message: 'Branch is required' }),
  loanSanctionAmount: z.number().min(0, { message: 'Loan sanction amount must be 0 or greater' }),
  numberOfMonths: z.number().min(1, { message: 'Number of months must be at least 1' }),
  monthlyRepaymentAmount: z.number().min(0, { message: 'Monthly repayment amount must be 0 or greater' }),
  fixedDeposit: z.number().min(0, { message: 'Fixed deposit must be 0 or greater' }),
  linkageId: z.string().min(1, { message: 'Linkage is required' }),
  numberOfMembers: z.number().min(1, { message: 'Number of members must be at least 1' }),
});

export const updateSHGSchema = createSHGSchema.partial();

export const shgIdSchema = z.object({
  id: z.string().min(1, { message: 'SHG ID is required' }),
});

export type CreateSHGInput = z.infer<typeof createSHGSchema>;
export type UpdateSHGInput = z.infer<typeof updateSHGSchema>;
export type SHGIdInput = z.infer<typeof shgIdSchema>;


import { z } from 'zod';
import { PaymentMethod, PaymentType } from '../models/MonthlyRepayment';

export const createMonthlyRepaymentSchema = z.object({
  shgId: z.string().min(1, { message: 'SHG ID is required' }),
  repaymentDate: z.string().or(z.date()),
  amount: z.number().min(0, { message: 'Amount must be 0 or greater' }),
  receiptPhoto: z.string().min(1, { message: 'Receipt photo is required' }),
  paymentMethod: z.nativeEnum(PaymentMethod, { message: 'Invalid payment method' }),
  paymentType: z.nativeEnum(PaymentType, { message: 'Invalid payment type' }),
  unpaidMemberName: z.string().optional(),
});

export const updateMonthlyRepaymentSchema = createMonthlyRepaymentSchema.partial().omit({ shgId: true });

export const repaymentIdSchema = z.object({
  id: z.string().min(1, { message: 'Repayment ID is required' }),
});

export type CreateMonthlyRepaymentInput = z.infer<typeof createMonthlyRepaymentSchema>;
export type UpdateMonthlyRepaymentInput = z.infer<typeof updateMonthlyRepaymentSchema>;
export type RepaymentIdInput = z.infer<typeof repaymentIdSchema>;


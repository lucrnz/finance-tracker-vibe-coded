import { z } from 'zod';
import { EXPENSE_CATEGORIES } from '../categories/index.js';

export const createBudgetSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(EXPENSE_CATEGORIES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid expense category' }),
  }),
  month: z.number().int().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12'),
  year: z.number().int().min(2000, 'Year must be 2000 or later').max(2100, 'Year must be 2100 or earlier'),
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  category: z.enum(EXPENSE_CATEGORIES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid expense category' }),
  }).optional(),
  month: z.number().int().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12').optional(),
  year: z.number().int().min(2000, 'Year must be 2000 or later').max(2100, 'Year must be 2100 or earlier').optional(),
});

export const replaceBudgetSchema = createBudgetSchema;

export const budgetQuerySchema = z.object({
  category: z.string().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type ReplaceBudgetInput = z.infer<typeof replaceBudgetSchema>;
export type BudgetQuery = z.infer<typeof budgetQuerySchema>;

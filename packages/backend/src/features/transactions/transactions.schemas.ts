import { z } from 'zod';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../categories/index.js';

const transactionTypeSchema = z.enum(['income', 'expense']);

export const createTransactionSchema = z
  .object({
    amount: z.number().positive('Amount must be positive'),
    description: z.string().min(1, 'Description is required').max(500),
    category: z.string().min(1, 'Category is required'),
    type: transactionTypeSchema,
    date: z.string().datetime('Invalid date format').or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  })
  .refine(
    (data) => {
      const validCategories =
        data.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      return validCategories.includes(data.category as never);
    },
    {
      message: 'Invalid category for the selected transaction type',
      path: ['category'],
    }
  );

export const updateTransactionSchema = z
  .object({
    amount: z.number().positive('Amount must be positive').optional(),
    description: z.string().min(1).max(500).optional(),
    category: z.string().min(1).optional(),
    type: transactionTypeSchema.optional(),
    date: z.string().datetime('Invalid date format').or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  })
  .refine(
    (data) => {
      if (data.category && data.type) {
        const validCategories =
          data.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
        return validCategories.includes(data.category as never);
      }
      return true;
    },
    {
      message: 'Invalid category for the selected transaction type',
      path: ['category'],
    }
  );

export const transactionQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;

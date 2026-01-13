import { z } from 'zod';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './constants';

// Auth schemas
export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Transaction schemas
const transactionTypeSchema = z.enum(['income', 'expense']);

export const createTransactionSchema = z
  .object({
    amount: z.coerce.number().positive('Amount must be positive'),
    description: z.string().min(1, 'Description is required').max(500),
    category: z.string().min(1, 'Category is required'),
    type: transactionTypeSchema,
    date: z.string().min(1, 'Date is required'),
  })
  .refine(
    (data) => {
      const validCategories =
        data.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      return (validCategories as readonly string[]).includes(data.category);
    },
    {
      message: 'Invalid category for the selected transaction type',
      path: ['category'],
    }
  );

export const updateTransactionSchema = createTransactionSchema;

// Budget schemas
export const createBudgetSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.enum(EXPENSE_CATEGORIES, {
    errorMap: () => ({ message: 'Invalid expense category' }),
  }),
  month: z.coerce.number().int().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12'),
  year: z.coerce.number().int().min(2000, 'Year must be 2000 or later').max(2100, 'Year must be 2100 or earlier'),
});

export const updateBudgetSchema = createBudgetSchema;

// Response schemas
export const authResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().optional(),
  }),
});

export const transactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  description: z.string(),
  category: z.string(),
  type: transactionTypeSchema,
  date: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const transactionsResponseSchema = z.object({
  transactions: z.array(transactionSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const budgetSchema = z.object({
  id: z.string(),
  amount: z.number(),
  category: z.string(),
  month: z.number(),
  year: z.number(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const budgetsResponseSchema = z.object({
  budgets: z.array(budgetSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const reportResponseSchema = z.object({
  month: z.number(),
  year: z.number(),
  totalIncome: z.number(),
  totalExpenses: z.number(),
  netBalance: z.number(),
  expensesByCategory: z.record(z.string(), z.number()),
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionsResponse = z.infer<typeof transactionsResponseSchema>;
export type Budget = z.infer<typeof budgetSchema>;
export type BudgetsResponse = z.infer<typeof budgetsResponseSchema>;
export type ReportResponse = z.infer<typeof reportResponseSchema>;
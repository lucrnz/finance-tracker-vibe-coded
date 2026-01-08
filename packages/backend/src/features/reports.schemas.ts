import { z } from 'zod';

export const reportQuerySchema = z.object({
  month: z.coerce.number().int().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12'),
  year: z.coerce.number().int().min(2000, 'Year must be 2000 or later').max(2100, 'Year must be 2100 or earlier'),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;

export interface ReportData {
  readonly month: number;
  readonly year: number;
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly netBalance: number;
  readonly expensesByCategory: Record<string, number>;
}
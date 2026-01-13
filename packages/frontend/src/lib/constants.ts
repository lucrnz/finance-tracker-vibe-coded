export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Entertainment',
  'Utilities',
  'Rent/Mortgage',
  'Healthcare',
  'Shopping',
  'Other',
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type TransactionType = 'income' | 'expense';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const CATEGORY_COLORS: Record<string, string> = {
  Food: 'hsl(var(--chart-1))',
  Transport: 'hsl(var(--chart-2))',
  Entertainment: 'hsl(var(--chart-3))',
  Utilities: 'hsl(var(--chart-4))',
  'Rent/Mortgage': 'hsl(var(--chart-5))',
  Healthcare: 'hsl(220, 70%, 50%)',
  Shopping: 'hsl(280, 65%, 60%)',
  Other: 'hsl(160, 60%, 45%)',
  Salary: 'hsl(120, 60%, 50%)',
  Freelance: 'hsl(200, 70%, 50%)',
};
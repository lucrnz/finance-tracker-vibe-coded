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

export const ALL_CATEGORIES = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES.filter((c) => !EXPENSE_CATEGORIES.includes(c as typeof EXPENSE_CATEGORIES[number])),
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type Category = ExpenseCategory | IncomeCategory;

import { Router } from 'express';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './categories.constants.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      expense: EXPENSE_CATEGORIES,
      income: INCOME_CATEGORIES,
    },
  });
});

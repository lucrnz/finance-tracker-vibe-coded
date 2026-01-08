import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate } from '../auth/index.js';
import { logger } from '../../shared/logger.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  replaceBudgetSchema,
  budgetQuerySchema,
} from './budgets.schemas.js';
import { budgetsService } from './budgets.service.js';
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
  ReplaceBudgetInput,
} from './budgets.schemas.js';

export const budgetsRouter = Router();

// All budget routes require authentication
budgetsRouter.use(authenticate);

// Get all budgets with filtering and pagination
budgetsRouter.get('/', async (req, res, next) => {
  try {
    logger.debug('GET /budgets', { query: req.query });
    const query = budgetQuerySchema.parse(req.query);
    const result = await budgetsService.findAll(req.user!.id, query);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

// Get single budget
budgetsRouter.get('/:id', async (req, res, next) => {
  try {
    logger.debug('GET /budgets/:id', { id: req.params['id'] });
    const budget = await budgetsService.findById(req.user!.id, req.params['id']!);
    res.json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
});

// Create budget
budgetsRouter.post('/', validate(createBudgetSchema), async (req, res, next) => {
  try {
    logger.debug('POST /budgets', { body: req.body });
    const input = req.body as CreateBudgetInput;
    const budget = await budgetsService.create(req.user!.id, input);
    res.status(201).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
});

// Update budget (partial)
budgetsRouter.patch('/:id', validate(updateBudgetSchema), async (req, res, next) => {
  try {
    logger.debug('PATCH /budgets/:id', { id: req.params['id'], body: req.body });
    const input = req.body as UpdateBudgetInput;
    const budget = await budgetsService.update(req.user!.id, req.params['id']!, input);
    res.json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
});

// Update budget (full replace)
budgetsRouter.put('/:id', validate(replaceBudgetSchema), async (req, res, next) => {
  try {
    logger.debug('PUT /budgets/:id', { id: req.params['id'], body: req.body });
    const input = req.body as ReplaceBudgetInput;
    const budget = await budgetsService.replace(req.user!.id, req.params['id']!, input);
    res.json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
});

// Delete budget
budgetsRouter.delete('/:id', async (req, res, next) => {
  try {
    logger.debug('DELETE /budgets/:id', { id: req.params['id'] });
    await budgetsService.delete(req.user!.id, req.params['id']!);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate } from '../auth/index.js';
import { logger } from '../../shared/logger.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from './transactions.schemas.js';
import { transactionsService } from './transactions.service.js';
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from './transactions.schemas.js';

export const transactionsRouter = Router();

// All transaction routes require authentication
transactionsRouter.use(authenticate);

// Get all transactions with filtering and pagination
transactionsRouter.get('/', async (req, res, next) => {
  try {
    logger.debug('GET /transactions', { query: req.query });
    const query = transactionQuerySchema.parse(req.query);
    const result = await transactionsService.findAll(req.user!.id, query);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction summary
transactionsRouter.get('/summary', async (req, res, next) => {
  try {
    logger.debug('GET /transactions/summary', { query: req.query });
    const { startDate, endDate } = req.query;
    const summary = await transactionsService.getSummary(
      req.user!.id,
      startDate as string | undefined,
      endDate as string | undefined
    );
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});

// Get single transaction
transactionsRouter.get('/:id', async (req, res, next) => {
  try {
    logger.debug('GET /transactions/:id', { id: req.params['id'] });
    const transaction = await transactionsService.findById(req.user!.id, req.params['id']!);
    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// Create transaction
transactionsRouter.post('/', validate(createTransactionSchema), async (req, res, next) => {
  try {
    logger.debug('POST /transactions', { body: req.body });
    const input = req.body as CreateTransactionInput;
    const transaction = await transactionsService.create(req.user!.id, input);
    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// Update transaction (partial)
transactionsRouter.patch('/:id', validate(updateTransactionSchema), async (req, res, next) => {
  try {
    logger.debug('PATCH /transactions/:id', { id: req.params['id'], body: req.body });
    const input = req.body as UpdateTransactionInput;
    const transaction = await transactionsService.update(req.user!.id, req.params['id']!, input);
    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// Update transaction (full replace)
transactionsRouter.put('/:id', validate(createTransactionSchema), async (req, res, next) => {
  try {
    logger.debug('PUT /transactions/:id', { id: req.params['id'], body: req.body });
    const input = req.body as CreateTransactionInput;
    const transaction = await transactionsService.replace(req.user!.id, req.params['id']!, input);
    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// Delete transaction
transactionsRouter.delete('/:id', async (req, res, next) => {
  try {
    logger.debug('DELETE /transactions/:id', { id: req.params['id'] });
    await transactionsService.delete(req.user!.id, req.params['id']!);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

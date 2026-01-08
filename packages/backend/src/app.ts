import express from 'express';
import { errorHandler } from './shared/middleware/error-handler.js';
import { logger } from './shared/logger.js';
import { authRouter } from './features/auth/index.js';
import { categoriesRouter } from './features/categories/index.js';
import { transactionsRouter } from './features/transactions/index.js';
import { budgetsRouter } from './features/budgets/index.js';
import { reportsRouter } from './features/reports/index.js';

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(express.json());

  // Request logging
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/transactions', transactionsRouter);
  app.use('/api/budgets', budgetsRouter);
  app.use('/api/reports', reportsRouter);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};

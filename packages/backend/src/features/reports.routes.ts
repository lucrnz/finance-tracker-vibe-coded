import { Router } from 'express';
import { authenticate } from '../auth/index.js';
import { logger } from '../../shared/logger.js';
import { reportQuerySchema } from './reports.schemas.js';
import { reportsService } from './reports.service.js';

export const reportsRouter = Router();

// All report routes require authentication
reportsRouter.use(authenticate);

// Get monthly report with aggregated data
reportsRouter.get('/', async (req, res, next) => {
  try {
    logger.debug('GET /reports', { query: req.query });
    
    const queryResult = reportQuerySchema.safeParse(req.query);
    
    if (!queryResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Both month and year query parameters are required',
          errors: queryResult.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      });
      return;
    }

    const report = await reportsService.getMonthlyReport(req.user!.id, queryResult.data);
    
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
});
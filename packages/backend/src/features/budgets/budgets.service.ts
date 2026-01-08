import { prisma } from '../../shared/database.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../../shared/errors.js';
import { logger } from '../../shared/logger.js';
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
  ReplaceBudgetInput,
  BudgetQuery,
} from './budgets.schemas.js';
import type { Budget } from '@prisma/client';

interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export const budgetsService = {
  async create(userId: string, input: CreateBudgetInput): Promise<Budget> {
    logger.debug('Creating budget', { userId, input });

    // Check for existing budget with same user/category/month/year
    const existing = await prisma.budget.findUnique({
      where: {
        userId_category_month_year: {
          userId,
          category: input.category,
          month: input.month,
          year: input.year,
        },
      },
    });

    if (existing) {
      throw new ConflictError(
        `Budget already exists for ${input.category} in ${input.month}/${input.year}`
      );
    }

    const budget = await prisma.budget.create({
      data: {
        amount: input.amount,
        category: input.category,
        month: input.month,
        year: input.year,
        userId,
      },
    });

    logger.info('Budget created', { budgetId: budget.id, userId });
    return budget;
  },

  async findAll(userId: string, query: BudgetQuery): Promise<PaginatedResult<Budget>> {
    const { category, month, year, page, limit } = query;
    const skip = (page - 1) * limit;

    logger.debug('Finding budgets', { userId, query });

    const where = {
      userId,
      ...(category && { category }),
      ...(month && { month }),
      ...(year && { year }),
    };

    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where,
        orderBy: [{ year: 'desc' }, { month: 'desc' }, { category: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.budget.count({ where }),
    ]);

    return {
      data: budgets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(userId: string, budgetId: string): Promise<Budget> {
    logger.debug('Finding budget by ID', { userId, budgetId });

    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new NotFoundError('Budget not found');
    }

    if (budget.userId !== userId) {
      throw new ForbiddenError('You do not have access to this budget');
    }

    return budget;
  },

  async update(userId: string, budgetId: string, input: UpdateBudgetInput): Promise<Budget> {
    logger.debug('Updating budget', { userId, budgetId, input });

    const budget = await this.findById(userId, budgetId);

    // If updating category, month, or year, check for conflicts
    const newCategory = input.category ?? budget.category;
    const newMonth = input.month ?? budget.month;
    const newYear = input.year ?? budget.year;

    // Check if the new combination would conflict with an existing budget
    if (input.category !== undefined || input.month !== undefined || input.year !== undefined) {
      const existing = await prisma.budget.findUnique({
        where: {
          userId_category_month_year: {
            userId,
            category: newCategory,
            month: newMonth,
            year: newYear,
          },
        },
      });

      if (existing && existing.id !== budgetId) {
        throw new ConflictError(
          `Budget already exists for ${newCategory} in ${newMonth}/${newYear}`
        );
      }
    }

    const updatedBudget = await prisma.budget.update({
      where: { id: budget.id },
      data: {
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.month !== undefined && { month: input.month }),
        ...(input.year !== undefined && { year: input.year }),
      },
    });

    logger.info('Budget updated', { budgetId, userId });
    return updatedBudget;
  },

  async replace(userId: string, budgetId: string, input: ReplaceBudgetInput): Promise<Budget> {
    logger.debug('Replacing budget', { userId, budgetId, input });

    const budget = await this.findById(userId, budgetId);

    // Check if the new combination would conflict with an existing budget (different from current)
    const existing = await prisma.budget.findUnique({
      where: {
        userId_category_month_year: {
          userId,
          category: input.category,
          month: input.month,
          year: input.year,
        },
      },
    });

    if (existing && existing.id !== budgetId) {
      throw new ConflictError(
        `Budget already exists for ${input.category} in ${input.month}/${input.year}`
      );
    }

    const replacedBudget = await prisma.budget.update({
      where: { id: budget.id },
      data: {
        amount: input.amount,
        category: input.category,
        month: input.month,
        year: input.year,
      },
    });

    logger.info('Budget replaced', { budgetId, userId });
    return replacedBudget;
  },

  async delete(userId: string, budgetId: string): Promise<void> {
    logger.debug('Deleting budget', { userId, budgetId });

    const budget = await this.findById(userId, budgetId);

    await prisma.budget.delete({
      where: { id: budget.id },
    });

    logger.info('Budget deleted', { budgetId, userId });
  },
} as const;

import { prisma } from '../../shared/database.js';
import { NotFoundError, ForbiddenError } from '../../shared/errors.js';
import { logger } from '../../shared/logger.js';
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQuery,
} from './transactions.schemas.js';
import type { Transaction } from '@prisma/client';

interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export const transactionsService = {
  async create(userId: string, input: CreateTransactionInput): Promise<Transaction> {
    logger.debug('Creating transaction', { userId, input });
    const date = new Date(input.date);
    
    const transaction = await prisma.transaction.create({
      data: {
        amount: input.amount,
        description: input.description,
        category: input.category,
        type: input.type,
        date,
        userId,
      },
    });

    logger.info('Transaction created', { transactionId: transaction.id, userId });
    return transaction;
  },

  async findAll(userId: string, query: TransactionQuery): Promise<PaginatedResult<Transaction>> {
    const { type, category, startDate, endDate, page, limit } = query;
    const skip = (page - 1) * limit;

    logger.debug('Finding transactions', { userId, query });

    const where = {
      userId,
      ...(type && { type }),
      ...(category && { category }),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(userId: string, transactionId: string): Promise<Transaction> {
    logger.debug('Finding transaction by ID', { userId, transactionId });

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenError('You do not have access to this transaction');
    }

    return transaction;
  },

  async update(userId: string, transactionId: string, input: UpdateTransactionInput): Promise<Transaction> {
    logger.debug('Updating transaction', { userId, transactionId, input });

    const transaction = await this.findById(userId, transactionId);

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.date !== undefined && { date: new Date(input.date) }),
      },
    });

    logger.info('Transaction updated', { transactionId, userId });
    return updatedTransaction;
  },

  async replace(userId: string, transactionId: string, input: CreateTransactionInput): Promise<Transaction> {
    logger.debug('Replacing transaction', { userId, transactionId, input });

    const transaction = await this.findById(userId, transactionId);

    const replacedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        amount: input.amount,
        description: input.description,
        category: input.category,
        type: input.type,
        date: new Date(input.date),
      },
    });

    logger.info('Transaction replaced', { transactionId, userId });
    return replacedTransaction;
  },

  async delete(userId: string, transactionId: string): Promise<void> {
    logger.debug('Deleting transaction', { userId, transactionId });

    const transaction = await this.findById(userId, transactionId);

    await prisma.transaction.delete({
      where: { id: transaction.id },
    });

    logger.info('Transaction deleted', { transactionId, userId });
  },

  async getSummary(userId: string, startDate?: string, endDate?: string) {
    logger.debug('Getting transaction summary', { userId, startDate, endDate });

    const where = {
      userId,
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [incomeResult, expenseResult, byCategory] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'income' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'expense' },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ['category', 'type'],
        where,
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = incomeResult._sum.amount ?? 0;
    const totalExpense = expenseResult._sum.amount ?? 0;
    const balance = totalIncome - totalExpense;

    logger.info('Transaction summary generated', { userId, totalIncome, totalExpense, balance });

    return {
      totalIncome,
      totalExpense,
      balance,
      byCategory: byCategory.map((item: { category: string; type: string; _sum: { amount: number | null } }) => ({
        category: item.category,
        type: item.type,
        total: item._sum.amount ?? 0,
      })),
    };
  },
} as const;

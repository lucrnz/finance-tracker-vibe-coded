import { prisma } from '../../shared/database.js';
import { logger } from '../../shared/logger.js';
import type { ReportQuery, ReportData } from './reports.schemas.js';

export const reportsService = {
  async getMonthlyReport(userId: string, query: ReportQuery): Promise<ReportData> {
    const { month, year } = query;
    
    logger.debug('Generating monthly report', { userId, month, year });

    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month

    const where = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Get income total
    const incomeResult = await prisma.transaction.aggregate({
      where: { ...where, type: 'income' },
      _sum: { amount: true },
    });

    // Get expense total
    const expenseResult = await prisma.transaction.aggregate({
      where: { ...where, type: 'expense' },
      _sum: { amount: true },
    });

    // Get expenses grouped by category
    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['category'],
      where: { ...where, type: 'expense' },
      _sum: { amount: true },
    });

    const totalIncome = incomeResult._sum.amount ?? 0;
    const totalExpenses = expenseResult._sum.amount ?? 0;
    const netBalance = totalIncome - totalExpenses;

    // Convert category expenses to an object
    const expensesByCategoryObj: Record<string, number> = {};
    for (const item of expensesByCategory) {
      expensesByCategoryObj[item.category] = item._sum.amount ?? 0;
    }

    const report: ReportData = {
      month,
      year,
      totalIncome,
      totalExpenses,
      netBalance,
      expensesByCategory: expensesByCategoryObj,
    };

    logger.info('Monthly report generated', { userId, month, year, totalIncome, totalExpenses, netBalance });

    return report;
  },
} as const;

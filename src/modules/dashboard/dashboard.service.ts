import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export class DashboardService {
  /**
   * Get overall summary: total income, total expenses, net balance
   */
  static async getSummary(userId?: string) {
    const where: Prisma.RecordWhereInput = { deletedAt: null };
    if (userId) where.userId = userId;

    const [incomeResult, expenseResult] = await Promise.all([
      prisma.record.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.record.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalIncome = Number(incomeResult._sum.amount || 0);
    const totalExpenses = Number(expenseResult._sum.amount || 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      totalIncomeCount: incomeResult._count,
      totalExpenseCount: expenseResult._count,
    };
  }

  /**
   * Get totals grouped by category
   */
  static async getCategoryTotals(userId?: string) {
    const where: Prisma.RecordWhereInput = { deletedAt: null };
    if (userId) where.userId = userId;

    const results = await prisma.record.groupBy({
      by: ['category', 'type'],
      where,
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    });

    return results.map((r) => ({
      category: r.category,
      type: r.type,
      total: Number(r._sum.amount || 0),
      count: r._count,
    }));
  }

  /**
   * Get recent transactions
   */
  static async getRecentTransactions(userId?: string, limit: number = 10) {
    const where: Prisma.RecordWhereInput = { deletedAt: null };
    if (userId) where.userId = userId;

    const records = await prisma.record.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return records;
  }

  /**
   * Get monthly trends (income vs expense per month)
   */
  static async getMonthlyTrends(userId?: string, months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const where: Prisma.RecordWhereInput = {
      deletedAt: null,
      date: { gte: startDate },
    };
    if (userId) where.userId = userId;

    // Use raw query for month-level grouping
    const userFilter = userId ? Prisma.sql`AND "userId" = ${userId}` : Prisma.sql``;

    const trends = await prisma.$queryRaw<
      Array<{ month: string; year: string; type: string; total: number; count: bigint }>
    >`
      SELECT 
        EXTRACT(MONTH FROM date)::TEXT AS month,
        EXTRACT(YEAR FROM date)::TEXT AS year,
        type::TEXT,
        SUM(amount)::FLOAT AS total,
        COUNT(*)::BIGINT AS count
      FROM records
      WHERE "deletedAt" IS NULL
        AND date >= ${startDate}
        ${userFilter}
      GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date), type
      ORDER BY year ASC, month ASC
    `;

    return trends.map((t) => ({
      month: parseInt(t.month),
      year: parseInt(t.year),
      type: t.type,
      total: Number(t.total),
      count: Number(t.count),
    }));
  }
}

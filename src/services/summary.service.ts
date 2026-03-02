import { prisma } from '@/lib/prisma';
import { TransactionType } from '@prisma/client';
import { DashboardData, MonthlySummary, CategorySummary, DailyTrend, BudgetProgress } from '@/types';
import { getStartOfMonth, getEndOfMonth } from '@/lib/utils';

export class SummaryService {
  async getDashboardData(userId: string, month: number, year: number): Promise<DashboardData> {
    const [summary, expenseByCategory, dailyTrend, budgets] = await Promise.all([
      this.getMonthlySummary(userId, month, year),
      this.getExpenseByCategory(userId, month, year),
      this.getDailyTrend(userId, month, year),
      this.getBudgetProgress(userId, month, year),
    ]);

    return {
      summary,
      expenseByCategory,
      dailyTrend,
      budgets,
    };
  }

  async getMonthlySummary(userId: string, month: number, year: number): Promise<MonthlySummary> {
    const startDate = getStartOfMonth(month, year);
    const endDate = getEndOfMonth(month, year);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        type: true,
        amount: true,
      },
    });

    const income = transactions
      .filter(t => t.type === TransactionType.income)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter(t => t.type === TransactionType.expense)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }

  async getExpenseByCategory(userId: string, month: number, year: number): Promise<CategorySummary[]> {
    const startDate = getStartOfMonth(month, year);
    const endDate = getEndOfMonth(month, year);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.expense,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    const categoryMap = new Map<string, { name: string; color: string; amount: number }>();
    let totalExpense = 0;

    for (const transaction of transactions) {
      const categoryId = transaction.categoryId;
      const amount = Number(transaction.amount);
      totalExpense += amount;

      if (categoryMap.has(categoryId)) {
        const existing = categoryMap.get(categoryId)!;
        existing.amount += amount;
      } else {
        categoryMap.set(categoryId, {
          name: transaction.category.name,
          color: transaction.category.color,
          amount,
        });
      }
    }

    const result: CategorySummary[] = [];
    for (const [categoryId, data] of categoryMap) {
      result.push({
        categoryId,
        categoryName: data.name,
        categoryColor: data.color,
        amount: data.amount,
        percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
      });
    }

    return result.sort((a, b) => b.amount - a.amount);
  }

  async getDailyTrend(userId: string, month: number, year: number): Promise<DailyTrend[]> {
    const startDate = getStartOfMonth(month, year);
    const endDate = getEndOfMonth(month, year);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        type: true,
        amount: true,
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const dailyMap = new Map<string, { income: number; expense: number }>();

    for (const transaction of transactions) {
      const dateKey = transaction.date.toISOString().split('T')[0];
      const amount = Number(transaction.amount);

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { income: 0, expense: 0 });
      }

      const dayData = dailyMap.get(dateKey)!;
      if (transaction.type === TransactionType.income) {
        dayData.income += amount;
      } else {
        dayData.expense += amount;
      }
    }

    const result: DailyTrend[] = [];
    for (const [date, data] of dailyMap) {
      result.push({ date, ...data });
    }

    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getBudgetProgress(userId: string, month: number, year: number): Promise<BudgetProgress[]> {
    const startDate = getStartOfMonth(month, year);
    const endDate = getEndOfMonth(month, year);

    const [budgets, transactions] = await Promise.all([
      prisma.budget.findMany({
        where: {
          userId,
          month,
          year,
        },
        include: {
          category: true,
        },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          type: TransactionType.expense,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          categoryId: true,
          amount: true,
        },
      }),
    ]);

    // Calculate total expense by category
    const expenseByCategory = new Map<string, number>();
    for (const transaction of transactions) {
      const current = expenseByCategory.get(transaction.categoryId) || 0;
      expenseByCategory.set(transaction.categoryId, current + Number(transaction.amount));
    }

    return budgets.map(budget => {
      const categoryId = budget.categoryId;
      const spent = categoryId ? (expenseByCategory.get(categoryId) || 0) : 0;
      const limit = Number(budget.limit);
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

      let status: 'good' | 'warning' | 'danger' = 'good';
      if (percentage >= 100) {
        status = 'danger';
      } else if (percentage >= 80) {
        status = 'warning';
      }

      return {
        budgetId: budget.id,
        categoryId,
        categoryName: budget.category?.name || 'ทั้งหมด',
        categoryColor: budget.category?.color || '#64748b',
        month: budget.month,
        year: budget.year,
        limit,
        spent,
        percentage,
        status,
      };
    });
  }
}

export const summaryService = new SummaryService();

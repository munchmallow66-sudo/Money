import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SummaryService } from './summary.service';
import { prisma } from '@/lib/prisma';
import { TransactionType } from '@prisma/client';

// Mock the prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    budget: {
      findMany: vi.fn(),
    },
  },
}));

describe('SummaryService', () => {
  let service: SummaryService;
  const mockUserId = 'user-123';

  beforeEach(() => {
    service = new SummaryService();
    vi.clearAllMocks();
  });

  describe('getMonthlySummary', () => {
    it('should calculate income, expense, and balance correctly', async () => {
      const mockTransactions = [
        { type: TransactionType.income, amount: 50000 },
        { type: TransactionType.income, amount: 30000 },
        { type: TransactionType.expense, amount: 15000 },
        { type: TransactionType.expense, amount: 5000 },
      ];

      (prisma.transaction.findMany as any).mockResolvedValue(mockTransactions);

      const result = await service.getMonthlySummary(mockUserId, 1, 2024);

      expect(result).toEqual({
        income: 80000,
        expense: 20000,
        balance: 60000,
      });
    });

    it('should return zero values when no transactions exist', async () => {
      (prisma.transaction.findMany as any).mockResolvedValue([]);

      const result = await service.getMonthlySummary(mockUserId, 1, 2024);

      expect(result).toEqual({
        income: 0,
        expense: 0,
        balance: 0,
      });
    });

    it('should handle negative balance correctly', async () => {
      const mockTransactions = [
        { type: TransactionType.income, amount: 10000 },
        { type: TransactionType.expense, amount: 15000 },
      ];

      (prisma.transaction.findMany as any).mockResolvedValue(mockTransactions);

      const result = await service.getMonthlySummary(mockUserId, 1, 2024);

      expect(result).toEqual({
        income: 10000,
        expense: 15000,
        balance: -5000,
      });
    });
  });

  describe('getExpenseByCategory', () => {
    it('should group expenses by category and calculate percentages', async () => {
      const mockTransactions = [
        { 
          categoryId: 'cat-1', 
          amount: 5000, 
          category: { name: 'Food', color: '#ff0000' } 
        },
        { 
          categoryId: 'cat-1', 
          amount: 3000, 
          category: { name: 'Food', color: '#ff0000' } 
        },
        { 
          categoryId: 'cat-2', 
          amount: 2000, 
          category: { name: 'Transport', color: '#00ff00' } 
        },
      ];

      (prisma.transaction.findMany as any).mockResolvedValue(mockTransactions);

      const result = await service.getExpenseByCategory(mockUserId, 1, 2024);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        categoryId: 'cat-1',
        categoryName: 'Food',
        amount: 8000,
        percentage: 80,
      });
      expect(result[1]).toMatchObject({
        categoryId: 'cat-2',
        categoryName: 'Transport',
        amount: 2000,
        percentage: 20,
      });
    });

    it('should return empty array when no expenses exist', async () => {
      (prisma.transaction.findMany as any).mockResolvedValue([]);

      const result = await service.getExpenseByCategory(mockUserId, 1, 2024);

      expect(result).toEqual([]);
    });
  });

  describe('getDailyTrend', () => {
    it('should aggregate daily income and expense', async () => {
      const mockTransactions = [
        { type: TransactionType.income, amount: 5000, date: new Date('2024-01-15') },
        { type: TransactionType.expense, amount: 2000, date: new Date('2024-01-15') },
        { type: TransactionType.expense, amount: 3000, date: new Date('2024-01-16') },
      ];

      (prisma.transaction.findMany as any).mockResolvedValue(mockTransactions);

      const result = await service.getDailyTrend(mockUserId, 1, 2024);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        date: '2024-01-15',
        income: 5000,
        expense: 2000,
      });
      expect(result[1]).toMatchObject({
        date: '2024-01-16',
        income: 0,
        expense: 3000,
      });
    });
  });

  describe('getBudgetProgress', () => {
    it('should calculate budget progress correctly', async () => {
      const mockBudgets = [
        { 
          id: 'budget-1', 
          categoryId: 'cat-1', 
          month: 1, 
          year: 2024, 
          limit: 10000,
          category: { name: 'Food', color: '#ff0000' }
        },
      ];

      const mockTransactions = [
        { categoryId: 'cat-1', amount: 6000 },
      ];

      (prisma.budget.findMany as any).mockResolvedValue(mockBudgets);
      (prisma.transaction.findMany as any).mockResolvedValue(mockTransactions);

      const result = await service.getBudgetProgress(mockUserId, 1, 2024);

      expect(result[0]).toMatchObject({
        budgetId: 'budget-1',
        categoryId: 'cat-1',
        categoryName: 'Food',
        limit: 10000,
        spent: 6000,
        percentage: 60,
        status: 'good',
      });
    });

    it('should mark budget as danger when over 100%', async () => {
      const mockBudgets = [
        { 
          id: 'budget-1', 
          categoryId: 'cat-1', 
          month: 1, 
          year: 2024, 
          limit: 5000,
          category: { name: 'Food', color: '#ff0000' }
        },
      ];

      const mockTransactions = [
        { categoryId: 'cat-1', amount: 6000 },
      ];

      (prisma.budget.findMany as any).mockResolvedValue(mockBudgets);
      (prisma.transaction.findMany as any).mockResolvedValue(mockTransactions);

      const result = await service.getBudgetProgress(mockUserId, 1, 2024);

      expect(result[0].percentage).toBe(120);
      expect(result[0].status).toBe('danger');
    });

    it('should mark budget as warning when between 80-100%', async () => {
      const mockBudgets = [
        { 
          id: 'budget-1', 
          categoryId: 'cat-1', 
          month: 1, 
          year: 2024, 
          limit: 10000,
          category: { name: 'Food', color: '#ff0000' }
        },
      ];

      const mockTransactions = [
        { categoryId: 'cat-1', amount: 8500 },
      ];

      (prisma.budget.findMany as any).mockResolvedValue(mockBudgets);
      (prisma.transaction.findMany as any).mockResolvedValue(mockTransactions);

      const result = await service.getBudgetProgress(mockUserId, 1, 2024);

      expect(result[0].percentage).toBe(85);
      expect(result[0].status).toBe('warning');
    });
  });
});

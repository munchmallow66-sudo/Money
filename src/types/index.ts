import { TransactionType } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
  color: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  note: string | null;
  date: Date;
  createdAt: Date;
  category?: Category;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  month: number;
  year: number;
  limit: number;
  createdAt: Date;
  category?: Category | null;
}

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

export interface DailyTrend {
  date: string;
  income: number;
  expense: number;
}

export interface DashboardData {
  summary: MonthlySummary;
  expenseByCategory: CategorySummary[];
  dailyTrend: DailyTrend[];
  budgets: BudgetProgress[];
}

export interface BudgetProgress {
  budgetId: string;
  categoryId: string | null;
  categoryName: string;
  categoryColor: string;
  month: number;
  year: number;
  limit: number;
  spent: number;
  percentage: number;
  status: 'good' | 'warning' | 'danger';
}

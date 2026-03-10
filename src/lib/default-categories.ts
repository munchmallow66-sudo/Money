import { prisma } from './prisma';
import { TransactionType } from '@prisma/client';

/**
 * Default categories that are automatically created for every new user.
 * These provide a comprehensive starting point for income/expense tracking.
 */
const DEFAULT_INCOME_CATEGORIES = [
  { name: 'เงินเดือน', color: '#22c55e' },
  { name: 'โบนัส', color: '#10b981' },
  { name: 'เงินปันผล/ลงทุน', color: '#14b8a6' },
  { name: 'รายได้เสริม', color: '#06b6d4' },
  { name: 'ของขวัญ/เงินให้', color: '#0ea5e9' },
];

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'อาหาร', color: '#ef4444' },
  { name: 'ค่าเดินทาง', color: '#f97316' },
  { name: 'ช้อปปิ้ง', color: '#eab308' },
  { name: 'ความบันเทิง', color: '#8b5cf6' },
  { name: 'ค่าสาธารณูปโภค', color: '#6366f1' },
  { name: 'สุขภาพ', color: '#ec4899' },
  { name: 'การศึกษา', color: '#3b82f6' },
  { name: 'ที่พักอาศัย', color: '#14b8a6' },
  { name: 'ประกันภัย', color: '#a855f7' },
  { name: 'อื่นๆ', color: '#6b7280' },
];

/**
 * Creates default categories for a newly registered user.
 * This includes both income and expense categories with predefined colors.
 *
 * @param userId - The database ID of the user to create categories for
 * @returns The number of categories created
 */
export async function createDefaultCategories(userId: string): Promise<number> {
  try {
    // Check if the user already has categories (avoid duplicates)
    const existingCount = await prisma.category.count({
      where: { userId },
    });

    if (existingCount > 0) {
      console.log(`[DefaultCategories] User ${userId} already has ${existingCount} categories, skipping.`);
      return 0;
    }

    // Create all income categories
    const incomeData = DEFAULT_INCOME_CATEGORIES.map((cat) => ({
      userId,
      name: cat.name,
      type: TransactionType.income,
      color: cat.color,
    }));

    // Create all expense categories
    const expenseData = DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
      userId,
      name: cat.name,
      type: TransactionType.expense,
      color: cat.color,
    }));

    const allCategories = [...incomeData, ...expenseData];

    await prisma.category.createMany({
      data: allCategories,
    });

    console.log(
      `[DefaultCategories] Created ${allCategories.length} default categories for user ${userId} ` +
      `(${incomeData.length} income, ${expenseData.length} expense)`
    );

    return allCategories.length;
  } catch (error) {
    console.error(`[DefaultCategories] Failed to create default categories for user ${userId}:`, error);
    // Don't throw — category creation failure should not block sign-in
    return 0;
  }
}

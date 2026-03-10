/**
 * Script to seed default categories for ALL existing users who don't have any categories yet.
 *
 * Usage:
 *   npx tsx scripts/seed-default-categories.ts
 */
import { config } from 'dotenv';
config();

import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

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

async function main() {
  console.log('=== Seed Default Categories for All Users ===\n');

  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      _count: {
        select: { categories: true },
      },
    },
  });

  console.log(`Found ${users.length} users in the database.\n`);

  let seededCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    if (user._count.categories > 0) {
      console.log(`⏭️  Skipping ${user.email} — already has ${user._count.categories} categories`);
      skippedCount++;
      continue;
    }

    console.log(`✨ Creating default categories for ${user.email}...`);

    const incomeData = DEFAULT_INCOME_CATEGORIES.map((cat) => ({
      userId: user.id,
      name: cat.name,
      type: TransactionType.income as TransactionType,
      color: cat.color,
    }));

    const expenseData = DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
      userId: user.id,
      name: cat.name,
      type: TransactionType.expense as TransactionType,
      color: cat.color,
    }));

    await prisma.category.createMany({
      data: [...incomeData, ...expenseData],
    });

    const totalCreated = incomeData.length + expenseData.length;
    console.log(`   ✅ Created ${totalCreated} categories (${incomeData.length} income, ${expenseData.length} expense)`);
    seededCount++;
  }

  console.log('\n=== Summary ===');
  console.log(`Total users: ${users.length}`);
  console.log(`Seeded:      ${seededCount}`);
  console.log(`Skipped:     ${skippedCount}`);
  console.log('\nDone! ✅');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

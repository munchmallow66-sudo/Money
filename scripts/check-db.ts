import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function main() {
  console.log('=== Neon Database Status Check ===\n');
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  
  try {
    // Test connection
    console.log('\n--- Connection Test ---');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!\n');

    // Count users
    const userCount = await prisma.user.count();
    console.log(`Users: ${userCount}`);
    
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true },
    });
    users.forEach(u => console.log(`  - ${u.email} (${u.id})`));

    // Count categories
    const categoryCount = await prisma.category.count();
    console.log(`\nCategories: ${categoryCount}`);
    
    if (categoryCount > 0) {
      const catsByUser = await prisma.category.groupBy({
        by: ['userId'],
        _count: { id: true },
      });
      for (const g of catsByUser) {
        const user = users.find(u => u.id === g.userId);
        console.log(`  - ${user?.email || g.userId}: ${g._count.id} categories`);
      }
    }

    // Count transactions
    const transactionCount = await prisma.transaction.count();
    console.log(`\nTransactions: ${transactionCount}`);
    
    if (transactionCount > 0) {
      const txByUser = await prisma.transaction.groupBy({
        by: ['userId'],
        _count: { id: true },
      });
      for (const g of txByUser) {
        const user = users.find(u => u.id === g.userId);
        console.log(`  - ${user?.email || g.userId}: ${g._count.id} transactions`);
      }
    }

    // Count budgets
    const budgetCount = await prisma.budget.count();
    console.log(`\nBudgets: ${budgetCount}`);

    // Check if tables exist
    console.log('\n--- Table Check ---');
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    ` as any[];
    console.log('Tables in DB:', tables.map((t: any) => t.tablename).join(', '));

  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

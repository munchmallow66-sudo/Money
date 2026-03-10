import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const transactions = await prisma.transaction.count();
  console.log('Users:', users);
  console.log('Transactions:', transactions);
  
  if (transactions > 0) {
    const dates = await prisma.transaction.findMany({
      select: { date: true },
    });
    console.log('Transaction Dates:', dates.map(t => t.date));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

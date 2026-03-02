import { config } from 'dotenv';
config(); // Load env first

import { PrismaClient, TransactionType } from '@prisma/client';

// Create Prisma Client without adapter for seed script
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('Start seeding...');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

  // หา user หรือสร้างใหม่ถ้าไม่มี
  let user = await prisma.user.findUnique({
    where: { email: 'watchara47114145@gmail.com' },
  });

  if (!user) {
    console.log('Creating new user...');
    user = await prisma.user.create({
      data: {
        email: 'watchara47114145@gmail.com',
        name: 'วัชระ ผลชัย',
        image: 'https://lh3.googleusercontent.com/a/ACg8ocJmsFBdMLRXatiieOzzz0I_uboSCSJEA9ygO9yLk-bqP-FBFao=s96-c',
      },
    });
  }

  console.log(`User: ${user.name} (${user.email})`);

  // สร้าง Categories สำหรับรายรับ
  const incomeCategories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'income-salary' },
      update: {},
      create: {
        id: 'income-salary',
        userId: user.id,
        name: 'เงินเดือน',
        type: TransactionType.income,
        color: '#22c55e',
      },
    }),
    prisma.category.upsert({
      where: { id: 'income-bonus' },
      update: {},
      create: {
        id: 'income-bonus',
        userId: user.id,
        name: 'โบนัส',
        type: TransactionType.income,
        color: '#10b981',
      },
    }),
    prisma.category.upsert({
      where: { id: 'income-investment' },
      update: {},
      create: {
        id: 'income-investment',
        userId: user.id,
        name: 'เงินปันผล/ลงทุน',
        type: TransactionType.income,
        color: '#14b8a6',
      },
    }),
    prisma.category.upsert({
      where: { id: 'income-freelance' },
      update: {},
      create: {
        id: 'income-freelance',
        userId: user.id,
        name: 'รายได้เสริม',
        type: TransactionType.income,
        color: '#06b6d4',
      },
    }),
  ]);

  // สร้าง Categories สำหรับรายจ่าย
  const expenseCategories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'expense-food' },
      update: {},
      create: {
        id: 'expense-food',
        userId: user.id,
        name: 'อาหาร',
        type: TransactionType.expense,
        color: '#ef4444',
      },
    }),
    prisma.category.upsert({
      where: { id: 'expense-transport' },
      update: {},
      create: {
        id: 'expense-transport',
        userId: user.id,
        name: 'ค่าเดินทาง',
        type: TransactionType.expense,
        color: '#f97316',
      },
    }),
    prisma.category.upsert({
      where: { id: 'expense-shopping' },
      update: {},
      create: {
        id: 'expense-shopping',
        userId: user.id,
        name: 'ช้อปปิ้ง',
        type: TransactionType.expense,
        color: '#eab308',
      },
    }),
    prisma.category.upsert({
      where: { id: 'expense-entertainment' },
      update: {},
      create: {
        id: 'expense-entertainment',
        userId: user.id,
        name: 'ความบันเทิง',
        type: TransactionType.expense,
        color: '#8b5cf6',
      },
    }),
    prisma.category.upsert({
      where: { id: 'expense-utilities' },
      update: {},
      create: {
        id: 'expense-utilities',
        userId: user.id,
        name: 'ค่าสาธารณูปโภค',
        type: TransactionType.expense,
        color: '#6366f1',
      },
    }),
    prisma.category.upsert({
      where: { id: 'expense-healthcare' },
      update: {},
      create: {
        id: 'expense-healthcare',
        userId: user.id,
        name: 'สุขภาพ',
        type: TransactionType.expense,
        color: '#ec4899',
      },
    }),
    prisma.category.upsert({
      where: { id: 'expense-education' },
      update: {},
      create: {
        id: 'expense-education',
        userId: user.id,
        name: 'การศึกษา',
        type: TransactionType.expense,
        color: '#3b82f6',
      },
    }),
    prisma.category.upsert({
      where: { id: 'expense-housing' },
      update: {},
      create: {
        id: 'expense-housing',
        userId: user.id,
        name: 'ที่พักอาศัย',
        type: TransactionType.expense,
        color: '#14b8a6',
      },
    }),
  ]);

  console.log(`Created ${incomeCategories.length} income categories`);
  console.log(`Created ${expenseCategories.length} expense categories`);

  // สร้าง Transactions
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const transactions = [
    // รายรับประจำ
    { amount: 35000, note: 'เงินเดือนเดือนนี้', type: TransactionType.income, categoryId: 'income-salary', monthOffset: 0 },
    { amount: 35000, note: 'เงินเดือนเดือนที่แล้ว', type: TransactionType.income, categoryId: 'income-salary', monthOffset: -1 },
    { amount: 35000, note: 'เงินเดือน 2 เดือนที่แล้ว', type: TransactionType.income, categoryId: 'income-salary', monthOffset: -2 },
    { amount: 15000, note: 'โบนัสประจำปี', type: TransactionType.income, categoryId: 'income-bonus', monthOffset: -1 },
    { amount: 5000, note: 'เงินปันผลหุ้น', type: TransactionType.income, categoryId: 'income-investment', monthOffset: 0 },
    { amount: 8000, note: 'รับจ้างฟรีแลนซ์', type: TransactionType.income, categoryId: 'income-freelance', monthOffset: -1 },
    { amount: 12000, note: 'โปรเจคพิเศษ', type: TransactionType.income, categoryId: 'income-freelance', monthOffset: -2 },

    // รายจ่าย - อาหาร
    { amount: 120, note: 'ข้าวเช้า', type: TransactionType.expense, categoryId: 'expense-food', monthOffset: 0, day: 1 },
    { amount: 65, note: 'กาแฟ', type: TransactionType.expense, categoryId: 'expense-food', monthOffset: 0, day: 2 },
    { amount: 180, note: 'ข้าวกลางวัน', type: TransactionType.expense, categoryId: 'expense-food', monthOffset: 0, day: 3 },
    { amount: 450, note: 'ข้าวเย็นกับเพื่อน', type: TransactionType.expense, categoryId: 'expense-food', monthOffset: 0, day: 5 },
    { amount: 320, note: 'สั่งอาหารออนไลน์', type: TransactionType.expense, categoryId: 'expense-food', monthOffset: -1, day: 10 },
    { amount: 2800, note: 'ซื้อของเข้าตู้เย็น', type: TransactionType.expense, categoryId: 'expense-food', monthOffset: -1, day: 15 },
    { amount: 150, note: 'ขนม', type: TransactionType.expense, categoryId: 'expense-food', monthOffset: -2, day: 8 },

    // รายจ่าย - ค่าเดินทาง
    { amount: 45, note: 'ค่า BTS', type: TransactionType.expense, categoryId: 'expense-transport', monthOffset: 0, day: 1 },
    { amount: 45, note: 'ค่า BTS', type: TransactionType.expense, categoryId: 'expense-transport', monthOffset: 0, day: 2 },
    { amount: 320, note: 'แท็กซี่', type: TransactionType.expense, categoryId: 'expense-transport', monthOffset: 0, day: 7 },
    { amount: 1500, note: 'เติมน้ำมัน', type: TransactionType.expense, categoryId: 'expense-transport', monthOffset: -1, day: 12 },
    { amount: 120, note: 'จอดรถ', type: TransactionType.expense, categoryId: 'expense-transport', monthOffset: -1, day: 20 },
    { amount: 500, note: 'ค่าทางด่วน', type: TransactionType.expense, categoryId: 'expense-transport', monthOffset: -2, day: 15 },

    // รายจ่าย - ช้อปปิ้ง
    { amount: 1290, note: 'เสื้อผ้า Uniqlo', type: TransactionType.expense, categoryId: 'expense-shopping', monthOffset: 0, day: 8 },
    { amount: 4590, note: 'รองเท้า', type: TransactionType.expense, categoryId: 'expense-shopping', monthOffset: -1, day: 5 },
    { amount: 350, note: 'อุปกรณ์เครื่องเขียน', type: TransactionType.expense, categoryId: 'expense-shopping', monthOffset: -1, day: 18 },
    { amount: 8900, note: 'โทรศัพท์มือถือ', type: TransactionType.expense, categoryId: 'expense-shopping', monthOffset: -2, day: 25 },
    { amount: 1200, note: 'กระเป๋า', type: TransactionType.expense, categoryId: 'expense-shopping', monthOffset: -2, day: 12 },

    // รายจ่าย - ความบันเทิง
    { amount: 350, note: 'Netflix', type: TransactionType.expense, categoryId: 'expense-entertainment', monthOffset: 0, day: 1 },
    { amount: 199, note: 'Spotify', type: TransactionType.expense, categoryId: 'expense-entertainment', monthOffset: 0, day: 5 },
    { amount: 450, note: 'หนังในโรง', type: TransactionType.expense, categoryId: 'expense-entertainment', monthOffset: -1, day: 22 },
    { amount: 1200, note: 'คอนเสิร์ต', type: TransactionType.expense, categoryId: 'expense-entertainment', monthOffset: -2, day: 8 },
    { amount: 299, note: 'Game', type: TransactionType.expense, categoryId: 'expense-entertainment', monthOffset: -2, day: 14 },

    // รายจ่าย - ค่าสาธารณูปโภค
    { amount: 2450, note: 'ค่าไฟฟ้า', type: TransactionType.expense, categoryId: 'expense-utilities', monthOffset: 0, day: 5 },
    { amount: 580, note: 'ค่าน้ำ', type: TransactionType.expense, categoryId: 'expense-utilities', monthOffset: 0, day: 5 },
    { amount: 699, note: 'ค่าอินเทอร์เน็ต', type: TransactionType.expense, categoryId: 'expense-utilities', monthOffset: 0, day: 10 },
    { amount: 890, note: 'ค่าโทรศัพท์', type: TransactionType.expense, categoryId: 'expense-utilities', monthOffset: 0, day: 12 },
    { amount: 2280, note: 'ค่าไฟฟ้าเดือนที่แล้ว', type: TransactionType.expense, categoryId: 'expense-utilities', monthOffset: -1, day: 5 },
    { amount: 520, note: 'ค่าน้ำเดือนที่แล้ว', type: TransactionType.expense, categoryId: 'expense-utilities', monthOffset: -1, day: 5 },

    // รายจ่าย - สุขภาพ
    { amount: 1200, note: 'ตรวจสุขภาพ', type: TransactionType.expense, categoryId: 'expense-healthcare', monthOffset: 0, day: 15 },
    { amount: 450, note: 'ยา/วิตามิน', type: TransactionType.expense, categoryId: 'expense-healthcare', monthOffset: -1, day: 8 },
    { amount: 2500, note: 'ฟิตเนส', type: TransactionType.expense, categoryId: 'expense-healthcare', monthOffset: -2, day: 1 },
    { amount: 800, note: 'ทำฟัน', type: TransactionType.expense, categoryId: 'expense-healthcare', monthOffset: -2, day: 20 },

    // รายจ่าย - การศึกษา
    { amount: 1290, note: 'คอร์สออนไลน์', type: TransactionType.expense, categoryId: 'expense-education', monthOffset: 0, day: 20 },
    { amount: 450, note: 'ซื้อหนังสือ', type: TransactionType.expense, categoryId: 'expense-education', monthOffset: -1, day: 15 },
    { amount: 3500, note: 'สอบใบประกาศ', type: TransactionType.expense, categoryId: 'expense-education', monthOffset: -2, day: 10 },

    // รายจ่าย - ที่พักอาศัย
    { amount: 8500, note: 'ค่าเช่าห้อง', type: TransactionType.expense, categoryId: 'expense-housing', monthOffset: 0, day: 1 },
    { amount: 8500, note: 'ค่าเช่าห้อง', type: TransactionType.expense, categoryId: 'expense-housing', monthOffset: -1, day: 1 },
    { amount: 8500, note: 'ค่าเช่าห้อง', type: TransactionType.expense, categoryId: 'expense-housing', monthOffset: -2, day: 1 },
    { amount: 1200, note: 'ซ่อมแอร์', type: TransactionType.expense, categoryId: 'expense-housing', monthOffset: -1, day: 25 },
  ];

  // สร้าง transactions
  let createdCount = 0;
  for (const t of transactions) {
    const date = new Date(currentYear, currentMonth - 1 + t.monthOffset, t.day || Math.floor(Math.random() * 28) + 1);
    
    await prisma.transaction.create({
      data: {
        userId: user.id,
        categoryId: t.categoryId,
        type: t.type,
        amount: t.amount,
        note: t.note,
        date: date,
      },
    });
    createdCount++;
  }

  console.log(`Created ${createdCount} transactions`);

  // สร้าง Budgets
  const budgets = [
    { categoryId: 'expense-food', limit: 8000, month: currentMonth, year: currentYear },
    { categoryId: 'expense-transport', limit: 3000, month: currentMonth, year: currentYear },
    { categoryId: 'expense-shopping', limit: 5000, month: currentMonth, year: currentYear },
    { categoryId: 'expense-entertainment', limit: 2000, month: currentMonth, year: currentYear },
    { categoryId: 'expense-utilities', limit: 5000, month: currentMonth, year: currentYear },
    { categoryId: 'expense-healthcare', limit: 3000, month: currentMonth, year: currentYear },
    { categoryId: 'expense-education', limit: 2000, month: currentMonth, year: currentYear },
    // Budgets for previous month
    { categoryId: 'expense-food', limit: 8000, month: currentMonth === 1 ? 12 : currentMonth - 1, year: currentMonth === 1 ? currentYear - 1 : currentYear },
    { categoryId: 'expense-transport', limit: 3000, month: currentMonth === 1 ? 12 : currentMonth - 1, year: currentMonth === 1 ? currentYear - 1 : currentYear },
    { categoryId: 'expense-shopping', limit: 10000, month: currentMonth === 1 ? 12 : currentMonth - 1, year: currentMonth === 1 ? currentYear - 1 : currentYear },
    // Overall budget (no category)
    { categoryId: null, limit: 35000, month: currentMonth, year: currentYear },
    { categoryId: null, limit: 35000, month: currentMonth === 1 ? 12 : currentMonth - 1, year: currentMonth === 1 ? currentYear - 1 : currentYear },
  ];

  for (const b of budgets) {
    // สำหรับ budget ที่ไม่มี category (overall budget)
    if (b.categoryId === null) {
      const existingBudget = await prisma.budget.findFirst({
        where: {
          userId: user.id,
          categoryId: null,
          month: b.month,
          year: b.year,
        },
      });
      
      if (existingBudget) {
        await prisma.budget.update({
          where: { id: existingBudget.id },
          data: { limit: b.limit },
        });
      } else {
        await prisma.budget.create({
          data: {
            userId: user.id,
            categoryId: null,
            month: b.month,
            year: b.year,
            limit: b.limit,
          },
        });
      }
    } else {
      // สำหรับ budget ที่มี category
      await prisma.budget.upsert({
        where: {
          userId_categoryId_month_year: {
            userId: user.id,
            categoryId: b.categoryId,
            month: b.month,
            year: b.year,
          },
        },
        update: { limit: b.limit },
        create: {
          userId: user.id,
          categoryId: b.categoryId,
          month: b.month,
          year: b.year,
          limit: b.limit,
        },
      });
    }
  }

  console.log(`Created/Updated ${budgets.length} budgets`);

  console.log('Seeding finished successfully!');
  console.log('\nสรุปข้อมูลที่สร้าง:');
  console.log(`- หมวดหมู่รายรับ: ${incomeCategories.length} รายการ`);
  console.log(`- หมวดหมู่รายจ่าย: ${expenseCategories.length} รายการ`);
  console.log(`- ธุรกรรม: ${createdCount} รายการ`);
  console.log(`- งบประมาณ: ${budgets.length} รายการ`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

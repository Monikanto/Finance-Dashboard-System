import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@finance.com' },
    update: {},
    create: {
      email: 'admin@finance.com',
      password: hashedPassword,
      name: 'System Admin',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log('Seeded admin user:', admin.email);

  // Create sample analyst
  const analystPassword = await bcrypt.hash('analyst123', 12);
  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@finance.com' },
    update: {},
    create: {
      email: 'analyst@finance.com',
      password: analystPassword,
      name: 'Demo Analyst',
      role: Role.ANALYST,
      isActive: true,
    },
  });
  console.log('Seeded analyst user:', analyst.email);

  // Create sample viewer
  const viewerPassword = await bcrypt.hash('viewer123', 12);
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@finance.com' },
    update: {},
    create: {
      email: 'viewer@finance.com',
      password: viewerPassword,
      name: 'Demo Viewer',
      role: Role.VIEWER,
      isActive: true,
    },
  });
  console.log('Seeded viewer user:', viewer.email);

  // Create sample financial records for the admin
  const categories = ['Salary', 'Freelance', 'Rent', 'Groceries', 'Utilities', 'Entertainment', 'Investment', 'Transport'];

  const records = [
    { amount: 5000, type: 'INCOME' as const, category: 'Salary', date: new Date('2026-01-15'), notes: 'January salary' },
    { amount: 1200, type: 'INCOME' as const, category: 'Freelance', date: new Date('2026-01-20'), notes: 'Web project' },
    { amount: 1500, type: 'EXPENSE' as const, category: 'Rent', date: new Date('2026-01-01'), notes: 'Monthly rent' },
    { amount: 300, type: 'EXPENSE' as const, category: 'Groceries', date: new Date('2026-01-10') },
    { amount: 150, type: 'EXPENSE' as const, category: 'Utilities', date: new Date('2026-01-05'), notes: 'Electric + water' },
    { amount: 5000, type: 'INCOME' as const, category: 'Salary', date: new Date('2026-02-15'), notes: 'February salary' },
    { amount: 800, type: 'EXPENSE' as const, category: 'Entertainment', date: new Date('2026-02-20') },
    { amount: 2000, type: 'INCOME' as const, category: 'Investment', date: new Date('2026-02-25'), notes: 'Dividend return' },
    { amount: 200, type: 'EXPENSE' as const, category: 'Transport', date: new Date('2026-02-10') },
    { amount: 5000, type: 'INCOME' as const, category: 'Salary', date: new Date('2026-03-15'), notes: 'March salary' },
    { amount: 1500, type: 'EXPENSE' as const, category: 'Rent', date: new Date('2026-03-01'), notes: 'Monthly rent' },
    { amount: 350, type: 'EXPENSE' as const, category: 'Groceries', date: new Date('2026-03-12') },
  ];

  for (const record of records) {
    await prisma.record.create({
      data: {
        ...record,
        userId: admin.id,
      },
    });
  }

  console.log(`Seeded ${records.length} financial records`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

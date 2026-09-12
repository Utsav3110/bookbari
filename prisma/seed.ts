import { PrismaClient, Role, UserStatus, LoanStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Bookbari library data...');

  // Create super admin user
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@bookbari.org' },
    update: {},
    create: {
      clerkId: 'user_superadmin_demo',
      name: 'Library Director',
      email: 'admin@bookbari.org',
      phone: '+1 555-0199',
      role: Role.SUPER_ADMIN,
      status: UserStatus.APPROVED,
    },
  });

  // Create regular approved users
  const user1 = await prisma.user.upsert({
    where: { email: 'sarah.reads@example.com' },
    update: {},
    create: {
      clerkId: 'user_sarah_demo',
      name: 'Sarah Connor',
      email: 'sarah.reads@example.com',
      phone: '+1 555-0144',
      role: Role.USER,
      status: UserStatus.APPROVED,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'alex.b@example.com' },
    update: {},
    create: {
      clerkId: 'user_alex_demo',
      name: 'Alex Rivera',
      email: 'alex.b@example.com',
      phone: '+1 555-0177',
      role: Role.USER,
      status: UserStatus.APPROVED,
    },
  });

  // Pending user
  await prisma.user.upsert({
    where: { email: 'pending.newbie@example.com' },
    update: {},
    create: {
      clerkId: 'user_pending_demo',
      name: 'Jordan Lee',
      email: 'pending.newbie@example.com',
      phone: '+1 555-0188',
      role: Role.USER,
      status: UserStatus.PENDING,
    },
  });

  // Create sample books
  const b1 = await prisma.book.create({
    data: {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      language: 'English',
      genre: 'Classic Fiction',
      totalQuantity: 3,
      description: 'A classic 1925 novel set on Long Island in the Roaring Twenties depicting tragic romance and social satire.',
      addedById: superAdmin.id,
    },
  });

  const b2 = await prisma.book.create({
    data: {
      title: 'Chokher Bali',
      author: 'Rabindranath Tagore',
      language: 'Bengali',
      genre: 'Fiction / Drama',
      totalQuantity: 2,
      description: 'A story of complex interpersonal relationships and human desires written by Nobel laureate Rabindranath Tagore.',
      addedById: superAdmin.id,
    },
  });

  const b3 = await prisma.book.create({
    data: {
      title: '1984',
      author: 'George Orwell',
      language: 'English',
      genre: 'Dystopian',
      totalQuantity: 1,
      description: 'A cautionary tale about totalitarian government, omnipresent surveillance, and public mind control.',
      addedById: superAdmin.id,
    },
  });

  const b4 = await prisma.book.create({
    data: {
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      language: 'English',
      genre: 'Non-Fiction / History',
      totalQuantity: 2,
      description: 'Surveying the history of humankind from the evolution of archaic human species in the Stone Age to modern times.',
      addedById: superAdmin.id,
    },
  });

  // Create sample active loan (not overdue)
  const today = new Date();
  const dueNormal = new Date();
  dueNormal.setDate(today.getDate() + 10);

  await prisma.loan.create({
    data: {
      bookId: b1.id,
      userId: user1.id,
      issuedById: superAdmin.id,
      issueDate: today,
      dueDate: dueNormal,
      status: LoanStatus.BORROWED,
    },
  });

  // Create sample overdue loan
  const issuePast = new Date();
  issuePast.setDate(today.getDate() - 25);
  const duePast = new Date();
  duePast.setDate(today.getDate() - 10);

  await prisma.loan.create({
    data: {
      bookId: b3.id,
      userId: user2.id,
      issuedById: superAdmin.id,
      issueDate: issuePast,
      dueDate: duePast,
      status: LoanStatus.BORROWED,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

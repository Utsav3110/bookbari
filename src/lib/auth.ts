import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import { Role, UserStatus } from '@prisma/client';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export const getCurrentDbUser = cache(async () => {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // Fallback sync if webhook hasn't created the user yet
    if (!dbUser) {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;

      const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
      const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || email.split('@')[0];
      const phone = clerkUser.phoneNumbers[0]?.phoneNumber ?? null;

      const isSuperAdminEmail = process.env.SUPER_ADMIN_EMAIL && email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase();

      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name,
          phone,
          role: isSuperAdminEmail ? Role.SUPER_ADMIN : Role.USER,
          status: isSuperAdminEmail ? UserStatus.APPROVED : UserStatus.PENDING,
        },
      });
    }

    return dbUser;
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Error in getCurrentDbUser:', error);
    return null;
  }
});

export async function requireApprovedUser() {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) {
    redirect('/sign-in');
  }

  if (dbUser.status === UserStatus.PENDING) {
    redirect('/pending-approval');
  }

  if (dbUser.status === UserStatus.REJECTED) {
    redirect('/request-declined');
  }

  return dbUser;
}

export async function requireAdmin() {
  const dbUser = await requireApprovedUser();
  if (dbUser.role !== Role.ADMIN && dbUser.role !== Role.SUPER_ADMIN) {
    redirect('/books');
  }
  return dbUser;
}

export async function requireSuperAdmin() {
  const dbUser = await requireApprovedUser();
  if (dbUser.role !== Role.SUPER_ADMIN) {
    redirect('/admin');
  }
  return dbUser;
}

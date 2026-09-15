'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireSuperAdmin, requireApprovedUser } from '@/lib/auth';
import { UserStatus, Role, LoanStatus } from '@prisma/client';
import { z } from 'zod';

// --- VALIDATION HELPERS ---

const uuidSchema = z.string().uuid('Invalid ID format');

// Only allow digits, spaces, dashes, parens, dots, and leading +
const phoneRegex = /^[+\d\s\-().]{5,20}$/;

function validateUuid(id: string): { valid: true } | { valid: false; error: string } {
  const result = uuidSchema.safeParse(id);
  if (!result.success) return { valid: false, error: 'Invalid ID format' };
  return { valid: true };
}

// Zod schemas for input validation
const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(200),
  language: z.string().min(1, 'Language is required').max(50),
  genre: z.string().optional(),
  totalQuantity: z.number().int().min(1, 'Quantity must be at least 1'),
  description: z.string().optional(),
  coverUrl: z.string().url('Must be a valid URL').refine(
    (url) => url === '' || url.startsWith('https://'),
    { message: 'Cover URL must use HTTPS' }
  ).or(z.literal('')).optional(),
});

const loanSchema = z.object({
  bookId: z.string().uuid(),
  borrowerName: z.string().min(1, 'Name is required'),
  borrowerSurname: z.string().min(1, 'Surname is required'),
  borrowerMobile: z.string().min(1, 'Mobile is required'),
  issueDate: z.string(),
  dueDate: z.string(),
});



// --- SUPER ADMIN ACTIONS ---

export async function promoteToAdminAction(userId: string) {
  const idCheck = validateUuid(userId);
  if (!idCheck.valid) return { error: idCheck.error };

  await requireSuperAdmin();

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return { error: 'User not found' };
  }

  if (targetUser.status !== UserStatus.APPROVED) {
    return { error: 'User must be approved before being promoted to Admin' };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: Role.ADMIN },
  });

  revalidatePath('/admin/admins');
  revalidatePath('/admin/users');
  return { success: true };
}

export async function demoteToUserAction(userId: string) {
  const idCheck = validateUuid(userId);
  if (!idCheck.valid) return { error: idCheck.error };

  const currentSuperAdmin = await requireSuperAdmin();

  if (userId === currentSuperAdmin.id) {
    return { error: 'Super Admin cannot demote themselves' };
  }

  // Verify the target user is actually an admin before demoting
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return { error: 'User not found' };
  }
  if (targetUser.role !== Role.ADMIN) {
    return { error: 'Only users with Admin role can be demoted' };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: Role.USER },
  });

  revalidatePath('/admin/admins');
  revalidatePath('/admin/users');
  return { success: true };
}

// --- BOOK MANAGEMENT ACTIONS ---

export async function addBookAction(formData: FormData) {
  const admin = await requireAdmin();

  const rawData = {
    title: formData.get('title') as string,
    author: formData.get('author') as string,
    language: formData.get('language') as string,
    genre: (formData.get('genre') as string) || undefined,
    totalQuantity: parseInt(formData.get('totalQuantity') as string || '1', 10),
    description: (formData.get('description') as string) || undefined,
    coverUrl: (formData.get('coverUrl') as string) || undefined,
  };

  const parsed = bookSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.book.create({
    data: {
      ...parsed.data,
      addedById: admin.id,
    },
  });

  revalidatePath('/admin/books');
  revalidatePath('/books');
  return { success: true };
}

export async function editBookAction(bookId: string, formData: FormData) {
  const idCheck = validateUuid(bookId);
  if (!idCheck.valid) return { error: idCheck.error };

  await requireAdmin();

  const rawData = {
    title: formData.get('title') as string,
    author: formData.get('author') as string,
    language: formData.get('language') as string,
    genre: (formData.get('genre') as string) || undefined,
    totalQuantity: parseInt(formData.get('totalQuantity') as string || '1', 10),
    description: (formData.get('description') as string) || undefined,
    coverUrl: (formData.get('coverUrl') as string) || undefined,
  };

  const parsed = bookSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check if quantity reduction conflicts with active borrowed count
  const activeLoansCount = await prisma.loan.count({
    where: {
      bookId: bookId,
      status: LoanStatus.BORROWED,
    },
  });

  if (parsed.data.totalQuantity < activeLoansCount) {
    return {
      error: `Cannot reduce total quantity below currently borrowed copies (${activeLoansCount} borrowed).`,
    };
  }

  await prisma.book.update({
    where: { id: bookId },
    data: parsed.data,
  });

  revalidatePath('/admin/books');
  revalidatePath(`/admin/books/${bookId}`);
  revalidatePath('/books');
  return { success: true };
}

export async function deleteBookAction(bookId: string) {
  const idCheck = validateUuid(bookId);
  if (!idCheck.valid) return { error: idCheck.error };

  await requireAdmin();

  const activeLoansCount = await prisma.loan.count({
    where: {
      bookId: bookId,
      status: LoanStatus.BORROWED,
    },
  });

  if (activeLoansCount > 0) {
    return { error: `Cannot delete book with ${activeLoansCount} active loan(s). Return all copies first.` };
  }

  // Soft delete
  await prisma.book.update({
    where: { id: bookId },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/admin/books');
  revalidatePath('/books');
  return { success: true };
}

// --- BOOK CHECKOUT & BORROWING ACTIONS ---

export async function issueCheckoutAction(formData: FormData) {
  const admin = await requireAdmin();

  const rawBookId = formData.get('bookId') as string;
  const borrowerName = formData.get('borrowerName') as string;
  const borrowerSurname = formData.get('borrowerSurname') as string;
  const borrowerMobile = formData.get('borrowerMobile') as string;
  const issueDateStr = formData.get('issueDate') as string;
  const dueDateStr = formData.get('dueDate') as string;

  const parsed = loanSchema.safeParse({
    bookId: rawBookId,
    borrowerName,
    borrowerSurname,
    borrowerMobile,
    issueDate: issueDateStr,
    dueDate: dueDateStr,
  });

  if (!parsed.success) {
    return { error: 'Invalid form input' };
  }

  const issueDate = new Date(issueDateStr);
  const dueDate = new Date(dueDateStr);

  if (dueDate <= issueDate) {
    return { error: 'Due date must be after the issue date' };
  }

  // Use a serializable transaction to prevent race conditions on the last copy
  const txResult = await prisma.$transaction(async (tx) => {
    // 2. Check if this exact person already has an active borrowing for this exact book
    const existingActiveLoan = await tx.loan.findFirst({
      where: {
        bookId: rawBookId,
        borrowerName,
        borrowerSurname,
        borrowerMobile,
        status: LoanStatus.BORROWED,
      },
    });

    if (existingActiveLoan) {
      return { error: 'This person already has an active checked-out copy of this book' };
    }

    // 3. Verify availability
    const book = await tx.book.findUnique({
      where: { id: rawBookId },
      include: {
        loans: {
          where: { status: LoanStatus.BORROWED },
        },
      },
    });

    if (!book || book.deletedAt) {
      return { error: 'Book not found' };
    }

    const availableQuantity = book.totalQuantity - book.loans.length;
    if (availableQuantity <= 0) {
      return { error: 'No available copies left for this book' };
    }

    // 4. Create borrowing checkout record
    await tx.loan.create({
      data: {
        bookId: rawBookId,
        borrowerName,
        borrowerSurname,
        borrowerMobile,
        issuedById: admin.id,
        issueDate,
        dueDate,
        status: LoanStatus.BORROWED,
      },
    });

    return { success: true as const };
  });

  if ('error' in txResult) {
    return txResult;
  }

  revalidatePath('/admin/checkouts');
  revalidatePath('/admin/overdue');
  revalidatePath('/books');
  revalidatePath('/my-borrowings');
  return { success: true };
}

export async function returnCheckoutAction(loanId: string) {
  const idCheck = validateUuid(loanId);
  if (!idCheck.valid) return { error: idCheck.error };

  await requireAdmin();

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { book: true, user: true },
  });

  if (!loan) {
    return { error: 'Borrowing record not found' };
  }

  if (loan.status === LoanStatus.RETURNED) {
    return { error: 'Book is already marked returned' };
  }

  await prisma.loan.update({
    where: { id: loanId },
    data: {
      status: LoanStatus.RETURNED,
      returnDate: new Date(),
    },
  });

  revalidatePath('/admin/checkouts');
  revalidatePath('/admin/overdue');
  revalidatePath('/books');

  return { success: true };
}



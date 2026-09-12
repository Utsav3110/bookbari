import { requireApprovedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Clock, ArrowLeft, Bell, CheckCircle2 } from 'lucide-react';
import { LoanStatus } from '@prisma/client';
import { requestBookNotificationAction } from '@/app/actions';

interface BookDetailPageProps {
  params: {
    id: string;
  };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const user = await requireApprovedUser();

  const book = await prisma.book.findFirst({
    where: {
      id: params.id,
      deletedAt: null,
    },
    include: {
      loans: {
        where: { status: LoanStatus.BORROWED },
        include: { user: true },
        orderBy: { dueDate: 'asc' },
      },
      requests: {
        where: { userId: user.id },
      },
    },
  });

  if (!book) {
    notFound();
  }

  const activeLoansCount = book.loans.length;
  const availableCount = book.totalQuantity - activeLoansCount;
  const isAvailable = availableCount > 0;
  const hasRequested = book.requests.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      {/* Main detail card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 sm:p-8 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-card">
        {/* Cover Column */}
        <div className="flex flex-col items-center justify-start space-y-4">
          <div className="w-full max-w-[220px] aspect-[3/4] bg-paper-200 dark:bg-charcoal-50 rounded-lg border border-paper-300 dark:border-charcoal-300 p-4 flex items-center justify-center shadow-subtle overflow-hidden">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="h-full object-contain rounded" />
            ) : (
              <div className="w-full h-full bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-50 rounded p-4 flex flex-col justify-between text-center">
                <BookOpen className="w-8 h-8 mx-auto text-primary" />
                <div className="font-serif font-bold text-sm text-ink dark:text-paper-100">
                  {book.title}
                </div>
                <div className="text-xs text-ink-muted dark:text-paper-400">
                  {book.author}
                </div>
              </div>
            )}
          </div>

          <div className="w-full text-center">
            {isAvailable ? (
              <span className="badge badge-success text-xs py-1.5 px-3">
                {availableCount} of {book.totalQuantity} Available
              </span>
            ) : (
              <span className="badge badge-warning text-xs py-1.5 px-3">
                All {book.totalQuantity} copies checked out
              </span>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100 leading-tight">
              {book.title}
            </h1>
            <p className="text-base text-ink-muted dark:text-paper-400 mt-1">
              by <span className="font-semibold text-ink dark:text-paper-100">{book.author}</span>
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-paper-100 dark:bg-charcoal-300 rounded-lg text-sm border border-paper-300 dark:border-charcoal-50">
            <div>
              <span className="text-xs text-ink-muted dark:text-paper-400 block">Language</span>
              <span className="font-medium text-ink dark:text-paper-100">{book.language}</span>
            </div>

            <div>
              <span className="text-xs text-ink-muted dark:text-paper-400 block">Genre</span>
              <span className="font-medium text-ink dark:text-paper-100">{book.genre || 'Unspecified'}</span>
            </div>

            <div>
              <span className="text-xs text-ink-muted dark:text-paper-400 block">Total Inventory</span>
              <span className="font-medium text-ink dark:text-paper-100">{book.totalQuantity} copies</span>
            </div>

            <div>
              <span className="text-xs text-ink-muted dark:text-paper-400 block">Currently Loaned</span>
              <span className="font-medium text-ink dark:text-paper-100">{activeLoansCount} copies</span>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-base text-ink dark:text-paper-100">About this book</h3>
              <p className="text-sm text-ink-muted dark:text-paper-400 leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>
          )}

          {/* Expected Return Schedule (if copies checked out) */}
          {!isAvailable && book.loans.length > 0 && (
            <div className="p-4 bg-terracotta-light/60 dark:bg-terracotta/10 rounded-lg border border-terracotta/20 space-y-3">
              <div className="flex items-center gap-2 text-terracotta font-semibold text-sm">
                <Clock className="w-4 h-4" />
                <span>Expected Return Schedule</span>
              </div>
              <div className="space-y-1 text-xs text-ink dark:text-paper-100">
                {book.loans.map((loan, idx) => (
                  <div key={loan.id} className="flex justify-between py-1 border-b border-terracotta/10 last:border-none">
                    <span>Copy #{idx + 1}</span>
                    <span>Due: <strong>{formatDate(loan.dueDate)}</strong></span>
                  </div>
                ))}
              </div>

              {/* Waitlist Button */}
              <div className="pt-2">
                {hasRequested ? (
                  <div className="flex items-center gap-2 text-xs text-primary dark:text-primary-dark font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>You are on the waitlist for this book</span>
                  </div>
                ) : (
                  <form action={async () => {
                    'use server';
                    await requestBookNotificationAction(book.id);
                  }}>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold shadow-subtle transition-colors"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      Notify Me When Available
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

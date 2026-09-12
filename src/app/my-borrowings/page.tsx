import { requireApprovedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, getDaysOverdue, getDaysRemaining, isOverdue } from '@/lib/utils';
import Link from 'next/link';
import { Clock, CheckCircle, BookOpen, AlertTriangle, ArrowRight } from 'lucide-react';
import { LoanStatus } from '@prisma/client';

interface MyBorrowingsPageProps {
  searchParams: {
    tab?: string;
  };
}

export default async function MyBorrowingsPage({ searchParams }: MyBorrowingsPageProps) {
  const user = await requireApprovedUser();
  const activeTab = searchParams.tab === 'history' ? 'history' : 'active';

  const borrowings = await prisma.loan.findMany({
    where: {
      userId: user.id,
      status: activeTab === 'active' ? LoanStatus.BORROWED : LoanStatus.RETURNED,
    },
    include: {
      book: true,
    },
    orderBy: activeTab === 'active' ? { dueDate: 'asc' } : { returnDate: 'desc' },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100">
          My Borrowings
        </h1>
        <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
          Track your currently checked out books and past reading history.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-paper-300 dark:border-charcoal-300 gap-6 text-sm font-medium">
        <Link
          href="/my-borrowings?tab=active"
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'active'
              ? 'border-primary text-primary dark:text-primary-dark font-bold'
              : 'border-transparent text-ink-muted dark:text-paper-400 hover:text-ink'
          }`}
        >
          <Clock className="w-4 h-4" /> Currently Checked Out
        </Link>
        <Link
          href="/my-borrowings?tab=history"
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'history'
              ? 'border-primary text-primary dark:text-primary-dark font-bold'
              : 'border-transparent text-ink-muted dark:text-paper-400 hover:text-ink'
          }`}
        >
          <CheckCircle className="w-4 h-4" /> Borrowing History
        </Link>
      </div>

      {/* Content List */}
      {borrowings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300">
          <BookOpen className="w-12 h-12 mx-auto text-ink-muted dark:text-paper-400 mb-3" />
          <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">
            {activeTab === 'active' ? 'No active checkouts' : 'No past borrowing history'}
          </h3>
          <p className="text-sm text-ink-muted dark:text-paper-400 max-w-sm mx-auto mt-1 mb-4">
            {activeTab === 'active'
              ? "You don't have any books checked out right now."
              : 'Your returned book checkouts will appear here.'}
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
          >
            Browse Library Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {borrowings.map((item) => {
            const overdue = isOverdue(item.dueDate, item.returnDate);
            const daysOverdue = getDaysOverdue(item.dueDate);
            const daysRemaining = getDaysRemaining(item.dueDate);

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle hover:shadow-card transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-16 bg-paper-200 dark:bg-charcoal-50 rounded border border-paper-300 dark:border-charcoal-300 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.book.coverUrl ? (
                      <img src={item.book.coverUrl} alt={item.book.title} className="h-full object-contain" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-primary" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-base text-ink dark:text-paper-100">
                      <Link href={`/books/${item.book.id}`} className="hover:text-primary transition-colors">
                        {item.book.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-ink-muted dark:text-paper-400">
                      by {item.book.author} • <span className="font-medium text-ink dark:text-paper-100">{item.book.language}</span>
                    </p>
                    <div className="text-xs text-ink-muted dark:text-paper-400 mt-2">
                      Issued on: {formatDate(item.issueDate)}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-paper-200 dark:border-charcoal-300 flex sm:flex-col justify-between items-end gap-1">
                  {activeTab === 'active' ? (
                    <>
                      <div className="text-xs text-ink-muted dark:text-paper-400">
                        Due: <strong className="text-ink dark:text-paper-100">{formatDate(item.dueDate)}</strong>
                      </div>
                      {overdue ? (
                        <span className="badge badge-danger">
                          <AlertTriangle className="w-3 h-3" /> {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-ink-muted dark:text-paper-400">
                        Returned on: <strong className="text-ink dark:text-paper-100">{formatDate(item.returnDate)}</strong>
                      </div>
                      <span className="badge badge-neutral">Returned</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

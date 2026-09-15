import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Library, Clock, AlertTriangle, UserCheck, Plus, ArrowRight, BookOpen, Users } from 'lucide-react';
import { UserStatus, LoanStatus } from '@prisma/client';

export default async function AdminDashboardPage() {
  await requireAdmin();

  const now = new Date();

  // Execute dashboard metrics and recent query lists in parallel
  const [
    totalBooks,
    activeLoansCount,
    overdueLoansCount,
    recentOverdueLoans,
  ] = await Promise.all([
    prisma.book.count({ where: { deletedAt: null } }),
    prisma.loan.count({ where: { status: LoanStatus.BORROWED } }),
    prisma.loan.count({
      where: {
        status: LoanStatus.BORROWED,
        dueDate: { lt: now },
      },
    }),
    prisma.loan.findMany({
      where: {
        status: LoanStatus.BORROWED,
        dueDate: { lt: now },
      },
      include: { book: true },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100">
          Admin Dashboard
        </h1>
        <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
          Overview of library inventory, lending status, and pending user approvals.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/books"
          className="p-6 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              Total Books
            </span>
            <div className="w-9 h-9 rounded-lg bg-paper-200 dark:bg-charcoal-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Library className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-serif font-bold text-ink dark:text-paper-100">
            {totalBooks}
          </div>
          <div className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
            Manage inventory <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link
          href="/admin/checkouts"
          className="p-6 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              Active Checkouts
            </span>
            <div className="w-9 h-9 rounded-lg bg-paper-200 dark:bg-charcoal-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-serif font-bold text-ink dark:text-paper-100">
            {activeLoansCount}
          </div>
          <div className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
            View active checkouts <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link
          href="/admin/overdue"
          className={`p-6 rounded-xl border shadow-subtle hover:shadow-card transition-all group ${
            overdueLoansCount > 0
              ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30'
              : 'bg-white dark:bg-charcoal-200 border-paper-300 dark:border-charcoal-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              Overdue Books
            </span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              overdueLoansCount > 0 ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-paper-200 dark:bg-charcoal-50 text-ink-muted'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-serif font-bold text-ink dark:text-paper-100">
            {overdueLoansCount}
          </div>
          <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
            View overdue list <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-6 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle space-y-4">
        <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/checkouts"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors shadow-subtle"
          >
            <Clock className="w-4 h-4" /> Issue Book Checkout
          </Link>

          <Link
            href="/admin/books"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-paper-200 dark:bg-charcoal-50 hover:bg-paper-300 dark:hover:bg-charcoal-300 text-ink dark:text-paper-100 text-sm font-medium transition-colors border border-paper-300 dark:border-charcoal-300"
          >
            <Plus className="w-4 h-4 text-primary" /> Add New Book
          </Link>

        </div>
      </div>

      {/* Urgent Attention Grid */}
      <div className="grid grid-cols-1 gap-6">

        {/* Overdue Alerts Widget */}
        <div className="p-6 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">Most Overdue Loans</h3>
            <Link href="/admin/overdue" className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline">View all</Link>
          </div>

          {recentOverdueLoans.length === 0 ? (
            <p className="text-sm text-ink-muted dark:text-paper-400 py-4">No overdue books at this time.</p>
          ) : (
            <div className="space-y-3">
              {recentOverdueLoans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-200/60 dark:border-red-900/30 text-xs">
                  <div>
                    <div className="font-bold text-ink dark:text-paper-100">{loan.book.title}</div>
                    <div className="text-ink-muted dark:text-paper-400">Borrower: {loan.borrowerName} {loan.borrowerSurname}</div>
                  </div>
                  <Link
                    href="/admin/overdue"
                    className="px-3 py-1 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                  >
                    Process Return
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, getDaysOverdue, isOverdue } from '@/lib/utils';
import Link from 'next/link';
import { returnCheckoutAction } from '@/app/actions';
import { IssueCheckoutModal } from '@/components/IssueCheckoutModal';
import { SearchInput } from '@/components/SearchInput';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { LoanStatus, UserStatus } from '@prisma/client';

interface AdminCheckoutsPageProps {
  searchParams: Promise<{
    tab?: string;
    q?: string;
  }>;
}

export default async function AdminCheckoutsPage({ searchParams }: AdminCheckoutsPageProps) {
  const resolvedSearchParams = await searchParams;
  await requireAdmin();

  const activeTab = resolvedSearchParams.tab === 'returned' ? 'returned' : 'active';
  const query = resolvedSearchParams.q || '';

  // Fetch approved users, active books, and checkouts list in parallel
  const [approvedUsers, allBooks, checkouts] = await Promise.all([
    prisma.user.findMany({
      where: { status: UserStatus.APPROVED },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, phone: true },
    }),
    prisma.book.findMany({
      where: { deletedAt: null },
      include: {
        loans: {
          where: { status: LoanStatus.BORROWED },
        },
      },
      orderBy: { title: 'asc' },
    }),
    prisma.loan.findMany({
      where: {
        status: activeTab === 'active' ? LoanStatus.BORROWED : LoanStatus.RETURNED,
        ...(query
          ? {
              OR: [
                { book: { title: { contains: query, mode: 'insensitive' } } },
                { user: { name: { contains: query, mode: 'insensitive' } } },
                { user: { email: { contains: query, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        book: true,
        user: true,
        issuedBy: true,
      },
      orderBy: activeTab === 'active' ? { dueDate: 'asc' } : { returnDate: 'desc' },
    }),
  ]);

  const availableBooks = allBooks
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      availableCount: b.totalQuantity - b.loans.length,
      totalQuantity: b.totalQuantity,
    }))
    .filter((b) => b.availableCount > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-paper-300 dark:border-charcoal-300">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100">
            Book Checkouts & Issued Records
          </h1>
          <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
            Issue new book checkouts, manage active borrowings, and mark returned books.
          </p>
        </div>

        <IssueCheckoutModal availableBooks={availableBooks} approvedUsers={approvedUsers} />
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-300 dark:border-charcoal-300">
        <div className="flex gap-6 text-sm font-medium">
          <Link
            href="/admin/checkouts?tab=active"
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'active'
                ? 'border-primary text-primary dark:text-primary-dark font-bold'
                : 'border-transparent text-ink-muted dark:text-paper-400 hover:text-ink'
            }`}
          >
            <Clock className="w-4 h-4" /> Currently Issued
          </Link>

          <Link
            href="/admin/checkouts?tab=returned"
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'returned'
                ? 'border-primary text-primary dark:text-primary-dark font-bold'
                : 'border-transparent text-ink-muted dark:text-paper-400 hover:text-ink'
            }`}
          >
            <CheckCircle className="w-4 h-4" /> Returned History
          </Link>
        </div>

        <SearchInput defaultValue={query} placeholder="Search title or borrower..." className="w-full sm:w-72 mb-3 sm:mb-0" />
      </div>

      {/* Checkouts Table */}
      {checkouts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300">
          <Clock className="w-12 h-12 mx-auto text-ink-muted dark:text-paper-400 mb-3" />
          <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">
            {activeTab === 'active' ? 'No active book checkouts' : 'No returned history found'}
          </h3>
          <p className="text-sm text-ink-muted dark:text-paper-400 max-w-sm mx-auto mt-1 mb-4">
            {activeTab === 'active'
              ? 'Click "Issue Book Checkout" to record a book checkout.'
              : 'Returned books will appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-100 dark:bg-charcoal-50 border-b border-paper-300 dark:border-charcoal-300 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              <tr>
                <th className="p-4">Book Title</th>
                <th className="p-4">Borrower</th>
                <th className="p-4">Issued On</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200 dark:divide-charcoal-300">
              {checkouts.map((item) => {
                const overdue = isOverdue(item.dueDate, item.returnDate);
                const daysOverdue = getDaysOverdue(item.dueDate);

                return (
                  <tr key={item.id} className="hover:bg-paper-100/50 dark:hover:bg-charcoal-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-serif font-bold text-ink dark:text-paper-100">{item.book.title}</div>
                      <div className="text-xs text-ink-muted dark:text-paper-400">by {item.book.author}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-ink dark:text-paper-100">{item.user.name}</div>
                      <div className="text-xs text-ink-muted dark:text-paper-400">{item.user.email}</div>
                    </td>
                    <td className="p-4 text-ink-muted dark:text-paper-400">{formatDate(item.issueDate)}</td>
                    <td className="p-4 text-ink-muted dark:text-paper-400">{formatDate(item.dueDate)}</td>
                    <td className="p-4">
                      {activeTab === 'active' ? (
                        overdue ? (
                          <span className="badge badge-danger">
                            <AlertTriangle className="w-3 h-3" /> {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                          </span>
                        ) : (
                          <span className="badge badge-success">Checked Out</span>
                        )
                      ) : (
                        <span className="badge badge-neutral">Returned {formatDate(item.returnDate)}</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {activeTab === 'active' && (
                        <form action={async () => {
                          'use server';
                          await returnCheckoutAction(item.id);
                        }}>
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-colors"
                          >
                            Mark Returned
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, getDaysOverdue } from '@/lib/utils';
import { returnCheckoutAction } from '@/app/actions';
import { AlertTriangle, Phone, Mail, CheckCircle, BookOpen } from 'lucide-react';
import { LoanStatus } from '@prisma/client';

export default async function AdminOverduePage() {
  await requireAdmin();

  const now = new Date();

  // Query overdue loans: status = BORROWED and dueDate < now
  const overdueLoans = await prisma.loan.findMany({
    where: {
      status: LoanStatus.BORROWED,
      dueDate: { lt: now },
    },
    include: {
      book: true,
      user: true,
    },
    orderBy: { dueDate: 'asc' }, // Oldest due date first = most overdue
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-paper-300 dark:border-charcoal-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100">
              Overdue Books ({overdueLoans.length})
            </h1>
            <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
              Active loans where the due date has passed. Reach out to borrowers to arrange returns.
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Table */}
      {overdueLoans.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300">
          <CheckCircle className="w-12 h-12 mx-auto text-primary mb-3" />
          <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">No overdue books!</h3>
          <p className="text-sm text-ink-muted dark:text-paper-400 max-w-sm mx-auto mt-1">
            All active loans are currently within their 15-day lending period.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-charcoal-200 rounded-xl border border-red-200 dark:border-red-900/40 shadow-subtle overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-red-50/50 dark:bg-red-950/20 border-b border-red-200/60 dark:border-red-900/30 text-xs font-semibold uppercase tracking-wider text-red-900 dark:text-red-300">
              <tr>
                <th className="p-4">Book Title</th>
                <th className="p-4">Borrower Contact</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Days Overdue</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200 dark:divide-charcoal-300">
              {overdueLoans.map((loan) => {
                const daysOverdue = getDaysOverdue(loan.dueDate);

                return (
                  <tr key={loan.id} className="hover:bg-red-50/20 dark:hover:bg-red-950/10 transition-colors">
                    <td className="p-4">
                      <div className="font-serif font-bold text-ink dark:text-paper-100">{loan.book.title}</div>
                      <div className="text-xs text-ink-muted dark:text-paper-400">by {loan.book.author}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-ink dark:text-paper-100">{loan.user.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted dark:text-paper-400 mt-1">
                        <Mail className="w-3 h-3" /> {loan.user.email}
                      </div>
                      {loan.user.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-ink-muted dark:text-paper-400 mt-0.5">
                          <Phone className="w-3 h-3" /> {loan.user.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-ink-muted dark:text-paper-400">
                      {formatDate(loan.dueDate)}
                    </td>
                    <td className="p-4">
                      <span className="badge badge-danger text-xs font-bold">
                        {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <form action={async () => {
                        'use server';
                        await returnCheckoutAction(loan.id);
                      }}>
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-colors"
                        >
                          Mark Returned
                        </button>
                      </form>
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

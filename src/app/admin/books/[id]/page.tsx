import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { editBookAction } from '@/app/actions';
import { ArrowLeft, Clock, Save, History, BookOpen } from 'lucide-react';
import { LoanStatus } from '@prisma/client';

interface EditBookPageProps {
  params: {
    id: string;
  };
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  await requireAdmin();

  const book = await prisma.book.findFirst({
    where: {
      id: params.id,
      deletedAt: null,
    },
    include: {
      loans: {
        include: { user: true, issuedBy: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!book) {
    notFound();
  }

  const activeLoansCount = book.loans.filter((l) => l.status === LoanStatus.BORROWED).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/admin/books"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Books Inventory
        </Link>
      </div>

      <div className="p-6 sm:p-8 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-paper-300 dark:border-charcoal-300 pb-4">
          <h1 className="text-2xl font-serif font-bold text-ink dark:text-paper-100">
            Edit Book: {book.title}
          </h1>
          <span className="badge badge-neutral">ID: {book.id.slice(0, 8)}...</span>
        </div>

        <form action={async (formData: FormData) => {
          'use server';
          await editBookAction(book.id, formData);
        }} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">Title</label>
            <input
              type="text"
              name="title"
              defaultValue={book.title}
              required
              className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">Author</label>
            <input
              type="text"
              name="author"
              defaultValue={book.author}
              required
              className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">Language</label>
            <input
              type="text"
              name="language"
              defaultValue={book.language}
              required
              className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">Genre</label>
            <input
              type="text"
              name="genre"
              defaultValue={book.genre || ''}
              className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
              Total Quantity Copies (Currently {activeLoansCount} borrowed)
            </label>
            <input
              type="number"
              name="totalQuantity"
              min={activeLoansCount || 1}
              defaultValue={book.totalQuantity}
              required
              className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">Cover Image URL</label>
            <input
              type="url"
              name="coverUrl"
              defaultValue={book.coverUrl || ''}
              className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={book.description || ''}
              className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Per-Book Loan History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h2 className="font-serif font-bold text-xl text-ink dark:text-paper-100">
            Loan History for this Title ({book.loans.length})
          </h2>
        </div>

        {book.loans.length === 0 ? (
          <p className="text-sm text-ink-muted dark:text-paper-400">This book has not been issued to any borrower yet.</p>
        ) : (
          <div className="bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-100 dark:bg-charcoal-50 border-b border-paper-300 dark:border-charcoal-300 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
                <tr>
                  <th className="p-4">Borrower</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Return Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200 dark:divide-charcoal-300">
                {book.loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-paper-100/50 dark:hover:bg-charcoal-50/50">
                    <td className="p-4 font-semibold text-ink dark:text-paper-100">{loan.user.name} ({loan.user.email})</td>
                    <td className="p-4 text-ink-muted dark:text-paper-400">{formatDate(loan.issueDate)}</td>
                    <td className="p-4 text-ink-muted dark:text-paper-400">{formatDate(loan.dueDate)}</td>
                    <td className="p-4 text-ink-muted dark:text-paper-400">{loan.returnDate ? formatDate(loan.returnDate) : '—'}</td>
                    <td className="p-4">
                      {loan.status === LoanStatus.RETURNED ? (
                        <span className="badge badge-neutral">Returned</span>
                      ) : (
                        <span className="badge badge-success">Borrowed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

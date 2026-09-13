import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { deleteBookAction } from '@/app/actions';
import { AddBookModal } from '@/components/AddBookModal';
import { SearchInput } from '@/components/SearchInput';
import { Search, Trash2, Edit3, BookOpen } from 'lucide-react';
import { LoanStatus } from '@prisma/client';

interface AdminBooksPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function AdminBooksPage({ searchParams }: AdminBooksPageProps) {
  const resolvedSearchParams = await searchParams;
  await requireAdmin();

  const query = resolvedSearchParams.q || '';

  const books = await prisma.book.findMany({
    where: {
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { author: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      loans: {
        where: { status: LoanStatus.BORROWED },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-paper-300 dark:border-charcoal-300">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100">
            Book Inventory
          </h1>
          <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
            Add, update, and manage your library book catalog. Total titles: {books.length}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Search */}
          <SearchInput defaultValue={query} placeholder="Search title or author..." className="w-64" />

          {/* Interactive Modal Component */}
          <AddBookModal />
        </div>
      </div>

      {/* Book Table */}
      {books.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300">
          <BookOpen className="w-12 h-12 mx-auto text-ink-muted dark:text-paper-400 mb-3" />
          <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">No books found</h3>
          <p className="text-sm text-ink-muted dark:text-paper-400 max-w-sm mx-auto mt-1 mb-4">
            Start adding books to your library inventory.
          </p>
          <div className="flex justify-center">
            <AddBookModal />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-100 dark:bg-charcoal-50 border-b border-paper-300 dark:border-charcoal-300 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              <tr>
                <th className="p-4">Title & Author</th>
                <th className="p-4">Language</th>
                <th className="p-4">Genre</th>
                <th className="p-4">Total</th>
                <th className="p-4">Available</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200 dark:divide-charcoal-300">
              {books.map((book) => {
                const activeLoansCount = book.loans.length;
                const availableCount = book.totalQuantity - activeLoansCount;

                return (
                  <tr key={book.id} className="hover:bg-paper-100/50 dark:hover:bg-charcoal-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-serif font-bold text-ink dark:text-paper-100">{book.title}</div>
                      <div className="text-xs text-ink-muted dark:text-paper-400">by {book.author}</div>
                    </td>
                    <td className="p-4 text-ink-muted dark:text-paper-400">{book.language}</td>
                    <td className="p-4 text-ink-muted dark:text-paper-400">{book.genre || '—'}</td>
                    <td className="p-4 font-semibold text-ink dark:text-paper-100">{book.totalQuantity}</td>
                    <td className="p-4">
                      {availableCount > 0 ? (
                        <span className="badge badge-success">{availableCount} available</span>
                      ) : (
                        <span className="badge badge-warning">0 available ({activeLoansCount} checked out)</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          href={`/admin/books/${book.id}`}
                          className="p-1.5 rounded hover:bg-paper-200 dark:hover:bg-charcoal-50 text-ink-muted hover:text-ink dark:text-paper-400 transition-colors"
                          title="Edit Book"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        {activeLoansCount === 0 && (
                          <form action={async () => {
                            'use server';
                            await deleteBookAction(book.id);
                          }}>
                            <button
                              type="submit"
                              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
                              title="Delete Book"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        )}
                      </div>
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

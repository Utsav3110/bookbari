import { requireApprovedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { SearchInput } from '@/components/SearchInput';
import { FilterDropdown } from '@/components/FilterDropdown';
import { BookOpen, Clock } from 'lucide-react';
import { LoanStatus } from '@prisma/client';

interface BooksPageProps {
  searchParams: {
    q?: string;
    lang?: string;
    genre?: string;
    page?: string;
  };
}

export default async function CatalogPage({ searchParams }: BooksPageProps) {
  await requireApprovedUser();

  const query = searchParams.q || '';
  const selectedLang = searchParams.lang || '';
  const selectedGenre = searchParams.genre || '';
  const currentPage = Math.max(1, parseInt(searchParams.page || '1', 10));
  const pageSize = 20;

  // Build filter condition
  const whereCondition: any = {
    deletedAt: null,
  };

  if (query) {
    whereCondition.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { author: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (selectedLang) {
    whereCondition.language = selectedLang;
  }

  if (selectedGenre) {
    whereCondition.genre = selectedGenre;
  }

  // Fetch unique languages & genres for filter dropdowns
  const allBooksForFilters = await prisma.book.findMany({
    where: { deletedAt: null },
    select: { language: true, genre: true },
  });

  const languages = Array.from(new Set(allBooksForFilters.map((b) => b.language))).filter(Boolean);
  const genres = Array.from(new Set(allBooksForFilters.map((b) => b.genre))).filter(Boolean) as string[];

  // Fetch books count and paginated books
  const totalBooksCount = await prisma.book.count({ where: whereCondition });
  const totalPages = Math.ceil(totalBooksCount / pageSize);

  const books = await prisma.book.findMany({
    where: whereCondition,
    include: {
      loans: {
        where: { status: LoanStatus.BORROWED },
        select: { dueDate: true },
        orderBy: { dueDate: 'asc' },
      },
    },
    orderBy: { title: 'asc' },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-paper-300 dark:border-charcoal-300">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100">
            Book Catalog
          </h1>
          <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
            Browse our library collection. Showing {books.length} of {totalBooksCount} books.
          </p>
        </div>
      </div>

      {/* Instant Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle">
        {/* Instant Debounced Search Input */}
        <div className="sm:col-span-6">
          <SearchInput defaultValue={query} placeholder="Type title or author to search instantly..." />
        </div>

        {/* Client Component Language Filter */}
        <div className="sm:col-span-3">
          <FilterDropdown
            name="lang"
            options={languages}
            defaultValue={selectedLang}
            placeholder="All Languages"
          />
        </div>

        {/* Client Component Genre Filter */}
        <div className="sm:col-span-3">
          <FilterDropdown
            name="genre"
            options={genres}
            defaultValue={selectedGenre}
            placeholder="All Genres"
          />
        </div>
      </div>

      {/* Catalog Grid */}
      {books.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300">
          <BookOpen className="w-12 h-12 mx-auto text-ink-muted dark:text-paper-400 mb-3" />
          <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">No books found</h3>
          <p className="text-sm text-ink-muted dark:text-paper-400 max-w-sm mx-auto mt-1">
            Try adjusting your search criteria or clearing filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => {
            const activeLoansCount = book.loans.length;
            const availableCount = book.totalQuantity - activeLoansCount;
            const isAvailable = availableCount > 0;
            const earliestDueDate = !isAvailable && book.loans.length > 0 ? book.loans[0].dueDate : null;

            return (
              <div
                key={book.id}
                className="flex flex-col bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle overflow-hidden hover:shadow-card transition-shadow"
              >
                {/* Book Thumbnail */}
                <div className="h-44 bg-paper-200 dark:bg-charcoal-50 p-4 flex items-center justify-center relative overflow-hidden border-b border-paper-300 dark:border-charcoal-300">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="h-full object-contain shadow-subtle rounded"
                    />
                  ) : (
                    <div className="w-24 h-32 bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-50 rounded p-3 flex flex-col justify-between shadow-subtle text-center">
                      <div className="font-serif font-bold text-xs text-ink dark:text-paper-100 line-clamp-3">
                        {book.title}
                      </div>
                      <div className="text-[10px] text-ink-muted dark:text-paper-400 line-clamp-1">
                        {book.author}
                      </div>
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3">
                    {isAvailable ? (
                      <span className="badge badge-success">
                        {availableCount} of {book.totalQuantity} available
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        0 of {book.totalQuantity} available
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-ink dark:text-paper-100 line-clamp-2 hover:text-primary transition-colors">
                      <Link href={`/books/${book.id}`}>{book.title}</Link>
                    </h3>
                    <p className="text-xs text-ink-muted dark:text-paper-400 mt-1">
                      by <span className="font-medium text-ink dark:text-paper-100">{book.author}</span>
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-paper-200 dark:border-charcoal-300 text-xs">
                    <div className="flex justify-between text-ink-muted dark:text-paper-400">
                      <span>Language:</span>
                      <span className="font-medium text-ink dark:text-paper-100">{book.language}</span>
                    </div>

                    {book.genre && (
                      <div className="flex justify-between text-ink-muted dark:text-paper-400">
                        <span>Genre:</span>
                        <span className="font-medium text-ink dark:text-paper-100">{book.genre}</span>
                      </div>
                    )}

                    {!isAvailable && earliestDueDate && (
                      <div className="flex items-center gap-1.5 text-terracotta bg-terracotta-light dark:bg-terracotta/10 p-2 rounded text-[11px]">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Expected back: <strong>{formatDate(earliestDueDate)}</strong></span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/books/${book.id}`}
                    className="w-full mt-2 py-2 text-center rounded-lg bg-paper-200 dark:bg-charcoal-50 hover:bg-paper-300 dark:hover:bg-charcoal-300 text-xs font-semibold text-ink dark:text-paper-100 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-paper-300 dark:border-charcoal-300 text-sm">
          <div className="text-ink-muted dark:text-paper-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/books?q=${query}&lang=${selectedLang}&genre=${selectedGenre}&page=${currentPage - 1}`}
                className="px-3 py-1.5 rounded bg-white dark:bg-charcoal-200 border border-paper-300 dark:border-charcoal-300 hover:bg-paper-200 text-xs font-medium"
              >
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/books?q=${query}&lang=${selectedLang}&genre=${selectedGenre}&page=${currentPage + 1}`}
                className="px-3 py-1.5 rounded bg-white dark:bg-charcoal-200 border border-paper-300 dark:border-charcoal-300 hover:bg-paper-200 text-xs font-medium"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

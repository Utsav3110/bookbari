import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Search, BookOpen, Filter, X, RefreshCw, Globe, Tag, Calendar, CheckCircle } from 'lucide-react';
import { WhatsAppRequestButton } from '../components/WhatsAppRequestButton';
import { BookImage } from '../components/BookImage';
import { useToast } from '../context/ToastContext';

interface Author {
  _id: string;
  name: string;
}

interface Book {
  _id: string;
  title: string;
  authorId?: Author;
  language: string;
  genre?: string;
  totalQuantity: number;
  availableQuantity?: number;
  expectedAvailableDate?: string;
  description?: string;
  coverUrl?: string;
}

// Utility to format date into DD/MM/YYYY
const formatDateDDMMYYYY = (dateInput?: string): string => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function BookList() {
  const { showToast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/books');
      const booksData = res.data.data !== undefined ? res.data.data : res.data;
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (error) {
      console.error('Error fetching books', error);
      showToast('Failed to load books catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Extract individual categories/genres by splitting comma-separated genre values
  const genres = Array.from(
    new Set(
      books
        .flatMap((b) => (b.genre ? b.genre.split(',').map((g) => g.trim()) : []))
        .filter(Boolean)
    )
  ).sort();

  const languages = Array.from(
    new Set(books.map((b) => b.language).filter((l): l is string => Boolean(l)))
  );

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.authorId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      book.genre?.toLowerCase().includes(search.toLowerCase()) ||
      book.language.toLowerCase().includes(search.toLowerCase());

    const matchesGenre = selectedGenre
      ? book.genre
          ?.split(',')
          .map((g) => g.trim().toLowerCase())
          .includes(selectedGenre.toLowerCase())
      : true;

    const matchesLanguage = selectedLanguage ? book.language === selectedLanguage : true;

    const isAvailable = (book.availableQuantity ?? book.totalQuantity) > 0;
    const matchesStock =
      stockFilter === 'all'
        ? true
        : stockFilter === 'in_stock'
        ? isAvailable
        : !isAvailable;

    return matchesSearch && matchesGenre && matchesLanguage && matchesStock;
  });

  return (
    <div className="space-y-8">
      {/* Hero / Header */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-amber-700/10 via-primary/10 to-amber-900/10 border border-paper-300 dark:border-charcoal-border relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="badge badge-warning text-xs uppercase tracking-widest font-bold">
            Public Library Catalog
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-ink dark:text-paper-100 tracking-tight">
            Welcome to <span className="text-primary">Bookbaari</span>
          </h1>
          <p className="text-base text-ink-muted dark:text-paper-300">
            Bookbaari (Book Baari) is your digital &amp; physical book library. Discover, borrow, and read books across fiction, non-fiction, academic, and regional literature in English, Hindi, Gujarati and more. Reserve or request your copy via WhatsApp!
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-white dark:bg-charcoal-100 px-4 py-3 rounded-xl border border-paper-300 dark:border-charcoal-border shadow-subtle">
          <Search className="w-5 h-5 text-ink-muted dark:text-paper-400 shrink-0" />
          <input
            type="text"
            placeholder="Search catalog by title, author, language, or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-ink dark:text-paper-100 placeholder:text-ink-muted dark:placeholder:text-paper-400 focus:outline-hidden"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-ink-muted hover:text-ink">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Section (Stock, Languages & Individual Categories) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stock / Availability Filter */}
          <div className="p-3 bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-border shadow-subtle space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-primary" /> Filter Availability
              </span>
              {stockFilter !== 'all' && (
                <button
                  onClick={() => setStockFilter('all')}
                  className="text-primary text-[10px] hover:underline lowercase font-normal"
                >
                  Clear stock
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  stockFilter === 'all'
                    ? 'bg-primary text-white font-bold'
                    : 'bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-300 hover:bg-paper-300 dark:hover:bg-charcoal-500'
                }`}
              >
                All Books
              </button>
              <button
                onClick={() => setStockFilter('in_stock')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  stockFilter === 'in_stock'
                    ? 'bg-primary text-white font-bold'
                    : 'bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-300 hover:bg-paper-300 dark:hover:bg-charcoal-500'
                }`}
              >
                In Stock Only
              </button>
              <button
                onClick={() => setStockFilter('out_of_stock')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  stockFilter === 'out_of_stock'
                    ? 'bg-primary text-white font-bold'
                    : 'bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-300 hover:bg-paper-300 dark:hover:bg-charcoal-500'
                }`}
              >
                Out of Stock
              </button>
            </div>
          </div>

          {/* Language Scroll Filter */}
          <div className="p-3 bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-border shadow-subtle space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" /> Filter by Language
              </span>
              {selectedLanguage && (
                <button
                  onClick={() => setSelectedLanguage('')}
                  className="text-primary text-[10px] hover:underline lowercase font-normal"
                >
                  Clear language
                </button>
              )}
            </div>

            <div className="max-h-24 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedLanguage('')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedLanguage === ''
                      ? 'bg-primary text-white font-bold'
                      : 'bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-300 hover:bg-paper-300 dark:hover:bg-charcoal-500'
                  }`}
                >
                  All Languages
                </button>
                {['English', 'Hindi', 'Gujarati', ...languages.filter((l) => !['English', 'Hindi', 'Gujarati'].includes(l))].map(
                  (lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(selectedLanguage === lang ? '' : lang)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedLanguage === lang
                          ? 'bg-primary text-white font-bold'
                          : 'bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-300 hover:bg-paper-300 dark:hover:bg-charcoal-500'
                      }`}
                    >
                      {lang}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Individual Category / Genre Scroll Filter */}
          <div className="p-3 bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-border shadow-subtle space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" /> Filter by Category
              </span>
              {selectedGenre && (
                <button
                  onClick={() => setSelectedGenre('')}
                  className="text-primary text-[10px] hover:underline lowercase font-normal"
                >
                  Clear category
                </button>
              )}
            </div>

            <div className="max-h-24 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedGenre('')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedGenre === ''
                      ? 'bg-primary text-white font-bold'
                      : 'bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-300 hover:bg-paper-300 dark:hover:bg-charcoal-500'
                  }`}
                >
                  All Categories ({genres.length})
                </button>
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(selectedGenre === g ? '' : g)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedGenre === g
                        ? 'bg-primary text-white font-bold'
                        : 'bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-300 hover:bg-paper-300 dark:hover:bg-charcoal-500'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-border space-y-3">
          <BookOpen className="w-12 h-12 mx-auto text-ink-muted opacity-40" />
          <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100">No Books Found</h3>
          <p className="text-sm text-ink-muted dark:text-paper-400">
            {search || selectedGenre || selectedLanguage || stockFilter !== 'all'
              ? 'Try adjusting your search criteria, availability, language, or category filter.'
              : 'Our inventory is currently empty.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const isAvailable = (book.availableQuantity ?? book.totalQuantity) > 0;
            const formattedExpectedDate = formatDateDDMMYYYY(book.expectedAvailableDate);

            return (
              <div
                key={book._id}
                className="bg-white dark:bg-charcoal-100 rounded-2xl border border-paper-300 dark:border-charcoal-border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Book Cover Banner / Image */}
                <div className="h-48 bg-paper-200 dark:bg-charcoal-50 relative overflow-hidden flex items-center justify-center border-b border-paper-300/50 dark:border-charcoal-50">
                  <BookImage
                    src={book.coverUrl}
                    alt={book.title}
                    fallbackTitle={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Availability & Expected Return Date Badge Overlay */}
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                    {isAvailable ? (
                      <span className="badge badge-success text-xs font-bold shadow-subtle">
                        {book.availableQuantity ?? book.totalQuantity} Available
                      </span>
                    ) : (
                      <>
                        <span className="badge badge-danger text-xs font-bold shadow-subtle">
                          Checked Out
                        </span>
                        {formattedExpectedDate && (
                          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50/90 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/50 shadow-subtle flex items-center gap-1 backdrop-blur-xs">
                            <Calendar className="w-3 h-3 text-amber-600 shrink-0" /> Back: {formattedExpectedDate}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <span>{book.genre || 'General'}</span>
                      <span>•</span>
                      <span className="text-ink-muted dark:text-paper-300">{book.language}</span>
                    </div>
                    <h3
                      onClick={() => setSelectedBook(book)}
                      className="font-serif font-bold text-xl text-ink dark:text-paper-100 group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
                    >
                      {book.title}
                    </h3>
                    <p className="text-sm font-medium text-ink-muted dark:text-paper-400">
                      by {book.authorId?.name || 'Unknown Author'}
                    </p>
                    {book.description && (
                      <p className="text-xs text-ink-muted dark:text-paper-400 line-clamp-2 pt-1">
                        {book.description}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp Request Pickup Button */}
                  <div className="pt-3 border-t border-paper-200 dark:border-charcoal-50">
                    <WhatsAppRequestButton
                      bookTitle={book.title}
                      bookAuthor={book.authorId?.name || 'Author'}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BOOK DETAIL MODAL */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-charcoal-100 rounded-2xl shadow-card p-6 border border-paper-300 dark:border-charcoal-border space-y-4 relative">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-muted hover:text-ink dark:text-paper-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4 items-start pt-2">
              <div className="w-24 h-36 bg-paper-200 dark:bg-charcoal-50 rounded-xl overflow-hidden shrink-0 border border-paper-300 dark:border-charcoal-border flex items-center justify-center">
                <BookImage
                  src={selectedBook.coverUrl}
                  alt={selectedBook.title}
                  fallbackTitle={selectedBook.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 flex-1">
                <span className="badge badge-neutral text-xs font-semibold">{selectedBook.genre || 'General'}</span>
                <h2 className="font-serif font-bold text-2xl text-ink dark:text-paper-100">{selectedBook.title}</h2>
                <p className="text-sm font-semibold text-ink-muted dark:text-paper-400">
                  Author: <span className="text-ink dark:text-paper-200">{selectedBook.authorId?.name}</span>
                </p>
                <div className="text-xs text-ink-muted dark:text-paper-400">
                  Language: <span className="font-semibold text-primary">{selectedBook.language}</span>
                </div>
                <div className="pt-1">
                  {(selectedBook.availableQuantity ?? selectedBook.totalQuantity) > 0 ? (
                    <span className="badge badge-success text-xs font-bold">
                      {selectedBook.availableQuantity ?? selectedBook.totalQuantity} of {selectedBook.totalQuantity} copies available
                    </span>
                  ) : (
                    <div className="space-y-1.5">
                      <span className="badge badge-danger text-xs font-bold">All copies checked out</span>
                      {selectedBook.expectedAvailableDate && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Expected Available: <span className="font-mono underline">{formatDateDDMMYYYY(selectedBook.expectedAvailableDate)}</span> (DD/MM/YYYY)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedBook.description && (
              <div className="pt-3 border-t border-paper-200 dark:border-charcoal-border space-y-1">
                <h4 className="text-xs font-bold uppercase text-ink-muted dark:text-paper-400">Synopsis / Details</h4>
                <p className="text-xs text-ink dark:text-paper-300 leading-relaxed">{selectedBook.description}</p>
              </div>
            )}

            <div className="pt-3 border-t border-paper-200 dark:border-charcoal-border">
              <WhatsAppRequestButton
                bookTitle={selectedBook.title}
                bookAuthor={selectedBook.authorId?.name || 'Author'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

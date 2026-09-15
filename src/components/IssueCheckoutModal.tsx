'use client';

import { useState } from 'react';
import { issueCheckoutAction } from '@/app/actions';
import { Plus, X, Clock, AlertCircle, Search, Check, BookOpen, User } from 'lucide-react';

interface IssueCheckoutModalProps {
  availableBooks: { id: string; title: string; author: string; availableCount: number; totalQuantity: number }[];
}

export function IssueCheckoutModal({ availableBooks }: IssueCheckoutModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form selection states
  const [selectedBookId, setSelectedBookId] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);


  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 15);
  const defaultDueStr = defaultDue.toISOString().split('T')[0];

  // Filter lists based on user search inputs
  const filteredBooks = availableBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase())
  );


  const selectedBook = availableBooks.find((b) => b.id === selectedBookId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBookId) {
      setError('Please select a book');
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('bookId', selectedBookId);

    const result = await issueCheckoutAction(formData);

    setLoading(false);

    if (result && 'error' in result && result.error) {
      setError(result.error);
    } else if (result && 'error' in result) {
      setError('An unknown error occurred');
    } else {
      setIsOpen(false);
      setSelectedBookId('');
      setBookSearch('');
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-subtle transition-colors shrink-0"
      >
        <Plus className="w-4 h-4" /> Issue Book Checkout
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="w-full max-w-xl bg-white dark:bg-charcoal-200 rounded-2xl border border-paper-300 dark:border-charcoal-300 shadow-elevation p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-paper-300 dark:border-charcoal-300 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100">
                  Issue Book Checkout
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 hover:bg-paper-200 dark:hover:bg-charcoal-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <input type="hidden" name="bookId" value={selectedBookId} />

              {/* Searchable Book Selection Combobox */}
              <div className="sm:col-span-2 relative">
                <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
                  Select Book <span className="text-red-500">*</span>
                </label>

                <div
                  onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)}
                  className="w-full px-3 py-2.5 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg cursor-pointer flex items-center justify-between text-xs"
                >
                  {selectedBook ? (
                    <div className="flex items-center gap-2 font-medium text-ink dark:text-paper-100">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>{selectedBook.title} by {selectedBook.author} ({selectedBook.availableCount} available)</span>
                    </div>
                  ) : (
                    <span className="text-ink-muted dark:text-paper-400">Search and select book...</span>
                  )}
                  <Search className="w-4 h-4 text-ink-muted dark:text-paper-400" />
                </div>

                {isBookDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-50 rounded-xl shadow-elevation p-2 space-y-2 max-h-56 overflow-y-auto">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-ink-muted dark:text-paper-400" />
                      <input
                        type="text"
                        value={bookSearch}
                        onChange={(e) => setBookSearch(e.target.value)}
                        placeholder="Type book title or author..."
                        className="w-full pl-8 pr-3 py-1.5 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-ink dark:text-paper-100"
                        autoFocus
                      />
                    </div>

                    <div className="divide-y divide-paper-200 dark:divide-charcoal-50">
                      {filteredBooks.length === 0 ? (
                        <div className="p-3 text-center text-xs text-ink-muted dark:text-paper-400">
                          No matching available books found
                        </div>
                      ) : (
                        filteredBooks.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => {
                              setSelectedBookId(b.id);
                              setIsBookDropdownOpen(false);
                            }}
                            className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between text-xs hover:bg-paper-200 dark:hover:bg-charcoal-50 transition-colors ${
                              selectedBookId === b.id ? 'bg-primary-light dark:bg-primary/20 text-primary font-semibold' : ''
                            }`}
                          >
                            <div>
                              <div className="font-bold text-ink dark:text-paper-100">{b.title}</div>
                              <div className="text-[11px] text-ink-muted dark:text-paper-400">by {b.author}</div>
                            </div>
                            <span className="badge badge-success text-[10px]">{b.availableCount} of {b.totalQuantity} available</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Borrower Details */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
                    Borrower Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="borrowerName"
                    required
                    placeholder="e.g. John"
                    className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
                    Borrower Surname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="borrowerSurname"
                    required
                    placeholder="e.g. Doe"
                    className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
                    Borrower Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="borrowerMobile"
                    required
                    placeholder="e.g. +1234567890"
                    className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
                  Giving / Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="issueDate"
                  defaultValue={todayStr}
                  required
                  className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
                  Due Date (Default: +15 days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dueDate"
                  defaultValue={defaultDueStr}
                  required
                  className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-paper-200 dark:border-charcoal-300">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Checkout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

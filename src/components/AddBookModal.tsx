'use client';

import { useState } from 'react';
import { addBookAction } from '@/app/actions';
import { Plus, X, BookOpen, AlertCircle } from 'lucide-react';

export function AddBookModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await addBookAction(formData);

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-subtle transition-colors shrink-0"
      >
        <Plus className="w-4 h-4" /> Add New Book
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="w-full max-w-2xl bg-white dark:bg-charcoal-200 rounded-2xl border border-paper-300 dark:border-charcoal-300 shadow-elevation p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-paper-300 dark:border-charcoal-300 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100">
                  Add New Book to Inventory
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
              <div>
                <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. The Alchemist"
                  className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  required
                  placeholder="e.g. Paulo Coelho"
                  className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
                  Language <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="language"
                  required
                  defaultValue="English"
                  placeholder="e.g. English, Bengali, Spanish"
                  className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
                  Genre
                </label>
                <input
                  type="text"
                  name="genre"
                  placeholder="e.g. Fiction, Novel, Philosophy"
                  className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
                  Total Inventory Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalQuantity"
                  required
                  min="1"
                  defaultValue="1"
                  className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
                  Cover Image URL (optional)
                </label>
                <input
                  type="url"
                  name="coverUrl"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-ink dark:text-paper-100 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink dark:text-paper-100 mb-1">
                  Description / Synopsis (optional)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief summary of the book..."
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
                  {loading ? 'Adding Book...' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

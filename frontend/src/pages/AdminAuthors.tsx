import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, Plus, Edit2, Trash2, Search, AlertCircle, CheckCircle, RefreshCw, X, BookOpen } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

interface Author {
  _id: string;
  name: string;
  bio?: string;
  bookCount: number;
  createdAt: string;
}

export default function AdminAuthors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showSuccess, showError, showWarning } = useToast();

  // Confirmation Modal State
  const [deletingAuthor, setDeletingAuthor] = useState<Author | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  // Form Fields
  const [nameInput, setNameInput] = useState('');
  const [bio, setBio] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/authors');
      const data = res.data.data !== undefined ? res.data.data : res.data;
      setAuthors(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load authors', err);
      showError('Failed to load authors directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const resetForm = () => {
    setNameInput('');
    setBio('');
    setErrorMsg('');
    setSuccessMsg('');
    setEditingAuthor(null);
  };

  const handleAddAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setErrorMsg('Author name is required');
      showError('Author name is required');
      return;
    }

    const trimmedName = nameInput.trim();
    const isDuplicate = authors.some(
      (a) => a.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      const msg = `Author "${trimmedName}" already exists!`;
      setErrorMsg(msg);
      showWarning(msg);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/authors', {
        name: trimmedName,
        bio: bio.trim()
      });

      const msg = res.data.message || `Author "${trimmedName}" added successfully!`;
      setSuccessMsg(msg);
      showSuccess(msg);
      fetchAuthors();
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1200);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to create author';
      setErrorMsg(errMsg);
      showError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (author: Author) => {
    setEditingAuthor(author);
    setNameInput(author.name);
    setBio(author.bio || '');
    setErrorMsg('');
    setSuccessMsg('');
    setShowEditModal(true);
  };

  const handleUpdateAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor || !nameInput.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put(`/authors/${editingAuthor._id}`, {
        name: nameInput.trim(),
        bio: bio.trim()
      });

      const msg = res.data.message || 'Author updated successfully!';
      setSuccessMsg(msg);
      showSuccess(msg);
      fetchAuthors();
      setTimeout(() => {
        setShowEditModal(false);
        resetForm();
      }, 1200);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update author';
      setErrorMsg(errMsg);
      showError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAuthor = (author: Author) => {
    if (author.bookCount > 0) {
      showError(`Cannot delete author "${author.name}". ${author.bookCount} book(s) associated with this author.`);
      return;
    }
    setDeletingAuthor(author);
  };

  const executeDeleteAuthor = async () => {
    if (!deletingAuthor) return;
    try {
      const res = await api.delete(`/authors/${deletingAuthor._id}`);
      showSuccess(res.data.message || `Author "${deletingAuthor.name}" deleted successfully`);
      fetchAuthors();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete author');
    } finally {
      setDeletingAuthor(null);
    }
  };

  const filteredAuthors = authors.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-300 dark:border-charcoal-300">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100 flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" /> Author Directory
          </h1>
          <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
            Manage book authors. Duplicate author entries are automatically prevented.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-subtle transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Author
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-charcoal-100 p-3 rounded-xl border border-paper-300 dark:border-charcoal-50 shadow-subtle">
        <Search className="w-5 h-5 text-ink-muted dark:text-paper-400" />
        <input
          type="text"
          placeholder="Search author by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-ink dark:text-paper-100 placeholder:text-ink-muted dark:placeholder:text-paper-400 focus:outline-hidden"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-ink-muted hover:text-ink">
            Clear
          </button>
        )}
      </div>

      {/* Authors List / Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredAuthors.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 space-y-3">
          <Users className="w-12 h-12 mx-auto text-ink-muted opacity-50" />
          <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">No Authors Found</h3>
          <p className="text-sm text-ink-muted dark:text-paper-400">
            {search ? 'No authors match your search.' : 'Add authors to build your catalog.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAuthors.map((author) => (
            <div
              key={author._id}
              className="p-5 bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-border shadow-subtle dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-card hover:border-primary/40 dark:hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">
                    {author.name}
                  </h3>
                  <span className="badge badge-neutral text-xs shrink-0 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-primary" /> {author.bookCount} {author.bookCount === 1 ? 'book' : 'books'}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-paper-200 dark:border-charcoal-50 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    resetForm();
                    setEditingAuthor(author);
                    setNameInput(author.name);
                    setShowEditModal(true);
                  }}
                  className="p-2 rounded-lg text-ink-muted hover:text-primary dark:text-paper-400 dark:hover:text-primary hover:bg-paper-200 dark:hover:bg-charcoal-50 transition-colors"
                  title="Edit Author"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteAuthor(author)}
                  className="p-2 rounded-lg text-ink-muted hover:text-red-600 dark:text-paper-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Delete Author"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD AUTHOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-charcoal-100 rounded-2xl shadow-card p-6 border border-paper-300 dark:border-charcoal-50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-charcoal-50">
              <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Add New Author
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink dark:text-paper-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200 dark:border-red-900/40 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs rounded-xl border border-green-200 dark:border-green-900/40 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddAuthor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Author Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. J.K. Rowling"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-50 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-100 font-semibold text-sm hover:bg-paper-300 dark:hover:bg-charcoal-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-subtle transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Author'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT AUTHOR MODAL */}
      {showEditModal && editingAuthor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-charcoal-100 rounded-2xl shadow-card p-6 border border-paper-300 dark:border-charcoal-50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-charcoal-300">
              <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" /> Edit Author
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink dark:text-paper-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200 dark:border-red-900/40 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs rounded-xl border border-green-200 dark:border-green-900/40 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditAuthor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Author Full Name *
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-100 font-semibold text-sm hover:bg-paper-300 dark:hover:bg-charcoal-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-subtle transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingAuthor)}
        title="Delete Author"
        message={`Are you sure you want to delete author "${deletingAuthor?.name}"?`}
        confirmText="Delete Author"
        cancelText="Cancel"
        type="danger"
        onConfirm={executeDeleteAuthor}
        onCancel={() => setDeletingAuthor(null)}
      />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Tag, Plus, Edit2, Trash2, Search, AlertCircle, CheckCircle, RefreshCw, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

interface GenreItem {
  _id: string;
  name: string;
  createdAt: string;
}

export default function AdminGenres() {
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showSuccess, showError } = useToast();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState<GenreItem | null>(null);
  const [deletingGenre, setDeletingGenre] = useState<GenreItem | null>(null);

  // Form input
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const res = await api.get('/genres');
      const payload = res.data.data !== undefined ? res.data.data : res.data;
      setGenres(payload);
    } catch (err: any) {
      console.error('Failed to load genres', err);
      showError('Failed to load category directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const resetForm = () => {
    setNameInput('');
    setErrorMsg('');
    setSuccessMsg('');
    setEditingGenre(null);
  };

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setErrorMsg('Genre name is required');
      showError('Genre name is required');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/genres', { name: nameInput.trim() });
      const msg = res.data.message || `Category "${nameInput.trim()}" added successfully!`;
      setSuccessMsg(msg);
      showSuccess(msg);
      setNameInput('');
      fetchGenres();
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1200);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to create genre';
      setErrorMsg(errMsg);
      showError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGenre || !nameInput.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put(`/genres/${editingGenre._id}`, { name: nameInput.trim() });
      const msg = res.data.message || 'Category updated successfully!';
      setSuccessMsg(msg);
      showSuccess(msg);
      fetchGenres();
      setTimeout(() => {
        setShowEditModal(false);
        resetForm();
      }, 1200);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update genre';
      setErrorMsg(errMsg);
      showError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGenre = (genre: GenreItem) => {
    setDeletingGenre(genre);
  };

  const executeDeleteGenre = async () => {
    if (!deletingGenre) return;
    try {
      const res = await api.delete(`/genres/${deletingGenre._id}`);
      showSuccess(res.data.message || `Category "${deletingGenre.name}" deleted successfully`);
      fetchGenres();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete genre');
    } finally {
      setDeletingGenre(null);
    }
  };

  const filteredGenres = genres.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-300 dark:border-charcoal-300">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100 flex items-center gap-2">
            <Tag className="w-7 h-7 text-primary" /> Genre & Category Directory
          </h1>
          <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
            Manage book genres and categories (e.g. Fiction, Non-Fiction, Mystery, Sci-Fi).
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-subtle transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-charcoal-100 p-3 rounded-xl border border-paper-300 dark:border-charcoal-border shadow-subtle">
        <Search className="w-5 h-5 text-ink-muted dark:text-paper-400" />
        <input
          type="text"
          placeholder="Search category by name..."
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

      {/* Genres Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredGenres.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-border space-y-3">
          <Tag className="w-12 h-12 mx-auto text-ink-muted opacity-50" />
          <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">No Categories Found</h3>
          <p className="text-sm text-ink-muted dark:text-paper-400">
            {search ? 'No categories match your search.' : 'Add categories to build your library taxonomies.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGenres.map((genre) => (
            <div
              key={genre._id}
              className="p-5 bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-border shadow-subtle dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-card hover:border-primary/40 dark:hover:border-primary/50 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-paper-200 dark:bg-charcoal-50 text-primary flex items-center justify-center font-bold text-sm">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">
                  {genre.name}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    resetForm();
                    setEditingGenre(genre);
                    setNameInput(genre.name);
                    setShowEditModal(true);
                  }}
                  className="p-2 rounded-lg text-ink-muted hover:text-primary dark:text-paper-400 dark:hover:text-primary hover:bg-paper-200 dark:hover:bg-charcoal-50 transition-colors"
                  title="Edit Genre"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteGenre(genre)}
                  className="p-2 rounded-lg text-ink-muted hover:text-red-600 dark:text-paper-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Delete Genre"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD GENRE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-charcoal-100 rounded-2xl shadow-card p-6 border border-paper-300 dark:border-charcoal-50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-charcoal-300">
              <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Add New Category
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

            <form onSubmit={handleAddGenre} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Category / Genre Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mystery, Fantasy, Self-Help"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
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
                  {submitting ? 'Saving...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GENRE MODAL */}
      {showEditModal && editingGenre && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-charcoal-100 rounded-2xl shadow-card p-6 border border-paper-300 dark:border-charcoal-50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-charcoal-300">
              <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" /> Edit Category
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

            <form onSubmit={handleEditGenre} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Category Name *
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
        isOpen={Boolean(deletingGenre)}
        title="Delete Category / Genre"
        message={`Are you sure you want to delete category "${deletingGenre?.name}"? Books under this category will remain intact.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        type="danger"
        onConfirm={executeDeleteGenre}
        onCancel={() => setDeletingGenre(null)}
      />
    </div>
  );
}

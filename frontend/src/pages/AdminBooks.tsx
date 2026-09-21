import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Library, BookOpen, Plus, Search, Edit2, Trash2, CheckCircle, AlertCircle, RefreshCw, X, ChevronDown, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

interface Author {
  _id: string;
  name: string;
}

interface GenreItem {
  _id: string;
  name: string;
}

interface LanguageItem {
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
  activeLoansCount?: number;
  description?: string;
  coverUrl?: string;
  createdAt: string;
}

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showSuccess, showError } = useToast();

  // Confirmation Modal State
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  
  // Searchable Author Selection State
  const [selectedAuthorId, setSelectedAuthorId] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  // Multi-Genre Selection State
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreSearch, setGenreSearch] = useState('');
  
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [totalQuantity, setTotalQuantity] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, authorsRes, genresRes, languagesRes] = await Promise.all([
        api.get('/books'),
        api.get('/authors'),
        api.get('/genres'),
        api.get('/languages')
      ]);
      const booksData = booksRes.data.data !== undefined ? booksRes.data.data : booksRes.data;
      const authorsData = authorsRes.data.data !== undefined ? authorsRes.data.data : authorsRes.data;
      const genresData = genresRes.data.data !== undefined ? genresRes.data.data : genresRes.data;
      const languagesData = languagesRes.data.data !== undefined ? languagesRes.data.data : languagesRes.data;

      setBooks(Array.isArray(booksData) ? booksData : []);
      setAuthors(Array.isArray(authorsData) ? authorsData : []);
      setGenres(Array.isArray(genresData) ? genresData : []);
      setLanguages(Array.isArray(languagesData) ? languagesData : []);
    } catch (err: any) {
      console.error('Failed to load books catalog', err);
      showError('Failed to load books catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTitle('');
    setSelectedAuthorId('');
    setAuthorSearch('');
    setShowAuthorDropdown(false);
    setSelectedGenres([]);
    setGenreSearch('');
    setSelectedLanguage('');
    setTotalQuantity(1);
    setDescription('');
    setCoverUrl('');
    setErrorMsg('');
    setSuccessMsg('');
    setEditingBook(null);
  };

  const toggleGenreSelection = (genreName: string) => {
    if (selectedGenres.includes(genreName)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genreName));
    } else {
      setSelectedGenres([...selectedGenres, genreName]);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedAuthorId || !selectedLanguage) {
      const msg = 'Title, Author, and Language are required fields';
      setErrorMsg(msg);
      showError(msg);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/books', {
        title: title.trim(),
        authorId: selectedAuthorId,
        genre: selectedGenres.join(', '),
        language: selectedLanguage,
        totalQuantity: Number(totalQuantity) || 1,
        description: description.trim(),
        coverUrl: coverUrl.trim()
      });

      const msg = res.data.message || `Book "${title.trim()}" added to inventory!`;
      setSuccessMsg(msg);
      showSuccess(msg);
      fetchData();
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1200);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to create book';
      setErrorMsg(errMsg);
      showError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setTitle(book.title);
    setSelectedAuthorId(book.authorId?._id || '');
    setAuthorSearch(book.authorId?.name || '');
    
    if (book.genre) {
      const gList = book.genre.split(',').map((g) => g.trim()).filter(Boolean);
      setSelectedGenres(gList);
    } else {
      setSelectedGenres([]);
    }

    setSelectedLanguage(book.language || '');
    setTotalQuantity(book.totalQuantity || 1);
    setDescription(book.description || '');
    setCoverUrl(book.coverUrl || '');
    setErrorMsg('');
    setSuccessMsg('');
    setShowEditModal(true);
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook || !title.trim() || !selectedAuthorId || !selectedLanguage) {
      const msg = 'Title, Author, and Language are required fields';
      setErrorMsg(msg);
      showError(msg);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put(`/books/${editingBook._id}`, {
        title: title.trim(),
        authorId: selectedAuthorId,
        genre: selectedGenres.join(', '),
        language: selectedLanguage,
        totalQuantity: Number(totalQuantity) || 1,
        description: description.trim(),
        coverUrl: coverUrl.trim()
      });

      const msg = res.data.message || 'Book updated successfully!';
      setSuccessMsg(msg);
      showSuccess(msg);
      fetchData();
      setTimeout(() => {
        setShowEditModal(false);
        resetForm();
      }, 1200);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update book';
      setErrorMsg(errMsg);
      showError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = (book: Book) => {
    if ((book.activeLoansCount || 0) > 0) {
      showError(`Cannot delete "${book.title}". There are ${book.activeLoansCount} copy/copies currently borrowed by members.`);
      return;
    }
    setDeletingBook(book);
  };

  const executeDeleteBook = async () => {
    if (!deletingBook) return;
    try {
      const res = await api.delete(`/books/${deletingBook._id}`);
      showSuccess(res.data.message || `Book "${deletingBook.title}" deleted successfully`);
      fetchData();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete book');
    } finally {
      setDeletingBook(null);
    }
  };

  const filteredAuthorsForSearch = authors.filter((a) =>
    a.name.toLowerCase().includes(authorSearch.toLowerCase())
  );

  const filteredGenresForSearch = genres.filter((g) =>
    g.name.toLowerCase().includes(genreSearch.toLowerCase())
  );

  const selectedAuthorObj = authors.find((a) => a._id === selectedAuthorId);

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.authorId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.genre?.toLowerCase().includes(search.toLowerCase()) ||
      b.language.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-300 dark:border-charcoal-300">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100 flex items-center gap-2">
            <Library className="w-7 h-7 text-primary" /> Book Inventory Management
          </h1>
          <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
            Manage library titles, total stock, and available copies.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-subtle transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Book
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-charcoal-100 p-3 rounded-xl border border-paper-300 dark:border-charcoal-50 shadow-subtle">
        <Search className="w-5 h-5 text-ink-muted dark:text-paper-400" />
        <input
          type="text"
          placeholder="Search by title, author, language, or genre..."
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

      {/* Books Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 space-y-3">
          <BookOpen className="w-12 h-12 mx-auto text-ink-muted opacity-50" />
          <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">No Books Found</h3>
          <p className="text-sm text-ink-muted dark:text-paper-400">
            {search ? 'No books match your search filter.' : 'Your inventory is currently empty.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 shadow-subtle overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-200/50 dark:bg-charcoal-50/50 border-b border-paper-300 dark:border-charcoal-50 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              <tr>
                <th className="p-4">Book Details</th>
                <th className="p-4">Author</th>
                <th className="p-4">Language & Genre(s)</th>
                <th className="p-4">Total Stock</th>
                <th className="p-4">Available</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200 dark:divide-charcoal-50/60">
              {filteredBooks.map((book) => (
                <tr key={book._id} className="hover:bg-paper-100/50 dark:hover:bg-charcoal-50/30 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-14 bg-paper-200 dark:bg-charcoal-50 rounded-md overflow-hidden shrink-0 border border-paper-300 dark:border-charcoal-50 flex items-center justify-center">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-ink-muted" />
                      )}
                    </div>
                    <div>
                      <div className="font-serif font-bold text-ink dark:text-paper-100">{book.title}</div>
                      {book.description && (
                        <p className="text-xs text-ink-muted dark:text-paper-400 line-clamp-1 max-w-xs">
                          {book.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-ink dark:text-paper-200">
                    {book.authorId?.name || 'Unknown Author'}
                  </td>
                  <td className="p-4 space-y-1">
                    <div className="text-xs font-semibold text-primary">{book.language}</div>
                    {book.genre ? (
                      <div className="flex flex-wrap gap-1">
                        {book.genre.split(',').map((g, idx) => (
                          <span key={idx} className="badge badge-neutral text-[10px] font-medium">
                            {g.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-ink-muted">General</span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-ink dark:text-paper-100">
                    {book.totalQuantity} {book.totalQuantity === 1 ? 'copy' : 'copies'}
                  </td>
                  <td className="p-4">
                    {(book.availableQuantity || 0) > 0 ? (
                      <span className="badge badge-success text-xs font-semibold">
                        {book.availableQuantity} Available
                      </span>
                    ) : (
                      <span className="badge badge-danger text-xs font-semibold">
                        All Borrowed
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(book)}
                        className="p-2 rounded-lg text-ink-muted hover:text-primary dark:text-paper-400 dark:hover:text-primary hover:bg-paper-200 dark:hover:bg-charcoal-50 transition-colors"
                        title="Edit Book"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book)}
                        className="p-2 rounded-lg text-ink-muted hover:text-red-600 dark:text-paper-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD / EDIT BOOK MODAL */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-charcoal-100 rounded-2xl shadow-card p-6 border border-paper-300 dark:border-charcoal-50 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-charcoal-300">
              <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {showAddModal ? 'Add New Book' : 'Edit Book Details'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
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

            <form onSubmit={showAddModal ? handleAddBook : handleUpdateBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Panchatantra Stories"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* SEARCHABLE AUTHOR DROPDOWN */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Author * (Type to Search)
                </label>

                <div
                  onClick={() => setShowAuthorDropdown(!showAuthorDropdown)}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm cursor-pointer flex items-center justify-between"
                >
                  <span>{selectedAuthorObj ? selectedAuthorObj.name : 'Select or search Author...'}</span>
                  <Search className="w-4 h-4 text-ink-muted" />
                </div>

                {showAuthorDropdown && (
                  <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-charcoal-300 rounded-xl shadow-card border border-paper-300 dark:border-charcoal-500 p-2 space-y-2">
                    <input
                      type="text"
                      placeholder="Search author..."
                      value={authorSearch}
                      onChange={(e) => setAuthorSearch(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-paper-100 dark:bg-charcoal-200 border border-paper-300 dark:border-charcoal-400 text-ink dark:text-paper-100 focus:outline-hidden"
                      autoFocus
                    />
                    
                    <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-thin">
                      {filteredAuthorsForSearch.length === 0 ? (
                        <div className="p-2 text-center text-xs text-ink-muted">No authors found</div>
                      ) : (
                        filteredAuthorsForSearch.map((a) => (
                          <div
                            key={a._id}
                            onClick={() => {
                              setSelectedAuthorId(a._id);
                              setShowAuthorDropdown(false);
                            }}
                            className={`p-2 text-xs rounded-lg cursor-pointer flex items-center justify-between hover:bg-paper-200 dark:hover:bg-charcoal-200 ${
                              selectedAuthorId === a._id ? 'bg-primary/10 text-primary font-bold' : 'text-ink dark:text-paper-100'
                            }`}
                          >
                            <span>{a.name}</span>
                            {selectedAuthorId === a._id && <Check className="w-3.5 h-3.5 text-primary" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Language *
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="" disabled>Select Language</option>
                  {languages.map((l) => (
                    <option key={l._id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* MULTI-SELECT GENRES / CATEGORIES */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400">
                    Genre / Category (Select One or Multiple)
                  </label>
                  <span className="text-[11px] text-primary font-medium">
                    {selectedGenres.length} selected
                  </span>
                </div>

                {selectedGenres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-paper-200/50 dark:bg-charcoal-50/50 rounded-xl border border-paper-300 dark:border-charcoal-300">
                    {selectedGenres.map((g) => (
                      <span
                        key={g}
                        onClick={() => toggleGenreSelection(g)}
                        className="badge badge-primary text-xs cursor-pointer flex items-center gap-1"
                        title="Click to remove"
                      >
                        {g} <X className="w-3 h-3 hover:text-red-300" />
                      </span>
                    ))}
                  </div>
                )}

                <div className="p-3 bg-paper-100 dark:bg-charcoal-300 rounded-xl border border-paper-300 dark:border-charcoal-500 space-y-2">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={genreSearch}
                    onChange={(e) => setGenreSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-charcoal-200 border border-paper-300 dark:border-charcoal-400 text-ink dark:text-paper-100 focus:outline-hidden"
                  />

                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                    {filteredGenresForSearch.length === 0 ? (
                      <div className="text-center text-xs text-ink-muted py-2">No categories found</div>
                    ) : (
                      filteredGenresForSearch.map((g) => {
                        const isChecked = selectedGenres.includes(g.name);
                        return (
                          <label
                            key={g._id}
                            className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-primary/10 text-primary font-bold'
                                : 'text-ink dark:text-paper-200 hover:bg-paper-200 dark:hover:bg-charcoal-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleGenreSelection(g.name)}
                              className="rounded border-paper-300 text-primary focus:ring-primary"
                            />
                            <span>{g.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Total Quantity (Copies) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalQuantity}
                  onChange={(e) => setTotalQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Cover Image URL (HTTPS)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief synopsis or details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
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
                  {submitting ? 'Saving...' : showAddModal ? 'Add Book' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingBook)}
        title="Remove Book from Inventory"
        message={`Are you sure you want to remove "${deletingBook?.title}" from inventory? This action cannot be undone.`}
        confirmText="Remove Book"
        cancelText="Cancel"
        type="danger"
        onConfirm={executeDeleteBook}
        onCancel={() => setDeletingBook(null)}
      />
    </div>
  );
}

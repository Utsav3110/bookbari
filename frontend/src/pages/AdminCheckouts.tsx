import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Clock, Plus, Search, CheckCircle, AlertCircle, Phone, BookOpen, User, RefreshCw, X, Calendar, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

interface Book {
  _id: string;
  title: string;
  authorId?: { name: string };
  availableQuantity?: number;
  totalQuantity: number;
}

interface Loan {
  _id: string;
  bookId: Book;
  borrowerName: string;
  borrowerSurname: string;
  borrowerMobile: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'BORROWED' | 'RETURNED';
  issuedById?: { name: string; email: string };
}

export default function AdminCheckouts() {
  const { showToast } = useToast();
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [returnedLoans, setReturnedLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'returned'>('active');
  const [search, setSearch] = useState('');

  // Confirmation Modal State
  const [confirmReturnLoanId, setConfirmReturnLoanId] = useState<string | null>(null);

  // Helper date format YYYY-MM-DD
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getFutureDateStr = (days: number, fromDateStr = getTodayStr()) => {
    const d = new Date(fromDateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Modal State
  const [showIssueModal, setShowIssueModal] = useState(false);
  
  // Searchable Book Selection State
  const [selectedBookId, setSelectedBookId] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [showBookDropdown, setShowBookDropdown] = useState(false);

  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerSurname, setBorrowerSurname] = useState('');
  const [borrowerMobile, setBorrowerMobile] = useState('');
  
  // Start & End Dates (Default 15 days duration)
  const [issueDate, setIssueDate] = useState<string>(getTodayStr());
  const [dueDate, setDueDate] = useState<string>(getFutureDateStr(15));

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [activeRes, returnedRes, booksRes] = await Promise.all([
        api.get('/loans/active'),
        api.get('/loans/returned'),
        api.get('/books')
      ]);
      const activeData = activeRes.data.data !== undefined ? activeRes.data.data : activeRes.data;
      const returnedData = returnedRes.data.data !== undefined ? returnedRes.data.data : returnedRes.data;
      const booksData = booksRes.data.data !== undefined ? booksRes.data.data : booksRes.data;
      
      setActiveLoans(Array.isArray(activeData) ? activeData : []);
      setReturnedLoans(Array.isArray(returnedData) ? returnedData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (err: any) {
      console.error('Failed to load checkouts', err);
      showToast('Failed to load checkouts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setSelectedBookId('');
    setBookSearch('');
    setShowBookDropdown(false);
    setBorrowerName('');
    setBorrowerSurname('');
    setBorrowerMobile('');
    setIssueDate(getTodayStr());
    setDueDate(getFutureDateStr(15));
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleIssueDateChange = (newIssueDate: string) => {
    setIssueDate(newIssueDate);
    setDueDate(getFutureDateStr(15, newIssueDate));
  };

  const getDurationInDays = () => {
    if (!issueDate || !dueDate) return 0;
    const start = new Date(issueDate).getTime();
    const end = new Date(dueDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 3600 * 24));
    return diff;
  };

  const filteredBooksForSearch = books.filter(
    (b) =>
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.authorId?.name?.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const selectedBookObj = books.find((b) => b._id === selectedBookId);

  const handleIssueLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !borrowerName.trim() || !borrowerMobile.trim()) {
      const errorText = 'Book title, Borrower First Name, and Phone number are required.';
      setErrorMsg(errorText);
      showToast(errorText, 'error');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/loans', {
        bookId: selectedBookId,
        borrowerName: borrowerName.trim(),
        borrowerSurname: borrowerSurname.trim(),
        borrowerMobile: borrowerMobile.trim(),
        issueDate,
        dueDate
      });

      const successText = res.data?.message || 'Book checkout issued successfully!';
      setSuccessMsg(successText);
      showToast(successText, 'success');
      fetchData();
      setTimeout(() => {
        setShowIssueModal(false);
        resetForm();
      }, 1500);
    } catch (err: any) {
      const errorText = err.response?.data?.message || 'Failed to issue book checkout';
      setErrorMsg(errorText);
      showToast(errorText, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnLoan = (loanId: string) => {
    setConfirmReturnLoanId(loanId);
  };

  const executeReturnLoan = async () => {
    if (!confirmReturnLoanId) return;
    try {
      const res = await api.post(`/loans/${confirmReturnLoanId}/return`);
      showToast(res.data?.message || 'Book copy marked as returned!', 'success');
      fetchData();
    } catch (err: any) {
      const errorText = err.response?.data?.message || 'Failed to process return';
      showToast(errorText, 'error');
    } finally {
      setConfirmReturnLoanId(null);
    }
  };

  const displayedLoans = tab === 'active' ? activeLoans : returnedLoans;
  const filteredLoans = displayedLoans.filter(
    (l) =>
      l.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
      l.borrowerSurname?.toLowerCase().includes(search.toLowerCase()) ||
      l.borrowerMobile.includes(search) ||
      l.bookId?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-300 dark:border-charcoal-300">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100 flex items-center gap-2">
            <Clock className="w-7 h-7 text-primary" /> Book Checkouts & Lending
          </h1>
          <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
            Issue new book checkouts to readers and process returned books.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowIssueModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-subtle transition-colors"
        >
          <Plus className="w-4 h-4" /> Issue New Checkout
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-paper-200 dark:bg-charcoal-50 p-1 rounded-xl border border-paper-300 dark:border-charcoal-300">
          <button
            onClick={() => setTab('active')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === 'active'
                ? 'bg-primary text-white shadow-subtle'
                : 'text-ink-muted dark:text-paper-400 hover:text-ink dark:hover:text-paper-100'
            }`}
          >
            Active Checkouts ({activeLoans.length})
          </button>
          <button
            onClick={() => setTab('returned')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === 'returned'
                ? 'bg-primary text-white shadow-subtle'
                : 'text-ink-muted dark:text-paper-400 hover:text-ink dark:hover:text-paper-100'
            }`}
          >
            Returned History ({returnedLoans.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-white dark:bg-charcoal-100 px-3 py-2 rounded-xl border border-paper-300 dark:border-charcoal-50 shadow-subtle flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-ink-muted dark:text-paper-400" />
          <input
            type="text"
            placeholder="Search borrower or book..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-ink dark:text-paper-100 placeholder:text-ink-muted dark:placeholder:text-paper-400 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 space-y-3">
          <Clock className="w-12 h-12 mx-auto text-ink-muted opacity-50" />
          <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">No Checkouts Found</h3>
          <p className="text-sm text-ink-muted dark:text-paper-400">
            {tab === 'active' ? 'No books are currently checked out.' : 'No returned loan history available.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 shadow-subtle overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-200/50 dark:bg-charcoal-50/50 border-b border-paper-300 dark:border-charcoal-50 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              <tr>
                <th className="p-4">Book Title</th>
                <th className="p-4">Borrower Info</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">End Date (Due)</th>
                <th className="p-4">Status</th>
                {tab === 'active' && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200 dark:divide-charcoal-300">
              {filteredLoans.map((loan) => (
                <tr key={loan._id} className="hover:bg-paper-100/50 dark:hover:bg-charcoal-50/30 transition-colors">
                  <td className="p-4">
                    <div className="font-serif font-bold text-ink dark:text-paper-100">
                      {loan.bookId?.title || 'Unknown Book'}
                    </div>
                    <div className="text-xs text-ink-muted dark:text-paper-400">
                      by {loan.bookId?.authorId?.name || 'Unknown Author'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-ink dark:text-paper-100 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      {loan.borrowerName} {loan.borrowerSurname}
                    </div>
                    <div className="text-xs text-ink-muted dark:text-paper-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-ink-muted" /> {loan.borrowerMobile}
                    </div>
                  </td>
                  <td className="p-4 text-ink-muted dark:text-paper-400 text-xs font-medium">
                    {new Date(loan.issueDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-ink dark:text-paper-200 text-xs font-medium">
                    {new Date(loan.dueDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {loan.status === 'BORROWED' ? (
                      <span className="badge badge-warning text-xs font-semibold">Borrowed</span>
                    ) : (
                      <span className="badge badge-success text-xs font-semibold">Returned</span>
                    )}
                  </td>
                  {tab === 'active' && (
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleReturnLoan(loan._id)}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-colors"
                      >
                        Mark Returned
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ISSUE CHECKOUT MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-charcoal-100 rounded-2xl shadow-card p-6 border border-paper-300 dark:border-charcoal-50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-charcoal-300">
              <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Issue Book Checkout
              </h3>
              <button
                onClick={() => {
                  setShowIssueModal(false);
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

            <form onSubmit={handleIssueLoan} className="space-y-4">
              {/* SEARCHABLE BOOK SELECTION */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Select Book * (Type to Search)
                </label>

                <div
                  onClick={() => setShowBookDropdown(!showBookDropdown)}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">
                    {selectedBookObj
                      ? `${selectedBookObj.title} (${selectedBookObj.availableQuantity ?? selectedBookObj.totalQuantity} copies left)`
                      : 'Type to search book from catalog...'}
                  </span>
                  <Search className="w-4 h-4 text-ink-muted shrink-0" />
                </div>

                {showBookDropdown && (
                  <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-charcoal-300 rounded-xl shadow-card border border-paper-300 dark:border-charcoal-500 p-2 space-y-2">
                    <input
                      type="text"
                      placeholder="Search title or author..."
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-paper-100 dark:bg-charcoal-200 border border-paper-300 dark:border-charcoal-400 text-ink dark:text-paper-100 focus:outline-hidden"
                      autoFocus
                    />

                    {/* Scrollable List (max-h-40 shows 3-4 items) */}
                    <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-thin">
                      {filteredBooksForSearch.length === 0 ? (
                        <div className="p-2 text-center text-xs text-ink-muted">No books found</div>
                      ) : (
                        filteredBooksForSearch.map((b) => {
                          const available = b.availableQuantity ?? b.totalQuantity;
                          const isDisabled = available <= 0;
                          return (
                            <div
                              key={b._id}
                              onClick={() => {
                                if (isDisabled) return;
                                setSelectedBookId(b._id);
                                setShowBookDropdown(false);
                              }}
                              className={`p-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                                isDisabled
                                  ? 'opacity-40 cursor-not-allowed'
                                  : selectedBookId === b._id
                                  ? 'bg-primary/10 text-primary font-bold cursor-pointer'
                                  : 'text-ink dark:text-paper-100 hover:bg-paper-200 dark:hover:bg-charcoal-200 cursor-pointer'
                              }`}
                            >
                              <div>
                                <div className="font-bold">{b.title}</div>
                                <div className="text-[10px] text-ink-muted">by {b.authorId?.name || 'Author'}</div>
                              </div>
                              <div className="text-right shrink-0">
                                {available > 0 ? (
                                  <span className="badge badge-success text-[10px]">{available} left</span>
                                ) : (
                                  <span className="badge badge-danger text-[10px]">None left</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Doe"
                    value={borrowerSurname}
                    onChange={(e) => setBorrowerSurname(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Mobile Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={borrowerMobile}
                  onChange={(e) => setBorrowerMobile(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Start Date & End Date Inputs */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-paper-200/60 dark:bg-charcoal-50/50 rounded-xl border border-paper-300 dark:border-charcoal-300">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" /> Start Date *
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => handleIssueDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-charcoal-200 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" /> End Date *
                  </label>
                  <input
                    type="date"
                    min={issueDate}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-charcoal-200 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="col-span-2 text-center text-[11px] text-ink-muted dark:text-paper-400 pt-1 font-medium">
                  Total Lending Duration: <span className="font-bold text-primary">{getDurationInDays()} days</span> (Default 15 days)
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowIssueModal(false);
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
                  {submitting ? 'Issuing...' : 'Issue Checkout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmReturnLoanId)}
        title="Mark Book as Returned"
        message="Are you sure you want to mark this book copy as returned? This will update the available stock."
        confirmText="Yes, Mark Returned"
        cancelText="Cancel"
        type="info"
        onConfirm={executeReturnLoan}
        onCancel={() => setConfirmReturnLoanId(null)}
      />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Library, Clock, AlertTriangle, Users, ShieldCheck, Plus, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Stats {
  totalBooks: number;
  activeLoansCount: number;
  overdueLoansCount: number;
  totalAuthors: number;
  totalAdmins: number;
  recentOverdueLoans: any[];
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useToast();

  const fetchOverview = async (isManual = false) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/stats/overview');
      const payload = res.data.data !== undefined ? res.data.data : res.data;
      setStats(payload);
      if (isManual) {
        showSuccess('Overview metrics refreshed');
      }
    } catch (err: any) {
      console.error('Failed to load stats overview:', err);
      const msg = err.response?.data?.message || 'Failed to load dashboard metrics';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100">
            Admin Overview
          </h1>
          <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
            Real-time library metrics, inventory overview, and loan alerts.
          </p>
        </div>
        <button
          onClick={() => fetchOverview(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-100 rounded-lg hover:bg-paper-300 dark:hover:bg-charcoal-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Books */}
        <Link
          to="/admin/books"
          className="p-5 bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 shadow-subtle hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              Books
            </span>
            <div className="w-9 h-9 rounded-lg bg-paper-200 dark:bg-charcoal-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Library className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-serif font-bold text-ink dark:text-paper-100">
            {stats?.totalBooks || 0}
          </div>
          <div className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
            Manage inventory <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Total Authors */}
        <Link
          to="/admin/authors"
          className="p-5 bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 shadow-subtle hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              Authors
            </span>
            <div className="w-9 h-9 rounded-lg bg-paper-200 dark:bg-charcoal-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-serif font-bold text-ink dark:text-paper-100">
            {stats?.totalAuthors || 0}
          </div>
          <div className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
            Manage authors <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Active Checkouts */}
        <Link
          to="/admin/checkouts"
          className="p-5 bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 shadow-subtle hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              Active Checkouts
            </span>
            <div className="w-9 h-9 rounded-lg bg-paper-200 dark:bg-charcoal-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-serif font-bold text-ink dark:text-paper-100">
            {stats?.activeLoansCount || 0}
          </div>
          <div className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
            View checkouts <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Overdue Books */}
        <Link
          to="/admin/overdue"
          className={`p-5 rounded-xl border shadow-subtle hover:shadow-card transition-all group ${
            (stats?.overdueLoansCount || 0) > 0
              ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
              : 'bg-white dark:bg-charcoal-100 border-paper-300 dark:border-charcoal-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              Overdue
            </span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              (stats?.overdueLoansCount || 0) > 0
                ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                : 'bg-paper-200 dark:bg-charcoal-50 text-ink-muted'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-serif font-bold text-ink dark:text-paper-100">
            {stats?.overdueLoansCount || 0}
          </div>
          <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
            View report <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Total Admins */}
        <Link
          to="/admin/admins"
          className="p-5 bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 shadow-subtle hover:shadow-card transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              Admins
            </span>
            <div className="w-9 h-9 rounded-lg bg-paper-200 dark:bg-charcoal-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-serif font-bold text-ink dark:text-paper-100">
            {stats?.totalAdmins || 0}
          </div>
          <div className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
            Manage admins <ArrowRight className="w-3 h-3" />
          </div>
        </Link>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-6 bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 shadow-subtle space-y-4">
        <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/checkouts"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors shadow-subtle"
          >
            <Clock className="w-4 h-4" /> Issue Book Checkout
          </Link>

          <Link
            to="/admin/books"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-paper-200 dark:bg-charcoal-50 hover:bg-paper-300 dark:hover:bg-charcoal-300 text-ink dark:text-paper-100 text-sm font-medium transition-colors border border-paper-300 dark:border-charcoal-50"
          >
            <Plus className="w-4 h-4 text-primary" /> Add New Book
          </Link>

          <Link
            to="/admin/authors"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-paper-200 dark:bg-charcoal-50 hover:bg-paper-300 dark:hover:bg-charcoal-300 text-ink dark:text-paper-100 text-sm font-medium transition-colors border border-paper-300 dark:border-charcoal-50"
          >
            <Users className="w-4 h-4 text-primary" /> Manage Authors
          </Link>
        </div>
      </div>

      {/* Overdue Alerts Widget */}
      <div className="p-6 bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Overdue Loans Pending Return
          </h3>
          <Link to="/admin/overdue" className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline">
            View all overdue ({stats?.overdueLoansCount || 0})
          </Link>
        </div>

        {(!stats?.recentOverdueLoans || stats.recentOverdueLoans.length === 0) ? (
          <div className="text-center py-8 text-sm text-ink-muted dark:text-paper-400 flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <p>No overdue books! All borrowed books are currently within their lending period.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentOverdueLoans.map((loan: any) => (
              <div
                key={loan._id}
                className="flex items-center justify-between p-3.5 bg-red-50/60 dark:bg-red-950/20 rounded-lg border border-red-200/60 dark:border-red-900/30 text-xs"
              >
                <div>
                  <div className="font-bold text-ink dark:text-paper-100">
                    {loan.bookId?.title || 'Unknown Book'}
                  </div>
                  <div className="text-ink-muted dark:text-paper-400 mt-0.5">
                    Borrower: <span className="font-medium text-ink dark:text-paper-200">{loan.borrowerName} {loan.borrowerSurname}</span> ({loan.borrowerMobile})
                  </div>
                </div>
                <Link
                  to="/admin/overdue"
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-subtle transition-colors"
                >
                  Process Return
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

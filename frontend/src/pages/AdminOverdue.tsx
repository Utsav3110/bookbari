import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { AlertTriangle, CheckCircle, Phone, RefreshCw } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

interface Loan {
  _id: string;
  bookId?: {
    title: string;
    authorId?: { name: string };
  };
  borrowerName: string;
  borrowerSurname: string;
  borrowerMobile: string;
  issueDate: string;
  dueDate: string;
}

export default function AdminOverdue() {
  const { showToast } = useToast();
  const [overdueLoans, setOverdueLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmReturnLoanId, setConfirmReturnLoanId] = useState<string | null>(null);

  const fetchOverdue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loans/overdue');
      const overdueData = res.data.data !== undefined ? res.data.data : res.data;
      setOverdueLoans(Array.isArray(overdueData) ? overdueData : []);
    } catch (err) {
      console.error('Failed to load overdue report', err);
      showToast('Failed to load overdue report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const handleReturn = (loanId: string) => {
    setConfirmReturnLoanId(loanId);
  };

  const executeReturn = async () => {
    if (!confirmReturnLoanId) return;
    try {
      const res = await api.post(`/loans/${confirmReturnLoanId}/return`);
      showToast(res.data?.message || 'Book copy marked as returned!', 'success');
      fetchOverdue();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to mark returned', 'error');
    } finally {
      setConfirmReturnLoanId(null);
    }
  };

  const getDaysOverdue = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - due.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const sendWhatsAppReminder = (loan: Loan) => {
    const cleanPhone = loan.borrowerMobile.replace(/[^0-9]/g, '');
    const bookTitle = loan.bookId?.title || 'the borrowed book';
    const dueDateFormatted = new Date(loan.dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    const message = encodeURIComponent(
      `Hi ${loan.borrowerName}, this is a gentle reminder from Book Baari. Your borrowed book "${bookTitle}" was due on ${dueDateFormatted}. Please return it at your earliest convenience. Thank you!`
    );
    const targetPhone = cleanPhone.length > 0 ? cleanPhone : import.meta.env.VITE_WHATSAPP_NUMBER;
    const url = `https://wa.me/${targetPhone}?text=${message}`;
    showToast(`Opening WhatsApp reminder for ${loan.borrowerName}...`, 'info');
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-paper-300 dark:border-charcoal-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100">
              Overdue Books Report ({overdueLoans.length})
            </h1>
            <p className="text-sm text-ink-muted dark:text-paper-400 mt-0.5">
              Books past their due date. Send WhatsApp reminders or process returns.
            </p>
          </div>
        </div>

        <button
          onClick={fetchOverdue}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-100 rounded-lg hover:bg-paper-300 dark:hover:bg-charcoal-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : overdueLoans.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 space-y-3">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
          <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">No Overdue Books!</h3>
          <p className="text-sm text-ink-muted dark:text-paper-400 max-w-sm mx-auto">
            All active loans are currently within their lending period.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-charcoal-200 rounded-xl border border-red-200 dark:border-red-900/40 shadow-subtle overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-red-50/60 dark:bg-red-950/20 border-b border-red-200/60 dark:border-red-900/30 text-xs font-semibold uppercase tracking-wider text-red-900 dark:text-red-300">
              <tr>
                <th className="p-4">Book Title</th>
                <th className="p-4">Borrower Contact</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Overdue Duration</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200 dark:divide-charcoal-300">
              {overdueLoans.map((loan) => {
                const days = getDaysOverdue(loan.dueDate);

                return (
                  <tr key={loan._id} className="hover:bg-red-50/20 dark:hover:bg-red-950/10 transition-colors">
                    <td className="p-4">
                      <div className="font-serif font-bold text-ink dark:text-paper-100">
                        {loan.bookId?.title || 'Unknown Title'}
                      </div>
                      <div className="text-xs text-ink-muted dark:text-paper-400">
                        by {loan.bookId?.authorId?.name || 'Unknown Author'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-ink dark:text-paper-100">
                        {loan.borrowerName} {loan.borrowerSurname}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-ink-muted dark:text-paper-400 mt-0.5">
                        <Phone className="w-3 h-3 text-ink-muted" /> {loan.borrowerMobile}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-ink-muted dark:text-paper-400 font-medium">
                      {new Date(loan.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="badge badge-danger text-xs font-bold">
                        {days} {days === 1 ? 'day' : 'days'} overdue
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* WhatsApp Reminder Button */}
                        <button
                          onClick={() => sendWhatsAppReminder(loan)}
                          className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-semibold shadow-subtle transition-colors flex items-center gap-1.5"
                          title="Send WhatsApp Reminder"
                        >
                          <WhatsAppIcon className="w-4 h-4" /> Remind
                        </button>
                        {/* Return Button */}
                        <button
                          onClick={() => handleReturn(loan._id)}
                          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-colors"
                        >
                          Mark Returned
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmReturnLoanId)}
        title="Return Overdue Book"
        message="Are you sure you want to mark this overdue book as returned? This will restock the copy into inventory."
        confirmText="Yes, Mark Returned"
        cancelText="Cancel"
        type="info"
        onConfirm={executeReturn}
        onCancel={() => setConfirmReturnLoanId(null)}
      />
    </div>
  );
}

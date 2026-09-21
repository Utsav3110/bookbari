import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { ShieldCheck, UserPlus, Trash2, CheckCircle, AlertCircle, RefreshCw, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  phone?: string;
  createdAt: string;
}

export default function AdminManageAdmins() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Confirmation state
  const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/admins');
      const adminsData = res.data.data !== undefined ? res.data.data : res.data;
      setAdmins(Array.isArray(adminsData) ? adminsData : []);
    } catch (err) {
      console.error('Failed to load admins', err);
      showToast('Failed to load admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      const msg = 'Name, email, and password are required';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/users/admin', {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim()
      });

      const successText = res.data?.message || `Admin user "${name.trim()}" created successfully!`;
      setSuccessMsg(successText);
      showToast(successText, 'success');
      fetchAdmins();
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1500);
    } catch (err: any) {
      const errorText = err.response?.data?.message || 'Failed to create admin';
      setErrorMsg(errorText);
      showToast(errorText, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (adminId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await api.put(`/users/admin/${adminId}/status`, { status });
      showToast(res.data?.message || 'Admin status updated!', 'success');
      fetchAdmins();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteAdmin = (admin: AdminUser) => {
    if (admin.role === 'SUPER_ADMIN') {
      showToast('Cannot delete Super Admin account.', 'error');
      return;
    }
    setDeletingAdmin(admin);
  };

  const executeDeleteAdmin = async () => {
    if (!deletingAdmin) return;
    try {
      const res = await api.delete(`/users/admin/${deletingAdmin._id}`);
      showToast(res.data?.message || 'Admin deleted successfully', 'success');
      fetchAdmins();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete admin', 'error');
    } finally {
      setDeletingAdmin(null);
    }
  };

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 text-center bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300">
        <ShieldCheck className="w-12 h-12 mx-auto text-red-500 mb-2" />
        <h2 className="font-serif font-bold text-xl text-ink dark:text-paper-100">Super Admin Access Only</h2>
        <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
          Only Super Admins are authorized to view and create admin accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-300 dark:border-charcoal-300">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" /> Admin User Management
          </h1>
          <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
            Super Admin Portal: Create administrator accounts and control access privileges.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-subtle transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Create New Admin
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : admins.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 space-y-3">
          <User className="w-12 h-12 mx-auto text-ink-muted opacity-50" />
          <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">No Administrators Found</h3>
          <p className="text-sm text-ink-muted dark:text-paper-400">
            Create administrator accounts using the button above.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-50 shadow-subtle overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-200/50 dark:bg-charcoal-50/50 border-b border-paper-300 dark:border-charcoal-50 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              <tr>
                <th className="p-4">Administrator Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200 dark:divide-charcoal-50/60">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-paper-100/50 dark:hover:bg-charcoal-50/30 transition-colors">
                  <td className="p-4 font-bold text-ink dark:text-paper-100">
                    {admin.name}
                  </td>
                  <td className="p-4 text-ink-muted dark:text-paper-300 font-medium">
                    {admin.email}
                  </td>
                  <td className="p-4">
                    {admin.role === 'SUPER_ADMIN' ? (
                      <span className="badge badge-warning text-xs font-semibold">Super Admin</span>
                    ) : (
                      <span className="badge badge-success text-xs font-semibold">Admin</span>
                    )}
                  </td>
                  <td className="p-4">
                    {admin.status === 'APPROVED' ? (
                      <span className="badge badge-success text-xs">Approved</span>
                    ) : admin.status === 'PENDING' ? (
                      <span className="badge badge-warning text-xs">Pending Approval</span>
                    ) : (
                      <span className="badge badge-danger text-xs">Rejected</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {admin.role !== 'SUPER_ADMIN' && admin.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(admin._id, 'APPROVED')}
                          className="px-2.5 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-subtle transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {admin.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="p-1.5 rounded-lg text-ink-muted hover:text-red-600 dark:text-paper-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete Admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE ADMIN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-charcoal-100 rounded-2xl shadow-card p-6 border border-paper-300 dark:border-charcoal-50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-charcoal-300">
              <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" /> Create New Admin
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

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="admin@bookbari.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper-100 dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-500 text-ink dark:text-paper-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
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
                  {submitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingAdmin)}
        title="Delete Administrator"
        message={`Are you sure you want to delete administrator "${deletingAdmin?.name}"? This action cannot be undone.`}
        confirmText="Delete Admin"
        cancelText="Cancel"
        type="danger"
        onConfirm={executeDeleteAdmin}
        onCancel={() => setDeletingAdmin(null)}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { updateUserPhoneAction } from '@/app/actions';
import { Phone, CheckCircle, AlertCircle, Edit2, X } from 'lucide-react';

export function UpdatePhoneForm({ currentPhone }: { currentPhone?: string | null }) {
  const [phone, setPhone] = useState(currentPhone || '');
  const [savedPhone, setSavedPhone] = useState(currentPhone || '');
  const [isEditing, setIsEditing] = useState(!currentPhone);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await updateUserPhoneAction(phone);
    setLoading(false);

    if (res.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setSavedPhone(phone);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Phone number updated successfully!' });
    }
  };

  const handleCancel = () => {
    setPhone(savedPhone);
    setIsEditing(false);
    setMessage(null);
  };

  return (
    <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-3 text-left my-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs uppercase tracking-wider">
          <Phone className="w-4 h-4 text-terracotta" />
          <span>Contact Phone Number</span>
        </div>

        {!isEditing && savedPhone && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-charcoal-50 hover:bg-paper-200 dark:hover:bg-charcoal-300 border border-paper-300 dark:border-charcoal-300 rounded-lg text-xs font-semibold text-ink dark:text-paper-100 transition-colors shadow-subtle"
          >
            <Edit2 className="w-3.5 h-3.5 text-primary" /> Change Number
          </button>
        )}
      </div>

      {!isEditing && savedPhone ? (
        /* Read-only view when phone is already saved */
        <div className="p-3 bg-white dark:bg-charcoal-50 rounded-lg border border-paper-300 dark:border-charcoal-300 flex items-center justify-between text-xs">
          <div>
            <span className="text-ink-muted dark:text-paper-400 block text-[10px] uppercase font-semibold">Registered Phone</span>
            <span className="font-bold text-sm text-ink dark:text-paper-100">{savedPhone}</span>
          </div>
          <span className="badge badge-success text-[10px]">Saved</span>
        </div>
      ) : (
        /* Edit form when phone is missing or user clicked Change Number */
        <div className="space-y-2">
          <p className="text-xs text-ink-muted dark:text-paper-400">
            Please provide your contact phone number so library admins can reach you regarding book checkouts.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555-0199 or 9876543210"
              required
              className="flex-1 px-3 py-2 bg-white dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary text-ink dark:text-paper-100"
            />

            {savedPhone && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-2 bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-100 text-xs font-medium rounded-lg hover:bg-paper-300 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-subtle transition-colors shrink-0 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Phone'}
            </button>
          </form>
        </div>
      )}

      {message && (
        <div className={`text-xs flex items-center gap-1.5 ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-charcoal-100 rounded-2xl shadow-card p-6 border border-paper-300 dark:border-charcoal-border space-y-4 relative animate-in fade-in duration-150 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-muted hover:text-ink dark:text-paper-400 hover:bg-paper-100 dark:hover:bg-charcoal-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 pt-1">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              type === 'danger'
                ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                : type === 'warning'
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {type === 'danger' || type === 'warning' ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <HelpCircle className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1 pr-6">
            <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100">{title}</h3>
            <p className="text-sm text-ink-muted dark:text-paper-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-paper-200 dark:border-charcoal-300">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-paper-200 dark:bg-charcoal-50 hover:bg-paper-300 dark:hover:bg-charcoal-100 text-ink dark:text-paper-200 font-semibold text-sm transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl font-semibold text-sm text-white shadow-subtle transition-colors flex items-center gap-2 cursor-pointer ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

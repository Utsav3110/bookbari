import React, { useState } from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Calendar, X, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface WhatsAppRequestButtonProps {
  bookTitle: string;
  bookAuthor: string;
  whatsappNumber?: string;
}

// Utility to format date string (YYYY-MM-DD) into DD/MM/YYYY format
const formatDDMMYYYY = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export function WhatsAppRequestButton({
  bookTitle,
  bookAuthor,
  whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER,
}: WhatsAppRequestButtonProps) {
  const { showToast } = useToast();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Set default pickup date to today in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState<string>(todayStr);

  const setOffsetDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setPickupDate(d.toISOString().split('T')[0]);
  };

  const handleSend = () => {
    if (!pickupDate) return;
    const formattedDDMMYYYY = formatDDMMYYYY(pickupDate);
    const message = encodeURIComponent(
      `Hi Book Baari! I would like to reserve/pick up "${bookTitle}" by ${bookAuthor} on date ${formattedDDMMYYYY} (DD/MM/YYYY). Is it available?`
    );
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    showToast(`Opening WhatsApp request for "${bookTitle}" on ${formattedDDMMYYYY}...`, 'info');
    window.open(url, '_blank');
    setShowDatePicker(false);
  };

  return (
    <div className="w-full">
      {!showDatePicker ? (
        <button
          type="button"
          onClick={() => {
            setPickupDate(todayStr);
            setShowDatePicker(true);
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#128C7E] active:bg-[#075E54] text-white font-semibold text-sm shadow-subtle transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <WhatsAppIcon className="w-4 h-4" /> Request via WhatsApp
        </button>
      ) : (
        <div className="p-4 bg-paper-100 dark:bg-charcoal-100 rounded-xl border border-paper-300 dark:border-charcoal-border shadow-card space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-paper-200 dark:border-charcoal-50">
            <label className="block text-xs font-bold text-ink dark:text-paper-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> Select Pickup Date
            </label>
            <button
              onClick={() => setShowDatePicker(false)}
              className="p-1 rounded-md text-ink-muted hover:text-ink dark:text-paper-400 hover:bg-paper-200 dark:hover:bg-charcoal-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setOffsetDate(0)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors shrink-0 ${pickupDate === todayStr
                  ? 'bg-primary text-white'
                  : 'bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-300 hover:bg-paper-300'
                }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setOffsetDate(1)}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-300 hover:bg-paper-300 transition-colors shrink-0"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setOffsetDate(3)}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-300 hover:bg-paper-300 transition-colors shrink-0"
            >
              +3 Days
            </button>
            <button
              type="button"
              onClick={() => setOffsetDate(7)}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-300 hover:bg-paper-300 transition-colors shrink-0"
            >
              +7 Days
            </button>
          </div>

          {/* HTML Calendar Input */}
          <div className="space-y-1">
            <input
              type="date"
              min={todayStr}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-charcoal-300 border border-paper-300 dark:border-charcoal-border text-ink dark:text-paper-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
            {pickupDate && (
              <div className="text-[11px] font-bold text-primary dark:text-primary-light flex items-center justify-between px-1">
                <span>Selected Pickup Date:</span>
                <span className="font-mono text-xs underline decoration-primary/40">{formatDDMMYYYY(pickupDate)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowDatePicker(false)}
              className="flex-1 py-2 rounded-lg bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-100 text-xs font-semibold hover:bg-paper-300 dark:hover:bg-charcoal-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!pickupDate}
              onClick={handleSend}
              className={`flex-1 py-2 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${pickupDate
                  ? 'bg-[#25D366] hover:bg-[#128C7E] shadow-subtle cursor-pointer'
                  : 'bg-[#25D366]/50 cursor-not-allowed'
                }`}
            >
              <WhatsAppIcon className="w-4 h-4" /> Send Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

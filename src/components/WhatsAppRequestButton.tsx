'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { WhatsAppIcon } from './WhatsAppIcon';

interface WhatsAppRequestButtonProps {
  bookTitle: string;
  bookAuthor: string;
  whatsappNumber: string | undefined;
}

export function WhatsAppRequestButton({ bookTitle, bookAuthor, whatsappNumber }: WhatsAppRequestButtonProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined);
  
  if (!whatsappNumber) return null;

  // Format today's date for the min attribute of the date picker
  const today = new Date().toISOString().split('T')[0];

  let url = '#';
  if (pickupDate) {
    const formattedDate = pickupDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const message = encodeURIComponent(`Hi! I would like to pick up "${bookTitle}" by ${bookAuthor} on ${formattedDate}. Is it available?`);
    url = `https://wa.me/${whatsappNumber}?text=${message}`;
  }

  return (
    <div className="mt-6 w-full text-left">
      {!showDatePicker ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setShowDatePicker(true);
          }}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-dark text-white font-semibold shadow-subtle transition-colors flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
        >
          <WhatsAppIcon className="w-5 h-5" /> I want this book
        </button>
      ) : (
        <div className="p-4 bg-paper-100 dark:bg-charcoal-300 rounded-xl border border-paper-300 dark:border-charcoal-50 shadow-subtle space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink dark:text-paper-100 mb-2">
              When will you pick this up?
            </label>
            <div className="flex justify-center bg-white dark:bg-charcoal-200 border border-paper-300 dark:border-charcoal-300 rounded-lg p-2">
              <DayPicker
                mode="single"
                selected={pickupDate}
                onSelect={setPickupDate}
                disabled={{ before: new Date() }}
                className="text-ink dark:text-paper-100"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowDatePicker(false);
                setPickupDate(undefined);
              }}
              className="flex-1 py-2 rounded-lg bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-100 text-sm font-medium hover:bg-paper-300 dark:hover:bg-charcoal-100 transition-colors cursor-pointer touch-manipulation"
            >
              Cancel
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                pickupDate ? 'bg-[#25D366] hover:bg-[#128C7E] shadow-subtle' : 'bg-[#25D366]/50 cursor-not-allowed pointer-events-none'
              }`}
              onClick={(e) => {
                if (!pickupDate) e.preventDefault();
              }}
            >
              <WhatsAppIcon className="w-5 h-5" /> Send Request
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

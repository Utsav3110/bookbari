import React from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';

export function FloatingWhatsApp() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const message = encodeURIComponent('Hi Book Baari, I have a question about books or borrowing.');
  const url = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
      aria-label="Contact us on WhatsApp"
      title="Contact Book Baari on WhatsApp"
    >
      <WhatsAppIcon className="w-6 h-6 group-hover:rotate-6 transition-transform" />
    </a>
  );
}

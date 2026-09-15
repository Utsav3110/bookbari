import { WhatsAppIcon } from './WhatsAppIcon';

export function FloatingWhatsApp() {
  const whatsappNumber = process.env.WHATSAPP_NUMBER;
  
  if (!whatsappNumber) {
    return null;
  }

  const message = encodeURIComponent('Hi, I need help with Bookbari');
  const url = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#25D366] text-white shadow-[0_4px_12px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_16px_rgba(37,211,102,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center group"
      aria-label="Contact us on WhatsApp"
      title="Contact us on WhatsApp"
    >
      <WhatsAppIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
    </a>
  );
}

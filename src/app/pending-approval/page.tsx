import { getCurrentDbUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Clock } from 'lucide-react';
import { UpdatePhoneForm } from '@/components/UpdatePhoneForm';

export default async function PendingApprovalPage() {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  if (dbUser.status === 'APPROVED') {
    redirect('/books');
  }

  if (dbUser.status === 'REJECTED') {
    redirect('/request-declined');
  }

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-card text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-paper-200 dark:bg-charcoal-50 flex items-center justify-center text-terracotta">
        <Clock className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-serif font-bold text-ink dark:text-paper-100 mb-2">
        Awaiting Admin Approval
      </h1>
      <p className="text-sm text-ink-muted dark:text-paper-400 mb-6 leading-relaxed">
        Welcome to <strong className="text-ink dark:text-paper-100">Bookbari</strong>! Your account registration is currently pending review by an administrator.
      </p>

      {/* Phone Number Input Prompt if Phone is Missing */}
      <UpdatePhoneForm currentPhone={dbUser.phone} />

      <div className="p-4 bg-paper-100 dark:bg-charcoal-300 rounded-lg text-left text-xs text-ink-muted dark:text-paper-400 my-6 space-y-1 border border-paper-300 dark:border-charcoal-50">
        <div><strong>Name:</strong> {dbUser.name}</div>
        <div><strong>Email:</strong> {dbUser.email}</div>
        <div><strong>Phone:</strong> {dbUser.phone || <span className="text-amber-600 dark:text-amber-400 font-semibold">Not provided yet</span>}</div>
      </div>

      <p className="text-xs text-ink-muted dark:text-paper-400 italic">
        Once an admin approves your request, refresh this page to start browsing the catalog.
      </p>
    </div>
  );
}

import { getCurrentDbUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function RequestDeclinedPage() {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  if (dbUser.status === 'APPROVED') {
    redirect('/books');
  }

  if (dbUser.status === 'PENDING') {
    redirect('/pending-approval');
  }

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-card text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
        <XCircle className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-serif font-bold text-ink dark:text-paper-100 mb-2">
        Access Request Declined
      </h1>
      <p className="text-sm text-ink-muted dark:text-paper-400 mb-6 leading-relaxed">
        Your request for access to the Bookbari library system was not approved by an administrator at this time.
      </p>

      <div className="p-4 bg-paper-100 dark:bg-charcoal-300 rounded-lg text-left text-xs text-ink-muted dark:text-paper-400 mb-6 space-y-1 border border-paper-300 dark:border-charcoal-50">
        <div><strong>Name:</strong> {dbUser.name}</div>
        <div><strong>Email:</strong> {dbUser.email}</div>
      </div>

      <p className="text-xs text-ink-muted dark:text-paper-400">
        If you believe this is an error, please contact the library manager directly.
      </p>
    </div>
  );
}

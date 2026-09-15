import type { Metadata } from 'next';
import { ClerkProvider, UserButton } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Sidebar } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { getCurrentDbUser } from '@/lib/auth';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bookbari — Library Lending Tracker',
  description: 'Track in-house book lending: who has which book, due dates, and overdue items.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbUser = await getCurrentDbUser();
  const showSidebar = dbUser?.status === 'APPROVED';
  const isAdmin = dbUser?.role === 'ADMIN' || dbUser?.role === 'SUPER_ADMIN';

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-paper-100 dark:bg-charcoal-200 text-ink dark:text-paper-100 font-sans antialiased">
          <ThemeProvider>
            {showSidebar ? (
              // Authenticated Approved User Layout with Sidebar
              <div className="min-h-screen flex flex-col lg:flex-row">
                <Sidebar userRole={dbUser.role} userStatus={dbUser.status} />
                <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full">
                  <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                  </main>
                  <footer className="border-t border-paper-300 dark:border-charcoal-300 py-4 text-center text-xs text-ink-muted dark:text-paper-400">
                    <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
                      <div className="font-serif font-semibold text-ink dark:text-paper-100">
                        Bookbari
                      </div>
                      <div>© {new Date().getFullYear()} Bookbari Library</div>
                    </div>
                  </footer>
                </div>
              </div>
            ) : (
              // Public / Unauthenticated / Pending User Full-Width Layout (No Sidebar)
              <div className="min-h-screen flex flex-col justify-between">
                <header className="sticky top-0 z-40 w-full border-b border-paper-300 dark:border-charcoal-300 bg-paper-100/90 dark:bg-charcoal-200/90 backdrop-blur-md">
                  <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 sm:gap-2.5 text-ink dark:text-paper-100 font-bold text-lg sm:text-xl tracking-tight shrink-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-subtle">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="font-serif hidden sm:inline">Bookbari</span>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <ThemeToggle />
                      {isAdmin ? (
                        <UserButton />
                      ) : (
                        <Link href="/admin" className="text-xs text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 transition-colors px-2 py-1">
                          Admin Login
                        </Link>
                      )}
                    </div>
                  </div>
                </header>

                <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
                  {children}
                </main>

                <footer className="border-t border-paper-300 dark:border-charcoal-300 py-6 text-center text-xs text-ink-muted dark:text-paper-400">
                  <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
                    <div className="font-serif font-semibold text-ink dark:text-paper-100">
                      Bookbari
                    </div>
                    <div>© {new Date().getFullYear()} Bookbari Library</div>
                  </div>
                </footer>
              </div>
            )}
            <FloatingWhatsApp />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

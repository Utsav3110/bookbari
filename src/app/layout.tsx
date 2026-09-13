import type { Metadata } from 'next';
import { ClerkProvider, SignInButton, UserButton } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Sidebar } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
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
  const userId = dbUser?.clerkId ?? null;
  const showSidebar = dbUser?.status === 'APPROVED';

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
                  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 text-ink dark:text-paper-100 font-bold text-xl tracking-tight">
                      <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-subtle">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="font-serif">Bookbari</span>
                    </Link>

                    <div className="flex items-center gap-3">
                      <ThemeToggle />
                      {userId || dbUser ? (
                        <UserButton />
                      ) : (
                        <SignInButton mode="modal">
                          <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-colors">
                            Sign In
                          </button>
                        </SignInButton>
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
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '../context/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const showSidebar = user?.status === 'APPROVED';

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-paper-100 dark:bg-charcoal-200 text-ink dark:text-paper-100 font-sans antialiased">
        {showSidebar ? (
          // Authenticated Approved User Layout with Sidebar
          <div className="min-h-screen flex flex-col lg:flex-row">
            <Sidebar />
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full">
              <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
              <footer className="border-t border-paper-300 dark:border-charcoal-300 py-4 text-center text-xs text-ink-muted dark:text-paper-400">
                <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
                  <div className="font-serif font-semibold text-ink dark:text-paper-100">
                    Book Baari
                  </div>
                  <div>© {new Date().getFullYear()} Book Baari Library</div>
                </div>
              </footer>
            </div>
          </div>
        ) : (
          // Public / Unauthenticated / Pending User Full-Width Layout (No Sidebar)
          <div className="min-h-screen flex flex-col justify-between">
            <Navbar />
            
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
              {children}
            </main>

            <footer className="border-t border-paper-300 dark:border-charcoal-300 py-6 text-center text-xs text-ink-muted dark:text-paper-400">
              <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
                <div className="font-serif font-semibold text-ink dark:text-paper-100">
                  Book Baari
                </div>
                <div>© {new Date().getFullYear()} Book Baari Library</div>
              </div>
            </footer>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

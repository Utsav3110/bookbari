import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { BookOpen, Library, Clock, AlertTriangle, ShieldCheck, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  
  const isApproved = user?.status === 'APPROVED';
  const isAdmin = isApproved && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN');
  const isSuperAdmin = isApproved && user?.role === 'SUPER_ADMIN';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userNavLinks = [
    { href: '/', label: 'Catalog', icon: BookOpen },
  ];

  const adminNavLinks = isAdmin
    ? [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/books', label: 'Books', icon: Library },
        { href: '/admin/loans', label: 'Lending', icon: Clock },
        { href: '/admin/overdue', label: 'Overdue Report', icon: AlertTriangle },
      ]
    : [];

  if (isSuperAdmin) {
    adminNavLinks.push({ href: '/admin/admins', label: 'Admins', icon: ShieldCheck });
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-paper-300 dark:border-charcoal-300 bg-paper-100/90 dark:bg-charcoal-200/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4 md:gap-8 shrink-0">
            <Link to="/" className="flex items-center gap-2 md:gap-2.5 text-ink dark:text-paper-100 font-bold text-lg md:text-xl tracking-tight hover:opacity-90">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-primary text-white flex items-center justify-center shadow-subtle shrink-0">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className="font-serif hidden sm:inline">Bookbaari</span>
            </Link>

            {/* Desktop User Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {userNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-paper-200 dark:bg-charcoal-50 text-primary dark:text-primary-dark font-semibold'
                        : 'text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 hover:bg-paper-200/50 dark:hover:bg-charcoal-50/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Admin Navigation & User Action Controls */}
          <div className="hidden md:flex items-center gap-4">
            {isAdmin && (
              <div className="flex items-center gap-1 pl-4 border-l border-paper-300 dark:border-charcoal-300">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400 mr-1">
                  Admin:
                </span>
                {adminNavLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        active
                          ? 'bg-primary text-white font-semibold shadow-subtle'
                          : 'text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 hover:bg-paper-200/60 dark:hover:bg-charcoal-50/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}

            <ThemeToggle />

            {isAdmin ? (
              <button onClick={handleLogout} className="text-xs text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 transition-colors bg-paper-200 dark:bg-charcoal-50 px-2 py-1 rounded-md">
                Logout
              </button>
            ) : (
              <Link to="/login" className="text-xs text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            {isAdmin && (
              <button onClick={handleLogout} className="text-xs text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 transition-colors bg-paper-200 dark:bg-charcoal-50 px-2 py-1 rounded-md">
                Logout
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-ink-muted dark:text-paper-400 hover:text-ink dark:hover:text-paper-100 hover:bg-paper-200 dark:hover:bg-charcoal-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-paper-300 dark:border-charcoal-300 bg-paper-100 dark:bg-charcoal-200 px-4 pt-2 pb-4 space-y-2">
          {userNavLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.href)
                    ? 'bg-paper-200 dark:bg-charcoal-50 text-primary dark:text-primary-dark font-semibold'
                    : 'text-ink dark:text-paper-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}

          {isAdmin && (
            <div className="pt-2 border-t border-paper-300 dark:border-charcoal-300">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
                Admin Panel
              </div>
              {adminNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
                      isActive(link.href)
                        ? 'bg-primary text-white font-semibold'
                        : 'text-ink dark:text-paper-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {!isAdmin && (
            <div className="pt-2">
              <Link to="/login" className="block text-center w-full py-2.5 rounded-md bg-paper-200 dark:bg-charcoal-50 text-ink dark:text-paper-100 text-sm font-medium">
                Admin Login
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

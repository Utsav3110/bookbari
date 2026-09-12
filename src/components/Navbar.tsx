'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser, SignInButton } from '@clerk/nextjs';
import { ThemeToggle } from './ThemeToggle';
import { BookOpen, Library, Users, Clock, AlertTriangle, ShieldCheck, Menu, X, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { Role, UserStatus } from '@prisma/client';

interface NavbarProps {
  userRole?: Role | null;
  userStatus?: UserStatus | null;
}

export function Navbar({ userRole, userStatus }: NavbarProps) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isApproved = userStatus === 'APPROVED';
  const isAdmin = isApproved && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN');
  const isSuperAdmin = isApproved && userRole === 'SUPER_ADMIN';

  const userNavLinks = isApproved
    ? [
        { href: '/books', label: 'Catalog', icon: BookOpen },
        { href: '/my-loans', label: 'My Loans', icon: Clock },
      ]
    : [];

  const adminNavLinks = isAdmin
    ? [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/books', label: 'Books', icon: Library },
        { href: '/admin/loans', label: 'Lending', icon: Clock },
        { href: '/admin/overdue', label: 'Overdue', icon: AlertTriangle },
        { href: '/admin/users', label: 'Users', icon: Users },
      ]
    : [];

  if (isSuperAdmin) {
    adminNavLinks.push({ href: '/admin/admins', label: 'Admins', icon: ShieldCheck });
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-paper-300 dark:border-charcoal-300 bg-paper-100/90 dark:bg-charcoal-200/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href={isApproved ? '/books' : '/'} className="flex items-center gap-2.5 text-ink dark:text-paper-100 font-bold text-xl tracking-tight hover:opacity-90">
              <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center shadow-subtle">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-serif">Bookbari</span>
            </Link>

            {/* Desktop User Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {userNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
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
                      href={link.href}
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

            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors shadow-subtle">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            {isSignedIn && <UserButton />}
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
                href={link.href}
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
                    href={link.href}
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

          {!isSignedIn && (
            <div className="pt-2">
              <SignInButton mode="modal">
                <button className="w-full py-2.5 rounded-md bg-primary hover:bg-primary-hover text-white text-base font-medium">
                  Sign In
                </button>
              </SignInButton>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

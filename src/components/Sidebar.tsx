'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { ThemeToggle } from './ThemeToggle';
import {
  BookOpen,
  Library,
  Users,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Role, UserStatus } from '@prisma/client';

interface SidebarProps {
  userRole?: Role | null;
  userStatus?: UserStatus | null;
}

export function Sidebar({ userRole, userStatus }: SidebarProps) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isApproved = userStatus === 'APPROVED';
  // Strictly enforce admin privileges
  const isAdmin = isApproved && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN');
  const isSuperAdmin = isApproved && userRole === 'SUPER_ADMIN';

  const userNavLinks = [
    { href: '/books', label: 'Catalog', icon: BookOpen },
  ];

  const adminNavLinks = isAdmin
    ? [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/books', label: 'Book Inventory', icon: Library },
        { href: '/admin/checkouts', label: 'Issued Checkouts', icon: Clock },
        { href: '/admin/overdue', label: 'Overdue Report', icon: AlertTriangle },
      ]
    : [];

  if (isSuperAdmin) {
    adminNavLinks.push({ href: '/admin/admins', label: 'Manage Admins', icon: ShieldCheck });
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden sticky top-0 z-40 w-full flex items-center justify-between px-4 h-16 bg-paper-100/90 dark:bg-charcoal-200/90 backdrop-blur-md border-b border-paper-300 dark:border-charcoal-300">
        <Link href="/books" className="flex items-center gap-2.5 text-ink dark:text-paper-100 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-subtle">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-serif">Bookbari</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isSignedIn && <UserButton />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-ink-muted dark:text-paper-400 hover:text-ink dark:hover:text-paper-100 hover:bg-paper-200 dark:hover:bg-charcoal-50"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
        />
      )}

      {/* Desktop Fixed Sidebar & Mobile Drawer Drawer Content */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-paper-100 dark:bg-charcoal-200 border-r border-paper-300 dark:border-charcoal-300 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6 space-y-8">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/books"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-ink dark:text-paper-100 font-bold text-xl tracking-tight"
            >
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-card">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif block leading-none">Bookbari</span>
                <span className="text-[10px] font-normal text-ink-muted dark:text-paper-400 uppercase tracking-widest">
                  Library System
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-ink-muted hover:text-ink dark:text-paper-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Role Badge */}
          {isSignedIn && isApproved && (
            <div className="px-3 py-2 bg-paper-200/80 dark:bg-charcoal-50 rounded-lg text-xs flex items-center justify-between border border-paper-300/50 dark:border-charcoal-300">
              <span className="text-ink-muted dark:text-paper-400">Account Access</span>
              {userRole === 'SUPER_ADMIN' ? (
                <span className="badge badge-warning text-[10px]">Super Admin</span>
              ) : userRole === 'ADMIN' ? (
                <span className="badge badge-success text-[10px]">Admin</span>
              ) : (
                <span className="badge badge-neutral text-[10px]">Member</span>
              )}
            </div>
          )}

          {/* Main User Navigation Links */}
          {userNavLinks.length > 0 && (
            <nav className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-2">
                Library
              </div>
              {userNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary text-white font-semibold shadow-subtle'
                        : 'text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 hover:bg-paper-200 dark:hover:bg-charcoal-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </div>
                    {active && <ChevronRight className="w-4 h-4 opacity-70" />}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Admin Navigation Links — STRICTLY HIDDEN for Regular Users */}
          {isAdmin && adminNavLinks.length > 0 && (
            <nav className="space-y-1 pt-4 border-t border-paper-300 dark:border-charcoal-300">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-paper-400 mb-2">
                Administration
              </div>
              {adminNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary text-white font-semibold shadow-subtle'
                        : 'text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 hover:bg-paper-200 dark:hover:bg-charcoal-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </div>
                    {active && <ChevronRight className="w-4 h-4 opacity-70" />}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Sidebar Footer — Controls & Auth */}
        <div className="p-4 border-t border-paper-300 dark:border-charcoal-300 space-y-4 bg-paper-100/50 dark:bg-charcoal-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted dark:text-paper-400 font-medium">Appearance</span>
            <ThemeToggle />
          </div>

          <div className="pt-2 border-t border-paper-200 dark:border-charcoal-300 flex items-center justify-between">
            {isAdmin ? (
              <div className="flex items-center gap-3 w-full justify-between">
                <span className="text-xs text-ink dark:text-paper-100 font-medium">Account</span>
                <UserButton />
              </div>
            ) : (
              <Link href="/admin" className="w-full text-center py-2 text-[10px] text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 transition-colors">
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

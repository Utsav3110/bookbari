import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { BookOpen, Library, Clock, AlertTriangle, ShieldCheck, Menu, X, LayoutDashboard, ChevronRight, Users, Tag, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  
  const isApproved = user?.status === 'APPROVED';
  const isAdmin = isApproved && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN');
  const isSuperAdmin = isApproved && user?.role === 'SUPER_ADMIN';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userNavLinks = [
    { href: '/', label: 'Catalog', icon: BookOpen },
  ];

  const adminSections = isAdmin
    ? [
        {
          title: 'Main Dashboard',
          key: 'dashboard',
          links: [
            { href: '/admin', label: 'Overview', icon: LayoutDashboard },
          ],
        },
        {
          title: 'Catalog & Content',
          key: 'catalog',
          links: [
            { href: '/admin/books', label: 'Book Inventory', icon: Library },
            { href: '/admin/authors', label: 'Authors', icon: Users },
            { href: '/admin/genres', label: 'Genres & Categories', icon: Tag },
            { href: '/admin/languages', label: 'Languages', icon: Globe },
          ],
        },
        {
          title: 'Circulation',
          key: 'circulation',
          links: [
            { href: '/admin/checkouts', label: 'Issued Checkouts', icon: Clock },
            { href: '/admin/overdue', label: 'Overdue Report', icon: AlertTriangle },
          ],
        },
      ]
    : [];

  if (isAdmin && isSuperAdmin) {
    adminSections.push({
      title: 'System & Security',
      key: 'system',
      links: [
        { href: '/admin/admins', label: 'Manage Admins', icon: ShieldCheck },
      ],
    });
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
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden sticky top-0 z-40 w-full flex items-center justify-between px-4 h-16 bg-paper-100/90 dark:bg-charcoal-200/90 backdrop-blur-md border-b border-paper-300 dark:border-charcoal-300">
        <Link to="/" className="flex items-center gap-2.5 text-ink dark:text-paper-100 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-subtle">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-serif">Bookbaari</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && (
            <button onClick={handleLogout} className="text-xs text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 transition-colors bg-paper-200 dark:bg-charcoal-50 px-2 py-1 rounded-md">
              Logout
            </button>
          )}
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
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-paper-100 dark:bg-charcoal-200 border-r border-paper-300 dark:border-charcoal-border flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-ink dark:text-paper-100 font-bold text-xl tracking-tight"
            >
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-card">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif block leading-none">Bookbaari</span>
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
          {user && isApproved && (
            <div className="px-3 py-2 bg-paper-200/80 dark:bg-charcoal-100 rounded-xl text-xs flex items-center justify-between border border-paper-300/60 dark:border-charcoal-border">
              <span className="text-ink-muted dark:text-paper-400 font-medium">Account Access</span>
              {user?.role === 'SUPER_ADMIN' ? (
                <span className="badge badge-warning text-[10px]">Super Admin</span>
              ) : user?.role === 'ADMIN' ? (
                <span className="badge badge-success text-[10px]">Admin</span>
              ) : (
                <span className="badge badge-neutral text-[10px]">Member</span>
              )}
            </div>
          )}

          {/* Main User Navigation Links */}
          {userNavLinks.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-ink-muted/80 dark:text-paper-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                <span>Public Portal</span>
              </div>
              <div className="p-1 rounded-xl bg-paper-200/50 dark:bg-charcoal-100/50 border border-paper-300/40 dark:border-charcoal-border/50">
                {userNavLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-primary text-white font-semibold shadow-subtle'
                          : 'text-ink-muted hover:text-ink dark:text-paper-300 dark:hover:text-paper-100 hover:bg-paper-200/80 dark:hover:bg-charcoal-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-primary'}`} />
                        <span>{link.label}</span>
                      </div>
                      {active && <ChevronRight className="w-4 h-4 opacity-80" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin Navigation Sections — STRICTLY HIDDEN for Regular Users */}
          {isAdmin && adminSections.map((section) => (
            <div key={section.key} className="space-y-1.5">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-ink-muted/80 dark:text-paper-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0"></span>
                <span>{section.title}</span>
              </div>
              <div className="p-1 rounded-xl bg-paper-200/50 dark:bg-charcoal-100/50 border border-paper-300/40 dark:border-charcoal-border/50 space-y-0.5">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-primary text-white font-semibold shadow-subtle'
                          : 'text-ink-muted hover:text-ink dark:text-paper-300 dark:hover:text-paper-100 hover:bg-paper-200/80 dark:hover:bg-charcoal-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-primary/80 dark:text-primary-light/80'}`} />
                        <span>{link.label}</span>
                      </div>
                      {active && <ChevronRight className="w-4 h-4 opacity-80" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
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
                <button onClick={handleLogout} className="text-xs text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 transition-colors bg-paper-200 dark:bg-charcoal-50 px-2 py-1 rounded-md">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="w-full text-center py-2 text-[10px] text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 transition-colors">
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

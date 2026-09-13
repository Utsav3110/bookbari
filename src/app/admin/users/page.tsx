import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { UserStatus, Role } from '@prisma/client';
import { approveUserAction, rejectUserAction } from '@/app/actions';
import { SearchInput } from '@/components/SearchInput';
import { Check, X, Users, Search, UserCheck, ShieldAlert } from 'lucide-react';

interface AdminUsersPageProps {
  searchParams: {
    q?: string;
  };
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const currentAdmin = await requireAdmin();

  const query = searchParams.q || '';

  const whereCondition: any = {};
  if (query) {
    whereCondition.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ];
  }

  // Fetch pending, approved, and rejected users in parallel
  const [pendingUsers, approvedUsers, rejectedUsers] = await Promise.all([
    prisma.user.findMany({
      where: {
        ...whereCondition,
        status: UserStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: {
        ...whereCondition,
        status: UserStatus.APPROVED,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: {
        ...whereCondition,
        status: UserStatus.REJECTED,
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-paper-300 dark:border-charcoal-300">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100">
            User Management
          </h1>
          <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
            Approve pending member registrations and manage account status.
          </p>
        </div>

        {/* Live Search */}
        <SearchInput defaultValue={query} placeholder="Search users by name or email..." className="w-full md:w-72" />
      </div>

      {/* Section 1: Pending Approvals */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-terracotta" />
          <h2 className="font-serif font-bold text-xl text-ink dark:text-paper-100">
            Pending Approvals ({pendingUsers.length})
          </h2>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="p-6 bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 text-center text-sm text-ink-muted dark:text-paper-400">
            No pending user requests at this time.
          </div>
        ) : (
          <div className="bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-100 dark:bg-charcoal-50 border-b border-paper-300 dark:border-charcoal-300 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Requested On</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200 dark:divide-charcoal-300">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-paper-100/50 dark:hover:bg-charcoal-50/50 transition-colors">
                    <td className="p-4 font-semibold text-ink dark:text-paper-100">{user.name}</td>
                    <td className="p-4 text-ink-muted dark:text-paper-400">{user.email}</td>
                    <td className="p-4">
                      {user.phone ? (
                        <span className="text-ink-muted dark:text-paper-400">{user.phone}</span>
                      ) : (
                        <span className="badge badge-warning text-[10px]">⚠️ Missing Phone</span>
                      )}
                    </td>
                    <td className="p-4 text-ink-muted dark:text-paper-400">{formatDate(user.createdAt)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <form action={async () => {
                          'use server';
                          await approveUserAction(user.id);
                        }}>
                          <button
                            type="submit"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                        </form>

                        <form action={async () => {
                          'use server';
                          await rejectUserAction(user.id);
                        }}>
                          <button
                            type="submit"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Approved Members */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-serif font-bold text-xl text-ink dark:text-paper-100">
            Approved Members ({approvedUsers.length})
          </h2>
        </div>

        <div className="bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-100 dark:bg-charcoal-50 border-b border-paper-300 dark:border-charcoal-300 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined On</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200 dark:divide-charcoal-300">
              {approvedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-paper-100/50 dark:hover:bg-charcoal-50/50 transition-colors">
                  <td className="p-4 font-semibold text-ink dark:text-paper-100">{user.name}</td>
                  <td className="p-4 text-ink-muted dark:text-paper-400">{user.email}</td>
                  <td className="p-4 text-ink-muted dark:text-paper-400">{user.phone || 'N/A'}</td>
                  <td className="p-4">
                    {user.role === Role.SUPER_ADMIN ? (
                      <span className="badge badge-warning">Super Admin</span>
                    ) : user.role === Role.ADMIN ? (
                      <span className="badge badge-success">Admin</span>
                    ) : (
                      <span className="badge badge-neutral">User</span>
                    )}
                  </td>
                  <td className="p-4 text-ink-muted dark:text-paper-400">{formatDate(user.createdAt)}</td>
                  <td className="p-4 text-right">
                    {user.role === Role.USER && (
                      <form action={async () => {
                        'use server';
                        await rejectUserAction(user.id);
                      }}>
                        <button
                          type="submit"
                          className="px-2.5 py-1 rounded text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          Revoke Access
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Rejected Accounts */}
      {rejectedUsers.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-paper-300 dark:border-charcoal-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h2 className="font-serif font-bold text-xl text-ink dark:text-paper-100">
              Rejected Requests ({rejectedUsers.length})
            </h2>
          </div>

          <div className="bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-100 dark:bg-charcoal-50 border-b border-paper-300 dark:border-charcoal-300 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Rejected On</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200 dark:divide-charcoal-300">
                {rejectedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-paper-100/50 dark:hover:bg-charcoal-50/50">
                    <td className="p-4 font-semibold text-ink dark:text-paper-100">{user.name}</td>
                    <td className="p-4 text-ink-muted dark:text-paper-400">{user.email}</td>
                    <td className="p-4 text-ink-muted dark:text-paper-400">{formatDate(user.updatedAt)}</td>
                    <td className="p-4 text-right">
                      <form action={async () => {
                        'use server';
                        await approveUserAction(user.id);
                      }}>
                        <button
                          type="submit"
                          className="px-2.5 py-1 rounded text-xs text-primary font-medium hover:bg-primary-light dark:hover:bg-primary/10 transition-colors"
                        >
                          Re-Approve
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

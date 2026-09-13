import { requireSuperAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { promoteToAdminAction, demoteToUserAction } from '@/app/actions';
import { ShieldCheck, UserPlus, UserMinus, Shield } from 'lucide-react';
import { Role, UserStatus } from '@prisma/client';

export default async function AdminAdminsPage() {
  const currentSuperAdmin = await requireSuperAdmin();

  // Fetch all admin level users and approved regular users eligible for promotion in parallel
  const [adminUsers, promotableUsers] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: { in: [Role.ADMIN, Role.SUPER_ADMIN] },
      },
      orderBy: { role: 'desc' },
    }),
    prisma.user.findMany({
      where: {
        role: Role.USER,
        status: UserStatus.APPROVED,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-paper-300 dark:border-charcoal-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-ink dark:text-paper-100">
              Super Admin — Admin Management
            </h1>
            <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">
              Promote approved members to Library Admins or demote existing Admins.
            </p>
          </div>
        </div>
      </div>

      {/* Current Admins Table */}
      <div className="space-y-4">
        <h2 className="font-serif font-bold text-xl text-ink dark:text-paper-100">
          Current Administrators ({adminUsers.length})
        </h2>

        <div className="bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-100 dark:bg-charcoal-50 border-b border-paper-300 dark:border-charcoal-300 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined On</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200 dark:divide-charcoal-300">
              {adminUsers.map((user) => (
                <tr key={user.id} className="hover:bg-paper-100/50 dark:hover:bg-charcoal-50/50">
                  <td className="p-4 font-semibold text-ink dark:text-paper-100">{user.name}</td>
                  <td className="p-4 text-ink-muted dark:text-paper-400">{user.email}</td>
                  <td className="p-4">
                    {user.role === Role.SUPER_ADMIN ? (
                      <span className="badge badge-warning">Super Admin</span>
                    ) : (
                      <span className="badge badge-success">Admin</span>
                    )}
                  </td>
                  <td className="p-4 text-ink-muted dark:text-paper-400">{formatDate(user.createdAt)}</td>
                  <td className="p-4 text-right">
                    {user.role === Role.ADMIN && (
                      <form action={async () => {
                        'use server';
                        await demoteToUserAction(user.id);
                      }}>
                        <button
                          type="submit"
                          className="flex items-center gap-1 ml-auto px-3 py-1.5 rounded-lg bg-paper-200 dark:bg-charcoal-50 hover:bg-paper-300 dark:hover:bg-charcoal-300 text-ink dark:text-paper-100 text-xs font-medium transition-colors"
                        >
                          <UserMinus className="w-3.5 h-3.5" /> Demote to User
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

      {/* Promote Approved User Section */}
      <div className="space-y-4 pt-4 border-t border-paper-300 dark:border-charcoal-300">
        <h2 className="font-serif font-bold text-xl text-ink dark:text-paper-100">
          Promote Member to Admin ({promotableUsers.length} available)
        </h2>

        {promotableUsers.length === 0 ? (
          <p className="text-sm text-ink-muted dark:text-paper-400">
            No approved regular users available for promotion right now.
          </p>
        ) : (
          <div className="bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 shadow-subtle overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-100 dark:bg-charcoal-50 border-b border-paper-300 dark:border-charcoal-300 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-paper-400">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200 dark:divide-charcoal-300">
                {promotableUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-paper-100/50 dark:hover:bg-charcoal-50/50">
                    <td className="p-4 font-semibold text-ink dark:text-paper-100">{user.name}</td>
                    <td className="p-4 text-ink-muted dark:text-paper-400">{user.email}</td>
                    <td className="p-4"><span className="badge badge-success">Approved</span></td>
                    <td className="p-4 text-right">
                      <form action={async () => {
                        'use server';
                        await promoteToAdminAction(user.id);
                      }}>
                        <button
                          type="submit"
                          className="flex items-center gap-1 ml-auto px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Promote to Admin
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

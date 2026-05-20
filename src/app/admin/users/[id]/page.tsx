import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';
import { getUserStats, getRecentConversions } from '@/lib/stats';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ConversionTable } from '@/components/dashboard/ConversionTable';
import { UserControls } from '@/components/admin/UserControls';

export const dynamic = 'force-dynamic';

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const [stats, recent] = await Promise.all([
    getUserStats(id),
    getRecentConversions({ userId: id }, 20),
  ]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-1">{user.name ?? user.email}</h1>
      <p className="text-sm text-[color:var(--muted)] mb-6">
        {user.email} · joined {new Date(user.createdAt).toLocaleDateString()}
      </p>

      <section className="mb-6 border border-[color:var(--border)] rounded-lg p-4 bg-[color:var(--surface)]">
        <h2 className="font-bold mb-3">Controls</h2>
        <UserControls
          userId={user.id}
          tier={user.tier}
          role={user.role}
          active={user.active}
          isSelf={admin.id === user.id}
        />
      </section>

      <StatsCards
        cards={[
          { label: 'Books', value: stats.totalBooks.toLocaleString() },
          { label: 'Words', value: stats.totalWords.toLocaleString() },
          {
            label: 'Top pair',
            value: stats.topLangPairs[0]
              ? `${stats.topLangPairs[0].sourceLang} → ${stats.topLangPairs[0].targetLang}`
              : '—',
          },
          {
            label: 'Sources',
            value: Object.keys(stats.bySource).length,
            sub: Object.entries(stats.bySource)
              .map(([k, v]) => `${k}: ${v.books}`)
              .join(' · '),
          },
        ]}
      />

      <section className="mt-8">
        <h2 className="text-lg font-bold mb-3">Recent conversions</h2>
        <ConversionTable rows={recent.items} />
      </section>
    </>
  );
}

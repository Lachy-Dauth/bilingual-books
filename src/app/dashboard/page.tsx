import { requireUser } from '@/lib/auth-helpers';
import { getUserStats, getRecentConversions } from '@/lib/stats';
import { migrateAnonymousConversions } from '@/lib/migrate-anon';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ConversionTable } from '@/components/dashboard/ConversionTable';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireUser();
  await migrateAnonymousConversions(user.id);
  const [stats, recent] = await Promise.all([
    getUserStats(user.id),
    getRecentConversions({ userId: user.id }, 20),
  ]);

  const topPair = stats.topLangPairs[0];

  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Your dashboard</h1>
        <p className="text-[color:var(--muted)] text-sm">
          Plan: <span className="font-semibold">{user.tier}</span>
          {user.role === 'admin' && ' · admin'}
        </p>
      </header>

      <StatsCards
        cards={[
          { label: 'Books converted', value: stats.totalBooks.toLocaleString() },
          { label: 'Words translated', value: stats.totalWords.toLocaleString() },
          {
            label: 'Top pair',
            value: topPair ? `${topPair.sourceLang} → ${topPair.targetLang}` : '—',
            sub: topPair ? `${topPair.books} book(s)` : undefined,
          },
          {
            label: 'Sources used',
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
    </main>
  );
}

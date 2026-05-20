import { getSiteStats } from '@/lib/stats';
import { StatsCards } from '@/components/dashboard/StatsCards';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const stats = await getSiteStats();
  const topPair = stats.topLangPairs[0];

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Site overview</h1>

      <StatsCards
        cards={[
          { label: 'Users', value: stats.totalUsers.toLocaleString(), sub: `${stats.recentSignups} new in last 30d` },
          { label: 'Total books', value: stats.totalBooks.toLocaleString(), sub: `${stats.anonymousBooks.toLocaleString()} anonymous` },
          { label: 'Total words', value: stats.totalWords.toLocaleString() },
          {
            label: 'Top pair',
            value: topPair ? `${topPair.sourceLang} → ${topPair.targetLang}` : '—',
            sub: topPair ? `${topPair.books} book(s)` : undefined,
          },
        ]}
      />

      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-[color:var(--border)] rounded-lg p-4 bg-[color:var(--surface)]">
          <h2 className="font-bold mb-3">By source</h2>
          <ul className="text-sm space-y-1">
            {Object.entries(stats.bySource).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span>{k}</span>
                <span className="tabular-nums">
                  {v.books.toLocaleString()} books · {v.words.toLocaleString()} words
                </span>
              </li>
            ))}
            {Object.keys(stats.bySource).length === 0 && (
              <li className="text-[color:var(--muted)]">No data yet.</li>
            )}
          </ul>
        </div>

        <div className="border border-[color:var(--border)] rounded-lg p-4 bg-[color:var(--surface)]">
          <h2 className="font-bold mb-3">Top language pairs</h2>
          <ul className="text-sm space-y-1">
            {stats.topLangPairs.map((p) => (
              <li key={`${p.sourceLang}-${p.targetLang}`} className="flex justify-between">
                <span>
                  {p.sourceLang} → {p.targetLang}
                </span>
                <span className="tabular-nums">{p.books.toLocaleString()} books</span>
              </li>
            ))}
            {stats.topLangPairs.length === 0 && (
              <li className="text-[color:var(--muted)]">No data yet.</li>
            )}
          </ul>
        </div>
      </section>
    </>
  );
}

'use client';

import type { Conversion } from '@prisma/client';
import { useT } from '@/i18n/I18nProvider';
import { StatsCards } from './StatsCards';
import { ConversionTable } from './ConversionTable';
import { DeleteAccountButton } from './DeleteAccountButton';

type UserView = {
  tier: string;
  role: string;
};

type StatsView = {
  totalBooks: number;
  totalWords: number;
  bySource: Record<string, { books: number; words: number }>;
  topLangPairs: { sourceLang: string; targetLang: string; books: number; words: number }[];
};

export function DashboardContent({
  user,
  stats,
  recent,
}: {
  user: UserView;
  stats: StatsView;
  recent: Conversion[];
}) {
  const { t } = useT();
  const topPair = stats.topLangPairs[0];

  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-[color:var(--muted)] text-sm">
          {t('dashboard.plan')}: <span className="font-semibold">{user.tier}</span>
          {user.role === 'admin' && ` · ${t('dashboard.adminTag')}`}
        </p>
      </header>

      <StatsCards
        cards={[
          {
            label: t('dashboard.cards.books'),
            value: stats.totalBooks.toLocaleString(),
          },
          {
            label: t('dashboard.cards.words'),
            value: stats.totalWords.toLocaleString(),
          },
          {
            label: t('dashboard.cards.topPair'),
            value: topPair
              ? `${topPair.sourceLang} → ${topPair.targetLang}`
              : '—',
            sub: topPair
              ? t('dashboard.cards.booksSub', { count: topPair.books })
              : undefined,
          },
          {
            label: t('dashboard.cards.sources'),
            value: Object.keys(stats.bySource).length,
            sub: Object.entries(stats.bySource)
              .map(([k, v]) => `${k}: ${v.books}`)
              .join(' · '),
          },
        ]}
      />

      <section className="mt-8">
        <h2 className="text-lg font-bold mb-3">{t('dashboard.recent')}</h2>
        <ConversionTable rows={recent} />
      </section>

      <section className="mt-12 pt-6 border-t border-[color:var(--border)]">
        <h2 className="text-lg font-bold mb-2">{t('dashboard.dangerZone')}</h2>
        <DeleteAccountButton />
      </section>
    </main>
  );
}

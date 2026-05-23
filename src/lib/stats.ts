import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export type UserStats = {
  totalBooks: number;
  totalWords: number;
  bySource: Record<string, { books: number; words: number }>;
  topLangPairs: { sourceLang: string; targetLang: string; books: number; words: number }[];
};

export type SiteStats = UserStats & {
  totalUsers: number;
  anonymousBooks: number;
  recentSignups: number;
};

async function statsForScope(where: Prisma.ConversionWhereInput): Promise<UserStats> {
  const [totals, bySourceRows, langPairs] = await Promise.all([
    prisma.conversion.aggregate({ _count: true, _sum: { wordCount: true }, where }),
    prisma.conversion.groupBy({
      by: ['source'],
      _count: true,
      _sum: { wordCount: true },
      where,
    }),
    prisma.conversion.groupBy({
      by: ['sourceLang', 'targetLang'],
      _count: true,
      _sum: { wordCount: true },
      where,
      orderBy: { _count: { sourceLang: 'desc' } },
      take: 10,
    }),
  ]);

  const bySource: UserStats['bySource'] = {};
  for (const row of bySourceRows) {
    bySource[row.source] = {
      books: row._count,
      words: row._sum.wordCount ?? 0,
    };
  }

  return {
    totalBooks: totals._count,
    totalWords: totals._sum.wordCount ?? 0,
    bySource,
    topLangPairs: langPairs.map((p) => ({
      sourceLang: p.sourceLang,
      targetLang: p.targetLang,
      books: p._count,
      words: p._sum.wordCount ?? 0,
    })),
  };
}

export async function getUserStats(userId: string): Promise<UserStats> {
  return statsForScope({ userId, status: 'ok' });
}

export async function getAnonymousStats(anonymousId: string): Promise<UserStats> {
  return statsForScope({ anonymousId, userId: null, status: 'ok' });
}

export async function getSiteStats(): Promise<SiteStats> {
  const base = await statsForScope({ status: 'ok' });
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [totalUsers, anonymousBooks, recentSignups] = await Promise.all([
    prisma.user.count(),
    prisma.conversion.count({ where: { userId: null, status: 'ok' } }),
    prisma.user.count({ where: { createdAt: { gte: since } } }),
  ]);
  return { ...base, totalUsers, anonymousBooks, recentSignups };
}

export async function getRecentConversions(
  where: Prisma.ConversionWhereInput,
  limit = 20,
  cursor?: string,
) {
  const items = await prisma.conversion.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const hasMore = items.length > limit;
  return {
    items: items.slice(0, limit),
    nextCursor: hasMore ? items[limit - 1].id : null,
  };
}

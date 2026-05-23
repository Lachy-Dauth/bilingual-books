import { prisma } from '@/lib/db';
import type { Tier } from '@prisma/client';

export type LimitCheck = {
  allowed: boolean;
  remaining: number;
  used: number;
  limit: number;
  plan: Tier;
  reason?: string;
};

/**
 * Per-tier monthly word limits. Set to Infinity to disable the gate.
 * Flip `free.maxWordsPerMonth` to a finite number to enforce a free tier.
 */
export const TIER_LIMITS: Record<Tier, { maxWordsPerMonth: number }> = {
  free: { maxWordsPerMonth: Infinity },
  pro: { maxWordsPerMonth: Infinity },
  unlimited: { maxWordsPerMonth: Infinity },
};

function startOfMonthUTC(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export async function getUsedWordsThisMonth(
  userId: string | null,
  anonymousId: string | null,
): Promise<number> {
  if (!userId && !anonymousId) return 0;
  const since = startOfMonthUTC();
  const agg = await prisma.conversion.aggregate({
    _sum: { wordCount: true },
    where: {
      createdAt: { gte: since },
      status: 'ok',
      ...(userId ? { userId } : { anonymousId, userId: null }),
    },
  });
  return agg._sum.wordCount ?? 0;
}

export async function checkLimit(
  userId: string | null,
  anonymousId: string | null,
  plannedWords: number,
): Promise<LimitCheck> {
  let tier: Tier = 'free';
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true, active: true },
    });
    if (user && !user.active) {
      return {
        allowed: false,
        remaining: 0,
        used: 0,
        limit: 0,
        plan: 'free',
        reason: 'account-deactivated',
      };
    }
    tier = user?.tier ?? 'free';
  }

  const limit = TIER_LIMITS[tier].maxWordsPerMonth;
  const used = await getUsedWordsThisMonth(userId, anonymousId);
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);

  if (limit === Infinity) {
    return { allowed: true, remaining, used, limit, plan: tier };
  }

  const allowed = plannedWords <= remaining;
  return {
    allowed,
    remaining,
    used,
    limit,
    plan: tier,
    reason: allowed ? undefined : 'monthly-word-limit-exceeded',
  };
}

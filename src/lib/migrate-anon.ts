import { prisma } from '@/lib/db';
import { getAnonymousId } from '@/lib/anon';

/**
 * If the current request has a `bb_anon_id` cookie, claim any anonymous
 * conversions that share that id for the given user. Idempotent.
 */
export async function migrateAnonymousConversions(userId: string): Promise<number> {
  const anonId = await getAnonymousId();
  if (!anonId) return 0;
  const result = await prisma.conversion.updateMany({
    where: { anonymousId: anonId, userId: null },
    data: { userId },
  });
  return result.count;
}

import { NextResponse } from 'next/server';
import { headers as nextHeaders } from 'next/headers';
import { auth } from '@/auth';
import { getAnonymousIdFromRequest } from '@/lib/anon';
import { checkLimit } from '@/lib/paywall';
import { prechecksSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = prechecksSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: await nextHeaders() });
  const userId = session?.user?.id ?? null;
  const anonymousId = userId ? null : getAnonymousIdFromRequest(req);

  const result = await checkLimit(userId, anonymousId, parsed.data.plannedWords);

  return NextResponse.json({
    allowed: result.allowed,
    remaining: Number.isFinite(result.remaining) ? result.remaining : null,
    used: result.used,
    limit: Number.isFinite(result.limit) ? result.limit : null,
    plan: result.plan,
    reason: result.reason,
  });
}

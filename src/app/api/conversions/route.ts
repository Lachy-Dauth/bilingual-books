import { NextResponse } from 'next/server';
import { headers as nextHeaders } from 'next/headers';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { getAnonymousIdFromRequest } from '@/lib/anon';
import { logConversionSchema } from '@/lib/validators';
import { getRecentConversions } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = logConversionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({ headers: await nextHeaders() });
  const userId = session?.user?.id ?? null;
  const anonymousId = userId ? null : getAnonymousIdFromRequest(req);

  const conv = await prisma.conversion.create({
    data: {
      userId,
      anonymousId,
      bookTitle: parsed.data.bookTitle,
      sourceLang: parsed.data.sourceLang,
      targetLang: parsed.data.targetLang,
      wordCount: parsed.data.wordCount,
      source: parsed.data.source,
      gutenbergId: parsed.data.gutenbergId,
      durationMs: parsed.data.durationMs,
      status: parsed.data.status,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: conv.id });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 100);
  const cursor = url.searchParams.get('cursor') ?? undefined;

  const session = await auth.api.getSession({ headers: await nextHeaders() });
  const userId = session?.user?.id ?? null;
  const anonymousId = userId ? null : getAnonymousIdFromRequest(req);

  if (!userId && !anonymousId) {
    return NextResponse.json({ items: [], nextCursor: null });
  }

  const where = userId ? { userId } : { anonymousId, userId: null };
  const result = await getRecentConversions(where, limit, cursor);
  return NextResponse.json(result);
}

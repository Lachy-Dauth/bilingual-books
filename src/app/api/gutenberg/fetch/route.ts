import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchBookFromGutenberg } from '@/lib/gutenberg';
import { gutenbergFetchSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const USER_AGENT =
  process.env.GUTENBERG_USER_AGENT ??
  'bilingual-books/1.0 (https://github.com/Lachy-Dauth/bilingual-books)';

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = gutenbergFetchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { gutenbergId, format } = parsed.data;

  const cached = await prisma.bookCache.findUnique({
    where: { gutenbergId_format: { gutenbergId, format } },
  });
  if (cached) {
    await prisma.bookCache.update({
      where: { id: cached.id },
      data: { hits: { increment: 1 } },
    });
    return new NextResponse(new Uint8Array(cached.bytes), {
      headers: {
        'Content-Type': cached.mimeType,
        'X-Cache': 'hit',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  let upstream: Response;
  try {
    upstream = await fetchBookFromGutenberg(gutenbergId, format, USER_AGENT);
  } catch (err) {
    return NextResponse.json(
      { error: 'upstream_unavailable', message: (err as Error).message },
      { status: 502 },
    );
  }

  const mimeType =
    upstream.headers.get('content-type') ??
    (format === 'epub' ? 'application/epub+zip' : 'text/plain; charset=utf-8');

  const buf = Buffer.from(await upstream.arrayBuffer());

  prisma.bookCache
    .create({
      data: { gutenbergId, format, mimeType, bytes: buf },
    })
    .catch(() => {
      /* swallow unique conflicts and storage errors silently */
    });

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      'Content-Type': mimeType,
      'X-Cache': 'miss',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

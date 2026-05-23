import { cookies } from 'next/headers';

const COOKIE_NAME = 'bb_anon_id';

export async function getAnonymousId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

export function getAnonymousIdFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [k, v] = part.trim().split('=');
    if (k === COOKIE_NAME && v) return decodeURIComponent(v);
  }
  return null;
}

export const ANON_COOKIE_NAME = COOKIE_NAME;

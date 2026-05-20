import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ANON_COOKIE = 'bb_anon_id';
const ONE_YEAR = 60 * 60 * 24 * 365;

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const existing = req.cookies.get(ANON_COOKIE)?.value;
  if (!existing) {
    res.cookies.set(ANON_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ONE_YEAR,
      path: '/',
    });
  }
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth handler manages its own cookies)
     * - _next/static, _next/image, favicon
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};

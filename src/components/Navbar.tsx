import Link from 'next/link';
import { getSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export async function Navbar() {
  const session = await getSession();
  let isAdmin = false;
  let userLabel: string | null = null;
  if (session?.user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true, name: true },
    });
    isAdmin = dbUser?.role === 'admin';
    userLabel = dbUser?.name || dbUser?.email || null;
  }

  return (
    <nav className="site-nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          Bilingual Books
        </Link>
        <div className="nav-links">
          <Link href="/">Convert</Link>
          {session?.user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              {isAdmin && <Link href="/admin">Admin</Link>}
              <span style={{ color: 'var(--muted)' }}>{userLabel}</span>
              <Link href="/sign-out">Sign out</Link>
            </>
          ) : (
            <>
              <Link href="/sign-in">Sign in</Link>
              <Link href="/sign-up">Sign up</Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

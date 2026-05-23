import Link from 'next/link';
import { getSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { NavLinks } from './NavLinks';

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
        <NavLinks
          signedIn={!!session?.user}
          isAdmin={isAdmin}
          userLabel={userLabel}
        />
      </div>
    </nav>
  );
}

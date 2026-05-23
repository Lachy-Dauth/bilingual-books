import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth-helpers';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex gap-4 text-sm mb-6 border-b border-[color:var(--border)] pb-3">
        <Link href="/admin" className="font-semibold">
          Overview
        </Link>
        <Link href="/admin/users" className="font-semibold">
          Users
        </Link>
      </nav>
      {children}
    </div>
  );
}

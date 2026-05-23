import Link from 'next/link';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const PER_PAGE = 25;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page ?? 1));

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: 'insensitive' as const } },
          { name: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { conversions: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      <form className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email or name"
          className="border rounded px-3 py-1 flex-1 max-w-md"
        />
        <button
          type="submit"
          className="bg-[color:var(--accent)] text-white px-3 py-1 rounded font-semibold"
        >
          Search
        </button>
      </form>

      <p className="text-sm text-[color:var(--muted)] mb-2">
        {total.toLocaleString()} users · page {page} of {lastPage}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-[color:var(--border)] text-[color:var(--muted)]">
              <th className="py-2 pr-2">Email</th>
              <th className="py-2 pr-2">Name</th>
              <th className="py-2 pr-2">Role</th>
              <th className="py-2 pr-2">Tier</th>
              <th className="py-2 pr-2">Active</th>
              <th className="py-2 pr-2 text-right">Conversions</th>
              <th className="py-2 pr-2">Joined</th>
              <th className="py-2 pr-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[color:var(--border)]/50">
                <td className="py-2 pr-2">{u.email}</td>
                <td className="py-2 pr-2">{u.name ?? '—'}</td>
                <td className="py-2 pr-2">{u.role}</td>
                <td className="py-2 pr-2">{u.tier}</td>
                <td className="py-2 pr-2">{u.active ? 'yes' : 'no'}</td>
                <td className="py-2 pr-2 text-right tabular-nums">
                  {u._count.conversions.toLocaleString()}
                </td>
                <td className="py-2 pr-2 whitespace-nowrap">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2 pr-2">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-[color:var(--accent)] font-semibold"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 mt-4 text-sm">
        {page > 1 && (
          <Link
            href={{ pathname: '/admin/users', query: { q, page: page - 1 } }}
            className="px-3 py-1 border border-[color:var(--border)] rounded"
          >
            Prev
          </Link>
        )}
        {page < lastPage && (
          <Link
            href={{ pathname: '/admin/users', query: { q, page: page + 1 } }}
            className="px-3 py-1 border border-[color:var(--border)] rounded"
          >
            Next
          </Link>
        )}
      </div>
    </>
  );
}

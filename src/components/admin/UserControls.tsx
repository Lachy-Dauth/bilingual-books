'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Role, Tier } from '@prisma/client';
import { setUserActive, setUserRole, setUserTier } from '@/app/admin/actions';

export function UserControls({
  userId,
  tier,
  role,
  active,
  isSelf,
}: {
  userId: string;
  tier: Tier;
  role: Role;
  active: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold w-20">Tier</label>
        <select
          value={tier}
          disabled={pending}
          onChange={(e) =>
            start(async () => {
              await setUserTier(userId, e.target.value as Tier);
              router.refresh();
            })
          }
          className="border rounded px-2 py-1"
        >
          <option value="free">free</option>
          <option value="pro">pro</option>
          <option value="unlimited">unlimited</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold w-20">Role</label>
        <select
          value={role}
          disabled={pending || isSelf}
          onChange={(e) =>
            start(async () => {
              await setUserRole(userId, e.target.value as Role);
              router.refresh();
            })
          }
          className="border rounded px-2 py-1"
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        {isSelf && (
          <span className="text-xs text-[color:var(--muted)]">
            (can&apos;t demote yourself)
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold w-20">Active</label>
        <button
          type="button"
          disabled={pending || isSelf}
          onClick={() =>
            start(async () => {
              await setUserActive(userId, !active);
              router.refresh();
            })
          }
          className="border border-[color:var(--border)] rounded px-3 py-1 font-semibold disabled:opacity-50"
        >
          {active ? 'Deactivate' : 'Reactivate'}
        </button>
        {isSelf && (
          <span className="text-xs text-[color:var(--muted)]">
            (can&apos;t deactivate yourself)
          </span>
        )}
      </div>
    </div>
  );
}

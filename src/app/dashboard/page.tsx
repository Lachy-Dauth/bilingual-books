import { requireUser } from '@/lib/auth-helpers';
import { getUserStats, getRecentConversions } from '@/lib/stats';
import { migrateAnonymousConversions } from '@/lib/migrate-anon';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireUser();
  await migrateAnonymousConversions(user.id);
  const [stats, recent] = await Promise.all([
    getUserStats(user.id),
    getRecentConversions({ userId: user.id }, 20),
  ]);

  return (
    <DashboardContent
      user={{ tier: user.tier, role: user.role }}
      stats={stats}
      recent={recent.items}
    />
  );
}

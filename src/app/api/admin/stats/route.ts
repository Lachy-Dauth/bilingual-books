import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { getSiteStats } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export async function GET() {
  await requireAdmin();
  const stats = await getSiteStats();
  return NextResponse.json(stats);
}

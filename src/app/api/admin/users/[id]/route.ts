import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';
import { adminUserPatchSchema } from '@/lib/validators';
import { getUserStats } from '@/lib/stats';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const stats = await getUserStats(id);
  return NextResponse.json({ user, stats });
}

export async function PATCH(req: Request, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = adminUserPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ user });
}

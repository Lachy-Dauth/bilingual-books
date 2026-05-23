'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';
import type { Role, Tier } from '@prisma/client';

export async function setUserTier(userId: string, tier: Tier) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { tier } });
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath('/admin/users');
}

export async function setUserActive(userId: string, active: boolean) {
  const admin = await requireAdmin();
  if (admin.id === userId && !active) {
    throw new Error('Refusing to deactivate yourself.');
  }
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath('/admin/users');
}

export async function setUserRole(userId: string, role: Role) {
  const admin = await requireAdmin();
  if (admin.id === userId && role !== 'admin') {
    throw new Error('Refusing to demote yourself.');
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath('/admin/users');
}

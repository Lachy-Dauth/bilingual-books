'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth-helpers';

/**
 * Permanently delete the current user. Conversion rows are anonymized via
 * Conversion.userId's `onDelete: SetNull`, so aggregate stats are preserved
 * without retaining personal data — matching what the privacy policy says.
 */
export async function deleteOwnAccount() {
  const user = await requireUser();
  await prisma.user.delete({ where: { id: user.id } });
  // Sessions cascade-delete with the User row, so the user's cookie now
  // points at nothing and the next request will treat them as anonymous.
  redirect('/?deleted=1');
}

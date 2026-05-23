import { PrismaClient } from '@prisma/client';
import { auth } from '../src/auth';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      '[seed] ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed.',
    );
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'admin', tier: 'unlimited', active: true, emailVerified: true },
    });
    console.log(`[seed] Existing user promoted to admin: ${email} (id=${existing.id})`);
    console.log(
      '[seed] Note: password unchanged. If you forgot the password, ' +
        'delete the user from the DB and re-run seed to recreate with new password.',
    );
    return;
  }

  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: 'Admin',
    },
  });

  if (!result.user) {
    throw new Error('signUpEmail did not return a user');
  }

  await prisma.user.update({
    where: { id: result.user.id },
    data: { role: 'admin', tier: 'unlimited', active: true, emailVerified: true },
  });

  console.log(`[seed] Admin created: ${email} (id=${result.user.id})`);
}

main()
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

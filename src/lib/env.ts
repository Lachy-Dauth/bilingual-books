/**
 * Validates required environment variables at server startup. Fails fast with
 * a clear message so you don't get an obscure Prisma / Better-Auth error a
 * few requests in. Imported from instrumentation.ts so it runs once when the
 * Node process boots.
 */

type EnvSpec = {
  name: string;
  hint: string;
  /** If set, must satisfy this predicate to be considered valid. */
  validate?: (v: string) => boolean;
};

const REQUIRED: EnvSpec[] = [
  {
    name: 'DATABASE_URL',
    hint: 'Postgres connection string. Railway injects this automatically when you add the Postgres plugin.',
    validate: (v) => v.startsWith('postgres://') || v.startsWith('postgresql://'),
  },
  {
    name: 'BETTER_AUTH_SECRET',
    hint: 'Random 32+ byte secret. Generate with: openssl rand -base64 32',
    validate: (v) => v.length >= 16,
  },
  {
    name: 'BETTER_AUTH_URL',
    hint: 'Public origin of the deployed app, e.g. https://bilingual-books.example.com',
    validate: (v) => v.startsWith('http://') || v.startsWith('https://'),
  },
];

const RECOMMENDED: EnvSpec[] = [
  { name: 'ADMIN_EMAIL', hint: 'Email for the seeded admin account.' },
  { name: 'ADMIN_PASSWORD', hint: 'Password for the seeded admin account.' },
];

export function validateEnv(): void {
  const errors: string[] = [];
  for (const spec of REQUIRED) {
    const v = process.env[spec.name];
    if (!v) {
      errors.push(`  - ${spec.name}: missing. ${spec.hint}`);
      continue;
    }
    if (spec.validate && !spec.validate(v)) {
      errors.push(`  - ${spec.name}: present but invalid format. ${spec.hint}`);
    }
  }

  if (errors.length > 0) {
    const msg =
      'bilingual-books: required environment variables are missing or invalid:\n' +
      errors.join('\n') +
      '\n\nSee .env.example for the full list.';
    // Don't exit during a Next.js build — we want the build to succeed even
    // when env vars aren't populated yet. Only enforce at runtime.
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn(msg);
      return;
    }
    console.error(msg);
    throw new Error(msg);
  }

  for (const spec of RECOMMENDED) {
    if (!process.env[spec.name]) {
      console.warn(
        `[env] ${spec.name} is not set. ${spec.hint} (Not fatal, but the admin seed step will be skipped.)`,
      );
    }
  }
}

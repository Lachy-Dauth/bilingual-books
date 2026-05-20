/**
 * Next.js instrumentation hook — runs once per Node process at server boot.
 * We use it to validate environment variables so the container fails fast
 * with a clear error message instead of an obscure Prisma or Better-Auth
 * error a few requests in.
 *
 * See https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('./lib/env');
    validateEnv();
  }
}

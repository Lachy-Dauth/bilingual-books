#!/bin/sh
set -e

echo "[entrypoint] Running prisma migrate deploy…"
node node_modules/prisma/build/index.js migrate deploy

if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "[entrypoint] Seeding admin user…"
  node node_modules/tsx/dist/cli.mjs prisma/seed.ts || echo "[entrypoint] Seed failed (continuing anyway)"
else
  echo "[entrypoint] ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin seed."
fi

echo "[entrypoint] Starting server…"
exec "$@"

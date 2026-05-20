#!/usr/bin/env tsx
/**
 * Local Gmail-API test runner.
 *
 * Usage:
 *   1. In .env.local set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and
 *      GMAIL_REFRESH_TOKEN (same values you'd set in Railway).
 *   2. Run:  npm run email:test -- recipient@example.com
 *
 * The script loads env, prints the resolved config, runs the same
 * verify() the /admin/email-test panel uses (refreshes an access token
 * against Google's OAuth endpoint), then sends a real test message via
 * the Gmail API.
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local', quiet: true });
loadEnv({ quiet: true });

import {
  getEmailConfig,
  sendEmail,
  verifyEmailTransport,
} from '../src/lib/email';

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error('Usage: npm run email:test -- recipient@example.com');
    console.error('');
    console.error('Required env vars (set in .env.local):');
    console.error('  GOOGLE_CLIENT_ID       OAuth client ID');
    console.error('  GOOGLE_CLIENT_SECRET   OAuth client secret');
    console.error('  GMAIL_REFRESH_TOKEN    From `npm run gmail:get-token`');
    console.error('Optional:');
    console.error('  GMAIL_SEND_FROM        Default bilingualbooksgen@gmail.com');
    process.exit(1);
  }

  const config = getEmailConfig();
  console.log('\nResolved email config:');
  console.log('  mode          ', config.authMode);
  console.log('  from          ', config.from);
  console.log('  client ID     ', config.clientId ?? '(unset)');
  console.log('  refresh token ', config.refreshToken);
  console.log('  configured    ', config.configured ? 'yes' : 'NO');

  if (!config.configured) {
    console.error(
      '\nSet GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN in .env.local.',
    );
    console.error('Generate the refresh token with: npm run gmail:get-token');
    process.exit(1);
  }

  console.log('\nStep 1: verify() — refreshing access token via Google OAuth…');
  const verify = await verifyEmailTransport();
  if (!verify.ok) {
    console.error('  FAILED:', verify.error ?? verify.reason);
    if (verify.error?.includes('invalid_grant')) {
      console.error('\n  Hint: the refresh token is invalid, revoked, or for a different');
      console.error('  client. Re-run `npm run gmail:get-token` to mint a fresh one.');
    }
    if (verify.error?.includes('invalid_client')) {
      console.error('\n  Hint: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET doesn\'t match the');
      console.error('  client that issued the refresh token.');
    }
    process.exit(1);
  }
  console.log('  OK — Google issued an access token.');

  console.log(`\nStep 2: sendMail() — delivering test message to ${to}…`);
  try {
    await sendEmail({
      to,
      subject: 'Bilingual Books — local Gmail API test',
      html: `<p>This is a local test from <code>npm run email:test</code>.</p>
<p>If you're reading it, your Gmail OAuth credentials work end-to-end.</p>
<p style="color:#888;font-size:0.85em;">Sent ${new Date().toISOString()}</p>`,
    });
    console.log('  OK — Gmail API accepted the message.');
    console.log(`\nDone. Check ${to} (and the spam folder).`);
  } catch (err) {
    console.error('  FAILED:', (err as Error).message);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('\nUnexpected error:', e);
  process.exit(1);
});

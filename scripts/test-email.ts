#!/usr/bin/env tsx
/**
 * Local SMTP test runner.
 *
 * Usage:
 *   1. Put SMTP_USER, SMTP_PASS (and optionally SMTP_HOST, SMTP_PORT,
 *      SMTP_FROM) in a `.env.local` file at the repo root.
 *   2. Run:  npm run email:test -- recipient@example.com
 *
 * The script loads the env, prints the resolved config, runs the same
 * verify() check the /admin/email-test panel uses, then sends a real
 * test message. Errors are printed verbatim — exactly what you'd see
 * in production logs.
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local', quiet: true });
loadEnv({ quiet: true }); // also try .env

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
    console.error('  SMTP_USER   full Gmail address');
    console.error('  SMTP_PASS   16-char Gmail App Password (no spaces)');
    console.error('Optional:');
    console.error('  SMTP_HOST   default smtp.gmail.com');
    console.error('  SMTP_PORT   default 465');
    console.error('  SMTP_FROM   default "Bilingual Books <$SMTP_USER>"');
    process.exit(1);
  }

  const config = getEmailConfig();
  console.log('\nResolved SMTP config:');
  console.log('  host       ', `${config.host}:${config.port}`);
  console.log('  user       ', config.user ?? '(unset)');
  console.log('  from       ', config.from);
  console.log('  configured ', config.configured ? 'yes' : 'NO — SMTP_USER/SMTP_PASS missing');

  if (!config.configured) {
    console.error('\nSet SMTP_USER and SMTP_PASS in .env.local and try again.');
    process.exit(1);
  }

  console.log('\nStep 1: verify() — opening connection and authenticating…');
  const verify = await verifyEmailTransport();
  if (!verify.ok) {
    console.error('  FAILED:', verify.error ?? verify.reason);
    if (verify.error?.includes('ENETUNREACH')) {
      console.error('\n  Hint: your network may be returning IPv6 records for the SMTP host');
      console.error('  but the route to IPv6 is down. Try setting NODE_OPTIONS:');
      console.error('    NODE_OPTIONS="--dns-result-order=ipv4first" npm run email:test -- ' + to);
    }
    if (verify.error?.includes('Invalid login')) {
      console.error('\n  Hint: SMTP_PASS is wrong. For Gmail, generate a 16-char App Password at');
      console.error('  https://myaccount.google.com/apppasswords (2-Step Verification must be on)');
      console.error('  and paste it without the spaces Google shows.');
    }
    process.exit(1);
  }
  console.log('  OK — server accepted credentials.');

  console.log(`\nStep 2: sendMail() — delivering test message to ${to}…`);
  try {
    await sendEmail({
      to,
      subject: 'Bilingual Books — local SMTP test',
      html: `<p>This is a local test from <code>npm run email:test</code>.</p>
<p>If you're reading it, your SMTP credentials work end-to-end.</p>
<p style="color:#888;font-size:0.85em;">Sent ${new Date().toISOString()}</p>`,
    });
    console.log('  OK — message accepted by the SMTP server.');
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

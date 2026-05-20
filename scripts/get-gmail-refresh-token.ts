#!/usr/bin/env tsx
/**
 * One-time helper to mint a Gmail refresh token.
 *
 * Usage:
 *   1. In Google Cloud Console for your project:
 *      a. APIs & Services → Library → enable "Gmail API".
 *      b. APIs & Services → OAuth consent screen → Edit → Add scope
 *         "https://www.googleapis.com/auth/gmail.send".
 *      c. APIs & Services → Credentials → your existing OAuth web client
 *         → Authorized redirect URIs → add http://localhost:47432/oauth/callback.
 *   2. In .env.local, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (the
 *      same ones already in Railway).
 *   3. Run:  npm run gmail:get-token
 *   4. Open the URL it prints in a browser, sign in as the account that
 *      should send the emails (e.g. bilingualbooksgen@gmail.com), approve
 *      the Gmail send scope.
 *   5. The script prints a refresh token. Paste it into Railway as
 *      GMAIL_REFRESH_TOKEN.
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local', quiet: true });
loadEnv({ quiet: true });

import http from 'node:http';
import { URL } from 'node:url';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env.local',
  );
  console.error('Copy them from your Railway service variables.');
  process.exit(1);
}

const PORT = 47432;
const REDIRECT = `http://localhost:${PORT}/oauth/callback`;
const SCOPE = 'https://www.googleapis.com/auth/gmail.send';

const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', clientId);
authUrl.searchParams.set('redirect_uri', REDIRECT);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', SCOPE);
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');

console.log('\n=== Gmail refresh token bootstrap ===\n');
console.log('1. Make sure these are done in Google Cloud Console:');
console.log('   - Gmail API is ENABLED for your project');
console.log(`   - OAuth consent screen lists the scope: ${SCOPE}`);
console.log(`   - Your OAuth client has redirect URI: ${REDIRECT}`);
console.log('');
console.log('2. Open this URL in your browser and sign in as the account');
console.log('   that should send the emails (e.g. bilingualbooksgen@gmail.com):');
console.log('');
console.log('   ' + authUrl.toString());
console.log('');
console.log('3. Approve the gmail.send permission.');
console.log('');
console.log(`Waiting for the callback on ${REDIRECT}…`);
console.log('(Ctrl-C to abort.)\n');

const server = http.createServer(async (req, res) => {
  if (!req.url) return;
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== '/oauth/callback') {
    res.writeHead(404).end();
    return;
  }

  const errorParam = url.searchParams.get('error');
  if (errorParam) {
    res.writeHead(400, { 'content-type': 'text/html' }).end(
      `<h1>OAuth error</h1><pre>${escapeHtml(errorParam)}</pre>`,
    );
    console.error(`\nOAuth returned error: ${errorParam}`);
    server.close();
    process.exit(1);
    return;
  }

  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400, { 'content-type': 'text/plain' }).end('Missing code');
    return;
  }

  console.log('Received authorization code, exchanging for refresh token…');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT,
      grant_type: 'authorization_code',
    }).toString(),
  });

  const data = (await tokenRes.json()) as {
    refresh_token?: string;
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenRes.ok || !data.refresh_token) {
    console.error('\nToken exchange failed:');
    console.error(data);
    res.writeHead(500, { 'content-type': 'text/html' }).end(
      `<h1>Token exchange failed</h1><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`,
    );
    server.close();
    process.exit(1);
    return;
  }

  res.writeHead(200, { 'content-type': 'text/html' }).end(
    `<!doctype html><html><body style="font-family:system-ui;max-width:560px;margin:48px auto;padding:0 16px;">
      <h1>Refresh token captured</h1>
      <p>You can close this tab and go back to your terminal.</p>
    </body></html>`,
  );

  console.log('\n=== SUCCESS ===\n');
  console.log('Paste this into Railway as GMAIL_REFRESH_TOKEN:\n');
  console.log(data.refresh_token);
  console.log('');
  console.log(
    '(Treat it like a password — it grants gmail.send rights to your account.)\n',
  );
  server.close();
  setTimeout(() => process.exit(0), 50);
});

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c] as string,
  );
}

server.listen(PORT);

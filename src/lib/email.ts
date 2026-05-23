/**
 * Gmail-API-over-HTTPS email transport. No nodemailer, no SMTP, no port 465
 * or 587 — Railway can't open outbound SMTP, but it can absolutely open
 * outbound HTTPS to gmail.googleapis.com.
 *
 * Auth flow:
 *   1. Reuse GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (already configured
 *      for Sign-in-with-Google).
 *   2. Run `npm run gmail:get-token` locally once to mint a refresh token
 *      scoped to `gmail.send` for bilingualbooksgen@gmail.com.
 *   3. Paste the refresh token into Railway as GMAIL_REFRESH_TOKEN.
 *
 * On send, this module exchanges the refresh token for a short-lived
 * access token (cached in-process until it expires), then POSTs the
 * RFC 2822 MIME message base64url-encoded to the Gmail API.
 */

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
const sendFromAddress =
  process.env.GMAIL_SEND_FROM || 'bilingualbooksgen@gmail.com';
const from = `Bilingual Books <${sendFromAddress}>`;

const configured = Boolean(clientId && clientSecret && refreshToken);

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Gmail OAuth credentials are not configured');
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }).toString(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${body}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
    scope?: string;
  };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

function buildMime(opts: { to: string; subject: string; html: string }): string {
  // Headers + blank line + body, CRLF separated, per RFC 2822.
  const lines = [
    `From: ${from}`,
    `To: ${opts.to}`,
    `Subject: ${encodeSubject(opts.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    opts.html,
  ];
  return lines.join('\r\n');
}

function encodeSubject(subject: string): string {
  // ASCII subjects don't need encoding; non-ASCII gets RFC 2047 encoded-word.
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(subject)) return subject;
  return `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
}

function base64url(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64url');
}

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export type EmailConfigStatus = {
  configured: boolean;
  authMode: 'gmail-oauth' | 'not-configured';
  clientId: string | null;
  refreshToken: 'set' | 'missing';
  from: string;
};

export function getEmailConfig(): EmailConfigStatus {
  return {
    configured,
    authMode: configured ? 'gmail-oauth' : 'not-configured',
    clientId: clientId ? clientId.slice(0, 12) + '…' : null,
    refreshToken: refreshToken ? 'set' : 'missing',
    from,
  };
}

export async function verifyEmailTransport(): Promise<
  | { ok: true }
  | { ok: false; reason: 'not-configured' | 'verify-failed'; error?: string }
> {
  if (!configured) return { ok: false, reason: 'not-configured' };
  try {
    // Refreshing the access token proves the refresh token + client
    // credentials are still valid. No actual send happens.
    await getAccessToken();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: 'verify-failed',
      error: (err as Error).message,
    };
  }
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  if (!configured) {
    console.warn(
      `[email] Gmail OAuth not configured. Would have sent to ${opts.to}: "${opts.subject}"`,
    );
    return;
  }
  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (err) {
    console.error('[email] Could not refresh access token:', err);
    throw new Error(`Token refresh failed: ${(err as Error).message}`);
  }

  const mime = buildMime(opts);
  const res = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: base64url(mime) }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    console.error(`[email] Gmail send failed (${res.status}):`, body);
    throw new Error(`Gmail send failed (${res.status}): ${body}`);
  }
}

export function passwordResetHtml(url: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;line-height:1.5;color:#222;background:#f7f7f7;margin:0;padding:24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px 28px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <tr><td>
        <h1 style="font-size:1.35rem;margin:0 0 16px;color:#352700;">Reset your password</h1>
        <p style="margin:0 0 16px;">We received a request to reset the password for your Bilingual Books account.</p>
        <p style="margin:24px 0;">
          <a href="${url}" style="display:inline-block;background:#8c5214;color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;font-weight:600;">Reset password</a>
        </p>
        <p style="margin:0 0 8px;color:#555;font-size:0.92em;">Or paste this URL into your browser:</p>
        <p style="margin:0 0 24px;word-break:break-all;font-size:0.85em;"><a href="${url}" style="color:#8c5214;">${url}</a></p>
        <p style="color:#777;font-size:0.88em;margin:0;">This link expires in about an hour. If you didn&rsquo;t request a reset, you can safely ignore this email &mdash; your password will not change.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:28px 0 16px;">
        <p style="color:#999;font-size:0.82em;margin:0;">Bilingual Books &middot; <a href="mailto:bilingualbooksgen@gmail.com" style="color:#999;">bilingualbooksgen@gmail.com</a></p>
      </td></tr>
    </table>
  </body>
</html>`;
}

import dns from 'node:dns';
import { promises as dnsP } from 'node:dns';
import nodemailer, { type Transporter } from 'nodemailer';

// Belt: tell Node to prefer IPv4 records in case the explicit resolve below
// is bypassed by anything.
dns.setDefaultResultOrder('ipv4first');

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from =
  process.env.SMTP_FROM ||
  (user ? `Bilingual Books <${user}>` : 'Bilingual Books');

// Lazily resolve the SMTP host to an IPv4 address the first time we need it
// (Railway's outbound IPv6 isn't routed; Gmail's AAAA records would cause
// ENETUNREACH). Cached for the process lifetime.
let cachedTransporter: Transporter | null | undefined;
let initPromise: Promise<Transporter | null> | null = null;

function buildTransporter(connectHost: string): Transporter {
  return nodemailer.createTransport({
    host: connectHost,
    port,
    secure: port === 465,
    auth: { user, pass },
    // Cert is issued for the hostname, not the IP we're connecting to.
    tls: { servername: host },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

async function getTransporter(): Promise<Transporter | null> {
  if (cachedTransporter !== undefined) return cachedTransporter;
  if (initPromise) return initPromise;
  if (!user || !pass) {
    cachedTransporter = null;
    return null;
  }
  initPromise = (async () => {
    let connectHost = host;
    try {
      const { address } = await dnsP.lookup(host, { family: 4 });
      connectHost = address;
      console.log(`[email] Resolved ${host} → ${address} (forcing IPv4)`);
    } catch (err) {
      console.warn(
        `[email] IPv4 lookup failed for ${host}, falling back to hostname:`,
        (err as Error).message,
      );
    }
    cachedTransporter = buildTransporter(connectHost);
    return cachedTransporter;
  })();
  return initPromise;
}

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export type EmailConfigStatus = {
  configured: boolean;
  host: string;
  port: number;
  user: string | null;
  from: string;
};

export function getEmailConfig(): EmailConfigStatus {
  return {
    configured: Boolean(user && pass),
    host,
    port,
    user: user ?? null,
    from,
  };
}

export async function verifyEmailTransport(): Promise<
  | { ok: true }
  | { ok: false; reason: 'not-configured' | 'verify-failed'; error?: string }
> {
  const t = await getTransporter();
  if (!t) return { ok: false, reason: 'not-configured' };
  try {
    await t.verify();
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
  const t = await getTransporter();
  if (!t) {
    console.warn(
      `[email] SMTP credentials missing. Would have sent to ${opts.to}: "${opts.subject}"`,
    );
    return;
  }
  try {
    await t.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (err) {
    console.error('[email] SMTP send failed:', err);
    throw new Error(`Failed to send email: ${(err as Error).message}`);
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

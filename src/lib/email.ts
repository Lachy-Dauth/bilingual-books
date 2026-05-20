import nodemailer, { type Transporter } from 'nodemailer';

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from =
  process.env.SMTP_FROM ||
  (user ? `Bilingual Books <${user}>` : 'Bilingual Books');

const transporter: Transporter | null =
  user && pass
    ? nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        // Railway's outbound IPv6 is not reachable, so SMTP hosts that
        // resolve to AAAA records (Google in particular) fail with
        // ENETUNREACH. Force IPv4-only resolution.
        family: 4,
        // Don't let a misconfigured SMTP host hang the request indefinitely.
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      })
    : null;

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
    configured: Boolean(transporter),
    host,
    port,
    user: user ?? null,
    from,
  };
}

/**
 * Connect to the SMTP server and verify auth without sending anything.
 * Returns a structured result so admin diagnostics can show what went wrong.
 */
export async function verifyEmailTransport(): Promise<
  | { ok: true }
  | { ok: false; reason: 'not-configured' | 'verify-failed'; error?: string }
> {
  if (!transporter) {
    return { ok: false, reason: 'not-configured' };
  }
  try {
    await transporter.verify();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: 'verify-failed',
      error: (err as Error).message,
    };
  }
}

/**
 * Send a transactional email via SMTP (Gmail by default).
 *
 * When SMTP_USER / SMTP_PASS aren't set, the helper logs the message
 * instead of sending — local dev and first-time deploys keep working
 * without credentials.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  if (!transporter) {
    console.warn(
      `[email] SMTP credentials missing. Would have sent to ${opts.to}: "${opts.subject}"`,
    );
    return;
  }
  try {
    await transporter.sendMail({
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

/** HTML body for the password-reset email. Inline styles since email clients
 *  do not honor external stylesheets. */
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

import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM || 'Bilingual Books <onboarding@resend.dev>';

const resend = apiKey ? new Resend(apiKey) : null;

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Send a transactional email via Resend. If RESEND_API_KEY is not configured
 * the email is only logged — useful for local dev and for graceful degradation
 * in production until the API key is set in Railway.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY is not set. Would have sent to ${opts.to}: "${opts.subject}"`,
    );
    return;
  }
  const { error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  if (error) {
    console.error('[email] Resend send failed:', error);
    throw new Error(`Failed to send email: ${error.message ?? 'unknown'}`);
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

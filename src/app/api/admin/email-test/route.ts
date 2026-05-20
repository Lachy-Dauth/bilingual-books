import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import {
  getEmailConfig,
  sendEmail,
  verifyEmailTransport,
} from '@/lib/email';

export const dynamic = 'force-dynamic';

/** Returns the resolved Gmail OAuth config (without exposing secrets). */
export async function GET() {
  await requireAdmin();
  const config = getEmailConfig();
  const verify = await verifyEmailTransport();
  return NextResponse.json({ config, verify });
}

/**
 * Sends a real test email via the Gmail API so an admin can confirm the
 * OAuth credentials work end-to-end. Body: { to?: string } — defaults to
 * the admin's own email.
 */
export async function POST(req: Request) {
  const admin = await requireAdmin();
  const body = (await req.json().catch(() => ({}))) as { to?: string };
  const to = (body.to || admin.email).trim();

  if (!to) {
    return NextResponse.json(
      { stage: 'input', error: 'No recipient email provided.' },
      { status: 400 },
    );
  }

  const config = getEmailConfig();
  if (!config.configured) {
    return NextResponse.json(
      {
        stage: 'config',
        error:
          'Gmail OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN. Without them, email is only logged to the server.',
        config,
      },
      { status: 500 },
    );
  }

  const verify = await verifyEmailTransport();
  if (!verify.ok) {
    return NextResponse.json(
      { stage: 'verify', error: verify.error, config },
      { status: 500 },
    );
  }

  try {
    await sendEmail({
      to,
      subject: 'Bilingual Books — Gmail API test',
      html: `<p>This is a test email from your <code>/admin</code> page. If you're reading it, the Gmail API transport is configured correctly.</p>
<p>Sent at ${new Date().toISOString()}.</p>`,
    });
    return NextResponse.json({ ok: true, to, config });
  } catch (err) {
    return NextResponse.json(
      { stage: 'send', error: (err as Error).message, config },
      { status: 500 },
    );
  }
}

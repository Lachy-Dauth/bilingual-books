import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Bilingual Books',
};

const LAST_UPDATED = '2026-05-20';

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 prose-policy">
      <h1>Privacy Policy</h1>
      <p className="meta">Last updated: {LAST_UPDATED}</p>

      <p>
        This page explains what data Bilingual Books collects, why, and what
        you can do about it. If you have questions, email{' '}
        <a href="mailto:[your-email@example.com]">[your-email@example.com]</a>.
      </p>

      <h2>1. Who runs this site</h2>
      <p>
        Bilingual Books is operated by Lachlan Dauth from
        Australia. We act as the data controller for the personal
        data described below.
      </p>

      <h2>2. What we collect</h2>
      <h3>2.1 Anonymous use</h3>
      <p>
        You can use the converter without an account. When you do, we set a
        first-party cookie called <code>bb_anon_id</code> (a random UUID, no
        personal data). It lets us count your conversions, show your own
        history on this device, and migrate that history into a user account
        if you sign up later. The cookie expires after one year and never
        leaves our server.
      </p>
      <h3>2.2 With an account</h3>
      <p>
        If you sign up, we store: your email address, your display name (if
        provided), a bcrypt-hashed password (only if you signed up with
        email/password), and OAuth identifiers (only if you signed in with
        Google). We also store an account tier (free / pro / unlimited) and
        whether the account is active.
      </p>
      <h3>2.3 Conversions</h3>
      <p>
        Each time you convert a book we log: book title, source and target
        language, word count, the conversion source (paste / EPUB upload /
        Project Gutenberg), the Gutenberg book ID if applicable, how long it
        took, and the outcome. We use this to show your dashboard, enforce
        any plan limits, and produce aggregate site stats. We do not log the
        text of your book.
      </p>
      <h3>2.4 Server logs</h3>
      <p>
        Our host (Railway) keeps short-term request logs that include IP
        address and user-agent for operational reasons. We do not look at or
        retain those logs ourselves.
      </p>

      <h2>3. Cookies</h2>
      <p>We use a small number of cookies:</p>
      <ul>
        <li>
          <strong>
            <code>bb_anon_id</code>
          </strong>{' '}
          — first-party, strictly necessary for your own conversion history
          on this device. One year.
        </li>
        <li>
          <strong>
            <code>bb.session_token</code>
          </strong>{' '}
          — first-party, set only when you sign in. Keeps you logged in.
        </li>
        <li>
          <strong>Google Analytics</strong> — only loaded if you click
          &ldquo;Accept&rdquo; on the cookie banner. We use it to understand
          aggregate traffic. We enable IP anonymization. You can withdraw
          consent at any time via &ldquo;Cookie preferences&rdquo; in the
          footer.
        </li>
      </ul>

      <h2>4. Third-party services</h2>
      <ul>
        <li>
          <strong>Google Translate</strong> (
          <code>translate.googleapis.com</code>) — your browser sends the
          paragraphs you want translated directly to Google. Google&rsquo;s
          terms and privacy policy apply to that exchange. Our server does
          not see the text.
        </li>
        <li>
          <strong>Project Gutenberg</strong> (
          <code>gutendex.com</code>, <code>www.gutenberg.org</code>) — used
          for the book search and download. We proxy the book file through
          our server but do not log the file contents.
        </li>
        <li>
          <strong>Google OAuth</strong> — only if you sign in with Google.
          We receive your email, name, profile image, and a stable user ID.
        </li>
        <li>
          <strong>Railway</strong> — our application host and database
          provider.
        </li>
      </ul>

      <h2>5. Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct,
        export, or delete your personal data, and to withdraw consent for
        analytics. To exercise any of these rights, email us at{' '}
        <a href="mailto:[your-email@example.com]">[your-email@example.com]</a>{' '}
        from the address on your account. We will respond within 30 days.
      </p>
      <p>
        You can also delete your account directly from your dashboard, which
        removes your user record. Conversions are anonymized (userId set to
        null) but retained for aggregate statistics.
      </p>

      <h2>6. Data retention</h2>
      <p>
        Account data is kept until you delete the account.{' '}
        <code>bb_anon_id</code> cookies expire after one year. Aggregate
        conversion records are retained indefinitely after they are
        anonymized.
      </p>

      <h2>7. Changes</h2>
      <p>
        If we change this policy materially, we will post the new version
        here with an updated &ldquo;Last updated&rdquo; date and, where
        required, notify account holders by email.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions? Email{' '}
        <a href="mailto:[your-email@example.com]">[your-email@example.com]</a>.
      </p>
    </main>
  );
}

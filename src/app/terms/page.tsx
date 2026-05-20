import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Bilingual Books',
};

const LAST_UPDATED = '2026-05-20';

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 prose-policy">
      <h1>Terms of Service</h1>
      <p className="meta">Last updated: {LAST_UPDATED}</p>

      <h2>1. Acceptance</h2>
      <p>
        By using Bilingual Books (the &ldquo;Service&rdquo;) you agree to
        these terms. If you do not agree, please do not use the Service.
      </p>

      <h2>2. What the Service does</h2>
      <p>
        Bilingual Books generates side-by-side bilingual editions of text and
        EPUB files by routing each paragraph or sentence through a public
        translation endpoint and packaging the result as an EPUB. You can
        also search Project Gutenberg from inside the Service and convert
        public-domain books.
      </p>

      <h2>3. Account responsibility</h2>
      <p>
        If you create an account, you are responsible for the activity that
        happens under it. Keep your password safe. Tell us at{' '}
        <a href="mailto:[your-email@example.com]">[your-email@example.com]</a>{' '}
        if you suspect it has been compromised.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          Submit content you do not have the right to translate (such as
          copyrighted books you do not own or are not licensed to use).
        </li>
        <li>
          Abuse, automate, or attempt to overload the Service or its
          upstream translation provider.
        </li>
        <li>
          Reverse-engineer the Service in a way that breaks its security
          model or evades account / plan limits.
        </li>
      </ul>
      <p>
        We may suspend or terminate accounts that violate these rules.
      </p>

      <h2>5. Translation quality</h2>
      <p>
        Translations come from a machine translation provider and may be
        inaccurate, awkward, or wrong. Do not rely on the output for legal,
        medical, safety-critical, or other consequential decisions. Always
        verify with a qualified human translator for important work.
      </p>

      <h2>6. Third-party content</h2>
      <p>
        Books retrieved from Project Gutenberg are subject to Project
        Gutenberg&rsquo;s license. You are responsible for honoring any
        attribution or redistribution requirements that apply to the
        underlying work and to the translation engine&rsquo;s output.
      </p>

      <h2>7. Plans and payments</h2>
      <p>
        The Service is currently free. If we introduce paid plans in the
        future, prices, billing terms, refunds, and cancellation will be
        described at the point of purchase before any charge is made.
      </p>

      <h2>8. No warranty</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo;, without warranties of any kind, express or
        implied. We do not guarantee that the Service will be uninterrupted,
        error-free, or that translations will meet any quality standard.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, neither we nor our
        contributors are liable for any indirect, incidental, special, or
        consequential damages arising from your use of the Service. Our
        total aggregate liability is limited to the amount you paid us in
        the twelve months before the claim, or USD 50, whichever is
        greater.
      </p>

      <h2>10. Changes to the Service or these terms</h2>
      <p>
        We may add, change, or remove features at any time. If we change
        these terms materially we will post the new version here with an
        updated &ldquo;Last updated&rdquo; date and, where required, notify
        account holders by email.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the laws of Australia, without
        regard to its conflict-of-laws rules. Any dispute will be brought in
        the courts of Australia.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions? Email{' '}
        <a href="mailto:[your-email@example.com]">[your-email@example.com]</a>.
      </p>
    </main>
  );
}

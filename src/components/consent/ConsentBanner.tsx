'use client';

import Link from 'next/link';
import { useConsent } from './ConsentProvider';

export function ConsentBanner() {
  const { choice, hydrated, accept, reject } = useConsent();
  if (!hydrated || choice !== null) return null;

  return (
    <div className="consent-banner" role="dialog" aria-label="Cookie consent">
      <div className="consent-banner-inner">
        <p className="consent-banner-text">
          We use a first-party cookie for anonymous conversion stats (required
          for the site to remember your books) and optionally Google Analytics
          to understand traffic. Read our{' '}
          <Link href="/privacy" className="consent-banner-link">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="consent-banner-actions">
          <button
            type="button"
            className="consent-banner-btn consent-banner-btn-secondary"
            onClick={reject}
          >
            Reject analytics
          </button>
          <button
            type="button"
            className="consent-banner-btn consent-banner-btn-primary"
            onClick={accept}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

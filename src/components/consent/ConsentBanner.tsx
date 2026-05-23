'use client';

import Link from 'next/link';
import { useConsent } from './ConsentProvider';
import { useT } from '@/i18n/I18nProvider';

export function ConsentBanner() {
  const { choice, hydrated, accept, reject } = useConsent();
  const { t } = useT();
  if (!hydrated || choice !== null) return null;

  return (
    <div className="consent-banner" role="dialog" aria-label="Cookie consent">
      <div className="consent-banner-inner">
        <p className="consent-banner-text">
          {t('consent.text')}{' '}
          <Link href="/privacy" className="consent-banner-link">
            {t('consent.privacyLink')}
          </Link>
          .
        </p>
        <div className="consent-banner-actions">
          <button
            type="button"
            className="consent-banner-btn consent-banner-btn-secondary"
            onClick={reject}
          >
            {t('consent.reject')}
          </button>
          <button
            type="button"
            className="consent-banner-btn consent-banner-btn-primary"
            onClick={accept}
          >
            {t('consent.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useConsent } from './ConsentProvider';
import { useT } from '@/i18n/I18nProvider';

export function CookiePreferences() {
  const { reset, hydrated } = useConsent();
  const { t } = useT();
  if (!hydrated) return null;
  return (
    <button
      type="button"
      className="footer-link-btn"
      onClick={reset}
      aria-label={t('footer.cookiePreferences')}
    >
      {t('footer.cookiePreferences')}
    </button>
  );
}

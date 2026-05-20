'use client';

import { useConsent } from './ConsentProvider';

export function CookiePreferences() {
  const { reset, hydrated } = useConsent();
  if (!hydrated) return null;
  return (
    <button
      type="button"
      className="footer-link-btn"
      onClick={reset}
      aria-label="Reopen cookie preferences"
    >
      Cookie preferences
    </button>
  );
}

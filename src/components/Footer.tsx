'use client';

import Link from 'next/link';
import { useT } from '@/i18n/I18nProvider';
import { BuyMeACoffee } from './BuyMeACoffee';
import { CookiePreferences } from './consent/CookiePreferences';

export function Footer() {
  const { t } = useT();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-tagline">{t('footer.tagline')}</p>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/privacy">{t('footer.privacy')}</Link>
          <Link href="/terms">{t('footer.terms')}</Link>
          <CookiePreferences />
        </nav>
        <BuyMeACoffee />
      </div>
    </footer>
  );
}

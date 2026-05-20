import Link from 'next/link';
import { BuyMeACoffee } from './BuyMeACoffee';
import { CookiePreferences } from './consent/CookiePreferences';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-tagline">
          Free, open-source bilingual book generator.
        </p>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <CookiePreferences />
        </nav>
        <BuyMeACoffee />
      </div>
    </footer>
  );
}

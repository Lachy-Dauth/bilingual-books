import { BuyMeACoffee } from './BuyMeACoffee';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-tagline">
          Free, open-source bilingual book generator.
        </p>
        <BuyMeACoffee />
      </div>
    </footer>
  );
}

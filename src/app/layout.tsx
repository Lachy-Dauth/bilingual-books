import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ConsentProvider } from '@/components/consent/ConsentProvider';
import { Analytics } from '@/components/consent/Analytics';
import { ConsentBanner } from '@/components/consent/ConsentBanner';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeScript } from '@/components/theme/ThemeScript';
import { I18nProvider } from '@/i18n/I18nProvider';
import { I18nScript } from '@/i18n/I18nScript';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bilingual Book Generator',
  description:
    'Generate side-by-side bilingual EPUBs from pasted text, existing EPUBs, or Project Gutenberg.',
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ThemeScript />
        <I18nScript />
      </head>
      <body>
        <ThemeProvider>
          <I18nProvider>
            <ConsentProvider>
              <Analytics gaId={GA_ID} />
              <Navbar />
              <div className="site-content">{children}</div>
              <Footer />
              <ConsentBanner />
            </ConsentProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

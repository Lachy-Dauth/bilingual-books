import type { Metadata, Viewport } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ConsentProvider } from '@/components/consent/ConsentProvider';
import { Analytics } from '@/components/consent/Analytics';
import { ConsentBanner } from '@/components/consent/ConsentBanner';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeScript } from '@/components/theme/ThemeScript';
import { I18nProvider } from '@/i18n/I18nProvider';
import { I18nScript } from '@/i18n/I18nScript';
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: 'Lachlan Dauth' }],
  creator: 'Lachlan Dauth',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'en',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#8c5214',
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

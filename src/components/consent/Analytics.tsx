'use client';

import Script from 'next/script';
import { useConsent } from './ConsentProvider';

/**
 * Google Analytics loader gated on the user's consent choice. Renders
 * nothing (no requests, no cookies) until the user clicks Accept on the
 * cookie banner.
 */
export function Analytics({ gaId }: { gaId?: string }) {
  const { choice, hydrated } = useConsent();
  if (!gaId || !hydrated || choice !== 'accepted') return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}

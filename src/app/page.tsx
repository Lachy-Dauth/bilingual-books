import { ConverterShell } from '@/components/converter/ConverterShell';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Web',
  browserRequirements: 'Requires JavaScript.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  inLanguage: ['en', 'fr', 'es', 'de', 'ja', 'zh'],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ConverterShell />
    </>
  );
}

/**
 * Canonical site URL + shared metadata constants, used by the SEO surface
 * (layout metadata, sitemap, robots, OG image, JSON-LD).
 *
 * Resolution order: explicit NEXT_PUBLIC_SITE_URL, then the Better-Auth
 * origin (already set in prod), then localhost for dev.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.BETTER_AUTH_URL ||
  'http://localhost:3000'
).replace(/\/$/, '');

export const SITE_NAME = 'Bilingual Books';

export const SITE_TAGLINE =
  'Side-by-side bilingual EPUB & PDF generator';

export const SITE_DESCRIPTION =
  'Turn any text, EPUB, or Project Gutenberg book into a side-by-side bilingual edition. Free and open source, dozens of languages, download as EPUB or PDF. Great for language learners and bilingual reading.';

export const SITE_KEYWORDS = [
  'bilingual books',
  'side-by-side translation',
  'parallel text',
  'EPUB translator',
  'bilingual EPUB',
  'dual language books',
  'language learning',
  'Project Gutenberg',
  'translate EPUB',
  'bilingual reader',
];

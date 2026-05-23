import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private / transient routes — nothing crawlable, and they're behind
      // auth anyway. Keep them out of the index explicitly.
      disallow: [
        '/admin',
        '/dashboard',
        '/sign-in',
        '/sign-up',
        '/sign-out',
        '/api/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

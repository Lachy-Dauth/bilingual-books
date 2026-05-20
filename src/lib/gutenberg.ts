export type GutendexBook = {
  id: number;
  title: string;
  authors: { name: string; birth_year: number | null; death_year: number | null }[];
  languages: string[];
  formats: Record<string, string>;
  download_count: number;
  subjects: string[];
};

export type GutendexResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
};

const GUTENDEX_BASE = 'https://gutendex.com/books';

export async function searchBooks(query: string, page = 1): Promise<GutendexResponse> {
  const url = new URL(GUTENDEX_BASE);
  if (query.trim()) url.searchParams.set('search', query.trim());
  if (page > 1) url.searchParams.set('page', String(page));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Gutendex search failed: ${res.status}`);
  return res.json();
}

export function pickFormat(
  formats: Record<string, string>,
  preferred: 'epub' | 'txt',
): string | null {
  if (preferred === 'epub') {
    return (
      formats['application/epub+zip'] ??
      formats['application/epub+zip; charset=utf-8'] ??
      null
    );
  }
  for (const [mime, url] of Object.entries(formats)) {
    if (mime.startsWith('text/plain') && !url.endsWith('.zip')) return url;
  }
  return null;
}

/**
 * Server-side: fetch the raw book bytes from Project Gutenberg.
 * The official EPUB URL pattern is www.gutenberg.org/ebooks/<id>.epub3.images;
 * for txt it is www.gutenberg.org/files/<id>/<id>-0.txt.
 * We try a sequence of known URL patterns until one returns 200.
 */
export async function fetchBookFromGutenberg(
  id: number,
  format: 'epub' | 'txt',
  userAgent: string,
): Promise<Response> {
  const candidates =
    format === 'epub'
      ? [
          `https://www.gutenberg.org/ebooks/${id}.epub3.images`,
          `https://www.gutenberg.org/ebooks/${id}.epub.images`,
          `https://www.gutenberg.org/ebooks/${id}.epub.noimages`,
        ]
      : [
          `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
          `https://www.gutenberg.org/files/${id}/${id}.txt`,
          `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
        ];

  for (const url of candidates) {
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent, Accept: '*/*' },
      redirect: 'follow',
    });
    if (res.ok) return res;
  }
  throw new Error(`Could not fetch Gutenberg book ${id} (${format})`);
}

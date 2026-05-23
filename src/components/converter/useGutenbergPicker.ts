'use client';

import { useState } from 'react';
import { pickFormat, type GutendexBook } from '@/lib/gutenberg';

export type GutenbergSeed = {
  bytes: ArrayBuffer;
  suggestedTitle: string;
  gutenbergId: number;
};

/**
 * Shared picker logic for any tab that surfaces gutendex books: download the
 * selected EPUB via our server proxy, then expose the bytes as a seed that
 * the host tab can hand to <EpubTab gutenbergSeed={...} /> for conversion.
 */
export function useGutenbergPicker() {
  const [seed, setSeed] = useState<GutenbergSeed | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(book: GutendexBook) {
    setLoadingId(book.id);
    setError(null);
    try {
      const epubUrl = pickFormat(book.formats, 'epub');
      const format: 'epub' | 'txt' = epubUrl ? 'epub' : 'txt';
      const res = await fetch('/api/gutenberg/fetch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ gutenbergId: book.id, format }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server error ${res.status}`);
      }
      if (format === 'txt') {
        throw new Error(
          'This book is only available as plain text on Gutenberg. Try a different book.',
        );
      }
      const bytes = await res.arrayBuffer();
      setSeed({ bytes, suggestedTitle: book.title, gutenbergId: book.id });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingId(null);
    }
  }

  return { seed, loadingId, error, pick };
}

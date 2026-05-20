'use client';

import { useState } from 'react';
import { searchBooks, type GutendexBook, pickFormat } from '@/lib/gutenberg';
import { EpubTab } from './EpubTab';

export function GutenbergTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GutendexBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seed, setSeed] = useState<{
    bytes: ArrayBuffer;
    suggestedTitle: string;
    gutenbergId: number;
  } | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setError(null);
    setSearching(true);
    try {
      const data = await searchBooks(query);
      setResults(data.results);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSearching(false);
    }
  }

  async function onPick(book: GutendexBook) {
    setLoadingId(book.id);
    setError(null);
    try {
      // Prefer EPUB; fall back to txt if none.
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
          'This book is only available as plain text on Gutenberg. EPUB conversion of raw text is not yet supported — try a different book.',
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

  if (seed) {
    return <EpubTab gutenbergSeed={seed} />;
  }

  return (
    <>
      <form onSubmit={onSearch} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Search title or author…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="cs-btn" disabled={searching || !query.trim()}>
          {searching ? 'Searching…' : 'Search'}
        </button>
      </form>

      <p className="field-hint" style={{ marginTop: 10 }}>
        Searches <a href="https://www.gutenberg.org" target="_blank" rel="noopener">Project Gutenberg</a> via gutendex. EPUB is preferred when available.
      </p>

      {error && (
        <p className="epub-status error" style={{ marginTop: 12 }}>
          {error}
        </p>
      )}

      <div className="gutenberg-results">
        {results.map((book) => {
          const cover = book.formats['image/jpeg'];
          const author = book.authors[0]?.name ?? 'Unknown';
          return (
            <div className="gutenberg-card" key={book.id}>
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="cover" src={cover} alt="" />
              ) : (
                <div className="cover" />
              )}
              <div className="meta">
                <p className="title">{book.title}</p>
                <p className="author">{author}</p>
                <p className="langs">
                  Languages: {book.languages.join(', ') || '—'} ·{' '}
                  {book.download_count.toLocaleString()} downloads
                </p>
              </div>
              <button
                type="button"
                className="cs-btn"
                onClick={() => onPick(book)}
                disabled={loadingId !== null}
              >
                {loadingId === book.id ? 'Loading…' : 'Convert'}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

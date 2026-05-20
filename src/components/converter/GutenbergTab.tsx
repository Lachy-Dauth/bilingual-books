'use client';

import { useState } from 'react';
import { searchBooks, type GutendexBook } from '@/lib/gutenberg';
import { EpubTab } from './EpubTab';
import { GutenbergResultsList } from './GutenbergResultsList';
import { useGutenbergPicker } from './useGutenbergPicker';

export function GutenbergTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GutendexBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);
  const { seed, loadingId, error, pick } = useGutenbergPicker();

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchErr(null);
    setSearching(true);
    try {
      const data = await searchBooks(query);
      setResults(data.results);
    } catch (err) {
      setSearchErr((err as Error).message);
    } finally {
      setSearching(false);
    }
  }

  if (seed) return <EpubTab gutenbergSeed={seed} />;

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
        Searches{' '}
        <a href="https://www.gutenberg.org" target="_blank" rel="noopener">
          Project Gutenberg
        </a>{' '}
        via gutendex. EPUB is preferred when available.
      </p>

      {(searchErr || error) && (
        <p className="epub-status error" style={{ marginTop: 12 }}>
          {searchErr ?? error}
        </p>
      )}

      <GutenbergResultsList books={results} loadingId={loadingId} onPick={pick} />
    </>
  );
}

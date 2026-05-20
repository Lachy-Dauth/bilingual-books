'use client';

import { useEffect, useState } from 'react';
import { popularBooks, type GutendexBook } from '@/lib/gutenberg';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EpubTab } from './EpubTab';
import { LanguageInput } from './LanguageInput';
import { GutenbergResultsList } from './GutenbergResultsList';
import { useGutenbergPicker } from './useGutenbergPicker';

const TOP_N = 20;

export function PopularTab() {
  const [lang, setLang] = useLocalStorage('bb_popular_lang', 'en');
  const [books, setBooks] = useState<GutendexBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const { seed, loadingId, error, pick } = useGutenbergPicker();

  useEffect(() => {
    const code = lang.trim().toLowerCase();
    if (!code) return;
    let cancelled = false;
    setLoading(true);
    setLoadErr(null);
    popularBooks(code)
      .then((data) => {
        if (cancelled) return;
        setBooks(data.results.slice(0, TOP_N));
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadErr(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  if (seed) return <EpubTab gutenbergSeed={seed} />;

  return (
    <>
      <p className="field-hint" style={{ marginBottom: 10 }}>
        Top {TOP_N} most-downloaded books on{' '}
        <a href="https://www.gutenberg.org" target="_blank" rel="noopener">
          Project Gutenberg
        </a>{' '}
        for the chosen language, ranked by download count.
      </p>

      <label className="field-label" htmlFor="popular-lang">
        Language
      </label>
      <div style={{ maxWidth: 320, marginBottom: 14 }}>
        <LanguageInput
          id="popular-lang"
          value={lang}
          onChange={setLang}
          placeholder="e.g. en, fr, es"
        />
      </div>

      {loading && <p className="field-hint">Loading popular books…</p>}
      {(loadErr || error) && (
        <p className="epub-status error">{loadErr ?? error}</p>
      )}
      {!loading && !loadErr && books.length === 0 && lang.trim() && (
        <p className="field-hint">
          No popular books found for &ldquo;{lang}&rdquo;. Check the language
          code.
        </p>
      )}

      <GutenbergResultsList books={books} loadingId={loadingId} onPick={pick} />
    </>
  );
}

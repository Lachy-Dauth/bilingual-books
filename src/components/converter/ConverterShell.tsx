'use client';

import { useState } from 'react';
import { PasteTab } from './PasteTab';
import { EpubTab } from './EpubTab';
import { GutenbergTab } from './GutenbergTab';
import { PopularTab } from './PopularTab';
import { ThemeToggle } from './ThemeToggle';
import { InfoModal } from './InfoModal';

type Tab = 'text' | 'epub' | 'popular' | 'gutenberg';

export function ConverterShell() {
  const [tab, setTab] = useState<Tab>('epub');
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="converter-shell">
      <div className="container">
        <header className="cs-header">
          <h1>Bilingual Book Generator</h1>
          <button
            type="button"
            className="icon-btn"
            aria-label="Information"
            onClick={() => setInfoOpen(true)}
            style={{ fontSize: '1.4rem' }}
          >
            ⓘ
          </button>
        </header>

        <div className="tabs" role="tablist">
          {(['text', 'epub', 'popular', 'gutenberg'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            className={`tab-btn ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {key === 'text'
              ? 'Paste text'
              : key === 'epub'
                ? 'Upload EPUB'
                : key === 'popular'
                  ? 'Popular books'
                  : 'Search Gutenberg'}
          </button>
        ))}
        </div>

        <div hidden={tab !== 'text'}>
          <PasteTab />
        </div>
        <div hidden={tab !== 'epub'}>
          <EpubTab />
        </div>
        <div hidden={tab !== 'popular'}>
          <PopularTab />
        </div>
        <div hidden={tab !== 'gutenberg'}>
          <GutenbergTab />
        </div>

        <div className="actions" style={{ marginTop: 20 }}>
          <ThemeToggle />
        </div>
      </div>

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}

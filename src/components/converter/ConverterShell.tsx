'use client';

import { useState } from 'react';
import { useT } from '@/i18n/I18nProvider';
import { PasteTab } from './PasteTab';
import { EpubTab } from './EpubTab';
import { GutenbergTab } from './GutenbergTab';
import { PopularTab } from './PopularTab';
import { InfoModal } from './InfoModal';
import type { TKey } from '@/i18n/messages/en';

type Tab = 'text' | 'epub' | 'popular' | 'gutenberg';

const TAB_LABEL_KEY: Record<Tab, TKey> = {
  text: 'tab.paste',
  epub: 'tab.epub',
  popular: 'tab.popular',
  gutenberg: 'tab.gutenberg',
};

export function ConverterShell() {
  const [tab, setTab] = useState<Tab>('epub');
  const [infoOpen, setInfoOpen] = useState(false);
  const { t } = useT();

  return (
    <div className="converter-shell">
      <div className="container">
        <header className="cs-header">
          <h1>{t('converter.title')}</h1>
          <button
            type="button"
            className="icon-btn"
            aria-label={t('converter.info')}
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
              {t(TAB_LABEL_KEY[key])}
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
      </div>

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}

'use client';

import { BuyMeACoffee } from '@/components/BuyMeACoffee';
import { useT } from '@/i18n/I18nProvider';

export function InfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  if (!open) return null;
  return (
    <div
      className="info-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="info-panel">
        <header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>{t('info.title')}</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close info"
            onClick={onClose}
          >
            ✕
          </button>
        </header>
        <p>{t('info.intro')}</p>
        <h2>{t('info.paste.h')}</h2>
        <p>{t('info.paste.body')}</p>
        <h2>{t('info.epub.h')}</h2>
        <p>{t('info.epub.body')}</p>
        <h2>{t('info.gutenberg.h')}</h2>
        <p>{t('info.gutenberg.body')}</p>
        <h2>{t('info.saveEpub.h')}</h2>
        <p>{t('info.saveEpub.body')}</p>
        <h2>{t('info.savePdf.h')}</h2>
        <p>{t('info.savePdf.body')}</p>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <BuyMeACoffee />
        </div>
      </div>
    </div>
  );
}

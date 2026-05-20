'use client';

import { Globe } from 'lucide-react';
import { useT } from './I18nProvider';
import { LOCALES, type Locale } from './types';

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useT();
  return (
    <label className="locale-switcher" title={t('nav.language')}>
      <Globe size={14} aria-hidden="true" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t('nav.language')}
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}

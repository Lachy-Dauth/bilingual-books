'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { MESSAGES } from './messages';
import { type TKey } from './messages/en';
import { DEFAULT_LOCALE, isLocale, type Locale } from './types';

const STORAGE_KEY = 'bb_locale';

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TKey) => string;
};

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // On first paint the inline script in <head> already set <html lang>. Here
  // we sync the React state from localStorage so consumers see the right
  // locale without an extra render flicker.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored)) setLocaleState(stored);
    } catch {
      /* localStorage blocked */
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l;
    }
  }, []);

  const t = useCallback(
    (key: TKey): string => {
      return MESSAGES[locale]?.[key] ?? MESSAGES.en[key] ?? key;
    },
    [locale],
  );

  return (
    <I18nCtx.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useT() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error('useT must be used within I18nProvider');
  return c;
}

export type Locale = 'en' | 'fr' | 'es' | 'de' | 'ja' | 'zh';

export const DEFAULT_LOCALE: Locale = 'en';

/** Locales offered in the UI switcher. Native-script labels (autonyms) so
 *  users can find their language regardless of the current UI locale. */
export const LOCALES: ReadonlyArray<{ code: Locale; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
];

export const LOCALE_CODES: Locale[] = LOCALES.map((l) => l.code);

export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALE_CODES as string[]).includes(v);
}

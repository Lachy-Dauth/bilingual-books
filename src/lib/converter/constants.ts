export const RTL_LANGS = [
  'ar',
  'he',
  'fa',
  'ur',
  'ks',
  'ps',
  'ug',
  'ckb',
  'pa',
  'sd',
];

export const PARALLEL_TRANSLATIONS = 6;
export const BLOCK_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, blockquote';

/** Concurrency level for each speed setting in the converter UI. */
export const SPEED_LEVELS: Record<'slow' | 'normal' | 'fast', number> = {
  slow: 2,
  normal: PARALLEL_TRANSLATIONS,
  fast: 12,
};

export const LANG_3TO2: Record<string, string> = {
  eng: 'en', fra: 'fr', fre: 'fr', spa: 'es', deu: 'de', ger: 'de',
  ita: 'it', por: 'pt', rus: 'ru', jpn: 'ja', kor: 'ko', zho: 'zh',
  chi: 'zh', ara: 'ar', heb: 'he', hin: 'hi', tha: 'th', tur: 'tr',
  vie: 'vi', pol: 'pl', nld: 'nl', dut: 'nl', swe: 'sv', nor: 'no',
  dan: 'da', fin: 'fi', ell: 'el', gre: 'el', ces: 'cs', cze: 'cs',
  ukr: 'uk', ron: 'ro', rum: 'ro', hun: 'hu', ind: 'id', msa: 'ms',
  may: 'ms',
};

export function isRtl(lang: string): boolean {
  return RTL_LANGS.includes(lang);
}

export function normalizeLanguageCode(code: string | null | undefined): string {
  if (!code) return '';
  const base = String(code).trim().split(/[-_]/)[0].toLowerCase();
  return LANG_3TO2[base] ?? base.slice(0, 2);
}

import { en } from './en';
import type { TKey } from './en';
import { fr } from './fr';
import { es } from './es';
import { de } from './de';
import { ja } from './ja';
import { zh } from './zh';
import type { Locale } from '../types';

export const MESSAGES: Record<Locale, Record<TKey, string>> = {
  en,
  fr,
  es,
  de,
  ja,
  zh,
};

import type { SentencePair } from './types';

/**
 * Splits raw input text into sentence-sized chunks for translation,
 * matching the legacy behavior: collapse newlines, then break on full stops.
 */
export function splitSentences(text: string): string[] {
  return text
    .replaceAll('\n', ' ')
    .replaceAll('.', '.\n')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function makePair(src: string, tgt: string): SentencePair {
  return { src, tgt };
}

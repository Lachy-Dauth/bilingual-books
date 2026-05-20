import { PARALLEL_TRANSLATIONS } from './constants';
import type { TranslationItem, TranslationProgress } from './types';

const GOOGLE_URL = 'https://translate.googleapis.com/translate_a/single';
const MAX_CHARS = 4500;

function splitForTranslation(text: string, limit: number): string[] {
  const out: string[] = [];
  let remaining = text;
  while (remaining.length > limit) {
    let cut = remaining.lastIndexOf('. ', limit);
    if (cut < limit / 2) cut = remaining.lastIndexOf(' ', limit);
    if (cut <= 0) {
      // No usable delimiter — hard-cut at `limit` exactly. The `+ 1`
      // below is only safe when `cut` points at a real delimiter we
      // want to include in the chunk.
      out.push(remaining.slice(0, limit).trim());
      remaining = remaining.slice(limit);
    } else {
      out.push(remaining.slice(0, cut + 1).trim());
      remaining = remaining.slice(cut + 1);
    }
  }
  if (remaining) out.push(remaining);
  return out;
}

export type CancelSignal = { cancelled: boolean };

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  cancel?: CancelSignal,
): Promise<string> {
  if (!text.trim()) return '';
  if (sourceLang === targetLang) return text;

  if (text.length > MAX_CHARS) {
    const parts = splitForTranslation(text, MAX_CHARS);
    const out: string[] = [];
    for (const part of parts) {
      if (cancel?.cancelled) break;
      out.push(await translateText(part, sourceLang, targetLang, cancel));
    }
    return out.join(' ');
  }

  const url = `${GOOGLE_URL}?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;

  let attempts = 0;
  while (attempts < 3) {
    if (cancel?.cancelled) return '';
    try {
      const resp = await fetch(url);
      if (resp.status === 429) {
        attempts++;
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempts)));
        continue;
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = (await resp.json()) as unknown;
      if (!Array.isArray(data) || !Array.isArray(data[0])) return '';
      return (data[0] as unknown[])
        .map((item) => {
          const arr = item as unknown[];
          return (arr && (arr[0] as string)) || '';
        })
        .join('')
        .trim();
    } catch (err) {
      attempts++;
      if (attempts >= 3) {
        console.warn(
          'Translation failed:',
          (err as Error).message,
          'text:',
          text.slice(0, 60),
        );
        return '';
      }
      await new Promise((r) => setTimeout(r, 300 * attempts));
    }
  }
  return '';
}

export async function translateAll(
  items: TranslationItem[],
  sourceLang: string,
  targetLang: string,
  onProgress: (p: TranslationProgress) => void,
  cancel: CancelSignal = { cancelled: false },
  concurrency: number = PARALLEL_TRANSLATIONS,
): Promise<void> {
  let done = 0;
  let cursor = 0;
  const total = items.length;

  const workers: Promise<void>[] = [];
  const n = Math.max(1, Math.floor(concurrency));
  for (let w = 0; w < n; w++) {
    workers.push(
      (async () => {
        while (cursor < items.length && !cancel.cancelled) {
          const idx = cursor++;
          const item = items[idx];
          const translation = await translateText(
            item.text,
            sourceLang,
            targetLang,
            cancel,
          );
          item.translation = translation;
          done++;
          onProgress({ done, total, item });
        }
      })(),
    );
  }
  await Promise.all(workers);
}

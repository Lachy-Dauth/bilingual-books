import { splitSentences } from './sentences';
import type { Block, Chapter, ParsedEpub, SplitMode } from './types';

/**
 * Expand a paragraph-mode block array into the requested mode.
 * - `paragraph` mode: returns the input unchanged (parseEpub already split
 *   on <br>/\n into per-line blocks).
 * - `sentence` mode: further splits non-heading blocks into sentence-level
 *   blocks, preserving the `paragraphEnd` marker on the final sentence of
 *   each original paragraph.
 */
export function expandBlocks(blocks: Block[], mode: SplitMode): Block[] {
  // 'sentence-aligned' translates paragraph-level then splits AFTER translation,
  // so for the translation pipeline it behaves like paragraph mode.
  if (mode === 'paragraph' || mode === 'sentence-aligned') return blocks;
  return blocks.flatMap((b) => {
    if (/^h[1-6]$/.test(b.tag)) return [b];
    const sentences = splitSentences(b.text);
    if (sentences.length <= 1) return [b];
    return sentences.map((s, i) => ({
      tag: b.tag,
      text: s,
      paragraphEnd: b.paragraphEnd && i === sentences.length - 1,
    }));
  });
}

export function expandChapters(chapters: Chapter[], mode: SplitMode): Chapter[] {
  if (mode === 'paragraph' || mode === 'sentence-aligned') return chapters;
  return chapters.map((ch) => ({
    ...ch,
    blocks: expandBlocks(ch.blocks, mode),
  }));
}

export function expandParsed(parsed: ParsedEpub, mode: SplitMode): ParsedEpub {
  return { ...parsed, chapters: expandChapters(parsed.chapters, mode) };
}

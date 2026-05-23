import { splitSentences } from './sentences';
import type { Block, Chapter, ParsedEpub, SplitMode } from './types';

/**
 * Merge consecutive sub-blocks (split on <br>/\n by parseEpub) back into one
 * block per original paragraph. Use when the user doesn't want <br> treated
 * as a paragraph boundary.
 */
export function collapseLineBreaks(blocks: Block[]): Block[] {
  const merged: Block[] = [];
  let bufTexts: string[] = [];
  let bufTag: string | null = null;
  for (const b of blocks) {
    if (bufTag === null) bufTag = b.tag;
    bufTexts.push(b.text);
    if (b.paragraphEnd) {
      merged.push({ tag: bufTag, text: bufTexts.join(' '), paragraphEnd: true });
      bufTexts = [];
      bufTag = null;
    }
  }
  if (bufTexts.length && bufTag !== null) {
    merged.push({ tag: bufTag, text: bufTexts.join(' '), paragraphEnd: true });
  }
  return merged;
}

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

export function prepareBlocks(
  blocks: Block[],
  mode: SplitMode,
  collapseBreaks: boolean,
): Block[] {
  const input = collapseBreaks ? collapseLineBreaks(blocks) : blocks;
  return expandBlocks(input, mode);
}

export function expandChapters(
  chapters: Chapter[],
  mode: SplitMode,
  collapseBreaks = false,
): Chapter[] {
  return chapters.map((ch) => ({
    ...ch,
    blocks: prepareBlocks(ch.blocks, mode, collapseBreaks),
  }));
}

export function expandParsed(
  parsed: ParsedEpub,
  mode: SplitMode,
  collapseBreaks = false,
): ParsedEpub {
  return {
    ...parsed,
    chapters: expandChapters(parsed.chapters, mode, collapseBreaks),
  };
}

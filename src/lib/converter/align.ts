import { splitSentences } from './sentences';
import type { Block, Chapter, ParsedEpub } from './types';

/**
 * Given a translated paragraph-level block, split both source and translation
 * into sentences and return a sequence of (src, tgt) sub-blocks that line up
 * visually. The translator handled the whole paragraph — we just chop the
 * already-translated text back into sentence-sized pairs.
 *
 * Sentence counts often differ between languages (French combines clauses
 * that English splits, etc.), so we map proportionally: every output pair
 * gets contiguous slices of the source and target sentence lists in roughly
 * the same ratio. The number of output pairs is min(srcCount, tgtCount).
 */
export function sentenceAlignBlock(block: Block): Block[] {
  if (/^h[1-6]$/.test(block.tag)) return [block];
  const src = splitSentences(block.text);
  const tgt = splitSentences(block.translation ?? '');
  if (!src.length) return [block];
  if (tgt.length === 0) {
    // No translation yet (cancelled / failed). Keep the block as one row.
    return [block];
  }
  const M = Math.min(src.length, tgt.length);
  if (M <= 1) {
    return [
      {
        tag: block.tag,
        text: src.join(' '),
        translation: tgt.join(' '),
        paragraphEnd: block.paragraphEnd,
      },
    ];
  }
  const aligned: Block[] = [];
  for (let i = 0; i < M; i++) {
    const srcStart = Math.floor((i * src.length) / M);
    const srcEnd = i === M - 1 ? src.length : Math.floor(((i + 1) * src.length) / M);
    const tgtStart = Math.floor((i * tgt.length) / M);
    const tgtEnd = i === M - 1 ? tgt.length : Math.floor(((i + 1) * tgt.length) / M);
    aligned.push({
      tag: block.tag,
      text: src.slice(srcStart, srcEnd).join(' '),
      translation: tgt.slice(tgtStart, tgtEnd).join(' '),
      paragraphEnd: i === M - 1 && block.paragraphEnd,
    });
  }
  return aligned;
}

export function sentenceAlignChapters(chapters: Chapter[]): Chapter[] {
  return chapters.map((ch) => ({
    ...ch,
    blocks: ch.blocks.flatMap(sentenceAlignBlock),
  }));
}

export function sentenceAlignParsed(parsed: ParsedEpub): ParsedEpub {
  return { ...parsed, chapters: sentenceAlignChapters(parsed.chapters) };
}

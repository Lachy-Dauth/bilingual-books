/**
 * Common abbreviations that end in a period but should not terminate a
 * sentence. Lowercased; comparison is case-insensitive. Single uppercase
 * letters (initials like "J. R. R. Tolkien") are handled separately.
 */
const ABBREVIATIONS = new Set([
  // Titles / honorifics (English + French)
  'mr', 'mrs', 'ms', 'mme', 'mlle', 'dr', 'drs', 'prof', 'sr', 'jr',
  'st', 'ste', 'rev', 'hon', 'esq',
  'capt', 'lt', 'sgt', 'col', 'gen', 'maj', 'cmdr',
  'gov', 'pres', 'sen', 'rep',
  // Latin / common (only unambiguous forms)
  'etc', 'vs', 'cf', 'viz', 'circa', 'approx',
  'e.g', 'i.e',
  // Time (only the dotted forms — bare "am"/"pm" are too ambiguous)
  'a.m', 'p.m',
  // Geographic — multi-period only; bare two-letter codes are too ambiguous
  'u.s', 'u.k', 'u.s.a', 'u.s.s.r', 'd.c',
  // Org suffixes
  'inc', 'ltd', 'corp', 'dept',
]);

const TERMINAL_RE = /(\S+?)[.!?。！？؟]+(?:["'”’»])?\s*$/u;

function endsWithAbbreviation(chunk: string): boolean {
  const m = chunk.match(TERMINAL_RE);
  if (!m) return false;
  const stem = m[1];
  // Single uppercase letter — initials. "J.", "R.", "M.", etc.
  if (/^[A-Z]$/.test(stem)) return true;
  return ABBREVIATIONS.has(stem.toLowerCase());
}

/**
 * Split a single line of text into sentences. Handles Latin-script
 * (.!?), CJK (。！？), and Arabic (؟) sentence terminators, and avoids
 * splitting after common abbreviations ("Dr.", "Mr.", "U.S.", initials
 * like "J. R. R.", etc.). Does not cross newline boundaries — the caller
 * is expected to split on \n first.
 */
export function splitSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  // Latin-script terminators (.!?؟) require following whitespace to split,
  // and may be followed by an optional closing quote/guillemet/paren so
  // dialog like  ...day." She  also ends a sentence at the period.
  // CJK terminators (。！？) split without whitespace because Chinese/Japanese
  // typically don't insert spaces between sentences.
  // Don't split if the next chunk starts with a lowercase letter — likely
  // a mid-sentence continuation like ' "Wait..." but stayed.' rather than a
  // new sentence. (?!\p{Ll}) lets uppercase, digits, quotes, and scripts
  // without case (CJK, Arabic, Hindi, …) all start a new sentence.
  const naive = trimmed.split(/(?<=[.!?؟]["'”’»)]?)\s+(?!\p{Ll})|(?<=[。！？])/u);
  const result: string[] = [];
  let buf = '';
  for (const part of naive) {
    if (!part) continue;
    buf = buf ? `${buf} ${part}` : part;
    if (!endsWithAbbreviation(buf)) {
      const t = buf.trim();
      if (t) result.push(t);
      buf = '';
    }
  }
  const tail = buf.trim();
  if (tail) result.push(tail);
  return result.length ? result : [trimmed];
}
